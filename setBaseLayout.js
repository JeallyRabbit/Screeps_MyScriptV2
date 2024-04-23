const { create } = require("lodash");
//const { move_avoid_hostile } = require("./move_avoid_hostile");
var RoomPositionFunctions = require('roomPositionFunctions');
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");
const mincut = require("./mincut")


class building_list_element {
    constructor(x, y, roomName, structureType, min_rcl) {
        this.x = x;
        this.y = y;
        this.roomName = roomName;
        this.structureType = structureType;
        this.min_rcl = min_rcl;
    }
}
function is_pos_free(x, y, roomName) {
    if (Game.rooms[roomName] != undefined) {
        var structures_at_pos = Game.rooms[roomName].lookForAt(LOOK_STRUCTURES, x, y)
        for (str of structures_at_pos) {
            if (str.structureType != STRUCTURE_ROAD && str.structureType != STRUCTURE_RAMPART)
                return false;
            break;
        }
        return true
    }

}

function is_wall_on_plan(spawn, x, y) {
    if (spawn.memory.room_plan[x][y] == STRUCTURE_WALL || spawn.memory.room_plan[x][y] == 'constructedWall') {
        return true;

    }
    else {
        return false;
    }
}

function is_wall_on_list(spawn, x, y) {
    var it = 0;
    for (let structure of spawn.memory.building_list) {
        if (structure.x == x && structure.y == y && structure.structureType == STRUCTURE_WALL) {
            return it;
        }
        it++;
    }
    return -1;
}

function is_wall_in_room(spawn, x, y) {
    var sturctures_at_pos = spawn.room.lookForAt(LOOK_STRUCTURES, x, y)

    for (structure of sturctures_at_pos) {
        if (structure.structureType == STRUCTURE_WALL) {
            return true;
        }
    }
    return false;
}

function plan_road_to_target(spawn, roomCM, target, rcl) {

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0 && spawn.memory.room_plan[i][j] != STRUCTURE_ROAD && spawn.memory.room_plan[i][j] != STRUCTURE_RAMPART) {
                roomCM.set(i, j, 255);
            }
            else if (spawn.memory.room_plan[i][j] != 0 && spawn.memory.room_plan[i][j] == STRUCTURE_ROAD) {
                roomCM.set(i, j, 1);
            }
        }
    }


    //console.log("target: ", target);
    destination = target;
    var ret = PathFinder.search(spawn.pos, destination, {
        //maxRooms: 64,
        range: 1,
        plainCost: 2,
        swampCost: 2,
        maxOps: 8000,

        roomCallback: function (roomName) {

            //let room = spawn.room.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            //costs = new PathFinder.CostMatrix;

            let room = Game.rooms[roomName];
            if (!room) { return; }

            if (roomName == spawn.room.name) {
                costs = roomCM;
            }
            else {

                //console.log(roomName);
                costs = new PathFinder.CostMatrix;
                const terrain = room.getTerrain()

                for (let y = 0; y < 50; y++) {
                    for (let x = 0; x < 50; x++) {
                        const tile = terrain.get(x, y);
                        const weight =
                            tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                                tile === TERRAIN_MASK_SWAMP ? 10 : // swamp => weight:  10
                                    2; // plain => weight:  2
                        costs.set(x, y, weight);
                    }
                }
            }
            //let 


            /*
            const terrain = spawn.room.getTerrain()

            for (let y = 0; y < 50; y++) {
                for (let x = 0; x < 50; x++) {
                    const tile = terrain.get(x, y);
                    const weight =
                        tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                            tile === TERRAIN_MASK_SWAMP ? 10 : // swamp => weight:  10
                                2; // plain => weight:  2
                    costs.set(x, y, weight);
                }
            }*/


            //spawn.
            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART ||
                        !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 255);
                }
            });

            // avoid construction sites
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType != STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 255);
            });

            //favour roads under construction
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });

            //ignore walls
            if (roomName == spawn.room.name) {
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (spawn.memory.room_plan[i][j] == STRUCTURE_WALL /*|| spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART*/) {
                            costs.set(i, j, 1);
                        }
                    }
                }

                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART /*|| spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART*/) {
                            costs.set(i, j, 1);
                        }
                    }
                }
            }

            /*
            //spawn.
            room.find(FIND_STRUCTURES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_WALL;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });
            */

            costs.set(destination.x, destination.y, 255);

            return costs;
        }
    });

    if (ret.incomplete != true || true) {
        //creep.say(creep.moveByPath(ret.path));
        //spawn.memory.source_path = ret;
        //console.log("found  route for: ", destination)
        //console.log("route is: ", ret.path.length, " long")
        //console.log("ret.path[last]: ", ret.path[ret.path.length - 1])
        //console.log(ret.incomplete, " ",ret.ops," ",ret.cost)
        /*
        if (destination == spawn.room.controller.pos) {
            console.log('pathing to controller')
            console.log(ret.path.length)
        }
        */
        for (let i = 0; i < ret.path.length; i++) {

            /*
            if (destination == spawn.room.controller.pos) {
                console.log(ret.path[i].x, " ", ret.path[i].y)
            }
            */
            if (ret.path[i].x != destination.x || ret.path[i].y != destination.y || ret.path[i].roomName != destination.roomName) {

                spawn.memory.road_building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, rcl));
                if (ret.path[i].roomName == spawn.room.name) {
                    spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;

                    //Game.rooms[ret.path[i].roomName].visual.circle(ret.path[i].x, ret.path[i].y, { fill: '#666666', radius: 0.5, stroke: 'pink' });

                    //console.log(ret.path[i].x, " ", ret.path[i].y);
                    if ((spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == 0 || spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == STRUCTURE_ROAD)
                        && is_pos_free(ret.path[i].x, ret.path[i].y, ret.path[i].roomName) == true


                    ) { // tile is empty on plan and in room


                        spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                        roomCM.set(ret.path[i].x, ret.path[i].y, 1);
                    }
                    else //if (spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == STRUCTURE_WALL ) {
                    {//going through wall
                        //console.log("going through wall at: ", ret.path[i].x, " ", ret.path[i].y, " ", ret.path[i].roomName)
                        //console.log("on plan; ", spawn.memory.room_plan[ret.path[i].x][ret.path[i].y])
                        var is_wall_on_list2 = is_wall_on_list(spawn, ret.path[i].x, ret.path[i].y)
                        var is_wall_in_room2 = is_wall_in_room(spawn, ret.path[i].x, ret.path[i].y)
                        if (is_wall_on_plan(spawn, ret.path[i].x, ret.path[i].y) == true || is_wall_on_list2 >= 0 || is_wall_in_room2 == true) {
                            //console.log("FOUND WALL AT: ", ret.path[i].x, " ", ret.path[i].y);
                            //console.log(spawn.memory.room_plan[ret.path[i].x][ret.path[i].y]);
                            //console.log(target)

                            spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_RAMPART;
                            spawn.memory.building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName,
                                STRUCTURE_RAMPART, rcl));
                            spawn.memory.road_building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName,
                                STRUCTURE_RAMPART, rcl));
                            if (is_wall_on_list2 >= 0) {
                                spawn.memory.building_list.splice(is_wall_on_list2, 1);
                            }

                            if (is_wall_in_room2) {
                                var structures_in_room = spawn.room.lookForAt(LOOK_STRUCTURES, ret.path[i].x, ret.path[i].y);
                                for (a of structures_in_room) {
                                    if (a.structureType == STRUCTURE_WALL) {
                                        a.destroy();
                                    }
                                }
                            }
                        }
                        for (let structure of spawn.memory.building_list) {
                            if ((Math.abs(structure.x - ret.path[i].x) < 2 || Math.abs(structure.y - ret.path[i].y) < 2) &&
                                structure.structureType == STRUCTURE_WALL && structure.roomName == spawn.room.name) {
                                structure.structureType = STRUCTURE_RAMPART;
                                spawn.memory.room_plan[structure.x][structure.y] = STRUCTURE_RAMPART;
                            }
                        }


                    }
                }
                else {
                    //spawn.memory.road_building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, rcl));
                    //console.log("building road to source in farming room resuklt: ", Game.rooms[ret.path[i].roomName].createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD));
                    //Game.rooms[ret.path[i].roomName].visual.circle(ret.path[i].x, ret.path[i].y, { fill: '#666666', radius: 0.5, stroke: 'black' });

                }


                //spawn.room.createConstructionSite(ret.path[i], STRUCTURE_ROAD);
            }

        }
    }
    /*
    else {
        //console.log("not found  route for: ", destination)
        //console.log("route is: ", ret.path.length, " long")
        //console.log("ret.path[last]: ", ret.path[ret.path.length - 1])
        //console.log(ret.incomplete)
    }
    */
}



function plan_road_to_controller(spawn, roomCM) {
    destination = spawn.room.controller.pos;
    var ret = PathFinder.search(spawn.pos, destination, {
        //maxCost: 300,
        range: 2,
        plainCost: 2,
        swampCost: 2,
        maxOps: 4000,

        roomCallback: function () {

            let room = spawn.room.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            if (!room) return;
            let costs = new PathFinder.CostMatrix;

            spawn.room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART ||
                        !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 255);
                }
            });

            // avoid construction sites
            spawn.room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType != STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 255);
            });

            //favour roads under construction
            spawn.room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });

            costs.set(destination.x, destination.y, 0);

            return costs;
        }
    });


    if (ret.incomplete != true /* || true*/) {
        //creep.say(creep.moveByPath(ret.path));
        spawn.memory.source_path = ret;
        for (let i = 0; i < ret.path.length; i++) {
            if (ret.path[i].x != destination.x || ret.path[i].y != destination.y) {
                if (spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == 0) {
                    spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                    spawn.memory.building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, 2));
                    roomCM.set(ret.path[i].x, ret.path[i].y, 0);
                }

                //spawn.room.createConstructionSite(ret.path[i], STRUCTURE_ROAD);
            }

        }
    }
}





function create_extension_stamp(spawn, x, y, rcl) { // need min 3's from distanceTransform
    spawn.memory.room_plan[x][y] = STRUCTURE_EXTENSION;//middle
    spawn.memory.building_list.push(new building_list_element(x, y, spawn.room.name, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x - 1][y] = STRUCTURE_EXTENSION;//left
    spawn.memory.building_list.push(new building_list_element(x - 1, y, spawn.room.name, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x + 1][y] = STRUCTURE_EXTENSION;//right
    spawn.memory.building_list.push(new building_list_element(x + 1, y, spawn.room.name, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x][y - 1] = STRUCTURE_EXTENSION;//up
    spawn.memory.building_list.push(new building_list_element(x, y - 1, spawn.room.name, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x][y + 1] = STRUCTURE_EXTENSION;//down
    spawn.memory.building_list.push(new building_list_element(x, y + 1, spawn.room.name, STRUCTURE_EXTENSION, rcl));

    //roads around it
    spawn.memory.room_plan[x][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y + 2, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y - 2, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x + 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 2, y, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 2, y, spawn.room.name, STRUCTURE_ROAD, rcl));

    spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 1, y + 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 1, y - 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 1, y + 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_ROAD, rcl));


    return 0;
}

function create_manager_stamp(spawn, x, y, rcl) {
    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_LINK, 5));
    spawn.memory.manager_link_pos=new RoomPosition(x - 1, y - 1, spawn.room.name);
    spawn.memory.room_plan[x - 1][y] = STRUCTURE_NUKER;
    spawn.memory.building_list.push(new building_list_element(x - 1, y, spawn.room.name, STRUCTURE_NUKER, 8));
    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_TERMINAL;
    spawn.memory.building_list.push(new building_list_element(x - 1, y + 1, spawn.room.name, STRUCTURE_TERMINAL, 5));
    spawn.memory.room_plan[x][y - 1] = STRUCTURE_FACTORY;
    spawn.memory.building_list.push(new building_list_element(x, y - 1, spawn.room.name, STRUCTURE_FACTORY, 7));
    spawn.memory.room_plan[x][y + 1] = STRUCTURE_SPAWN;
    spawn.memory.building_list.push(new building_list_element(x, y + 1, spawn.room.name, STRUCTURE_SPAWN, 7));
    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_STORAGE;
    spawn.memory.building_list.push(new building_list_element(x + 1, y - 1, spawn.room.name, STRUCTURE_STORAGE, 4));
    spawn.memory.storage_pos = new RoomPosition(x + 1, y - 1, spawn.room.name);
    spawn.memory.room_plan[x + 1][y] = STRUCTURE_POWER_SPAWN;
    spawn.memory.building_list.push(new building_list_element(x + 1, y, spawn.room.name, STRUCTURE_POWER_SPAWN, 8));

    //top horizontal edge
    spawn.memory.room_plan[x - 1][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 1, y - 2, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y - 2, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x + 1][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 1, y - 2, spawn.room.name, STRUCTURE_ROAD, 4));

    //left vertical edge
    spawn.memory.room_plan[x - 2][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 2, y - 1, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x - 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 2, y, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x - 2][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 2, y + 1, spawn.room.name, STRUCTURE_ROAD, 4));

    //bottom horizontal
    spawn.memory.room_plan[x - 1][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x - 1, y + 2, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y + 2, spawn.room.name, STRUCTURE_ROAD, 4));

    //diagonals
    spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 1, y + 1, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x + 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 2, y, spawn.room.name, STRUCTURE_ROAD, 4));
    spawn.memory.room_plan[x + 2][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x + 2, y - 1, spawn.room.name, STRUCTURE_ROAD, 4));
}
function create_ramparts(spawn) {
    //vertical and horizontal borders - right and left side
    var x_left = spawn.pos.x - 7;
    var x_right = spawn.pos.x + 7;
    var y = spawn.pos.y - 3;
    var y_down = spawn.pos.y + 7;
    var y_up = spawn.pos.y - 7;
    var x = spawn.pos.x - 3;

    for (let i = 0; i < 7; i++) {
        spawn.room.createConstructionSite(x_left, y, STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_right, y, STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x, y_down, STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x, y_up, STRUCTURE_RAMPART);
        x++;
        y++;
    }

    //diagonal borders

    //left 
    x_left = spawn.pos.x - 7;
    x_right = spawn.pos.x + 7;
    var y_up1 = spawn.pos.y - 2;
    var y_up2 = spawn.pos.y - 3;
    var y_down1 = spawn.pos.y + 2;
    var y_down2 = spawn.pos.y + 3;
    for (let i = 0; i < 5; i++) {
        //left
        spawn.room.createConstructionSite(x_left, y_up1, STRUCTURE_RAMPART);//going up
        spawn.room.createConstructionSite(x_left, y_up2, STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_left, y_down1, STRUCTURE_RAMPART);//going down
        spawn.room.createConstructionSite(x_left, y_down2, STRUCTURE_RAMPART);

        //right
        spawn.room.createConstructionSite(x_right, y_up1, STRUCTURE_RAMPART);//going up
        spawn.room.createConstructionSite(x_right, y_up2, STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_right, y_down1, STRUCTURE_RAMPART);//going down
        spawn.room.createConstructionSite(x_right, y_down2, STRUCTURE_RAMPART);

        x_right--;
        x_left++;
        y_up1--;
        y_up2--;
        y_down1++;
        y_down2++;
    }
    return 0;
}

function plan_extension_stamp(spawn, roomCM, rcl) {
    var is_succes = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }

        }
    }
    let distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);

    //Seeds - starting positions for floodfill (it have to be an array - somethink iterable)
    var seeds = [];
    if (spawn.room.storage != undefined || true) {

        //seeds.push(spawn.room.storage.pos);
        seeds.push(spawn.memory.storage_pos);
        //seeds.push(spawn.room.controller.pos);
        var floodCM = spawn.room.floodFill(seeds);

        var pos_for_stamp = new RoomPosition(0, 0, spawn.room.name);
        var min_distance_from_spawn = 100;
        for (i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (distanceCM.get(i, j) >= 3 && floodCM.get(i, j) < min_distance_from_spawn) {
                    min_distance_from_spawn = floodCM.get(i, j);
                    pos_for_stamp.x = i;
                    pos_for_stamp.y = j;
                }
            }
        }

        create_extension_stamp(spawn, pos_for_stamp.x, pos_for_stamp.y, rcl);

        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (spawn.memory.room_plan[i][j] != 0) {
                    roomCM.set(i, j, 255);
                    is_succes = true;
                }
            }
        }

        return is_succes;
    }

}

function plan_manager_stamp(spawn, roomCM) {
    var is_succes = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }


    var pos_for_manager = new RoomPosition(0, 0, spawn.room.name);
    seeds = [];
    seeds.push(spawn.pos);
    //TESTING
    seeds.push(spawn.room.controller.pos);
    //TESTING

    distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);


    Memory.roomVisuals = false;
    floodCM = spawn.room.floodFill(seeds);
    Memory.roomVisuals = false

    min_distance_from_spawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 4 && floodCM.get(i, j) < min_distance_from_spawn) {
                min_distance_from_spawn = floodCM.get(i, j);
                pos_for_manager.x = i;
                pos_for_manager.y = j;
            }
        }
    }

    create_manager_stamp(spawn, pos_for_manager.x, pos_for_manager.y);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
                is_succes = true;
            }
        }
    }
    return is_succes;
}

function plan_main_spawn_stamp(spawn, roomCM) {
    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y] = STRUCTURE_SPAWN; // seting spawn pos at plan

    //if (spawn.room.controller.level >= 2) {
    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y, spawn.room.name, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y, spawn.room.name, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 1, spawn.room.name, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y - 2] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y - 2, spawn.room.name, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 1, spawn.room.name, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 2, spawn.room.name, STRUCTURE_CONTAINER, 2));

    //if (spawn.room.controller.level >= 3) {
    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 2, spawn.room.name, STRUCTURE_CONTAINER, 3));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 3, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 3, spawn.room.name, STRUCTURE_EXTENSION, 3));

    // if (spawn.room.controller.level >= 3) {
    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 2, spawn.room.name, STRUCTURE_CONTAINER, 3));

    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 1, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y - 2] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y - 2, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 3, spawn.room.name, STRUCTURE_EXTENSION, 3));

    // if (spawn.room.controller.level >= 4) {
    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 4));
    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 4));
    //if (spawn.room.controller.level >= 5) {
    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 2] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 2, spawn.room.name, STRUCTURE_LINK, 3));
    spawn.memory.filler_link_pos=new RoomPosition(spawn.pos.x, spawn.pos.y - 2, spawn.room.name)

    //}
    // }
    //}

    //}


    // }

    for (let i = 0; i < 5; i++) {
        //bottom edge
        spawn.memory.room_plan[spawn.pos.x - 2 + i][spawn.pos.y + 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2 + i, spawn.pos.y + 1, spawn.room.name, STRUCTURE_ROAD, 2));
        //top edge
        spawn.memory.room_plan[spawn.pos.x - 2 + i][spawn.pos.y - 5] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2 + i, spawn.pos.y - 5, spawn.room.name, STRUCTURE_ROAD, 2));
        //left edge
        spawn.memory.room_plan[spawn.pos.x - 3][spawn.pos.y - i] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 3, spawn.pos.y - i, spawn.room.name, STRUCTURE_ROAD, 2));
        //right edge
        spawn.memory.room_plan[spawn.pos.x + 3][spawn.pos.y - i] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 3, spawn.pos.y - i, spawn.room.name, STRUCTURE_ROAD, 2));
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }
}

function plan_tower(spawn, roomCM, rcl) {
    var is_succes = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }


    var pos_for_tower = new RoomPosition(0, 0, spawn.room.name);
    seeds = [];
    seeds.push(spawn.memory.storage_pos);
    seeds.push(spawn.pos);
    distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);
    //Memory.roomVisuals=false;
    floodCM = spawn.room.floodFill(seeds);

    min_distance_from_spawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < min_distance_from_spawn) {
                min_distance_from_spawn = floodCM.get(i, j);
                pos_for_tower.x = i;
                pos_for_tower.y = j;
            }
        }
    }

    spawn.memory.room_plan[pos_for_tower.x][pos_for_tower.y] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(pos_for_tower.x, pos_for_tower.y, spawn.room.name, STRUCTURE_TOWER, rcl));

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
                is_succes = true;
            }
        }
    }
    return is_succes;
}





function build_from_plan(spawn) {
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                spawn.room.createConstructionSite(i, j, spawn.memory.room_plan[i][j]);
            }
        }
    }
}

function build_from_lists(spawn) {
    var rcl = spawn.room.controller.level;
    for (let i = 0; i < spawn.memory.building_list.length; i++) {
        if (Game.rooms[spawn.memory.building_list[i].roomName] != undefined && (spawn.memory.building_list[i].min_rcl <= rcl || spawn.memory.building_list[i] == undefined)) {
            if (spawn.memory.building_list[i].structureType == STRUCTURE_SPAWN && spawn.memory.building_list[i].min_rcl == 7) {
                Game.rooms[spawn.memory.building_list[i].roomName].createConstructionSite(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y,
                    spawn.memory.building_list[i].structureType, spawn.room.name + "_2");

            }
            else if (spawn.memory.building_list[i].structureType == STRUCTURE_SPAWN && spawn.memory.building_list[i].min_rcl == 8) {
                Game.rooms[spawn.memory.building_list[i].roomName].createConstructionSite(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y,
                    spawn.memory.building_list[i].structureType, spawn.room.name + "_3");

            }
            else if (spawn.memory.building_list[i].structureType == STRUCTURE_RAMPART && spawn.memory.building_list[i].min_rcl <= rcl) {
                Game.rooms[spawn.memory.building_list[i].roomName].createConstructionSite(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y, spawn.memory.building_list[i].structureType);
            }
            else if (is_pos_free(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y, spawn.memory.building_list[i].roomName) == true
                && spawn.memory.building_list[i].min_rcl <= rcl) {
                Game.rooms[spawn.memory.building_list[i].roomName].createConstructionSite(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y, spawn.memory.building_list[i].structureType);
            }


        }
    }
    for (let i = 0; i < spawn.memory.road_building_list.length; i++) {

        /*
        Game.rooms[spawn.memory.road_building_list[i].roomName].visual.circle(spawn.memory.road_building_list[i].x,
            spawn.memory.road_building_list[i].y, { fill: '#666666', radius: 0.5, stroke: 'blue' });
            */
        if (spawn.memory.road_building_list[i].min_rcl <= rcl && Game.rooms[spawn.memory.road_building_list[i].roomName] != undefined) {
            Game.rooms[spawn.memory.road_building_list[i].roomName].createConstructionSite(spawn.memory.road_building_list[i].x, spawn.memory.road_building_list[i].y, spawn.memory.road_building_list[i].structureType);
            //spawn.room.createConstructionSite(spawn.memory.building_list[i].x, spawn.memory.building_list[i].y, spawn.memory.building_list[i].structureType);
        }
    }
}

function plan_borders(spawn, roomCM, rcl) {
    const buildings = spawn.memory.building_list;
    const sources2 = [];
    const costMap = new PathFinder.CostMatrix();
    const terrain = spawn.room.getTerrain()

    for (let y = 0; y < 50; y++) {
        for (let x = 0; x < 50; x++) {
            const tile = terrain.get(x, y);
            const weight =
                tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                    tile === TERRAIN_MASK_SWAMP ? 5 : // swamp => weight:  5
                        1; // plain => weight:  1
            costMap.set(x, y, weight);
        }
    }
    let max_x = 0, min_x = 50, max_y = 0, min_y = 50;

    // Set high cost on building tiles
    for (let building of buildings) {
        if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL
            && building.x > 4 && building.x < 46 && building.y > 4 && building.y < 46) {
            sources2.push({ x: building.x, y: building.y });
            costMap.set(building.x, building.y, 200);
        }
    }


    // Determine the bounding box around buildings
    buildings.forEach(building => {
        if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL) {
            max_x = Math.max(max_x, building.x);
            min_x = Math.min(min_x, building.x);
            max_y = Math.max(max_y, building.y);
            min_y = Math.min(min_y, building.y);
        }
    });

    // Expand the bounding box slightly
    const padding = 4;
    min_x = Math.max(min_x - padding, 0);
    min_y = Math.max(min_y - padding, 0);
    max_x = Math.min(max_x + padding, 49);
    max_y = Math.min(max_y + padding, 49);

    // Set medium cost on tiles around buildings within the bounding box
    for (let x = min_x; x <= max_x; x++) {
        for (let y = min_y; y <= max_y; y++) {
            // Only set the cost if it's not a building tile
            if (costMap.get(x, y) !== 200) {
                costMap.set(x, y, 150); // Slightly lower cost to indicate preference for ramparts
            }
        }
    }

    console.log(sources2.length);

    // Use minCutToExit with the prepared sources and costMap
    const rampartPositions = mincut.minCutToExit(sources2, costMap);

    // Update room_plan and building_list with rampart positions
    rampartPositions.forEach(pos => {
        var is_on_road = false;
        /*
        for (let structure of spawn.memory.building_list) {
            //if (Math.abs(structure.x - pos.x) <= 1 && Math.abs(structure.y - pos.y) <= 1 && structure.structureType == STRUCTURE_ROAD)
            if (structure.roomName == undefined) {
                continue;
            }
            if (Math.abs(structure.x - pos.x) <= 1 && Math.abs(structure.y - pos.y) <= 1 && structure.structureType == STRUCTURE_ROAD
                || spawn.memory.room_plan[pos.x][pos.y] == STRUCTURE_ROAD) {// if building on road
                console.log("creating hole in wall at:", pos.x, " ", pos.y);
                spawn.memory.room_plan[pos.x][pos.y] = STRUCTURE_RAMPART;
                buildings.push({ x: pos.x, y: pos.y, roomName: spawn.room.name, structureType: STRUCTURE_RAMPART, rcl });
                spawn.memory.building_list.push(new building_list_element(pos.x, pos.y, spawn.room.name, STRUCTURE_RAMPART, 3));
                is_on_road = true;
            }
        }
        */
        if (true /* is_on_road == false */) {
            spawn.memory.room_plan[pos.x][pos.y] = STRUCTURE_RAMPART;
            buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_RAMPART, rcl });
            spawn.memory.building_list.push(new building_list_element(pos.x, pos.y, spawn.room.name, STRUCTURE_RAMPART, rcl));
            /*
            spawn.memory.room_plan[pos.x][pos.y] = STRUCTURE_WALL;
            buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_WALL, rcl });
            spawn.memory.building_list.push(new building_list_element(pos.x, pos.y, spawn.room.name, STRUCTURE_WALL, 3));
            */
        }


        /*
        else {
            spawn.memory.room_plan[pos.x][pos.y] = STRUCTURE_RAMPART;
            buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_RAMPART, rcl });
            spawn.memory.building_list.push(new building_list_element(pos.x, pos.y, STRUCTURE_RAMPART, 3));
        }
        */
    });
}


function plan_controller_ramparts(spawn) {
    var controller_ramparts = spawn.room.controller.pos.getNearbyPositions();
    for (let position of controller_ramparts) {
        spawn.memory.room_plan[position.x][position.y] = STRUCTURE_RAMPART;
        spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_RAMPART, 3));
    }
}

function plan_controller_container(spawn) {
    spawn.memory.controller_link_pos=undefined;
    var controller_pos = spawn.room.controller.pos.getN_NearbyPositions(2);
    const terrain = spawn.room.getTerrain();
    for (let position of controller_pos) {
        if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
            spawn.memory.room_plan[position.x][position.y] = STRUCTURE_CONTAINER;
            spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_CONTAINER, 2));
            break;
        }
    }

    for (let position of controller_pos) {
        var structures_on_pos = spawn.room.lookAt(position.x, position.y);
        var is_free = true;
        for (let str of structures_on_pos) {
            if (str.structureType == STRUCTURE_CONTAINER || str.structureType == STRUCTURE_WALL || terrain.get(position.x, position.y) == TERRAIN_MASK_WALL
                || spawn.memory.room_plan[position.x][position.y] == STRUCTURE_CONTAINER) {
                is_free = false;
                break;
            }
        }
        if (is_free) {
            spawn.memory.room_plan[position.x][position.y] = STRUCTURE_LINK;
            spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_LINK, 6));
            spawn.memory.controller_link_pos=new RoomPosition(position.x, position.y, spawn.room.name);
            break;
        }
    }
}



function plan_sources_containers(spawn, roomCM, rcl) {

    spawn.memory.sources_links_pos=[]

    for (source_id of spawn.memory.farming_sources) {

        var source = Game.getObjectById(source_id.id)
        if (source != undefined) {
            var source_pos = source.pos.getNearbyPositions();
            const terrain = source.room.getTerrain();
            for (let position of source_pos) {
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (source.room.name == spawn.room.name) {
                        spawn.memory.room_plan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }

                    spawn.memory.building_list.push(new building_list_element(position.x, position.y, source.room.name, STRUCTURE_CONTAINER, 2));
                    break;
                }
            }

            if (source.room.name == spawn.room.name) {
                for (let position of source_pos) {
                    var structures_on_pos = source.room.lookAt(position.x, position.y);
                    var is_free = true;
                    for (let str of structures_on_pos) {
                        if (str.structureType == STRUCTURE_CONTAINER || str.structureType == STRUCTURE_WALL || terrain.get(position.x, position.y) == TERRAIN_MASK_WALL
                            || spawn.memory.room_plan[position.x][position.y] == STRUCTURE_CONTAINER) {
                            is_free = false;
                            break;
                        }
                    }
                    if (is_free) {
                        spawn.memory.room_plan[position.x][position.y] = STRUCTURE_LINK;
                        spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_LINK, 8));
                        spawn.memory.sources_links_pos.push(new RoomPosition(position.x, position.y,spawn.room.name))

                        break;
                    }
                }
            }

        }

    }



}


function setBaseLayout(spawn) {

    // if (Game.time % 200 != 1) { return; }
    //var myStructures = spawn.room.find(FIND_MY_STRUCTURES);
    //spawn.memory.building_list = [];
    var rows = 50;
    var cols = 50;
    let roomCM = new PathFinder.CostMatrix;


    /*
    var construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    for (a of construction_sites) {
        a.remove();
    }
    */






    const terrain = new Room.Terrain(spawn.room.name);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (terrain.get(i, j) == 1) {
                roomCM.set(i, j, 255);
            }
            if (i <= 1 || i >= 48 || j <= 1 || j >= 48) {
                // roomCM.set(i, j, 255);
            }
        }
    }

    //PathFinder.roomCallback(spawn.room.name);




    //copyinmg room structures data from planner to roomCM (this have to be done before planning every stamp)
    //var { seeds, distanceCM, floodCM, min_distance_from_spawn } = plan_extension_stamp(spawn, roomCM);
    if (spawn.memory.room_plan == undefined || spawn.memory.building_list == undefined || (spawn.memory.building_list.length == 0) || true
    ) {

        spawn.memory.room_plan = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        spawn.memory.building_list = [];
        spawn.memory.road_building_list = [];

        plan_main_spawn_stamp(spawn, roomCM);

        plan_manager_stamp(spawn, roomCM);

        //plan_road_to_controller(spawn, roomCM);
        plan_tower(spawn, roomCM, 3);
        plan_extension_stamp(spawn, roomCM, 5);
        plan_tower(spawn, roomCM, 5);
        plan_extension_stamp(spawn, roomCM, 5);
        ////console.log("PLANING EX");
        plan_extension_stamp(spawn, roomCM, 6);
        plan_extension_stamp(spawn, roomCM, 6);
        plan_tower(spawn, roomCM, 7);
        plan_extension_stamp(spawn, roomCM, 7);
        plan_tower(spawn, roomCM, 8);
        plan_tower(spawn, roomCM, 8);
        plan_tower(spawn, roomCM, 8);

        plan_sources_containers(spawn, roomCM, 2)
        //plan_sources_links(spawn, roomCM, 8);

        //plan_borders(spawn, roomCM, 4);



        plan_road_to_target(spawn, roomCM, spawn.room.controller.pos, 2);
        plan_controller_ramparts(spawn);
        plan_controller_container(spawn)

    }



    //planning roads to sources (in all farming rooms including main room)
    if (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0) {
        //console.log("AAAAAAAAAAAAAAAAAAAAAAAA");
        if (spawn.memory.farming_rooms != undefined && spawn.memory.farming_rooms.length > 0) {
            //console.log("BBBBBBBBBBBBBB");

            for (let src of spawn.memory.farming_sources) {
                if (Game.getObjectById(src.id) != null) {
                    //console.log("planning to: ", Game.getObjectById(src.id).pos);
                    plan_road_to_target(spawn, roomCM, Game.getObjectById(src.id).pos, 2)
                    //console.log(" ");
                }

            }
            var mineral = spawn.room.find(FIND_MINERALS);
            plan_road_to_target(spawn, roomCM, mineral[0], 6);

        }
    }

    //plan_road_to_target(spawn,roomCM,new RoomPosition(41,37,'W3N8'),3)
    console.log("building");
    // console.log(roomCM.get(34,0))
    //console.log(spawn.memory.room_plan[34][0])
    build_from_lists(spawn);
    //return;
    ///////////////////////////////////////////////


    ////////////////////////////////////////////////////////////////////







    // //console.log("VISUALS");
    var if_visualize = true;
    if (if_visualize) {
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (spawn.memory.room_plan[i][j] == STRUCTURE_EXTENSION) {
                    spawn.room.visual.circle(i, j, { fill: '#ffff00', radius: 0.5, stroke: 'red' });
                    ////console.log("SHOWING EXTENSION");
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_ROAD) {
                    spawn.room.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'black' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_CONTAINER) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: 'red', stroke: 'black' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_SPAWN) {
                    spawn.room.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'pink' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_STORAGE) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#666666', stroke: 'white' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_TOWER) {
                    spawn.room.visual.circle(i, j, { fill: 'red', radius: 0.5, stroke: 'red' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART) {
                    spawn.room.visual.circle(i, j, { fill: 'green', radius: 0.5, stroke: 'green' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_WALL) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'grey' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_LINK) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#000000', stroke: 'blue' });
                }
            }
        }
    }

    //var towers = spawn.room.find(FIND_MY_STRUCTURES,
    //    { filter: function (structure) { return structure.structureType == STRUCTURE_TOWER; } });

    var mineral = spawn.room.find(FIND_MINERALS);
    ////console.log("mineral pos: ", mineral[0].pos);
    spawn.room.createConstructionSite(mineral[0].pos, STRUCTURE_EXTRACTOR); // STAAYS






}
module.exports = setBaseLayout;









