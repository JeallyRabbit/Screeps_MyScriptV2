const { create } = require("lodash");
//const { move_avoid_hostile } = require("./move_avoid_hostile");
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");
//const {mincut}=require("./mincut")


class building_list_element {
    constructor(x, y, structureType, min_rcl) {
        this.x = x;
        this.y = y;
        this.structureType = structureType;
        this.min_rcl = min_rcl;
    }
}


function create_extension_stamp(spawn, x, y,rcl) { // need min 3's from distanceTransform
    spawn.memory.room_plan[x][y] = STRUCTURE_EXTENSION;//middle
    spawn.memory.building_list.push(new building_list_element(x, y, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x - 1][y] = STRUCTURE_EXTENSION;//left
    spawn.memory.building_list.push(new building_list_element(x-1, y, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x + 1][y] = STRUCTURE_EXTENSION;//right
    spawn.memory.building_list.push(new building_list_element(x+1, y, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x][y - 1] = STRUCTURE_EXTENSION;//up
    spawn.memory.building_list.push(new building_list_element(x, y-1, STRUCTURE_EXTENSION, rcl));
    spawn.memory.room_plan[x][y + 1] = STRUCTURE_EXTENSION;//down
    spawn.memory.building_list.push(new building_list_element(x, y+1, STRUCTURE_EXTENSION, rcl));

    /*
    spawn.room.createConstructionSite(x, y, STRUCTURE_EXTENSION);//midle
    spawn.room.createConstructionSite(x - 1, y, STRUCTURE_EXTENSION);//left
    spawn.room.createConstructionSite(x + 1, y, STRUCTURE_EXTENSION);//right
    spawn.room.createConstructionSite(x, y - 1, STRUCTURE_EXTENSION);//up
    spawn.room.createConstructionSite(x, y + 1, STRUCTURE_EXTENSION);//down
    */

    //roads around it
    spawn.memory.room_plan[x][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y+2, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y-2, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x + 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+2, y, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-2, y, STRUCTURE_ROAD, rcl));

    spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+1, y+1, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+1, y-1, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-1, y+1, STRUCTURE_ROAD, rcl));
    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-1, y-1, STRUCTURE_ROAD, rcl));

    /*
    spawn.room.createConstructionSite(x, y + 2, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x, y - 2, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x + 2, y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x - 2, y, STRUCTURE_ROAD);

    spawn.room.createConstructionSite(x + 1, y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x + 1, y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x - 1, y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite(x - 1, y - 1, STRUCTURE_ROAD);
    */

    return 0;
}

function create_manager_stamp(spawn, x, y,rcl) {
    spawn.memory.room_plan[x - 1][y - 1] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(x-1, y-1, STRUCTURE_LINK, 5));
    spawn.memory.room_plan[x - 1][y] = STRUCTURE_NUKER;
    spawn.memory.building_list.push(new building_list_element(x-1, y, STRUCTURE_NUKER, 8));
    spawn.memory.room_plan[x - 1][y + 1] = STRUCTURE_TERMINAL;
    spawn.memory.building_list.push(new building_list_element(x-1, y+1, STRUCTURE_TERMINAL, 5));
    spawn.memory.room_plan[x][y - 1] = STRUCTURE_FACTORY;
    spawn.memory.building_list.push(new building_list_element(x, y-1, STRUCTURE_FACTORY, 7));
    spawn.memory.room_plan[x][y + 1] = STRUCTURE_SPAWN;
    spawn.memory.building_list.push(new building_list_element(x, y+1, STRUCTURE_SPAWN, 7));
    spawn.memory.room_plan[x + 1][y - 1] = STRUCTURE_STORAGE;
    spawn.memory.building_list.push(new building_list_element(x+1, y-1, STRUCTURE_SPAWN, 4));
    spawn.memory.room_plan[x + 1][y] = STRUCTURE_POWER_SPAWN;
    spawn.memory.building_list.push(new building_list_element(x+1, y, STRUCTURE_SPAWN, 8));

    //top horizontal edge
    spawn.memory.room_plan[x - 1][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-1, y-2, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y-2, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x + 1][y - 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+1, y-2, STRUCTURE_ROAD, 5));

    //left vertical edge
    spawn.memory.room_plan[x - 2][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-2, y-1, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x - 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-2, y, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x - 2][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-2, y+1, STRUCTURE_ROAD, 5));

    //bottom horizontal
    spawn.memory.room_plan[x - 1][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x-1, y+2, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x][y + 2] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x, y+2, STRUCTURE_ROAD, 5));

    //diagonals
    spawn.memory.room_plan[x + 1][y + 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+1, y+1, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x + 2][y] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+2, y, STRUCTURE_ROAD, 5));
    spawn.memory.room_plan[x + 2][y - 1] = STRUCTURE_ROAD;
    spawn.memory.building_list.push(new building_list_element(x+2, y-1, STRUCTURE_ROAD, 5));
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

function plan_extension_stamp(spawn, roomCM,rcl) {
    var is_succes = false;
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }
    //console.log(terrain.get(28,20));
    let distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);

    //Seeds - starting positions for floodfill (it have to be an array - somethink iterable)
    var seeds = [];
    if (spawn.room.storage != undefined) {
        seeds.push(spawn.room.storage.pos);
        //seeds.push(spawn.room.controller.pos);
        var floodCM = spawn.room.floodFill(seeds);

        var pos_for_stamp = new RoomPosition(0, 0, spawn.room.name);
        var min_distance_from_spawn = 100;
        for (i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (distanceCM.get(i, j) > 2 && floodCM.get(i, j) < min_distance_from_spawn) {
                    min_distance_from_spawn = floodCM.get(i, j);
                    pos_for_stamp.x = i;
                    pos_for_stamp.y = j;
                }
            }
        }

        create_extension_stamp(spawn, pos_for_stamp.x, pos_for_stamp.y,rcl);

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
    seeds.push(spawn.room.controller.pos);
    distanceCM = spawn.room.diagonalDistanceTransform(roomCM, false);
    floodCM = spawn.room.floodFill(seeds);

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
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 1, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y - 2] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y - 2, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 1, STRUCTURE_EXTENSION, 2));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 2, STRUCTURE_CONTAINER, 2));

    //if (spawn.room.controller.level >= 3) {
    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 2, STRUCTURE_CONTAINER, 3));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 3, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 2, spawn.pos.y - 4, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x + 1][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 1, spawn.pos.y - 4, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 4, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 3, STRUCTURE_EXTENSION, 3));

    // if (spawn.room.controller.level >= 3) {
    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 2] = STRUCTURE_CONTAINER;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 2, STRUCTURE_CONTAINER, 3));

    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 1] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 1, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y - 2] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y - 2, STRUCTURE_EXTENSION, 3));

    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 3] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 3, STRUCTURE_EXTENSION, 3));

    // if (spawn.room.controller.level >= 4) {
    spawn.memory.room_plan[spawn.pos.x - 2][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 2, spawn.pos.y - 4, STRUCTURE_EXTENSION, 4));
    spawn.memory.room_plan[spawn.pos.x - 1][spawn.pos.y - 4] = STRUCTURE_EXTENSION;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 1, spawn.pos.y - 4, STRUCTURE_EXTENSION, 4));
    //if (spawn.room.controller.level >= 5) {
    spawn.memory.room_plan[spawn.pos.x][spawn.pos.y - 2] = STRUCTURE_LINK;
    spawn.memory.building_list.push(new building_list_element(spawn.pos.x, spawn.pos.y - 2, STRUCTURE_LINK, 3));

    //}
    // }
    //}

    //}


    // }

    for (let i = 0; i < 7; i++) {
        //bottom edge
        spawn.memory.room_plan[spawn.pos.x - 3 + i][spawn.pos.y + 1] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 3 + i,spawn.pos.y + 1, STRUCTURE_ROAD, 2));
        //top edge
        spawn.memory.room_plan[spawn.pos.x - 3 + i][spawn.pos.y - 5] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 3 + i,spawn.pos.y - 5, STRUCTURE_ROAD, 2));
        //left edge
        spawn.memory.room_plan[spawn.pos.x - 3][spawn.pos.y + 1 - i] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x - 3,spawn.pos.y + 1 - i, STRUCTURE_ROAD, 2));
        //right edge
        spawn.memory.room_plan[spawn.pos.x + 3][spawn.pos.y + 1 - i] = STRUCTURE_ROAD;
        spawn.memory.building_list.push(new building_list_element(spawn.pos.x + 3,spawn.pos.y + 1 - i, STRUCTURE_ROAD, 2));
    }

    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (spawn.memory.room_plan[i][j] != 0) {
                roomCM.set(i, j, 255);
            }
        }
    }
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

function build_from_list(spawn)
{
    var rcl=spawn.room.controller.level;
    for(let i=0;i<spawn.memory.building_list.length;i++)
    {
        //console.log(spawn.memory.building_list[i].rcl);
        if(spawn.memory.building_list[i].min_rcl<=rcl)
        {
            //console.log("tryuing to build: ", spawn.memory.building_list[i].structureType);
            //console.log("on: ",spawn.memory.building_list[i].x,":",spawn.memory.building_list[i].y);
            spawn.room.createConstructionSite(spawn.memory.building_list[i].x,spawn.memory.building_list[i].y,spawn.memory.building_list[i].structureType);
        }
    }
}


function setBaseLayout(spawn) {

    // if (Game.time % 200 != 1) { return; }
    //var myStructures = spawn.room.find(FIND_MY_STRUCTURES);
    spawn.memory.building_list = [];
    var rows = 50;
    var cols = 50;
    let roomCM = new PathFinder.CostMatrix;
    spawn.memory.room_plan = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

    //TOWER - NEED TO BE CHANGED
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y + 4, STRUCTURE_TOWER);
    spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y + 4] = STRUCTURE_TOWER;
    console.log(spawn.memory.room_plan[spawn.pos.x + 2][spawn.pos.y + 4]);



    //Road to controller
    route_targets = spawn.room.controller;
    if (route_targets != undefined) {
        //console.log('routing to controller');
        //move_avoid_hostile(spawn,Game.getObjectById(route_targets[i]),1,false,undefined,2,2);
        destination = route_targets.pos;
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
                        return construction.structureType != STRUCTURE_ROAD
                    }
                }).forEach(function (struct) {
                    costs.set(struct.pos.x, struct.pos.y, 255);
                });

                costs.set(destination.x, destination.y, 1);

                return costs;
            }
        });

        if (ret.incomplete != true || true) {
            //creep.say(creep.moveByPath(ret.path));
            spawn.memory.source_path = ret;
            for (let i = 0; i < ret.path.length; i++) {
                if (ret.path[i].x != destination.x || ret.path[i].y != destination.y) {
                    //console.log(destination, " ", ret.path[i]);
                    if (spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] == 0) {
                        spawn.memory.room_plan[ret.path[i].x][ret.path[i].y] = STRUCTURE_ROAD;
                        spawn.memory.building_list.push(new building_list_element(ret.path[i].x,ret.path[i].y, STRUCTURE_ROAD, 2));
                        roomCM.set(ret.path[i].x, ret.path[i].y, 255);
                    }

                    //spawn.room.createConstructionSite(ret.path[i], STRUCTURE_ROAD);
                }

            }
            //console.log("FOUND ROUTE");
        }
    }



    const terrain = new Room.Terrain(spawn.room.name);
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (terrain.get(i, j) == 1) {
                roomCM.set(i, j, 255);
            }
        }
    }

    //PathFinder.roomCallback(spawn.room.name);




    //copyinmg room structures data from planner to roomCM (this have to be done before planning every stamp)
    //var { seeds, distanceCM, floodCM, min_distance_from_spawn } = plan_extension_stamp(spawn, roomCM);

    plan_main_spawn_stamp(spawn,roomCM);
    plan_manager_stamp(spawn,roomCM);
    plan_extension_stamp(spawn,roomCM,4)
    plan_extension_stamp(spawn,roomCM,4)
    plan_extension_stamp(spawn,roomCM,5)
    plan_extension_stamp(spawn,roomCM,6)
    build_from_list(spawn);
    /*
    if (spawn.room.controller.level >= 2) {
        plan_main_spawn_stamp(spawn, roomCM);
        //build_from_plan(spawn);
        if (spawn.room.controller.level >= 4) {
            if (spawn.memory.lvl4_building == undefined || true) {
                if (plan_manager_stamp(spawn, roomCM) == true && plan_extension_stamp(spawn, roomCM) == true) {
                    spawn.memory.lvl4_building = true;
                }
                else {
                    spawn.memory.lvl4_building = undefined
                }

            }

            if (spawn.room.controller.level >= 5) {
                if (spawn.memory.lvl5_building == undefined || true)
                    if (plan_extension_stamp(spawn, roomCM) == true) {
                        spawn.memory.lvl5_building = true;
                    }
                    else {
                        spawn.memory.lvl5_building = undefined
                    }
            }
            plan_extension_stamp(spawn, roomCM);
            plan_extension_stamp(spawn, roomCM);
            plan_extension_stamp(spawn, roomCM);
            plan_extension_stamp(spawn, roomCM);


            //build_from_list(spawn);
            
            if (spawn.room.controller.level >= 5) {
                plan_extension_stamp(spawn, roomCM);
                plan_extension_stamp(spawn, roomCM);
            }
            
        }
    }
    */



    //plan_manager_stamp(spawn, roomCM);
    //plan_extension_stamp(spawn,roomCM);
    //plan_extension_stamp(spawn,roomCM);






    var if_visualize = true;
    if (if_visualize) {
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                if (spawn.memory.room_plan[i][j] == STRUCTURE_EXTENSION) {
                    spawn.room.visual.circle(i, j, { fill: '#ffff00', radius: 0.5, stroke: 'red' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_ROAD) {
                    spawn.room.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'black' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_CONTAINER) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#666666', stroke: 'black' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_SPAWN) {
                    spawn.room.visual.circle(i, j, { fill: '#666666', radius: 0.5, stroke: 'pink' });
                }
                else if (spawn.memory.room_plan[i][j] == STRUCTURE_STORAGE) {
                    spawn.room.visual.rect(i - 0.25, j - 0.4, 0.5, 0.8, { fill: '#666666', stroke: 'white' });
                }
            }
        }
    }

    var towers = spawn.room.find(FIND_MY_STRUCTURES,
        { filter: function (structure) { return structure.structureType == STRUCTURE_TOWER; } });

    var mineral = spawn.room.find(FIND_MINERALS);
    //console.log("mineral pos: ", mineral[0].pos);
    spawn.room.createConstructionSite(mineral[0].pos, STRUCTURE_EXTRACTOR); // STAAYS






}
module.exports = setBaseLayout;






