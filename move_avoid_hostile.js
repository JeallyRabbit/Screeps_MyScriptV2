const { goOutOfRange } = require("./goOutOfRange");

function move_avoid_hostile(creep,destination,my_range,my_avoid,my_ops,my_plain,my_swamp) {
    //destination=destination.pos;
    //const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
    //my_avoid=false;
    if(my_plain==undefined)
    {
        my_plain=2;
    }
    if(my_swamp==undefined)
    {
        my_swamp=10;
    }
    if(my_ops==undefined)
    {
        my_ops=2000;
    }
    if(my_avoid==undefined)
    {
        my_avoid=true;
    }
    if(my_range==undefined)
    {
        my_range=1;
    }
    if(creep.pos.x==49 || creep.pos.x==0 || creep.pos.y==0 || creep.pos.y==49)
    {
        delete creep.memory.my_path;
    } 
    /*
    if(creep.pos.getRangeTo(destination)<=my_range)
    {

        return 0;
    }
    */
    //creep.say("mov");
    //console.log(creep.name);
    //console.log(creep.store.getFreeCapacity());
    var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
    var to_avoid = [];
    for (let i = 0; i < keepers.length; i++) {
        to_avoid = to_avoid.concat(keepers[i].pos.getN_NearbyPositions(3));
    }
    if(creep.memory.my_path!=undefined)
    {
        if(creep.memory.my_path.path[creep.memory.my_path.path.length-1]!=destination)
        {//if destination has changed delete path and recalculate it
            delete creep.memory.my_path;
        }
    }
    
    if (creep.memory.my_path==undefined) {
        //creep.say("CALC");
        var ret = PathFinder.search(creep.pos, destination, {
            //maxCost: 300,
            range: my_range,
            plainCost: my_plain,
            swampCost: my_swamp,
            maxOps: my_ops,

            roomCallback: function () {
    
                let room = creep.memory.home_room.name;
                // In this example `room` will always exist, but since 
                // PathFinder supports searches which span multiple rooms 
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
    
                creep.room.find(FIND_STRUCTURES).forEach(function (struct) {
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
                creep.room.find(FIND_MY_CREEPS).forEach(function (working_creep)
                    {
                        if(working_creep.memory.is_working==true)
                        {
                            costs.set(working_creep.pos.x,working_creep.pos.y, 255);
                        }
                    });

                // avoid construction sites
                creep.room.find(FIND_CONSTRUCTION_SITES).forEach(function (struct){
                    costs.set(struct.pos.x, struct.pos.y, 255);
                });
    
                // Avoid creeps in the room
                if(my_avoid!=false)
                {
                    creep.room.find(FIND_CREEPS).forEach(function (creep) {
                    costs.set(creep.pos.x, creep.pos.y, 255);
                    });
                }
                

                // avoid hostile creeps
                
                for (let i = 0; i < to_avoid.length; i++) {
                    costs.set(to_avoid[i].x, to_avoid[i].y, 255);
                }
                
                costs.set(destination.x,destination.y,1);
    
                return costs;
            }
        });

        if (ret.incomplete != true) {
            //creep.say(creep.moveByPath(ret.path));
            creep.memory.path_counter=0;
            creep.memory.my_path=ret;
            //creep.move(creep.pos.getDirectionTo(creep.memory.my_path[0]));
            //creep.move(creep.pos.getDirectionTo(ret.path[0]));
        }
        else if ( ret.incomplete==true){
            creep.say("no path");
            creep.moveTo(destination);
        }
    }
    if (creep.memory.my_path!=undefined) {
        //creep.say("USE");
        
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3) != undefined
            && creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) {
            goOutOfRange(creep, 3);
            //creep.say("NOT SAFE");
            creep.say("del1");
            delete creep.memory.my_path;
        }
        else {
            //creep.say("USE2");
            //creep.move(creep.pos.getDirectionTo(creep.memory.my_path[0]));
            
            //const path = JSON.parse(creep.memory.my_path);
            //if (creep.memory.my_path.length > 0) 
            if(creep.memory.my_path.incomplete!=true && creep.memory.path_counter<=creep.memory.my_path.ops+1)
            {
                //creep.say("USE3");
                //const moveResult =creep.moveByPath(JSON.stringify(creep.memory.my_path));
                var moveResult=undefined;
                if(creep.memory.my_path.path[creep.memory.path_counter]==undefined 
                    )
                {
                    creep.memory.path_counter=0;
                    //creep.say("del0");
                    delete creep.memory.my_path;
               }
                else{
                    var direction=new RoomPosition(creep.memory.my_path.path[creep.memory.path_counter].x,
                    creep.memory.my_path.path[creep.memory.path_counter].y,
                    creep.memory.my_path.path[creep.memory.path_counter].roomName)
                    moveResult=creep.move(creep.pos.getDirectionTo(direction));
                    //creep.say(moveResult);
                }
                
                if (moveResult === OK) {
                    //creep.memory.my_path.path=creep.memory.my_path.path.slice(1);
                    //delete creep.memory.my_path.path[0];
                    creep.memory.path_counter++;
                    creep.memory.next_pos=direction;
                    //creep.say(moveResult);
                    // Successfully moved along the path
                }
                else if (moveResult === ERR_INVALID_ARGS)// && creep.memory.wait_counter>1) 
                {
                    delete creep.memory.next_pos;
                    delete creep.memory.path_counter;
                    creep.say("del2");
                    delete creep.memory.my_path;
                }
                /*
                else if(moveResult!=-11){
                    //creep.memory.my_path.path=creep.memory.my_path.path.slice(1);
                    //creep.say(moveResult);
                    //console.log("moveResult: ", moveResult);
                }
                else{
                    creep.say(moveResult);
                }*/
            }
            else {
                // The path is empty, meaning the creep has reached its destination
                // Clear the cached path
                //creep.say("del2");
                return -1;
                creep.say("del4");
                delete creep.memory.my_path;
                delete creep.memory.next_pos;

            }
        }

    }
    else {
        // If the cached path doesn't exist, recalculate it and store it
        //const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
        //creep.memory.my_path = JSON.stringify(path);
    }
    return { keepers, to_avoid };
}
exports.move_avoid_hostile = move_avoid_hostile;
