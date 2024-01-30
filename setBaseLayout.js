const { create } = require("lodash");
const { move_avoid_hostile } = require("./move_avoid_hostile");

function create_extension_stamp(spawn, x, y) {
    spawn.room.createConstructionSite(x, y, STRUCTURE_EXTENSION);//midle
    spawn.room.createConstructionSite(x - 1, y, STRUCTURE_EXTENSION);//left
    spawn.room.createConstructionSite(x + 1, y, STRUCTURE_EXTENSION);//right
    spawn.room.createConstructionSite(x, y - 1, STRUCTURE_EXTENSION);//up
    spawn.room.createConstructionSite(x, y + 1, STRUCTURE_EXTENSION);//down

    if (spawn.room.controller.level > 1) {
        spawn.room.createConstructionSite(x, y + 2, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x, y - 2, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x + 2, y, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x - 2, y, STRUCTURE_ROAD);

        spawn.room.createConstructionSite(x + 1, y + 1, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x + 1, y - 1, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x - 1, y + 1, STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x - 1, y - 1, STRUCTURE_ROAD);
    }

    return 0;
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



function setBaseLayout(spawn) {

   // if (Game.time % 200 != 1) { return; }
    var myStructures = spawn.room.find(FIND_MY_STRUCTURES);

    spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y + 3, STRUCTURE_SPAWN, 'Spawn2'); //left
    //spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y + 3, STRUCTURE_WALL);
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y + 3, STRUCTURE_SPAWN, 'Spawn3'); // right

    if(spawn.room.controller.level>=2)
    {
        spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y - 1 , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y - 2 , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y -1 , STRUCTURE_EXTENSION);

        spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y -2 , STRUCTURE_CONTAINER);
    }
    if(spawn.room.controller.level>=3)
    {
        spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y -3, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y -4, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y -4, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x , spawn.pos.y -4, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x , spawn.pos.y -3, STRUCTURE_EXTENSION);
    }
    if(spawn.room.controller.level>=4)
    {
        spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y -2 , STRUCTURE_CONTAINER);
        spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y , STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y -1, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y -2, STRUCTURE_EXTENSION);

        spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y -3, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y -4, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y -4, STRUCTURE_EXTENSION);
    }
    
    /*
    for (let i = 0; i < 3; i++) {
        //spawn.room.createConstructionSite(spawn.pos.x + 2 + i, spawn.pos.y + i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 2 + i, spawn.pos.y + 1 + i, STRUCTURE_EXTENSION);

        spawn.room.createConstructionSite(spawn.pos.x + i, spawn.pos.y + 2 + i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 1 + i, spawn.pos.y + 2 + i, STRUCTURE_EXTENSION);
    }
    for (let i = 0; i < 3; i++) {
        spawn.room.createConstructionSite(spawn.pos.x + 5 - i, spawn.pos.y + 4 + i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 5 - i, spawn.pos.y + 5 + i, STRUCTURE_EXTENSION);
    }
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y + 5, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y + 5, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y + 7, STRUCTURE_EXTENSION);

    for (let i = 0; i < 6; i++) {
        spawn.room.createConstructionSite(spawn.pos.x - i, spawn.pos.y + 7 - i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 1 - i, spawn.pos.y + 7 - i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x + 1 - i, spawn.pos.y + 6 - i, STRUCTURE_EXTENSION);
    }
    */
   /*
    for (let i = 0; i < 4; i++) {
        spawn.room.createConstructionSite(spawn.pos.x - i, spawn.pos.y + 4 - i, STRUCTURE_EXTENSION);
    }
    spawn.room.createConstructionSite(spawn.pos.x - 6, spawn.pos.y + 1, STRUCTURE_EXTENSION);
    for (let i = 0; i < 3; i++) {
        spawn.room.createConstructionSite(spawn.pos.x - 4 + i, spawn.pos.y - 1 - i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 3 + i, spawn.pos.y - 1 - i, STRUCTURE_EXTENSION);

        spawn.room.createConstructionSite(spawn.pos.x - 6 + i, spawn.pos.y - 1 - i, STRUCTURE_EXTENSION);
        spawn.room.createConstructionSite(spawn.pos.x - 6 + i, spawn.pos.y - 2 - i, STRUCTURE_EXTENSION);
    }
    spawn.room.createConstructionSite(spawn.pos.x - 3, spawn.pos.y - 5, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite(spawn.pos.x - 3, spawn.pos.y - 6, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y - 6, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y - 6, STRUCTURE_EXTENSION);
    */

    //Create STORAGE - stays
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y - 2, STRUCTURE_STORAGE);

    //create link next to storage - stays
    spawn.room.createConstructionSite(spawn.pos.x + 3, spawn.pos.y - 3, STRUCTURE_LINK);

    //Create TOWERS - CHANGE
    //spawn.room.createConstructionSite(spawn.pos.x - 2, spawn.pos.y - 1, STRUCTURE_TOWER);
    //spawn.room.createConstructionSite(spawn.pos.x - 1, spawn.pos.y - 2, STRUCTURE_TOWER);
    
    /*
    spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y - 2, STRUCTURE_TOWER);
    spawn.room.createConstructionSite(spawn.pos.x, spawn.pos.y - 3, STRUCTURE_TOWER);
    spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y - 4, STRUCTURE_TOWER);
    spawn.room.createConstructionSite(spawn.pos.x + 2, spawn.pos.y - 3, STRUCTURE_TOWER);
    */

    //create terminal - stays
    spawn.room.createConstructionSite(spawn.pos.x + 1, spawn.pos.y - 1, STRUCTURE_TERMINAL);// build terminal

    var towers = spawn.room.find(FIND_MY_STRUCTURES,
        { filter: function (structure) { return structure.structureType == STRUCTURE_TOWER; } });
    if (spawn.room.controller.level >= 3 && towers != undefined && towers.length > 0) {
        /*
        //create_ramparts(spawn); //CHANGE
        for(let i=0;i<3;i++)
        {
            spawn.room.createConstructionSite(spawn.pos.x+5-i,spawn.pos.y+4+i,STRUCTURE_RAMPART);
            spawn.room.createConstructionSite(spawn.pos.x+5-i,spawn.pos.y+5+i,STRUCTURE_RAMPART);
        }
        spawn.room.createConstructionSite(spawn.pos.x+1,spawn.pos.y+7,STRUCTURE_RAMPART);

        for(let i=0;i<6;i++)
        {
            spawn.room.createConstructionSite(spawn.pos.x-i,spawn.pos.y+7-i,STRUCTURE_RAMPART);
            spawn.room.createConstructionSite(spawn.pos.x-1-i,spawn.pos.y+7-i,STRUCTURE_RAMPART);
        }
            spawn.room.createConstructionSite(spawn.pos.x-6,spawn.pos.y+1,STRUCTURE_RAMPART);
            spawn.room.createConstructionSite(spawn.pos.x-6,spawn.pos.y,STRUCTURE_RAMPART);
        for(let i=0;i<3;i++)
        {
            spawn.room.createConstructionSite(spawn.pos.x-6+i,spawn.pos.y-1-i,STRUCTURE_RAMPART);
            spawn.room.createConstructionSite(spawn.pos.x-6+i,spawn.pos.y-2-i,STRUCTURE_RAMPART);
        }
        spawn.room.createConstructionSite(spawn.pos.x-3,spawn.pos.y-5,STRUCTURE_RAMPART);
    spawn.room.createConstructionSite(spawn.pos.x-3,spawn.pos.y-6,STRUCTURE_RAMPART);
    spawn.room.createConstructionSite(spawn.pos.x-2,spawn.pos.y-6,STRUCTURE_RAMPART);
    spawn.room.createConstructionSite(spawn.pos.x-1,spawn.pos.y-6,STRUCTURE_RAMPART);
        */
    }

    var mineral = spawn.room.find(FIND_MINERALS);
    //console.log("mineral pos: ", mineral[0].pos);
    spawn.room.createConstructionSite(mineral[0].pos, STRUCTURE_EXTRACTOR); // STAAYS


    //LABS

    spawn.room.createConstructionSite(spawn.pos.x + 3, spawn.pos.y - 1, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 3, spawn.pos.y, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 4, spawn.pos.y, STRUCTURE_LAB);

    spawn.room.createConstructionSite(spawn.pos.x + 4, spawn.pos.y - 2, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 5, spawn.pos.y - 2, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 5, spawn.pos.y - 1, STRUCTURE_LAB);

    spawn.room.createConstructionSite(spawn.pos.x + 6, spawn.pos.y - 1, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 6, spawn.pos.y, STRUCTURE_LAB);

    spawn.room.createConstructionSite(spawn.pos.x + 4, spawn.pos.y + 1, STRUCTURE_LAB);
    spawn.room.createConstructionSite(spawn.pos.x + 5, spawn.pos.y + 1, STRUCTURE_LAB);

    /*
    for (let i = 0; i < 4; i++) {
        spawn.room.createConstructionSite(spawn.pos.x + 1 + i, spawn.pos.y + 1 + i, STRUCTURE_ROAD);
    }
    for (let i = 0; i < 3; i++) {
        spawn.room.createConstructionSite(spawn.pos.x + 3 - i, spawn.pos.y + 5 + i, STRUCTURE_ROAD);

    }
    for (let i = 0; i < 6; i++) {
        spawn.room.createConstructionSite(spawn.pos.x - i, spawn.pos.y + 6 - i, STRUCTURE_ROAD);
    }
    */

    //spawn.memory.sources=undefined;
    route_targets = spawn.room.controller;
    if (route_targets != undefined) {
        console.log('routing to controller');
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
                    console.log(destination, " ", ret.path[i]);
                    spawn.room.createConstructionSite(ret.path[i], STRUCTURE_ROAD);
                }

            }
            console.log("FOUND ROUTE");
        }
    }



}
module.exports = setBaseLayout;