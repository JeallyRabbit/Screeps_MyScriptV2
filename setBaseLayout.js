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

function plan_road_to_target(spawn, roomCM, target, rcl, my_range, start) {

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0 && spawn.memory.room_plan[i][j] != STRUCTURE_ROAD && spawn.memory.room_plan[i][j] != STRUCTURE_RAMPART) {
                roomCM.set(i, j, 255);
            }
            else if (spawn.memory.room_plan[i][j] != 0 && spawn.memory.room_plan[i][j] == STRUCTURE_ROAD
                && roomCM.get(i, j) != 255) {
                //roomCM.set(i, j, 1);
            }
        }
    }
    if (my_range == undefined) {
        my_range = 1;
    }

    //console.log("target: ", target);
    destination = target;
    var starting_pos = new RoomPosition(spawn.pos.x, spawn.pos.y, spawn.room.name)
    if (start != undefined) { starting_pos = start }
    //var ret = PathFinder.search(spawn.pos, destination, {
    var ret = PathFinder.search(starting_pos, destination, {
        //maxRooms: 64,
        range: my_range,
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
                // setting costmatrix for for rooms other than spawnRoom
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


           


            //costs.set(destination.x, destination.y, 255);

            return costs;
        }
    });




    ////////////////////////////////////

    if (ret.incomplete != true || true) {

        for (let i = 0; i < ret.path.length; i++) {

            /*
            if (destination == spawn.room.controller.pos) {
                console.log(ret.path[i].x, " ", ret.path[i].y)
            }
            */
            //if (ret.path[i].x != destination.x || ret.path[i].y != destination.y || ret.path[i].roomName != destination.roomName
            // && roomCM.get(ret.path[i].x,ret.path[i].y)<255
            // ) {

            spawn.memory.road_building_list.push(new building_list_element(ret.path[i].x, ret.path[i].y, ret.path[i].roomName, STRUCTURE_ROAD, rcl));
            if (ret.path[i].roomName == spawn.room.name && roomCM.get(ret.path[i].x, ret.path[i].y) < 255) {
                spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;

                //const terrain = spawn.room.getTerrain();

                //Game.rooms[ret.path[i].roomName].visual.circle(ret.path[i].x, ret.path[i].y, { fill: '#666666', radius: 0.5, stroke: 'pink' });

                //console.log(ret.path[i].x, " ", ret.path[i].y);
                if ((spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == 0 || spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == STRUCTURE_ROAD)
                    && is_pos_free(ret.path[i].x, ret.path[i].y, ret.path[i].roomName) == true && roomCM.get(ret.path[i].x, ret.path[i].y) < 255

                ) { // tile is empty on plan and in room
                    spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                    //roomCM.set(ret.path[i].x, ret.path[i].y, 1);
                }
            }


            //spawn.room.createConstructionSite(ret.path[i], STRUCTURE_ROAD);
            // }

        }
    }
}






function create_extension_stamp(spawn, x, y, rcl) { // need min 3's from distanceTransform
    const terrain = spawn.room.getTerrain();


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
    if (terrain.get(x, y + 2) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x][y + 2] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x, y + 2, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x, y - 2) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x][y - 2] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x, y - 2, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 2, y) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x + 2][y] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x + 2, y, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 2, y) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x - 2][y] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x - 2, y, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y + 1) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x + 1, y + 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x + 1, y - 1) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x + 1, y - 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y + 1) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x - 1, y + 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    }
    if (terrain.get(x - 1, y - 1) != TERRAIN_MASK_WALL) {
        spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_ROAD, rcl));
    }




    return 0;
}

function create_manager_stamp(spawn, x, y, rcl) {
    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_LINK, 5));
    spawn.memory.manager_link_pos = new RoomPosition(x - 1, y - 1, spawn.room.name);
    spawn.memory.room_plan[x - 1][y] = STRUCTURE_NUKER;
    spawn.memory.building_list.push(new building_list_element(x - 1, y, spawn.room.name, STRUCTURE_NUKER, 8));
    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_TERMINAL;
    spawn.memory.building_list.push(new building_list_element(x - 1, y + 1, spawn.room.name, STRUCTURE_TERMINAL, 5));
    spawn.memory.room_plan[x][y - 1] = STRUCTURE_FACTORY;
    //spawn.memory.building_list.push(new building_list_element(x, y - 1, spawn.room.name, STRUCTURE_FACTORY, 7));
    spawn.memory.room_plan[x][y + 1] = STRUCTURE_SPAWN;
    spawn.memory.building_list.push(new building_list_element(x, y + 1, spawn.room.name, STRUCTURE_SPAWN, 7));
    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_STORAGE;
    spawn.memory.building_list.push(new building_list_element(x + 1, y - 1, spawn.room.name, STRUCTURE_STORAGE, 4));
    spawn.memory.storage_pos = new RoomPosition(x + 1, y - 1, spawn.room.name);
    //spawn.memory.room_plan[x + 1][y] = STRUCTURE_POWER_SPAWN;
    //spawn.memory.building_list.push(new building_list_element(x + 1, y, spawn.room.name, STRUCTURE_POWER_SPAWN, 8));

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
        //seeds.push(spawn.pos);
        //seeds.push(spawn.room.controller.pos);
        var floodCM = spawn.room.floodFill(seeds);

        var pos_for_stamp = new RoomPosition(0, 0, spawn.room.name);
        var min_distance_from_spawn = 100;
        for (i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < min_distance_from_spawn
                    && (i > 5 && i < 45) && (j > 5 && j < 45)) {
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
    //seeds.push(spawn.room.controller.pos);
    //TESTING

    distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);


    Memory.roomVisuals = false;
    floodCM = spawn.room.floodFill(seeds);
    Memory.roomVisuals = false

    min_distance_from_spawn = 100;
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) >= 4 && floodCM.get(i, j) < min_distance_from_spawn
        && i>6 && i<44 && j>6 && j<44) {
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
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 2, spawn.room.name, STRUCTURE_CONTAINER, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 3, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y - 4, spawn.room.name, STRUCTURE_EXTENSION, 3));

    //third spawn
    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 4] = STRUCTURE_SPAWN;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 4, spawn.room.name, STRUCTURE_SPAWN, 8));

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
    spawn.memory.filler_link_pos = new RoomPosition(spawn.pos.x, spawn.pos.y - 2, spawn.room.name)

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


function plan_towers_stamp(spawn, roomCM) {
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
    distanceCM = spawn.room.distanceTransform(roomCM, false);
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

    create_tower_stamp(spawn, pos_for_tower.x, pos_for_tower.y)
    spawn.memory.pos_for_tower_keeper = pos_for_tower;
    //spawn.memory.room_plan[pos_for_tower.x][pos_for_tower.y] = STRUCTURE_TOWER;
    //spawn.memory.building_list.push(new building_list_element(pos_for_tower.x, pos_for_tower.y, spawn.room.name, STRUCTURE_TOWER, rcl));

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

function create_tower_stamp(spawn, x, y) {
    //spawn.memory.room_plan[x][y - 1] = STRUCTURE_CONTAINER;
    //spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_CONTAINER, 3));

    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(x - 1, y - 1, spawn.room.name, STRUCTURE_LINK, 8));

    spawn.memory.room_plan[x - 1][y] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x - 1, y, spawn.room.name, STRUCTURE_TOWER, 3));

    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x - 1, y + 1, spawn.room.name, STRUCTURE_TOWER, 5));

    spawn.memory.room_plan[x][y + 1] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x, y + 1, spawn.room.name, STRUCTURE_TOWER, 7));

    spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x + 1, y + 1, spawn.room.name, STRUCTURE_TOWER, 8));

    spawn.memory.room_plan[x + 1][y] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x + 1, y, spawn.room.name, STRUCTURE_TOWER, 8));

    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_TOWER;
    spawn.memory.building_list.push(new building_list_element(x + 1, y - 1, spawn.room.name, STRUCTURE_TOWER, 8));

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
                    tile === TERRAIN_MASK_SWAMP ? 1 : // swamp => weight:  5
                        1; // plain => weight:  1
            costMap.set(x, y, weight);
        }
    }
    let max_x = 0, min_x = 50, max_y = 0, min_y = 50;

    // Set high cost on building tiles
    for (let building of buildings) {
        if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL
            && building.structureType != STRUCTURE_CONTAINER && building.structureType != STRUCTURE_LINK && building.structureType != STRUCTURE_EXTRACTOR
            && building.x > 4 && building.x < 46 && building.y > 4 && building.y < 46) {
            sources2.push({ x: building.x, y: building.y });
            costMap.set(building.x, building.y, 200);
        }
    }


    // Determine the bounding box around buildings
    buildings.forEach(building => {
        /*if (building.structureType != STRUCTURE_ROAD && building.structureType != STRUCTURE_RAMPART && building.structureType != STRUCTURE_WALL
            && building.structureType != STRUCTURE_CONTAINER
        )*/
        if (building.structureType == STRUCTURE_EXTENSION || building.structureType == STRUCTURE_TOWER || building.structureType == STRUCTURE_SPAWN
            || building.structureType == STRUCTURE_STORAGE
        ) {
            max_x = Math.max(max_x, building.x);
            min_x = Math.min(min_x, building.x);
            max_y = Math.max(max_y, building.y);
            min_y = Math.min(min_y, building.y);
        }
    });

    // Expand the bounding box slightly
    const padding = 2;
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

    //console.log(sources2.length);

    // Use minCutToExit with the prepared sources and costMap
    const rampartPositions = mincut.minCutToExit(sources2, costMap);

    // Update room_plan and building_list with rampart positions
    rampartPositions.forEach(pos => {
        var is_on_road = false;
        if (true /* is_on_road == false */) {
            spawn.memory.room_plan[pos.x][pos.y] = STRUCTURE_RAMPART;

            buildings.push({ x: pos.x, y: pos.y, structureType: STRUCTURE_RAMPART, rcl });
            spawn.memory.building_list.push(new building_list_element(pos.x, pos.y, spawn.room.name, STRUCTURE_RAMPART, rcl));

        }
    });

    var rampart_entrances_list = []
    for (var i = 1; i < 48; i++) {
        for (var j = 1; j < 48; j++) {
            //findinf horizontal edges
            if (((spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && spawn.memory.room_plan[i - 1][j] == STRUCTURE_RAMPART) || (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && spawn.memory.room_plan[i + 1][j] == STRUCTURE_RAMPART))
                && i % 3 == 0
            ) {
                spawn.room.visual.circle(i, j, { fill: 'orange', radius: 0.5, stroke: 'red' });
                if (j < spawn.pos.x) {
                    spawn.room.visual.circle(i, j + 1, { fill: 'black', radius: 0.5, stroke: 'red' });
                    //spawn.memory.room_plan[i][j + 1] = STRUCTURE_RAMPART
                    rampart_entrances_list.push(new building_list_element(i, j + 1, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    spawn.memory.building_list.push(new building_list_element(i, j + 1, spawn.room.name, STRUCTURE_RAMPART, rcl));

                    spawn.room.visual.circle(i, j + 2, { fill: 'red', radius: 0.5, stroke: 'red' });
                    //spawn.memory.room_plan[i][j + 2] = STRUCTURE_RAMPART
                    spawn.memory.building_list.push(new building_list_element(i, j + 2, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i, j + 2, spawn.room.name, STRUCTURE_RAMPART, rcl));
                }
                else {
                    spawn.room.visual.circle(i, j - 1, { fill: 'red', radius: 0.5, stroke: 'red' });
                    spawn.memory.building_list.push(new building_list_element(i, j - 1, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i, j - 1, spawn.room.name, STRUCTURE_RAMPART, rcl));

                    spawn.room.visual.circle(i, j - 2, { fill: 'red', radius: 0.5, stroke: 'red' });
                    spawn.memory.building_list.push(new building_list_element(i, j - 2, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    //building_list.push(new building_list_element(i, j - 2, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i, j - 2, spawn.room.name, STRUCTURE_RAMPART, rcl));
                }
                //console.log("teeth: ", i, " ", j)
            }//vertical
            else if (((spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && spawn.memory.room_plan[i][j - 1] == STRUCTURE_RAMPART) || (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && spawn.memory.room_plan[i][j + 1] == STRUCTURE_RAMPART))
                && j % 3 == 0
            ) {
                spawn.room.visual.circle(i, j, { fill: 'orange', radius: 0.5, stroke: 'red' });

                if (i < spawn.pos.y) {
                    spawn.room.visual.circle(i + 1, j, { fill: 'red', radius: 0.5, stroke: 'red' });
                    //spawn.memory.room_plan[i + 1][j] = STRUCTURE_RAMPART
                    spawn.memory.building_list.push(new building_list_element(i + 1, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i + 1, j, spawn.room.name, STRUCTURE_RAMPART, rcl));

                    spawn.room.visual.circle(i + 2, j, { fill: 'red', radius: 0.5, stroke: 'red' });
                    spawn.memory.building_list.push(new building_list_element(i + 2, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i + 2, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                }
                else {
                    spawn.room.visual.circle(i - 1, j, { fill: 'red', radius: 0.5, stroke: 'red' });
                    //spawn.memory.room_plan[i - 1][j] = STRUCTURE_RAMPART
                    spawn.memory.building_list.push(new building_list_element(i - 1, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i - 1, j, spawn.room.name, STRUCTURE_RAMPART, rcl));

                    spawn.room.visual.circle(i - 2, j, { fill: 'red', radius: 0.5, stroke: 'red' });
                    //spawn.memory.room_plan[i - 2][j] = STRUCTURE_RAMPART
                    spawn.memory.building_list.push(new building_list_element(i - 2, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                    rampart_entrances_list.push(new building_list_element(i - 2, j, spawn.room.name, STRUCTURE_RAMPART, rcl));
                }
                //console.log("teeth: ", i, " ", j)
            }
        }
    }

    for (r of rampart_entrances_list) {
        spawn.memory.room_plan[r.x][r.y] = STRUCTURE_RAMPART
    }
}


function plan_controller_ramparts(spawn) {
    var controller_ramparts = spawn.room.controller.pos.getNearbyPositions();
    for (let position of controller_ramparts) {
        spawn.memory.room_plan[position.x][position.y] = STRUCTURE_RAMPART;
        spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_RAMPART, 4));
    }
}

function plan_controller_container(spawn) {
    spawn.memory.controller_link_pos = undefined;
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
            spawn.memory.controller_link_pos = new RoomPosition(position.x, position.y, spawn.room.name);
            break;
        }
    }
}



function plan_sources_containers(spawn, roomCM, rcl) {

    spawn.memory.sources_links_pos = []

    for (source_id of spawn.memory.farming_sources) {

        var source = Game.getObjectById(source_id.id)
        if (source != undefined) {
            var source_pos = source.pos.getN_NearbyPositions(1);
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

            var source_pos = source.pos.getN_NearbyPositions(1);
            if (source.room.name == spawn.room.name) {
                for (let position of source_pos) {
                    var structures_on_pos = source.room.lookAt(position.x, position.y);
                    var is_free = true;
                    for (let str of structures_on_pos) {
                        if (/*str.structureType == STRUCTURE_CONTAINER || */ str.structureType == STRUCTURE_WALL || terrain.get(position.x, position.y) == TERRAIN_MASK_WALL
                            || spawn.memory.room_plan[position.x][position.y] == STRUCTURE_CONTAINER) {
                            is_free = false;
                            break;
                        }
                    }
                    if (is_free) {
                        //console.log("pos: ",position," is free");
                        spawn.memory.room_plan[position.x][position.y] = STRUCTURE_LINK;
                        spawn.memory.building_list.push(new building_list_element(position.x, position.y, spawn.room.name, STRUCTURE_LINK, 8));
                        spawn.memory.sources_links_pos.push(new RoomPosition(position.x, position.y, spawn.room.name))
                        break;
                    }/*
                    else
                    {
                        console.log("pos: ",position," is not free");
                    }*/
                }



            }

        }

    }
}

function plan_keeper_sources_containers(spawn, roomCM, rcl) {

    for (source_id of spawn.memory.keepers_sources) {

        var source = Game.getObjectById(source_id.id)
        if (source != undefined) {
            var source_pos = source.pos.getN_NearbyPositions(1);
            const terrain = source.room.getTerrain();
            for (let position of source_pos) {
                if (terrain.get(position.x, position.y) != TERRAIN_MASK_WALL) {
                    if (source.room.name == spawn.room.name) {
                        //spawn.memory.room_plan[position.x][position.y] = STRUCTURE_CONTAINER;
                    }

                    spawn.memory.building_list.push(new building_list_element(position.x, position.y, source.room.name, STRUCTURE_CONTAINER, rcl));
                    break;
                }
            }

        }

    }
}
Spawn.prototype.setBaseLayout = function setBaseLayout(spawn) {

    // if (Game.time % 200 != 1) { return; }
    //var myStructures = spawn.room.find(FIND_MY_STRUCTURES);
    //spawn.memory.building_list = [];
    var stage = undefined
    console.log("PLANING BASE AT: ", spawn.room.name)
    /*
    if(roomCM==undefined)
    {
        console.log("roomCM is undefined");
        return;
    }
        */

    if (spawn.memory.if_success_planing_base == false) {
        spawn.memory.building_stage = undefined
    }
    spawn.memory.if_success_planing_base = false;

    if (spawn.memory.building_stage == undefined || (spawn.memory.building_stage != undefined && spawn.memory.building_stage > 40)) { // if stage is out of bounds
        spawn.memory.building_stage = 0;
        stage = spawn.memory.building_stage;
    }




    if (spawn.memory.building_stage != undefined && spawn.memory.building_stage < 0 || spawn.memory.building_stage > 4) {
        console.log("stage out of bounds")
        if (spawn.memory.building_stage > 4) {
            //stage++
            spawn.memory.building_stage++;
        }
        return;
    }

    stage = spawn.memory.building_stage;

    //stage=0;
    var rows = 50;
    var cols = 50;

    console.log(spawn.room.name, " is planing ", stage, " stage")
    if (stage == 0) // planning stamps
    {

        var cpu_before = Game.cpu.getUsed()
        let roomCM = new PathFinder.CostMatrix;
        const terrain = new Room.Terrain(spawn.room.name);
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (terrain.get(i, j) == 1) {
                    roomCM.set(i, j, 255);
                }
            }
        }

        spawn.memory.room_plan = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
        spawn.memory.building_list = [];
        spawn.memory.road_building_list = [];

        plan_main_spawn_stamp(spawn, roomCM);

        plan_manager_stamp(spawn, roomCM);

        //plan_road_to_controller(spawn, roomCM);
        plan_extension_stamp(spawn, roomCM, 5);
        plan_extension_stamp(spawn, roomCM, 5);
        plan_extension_stamp(spawn, roomCM, 6);
        plan_extension_stamp(spawn, roomCM, 6);
        plan_extension_stamp(spawn, roomCM, 7);
        plan_extension_stamp(spawn, roomCM, 7);
        plan_towers_stamp(spawn, roomCM);
        plan_sources_containers(spawn, roomCM, 2);
        plan_keeper_sources_containers(spawn, roomCM, 7)


        spawn.memory.roomCM = roomCM.serialize();
        spawn.memory.building_stage++;
        var cpu_after = Game.cpu.getUsed();
        spawn.memory.cpu_spent_for_stamps = cpu_after - cpu_before;
    }
    else if (stage == 1) // planning borders
    {
        var cpu_before = Game.cpu.getUsed()
        let roomCM_1 = PathFinder.CostMatrix.deserialize(spawn.memory.roomCM);
        if (Game.shard.name != 'shard3') {
            plan_borders(spawn, roomCM_1, 4);
        }
        spawn.memory.roomCM = roomCM_1.serialize();
        spawn.memory.building_stage++;
        var cpu_after = Game.cpu.getUsed()
        spawn.memory.cpu_for_borders = cpu_after - cpu_before
    }
    else if (stage == 2) // planing roads
    {
        var cpu_before = Game.cpu.getUsed()
        let roomCM_2 = PathFinder.CostMatrix.deserialize(spawn.memory.roomCM);
        plan_road_to_target(spawn, roomCM_2, spawn.room.controller.pos.getNearbyPositions(), 2);
        var mineral = spawn.room.find(FIND_MINERALS);
        plan_road_to_target(spawn, roomCM_2, mineral[0].pos.getNearbyPositions(), 6);
        if (Game.shard.name != 'shard3') {
            plan_controller_ramparts(spawn);
        }

        plan_controller_container(spawn)

        //planning roads to sources (in all farming rooms including main room)
        if ((spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0) || spawn.room.controller.level >= 4) {
            //console.log("AAAAAAAAAAAAAAAAAAAAAAAA");
            //planning roads to farming_sources
            if (spawn.memory.farming_rooms != undefined && spawn.memory.farming_rooms.length > 0) {
                //console.log("BBBBBBBBBBBBBB");

                for (let src of spawn.memory.farming_sources) {
                    //console.log("src: ",src)
                    if (Game.getObjectById(src.id) != null) {
                        //console.log("planning to: ", Game.getObjectById(src.id).pos);
                        plan_road_to_target(spawn, roomCM_2, Game.getObjectById(src.id).pos.getNearbyPositions(), 2)
                        //console.log(" ");
                    }

                }
            }

            /* moved to stage 3
            //planning roads to keepers_sources
            if (spawn.memory.keepers_sources != undefined && spawn.memory.keepers_sources.length > 0) {
                for (let src of spawn.memory.keepers_sources) {
                    //console.log("src: ",src)
                    if (Game.getObjectById(src.id) != null) {
                        //console.log("planning to: ", Game.getObjectById(src.id).pos);
                        plan_road_to_target(spawn, roomCM_2, Game.getObjectById(src.id).pos.getNearbyPositions(), 2)


                        // planning road between sources
                        for (let other_src of spawn.memory.keepers_sources) {
                            if (Game.getObjectById(other_src.id) != null && other_src.id != src.id) {
                                plan_road_to_target(spawn, roomCM_2,
                                    Game.getObjectById(src.id).pos, 2, 2,
                                    Game.getObjectById(other_src.id))
                            }
                        }
                        //console.log(" ");
                    }

                }
            }*/

        }


        spawn.memory.roomCM = roomCM_2.serialize();
        spawn.memory.building_stage++;
        var cpu_after = Game.cpu.getUsed()
        spawn.memory.cpu_for_roads1 = cpu_after - cpu_before
    }
    else if (stage == 3) {

        var cpu_before = Game.cpu.getUsed()
        let roomCM_2 = PathFinder.CostMatrix.deserialize(spawn.memory.roomCM);
        if ((spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0) || spawn.room.controller.level >= 4) {


            if (spawn.memory.keepers_sources != undefined && spawn.memory.keepers_sources.length > 0) {
                for (let src of spawn.memory.keepers_sources) {
                    //console.log("src: ",src)
                    if (Game.getObjectById(src.id) != null) {
                        //console.log("planning to: ", Game.getObjectById(src.id).pos);
                        plan_road_to_target(spawn, roomCM_2, Game.getObjectById(src.id).pos.getNearbyPositions(), 2)


                        // planning road between sources
                        for (let other_src of spawn.memory.keepers_sources) {
                            if (Game.getObjectById(other_src.id) != null && other_src.id != src.id
                        && Game.getObjectById(other_src.id).pos!=undefined ) {
                                plan_road_to_target(spawn, roomCM_2,
                                    Game.getObjectById(src.id).pos.getNearbyPositions(), 2, 2,
                                    Game.getObjectById(other_src.id).pos)
                            }
                        }
                        //console.log(" ");
                    }

                }
            }

        }

        spawn.memory.roomCM = roomCM_2.serialize();
        spawn.memory.building_stage++;
        var cpu_after = Game.cpu.getUsed()
        spawn.memory.cpu_for_roads2 = cpu_after - cpu_before

    }
    else if (stage == 4) {
        var cpu_before = Game.cpu.getUsed()
        build_from_lists(spawn);
        spawn.memory.building_stage++;
        var cpu_after = Game.cpu.getUsed()
        spawn.memory.cpu_for_building = cpu_after - cpu_before
    }
    else if (stage == 5) {
        var mineral = spawn.room.find(FIND_MINERALS);
        ////console.log("mineral pos: ", mineral[0].pos);
        spawn.room.createConstructionSite(mineral[0].pos, STRUCTURE_EXTRACTOR);
        spawn.memory.building_stage++;
    }

    spawn.memory.if_success_planing_base = true;

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


}









