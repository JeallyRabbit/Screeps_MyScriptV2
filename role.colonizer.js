var roleFarmer = require('role.farmer');
var roleBuilder = require('role.builder');

var roleColonizer = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say("Colonize");
        //creep.suicide();
        //creep.move(BOTTOM_LEFT);
        //return;
        //creep.say(creep.memory.target_room==creep.room.name);
        //creep.say(creep.room.name==creep.memory.target_room.name);
        if (creep.memory.target_room) {
            if (creep.room.name == creep.memory.target_room) {// if in target room - go claim 

                if (creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.harvesting = true;
                }

                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) ==0) {
                    //creep.say("FULL");
                    creep.memory.harvesting = false;
                }

                if (creep.memory.harvesting == true) {
                    
                    //creep.moveTo(Game.rooms[creep.memory.target_room].controller.pos);
                    
                    roleFarmer.run(creep,spawn);
                    // /return;
                    
                    /*
                    var sources=creep.pos.findClosestByRange(FIND_SOURCES);
                    if(creep.harvest(sources)==ERR_NOT_IN_RANGE)
                    {
                        console.log("OPQPQPQPQP");
                        console.log(creep.moveTo(sources));
                    }
                    return;
                    */
                    
                }
                else {
                    roleBuilder.run(creep, spawn);
                }

                var colonize_room_spawn = creep.room.find(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.my==true && str.structureType==STRUCTURE_SPAWN;
                        }
                });
                if(colonize_room_spawn!=undefined && colonize_room_spawn.length>0 && false)
                {
                    creep.suicide();
                    spawn.memory.req_colonizers=0;
                    spawn.memory.req_claimers=0;
                    spawn.memory.to_colonize=undefined;

                    creep.memory.home_room=colonize_room_spawn.room;
                    creep.memory.role='farmer';
                    creep.memory.target_room=creep.room.name;

                    for(let i=0;i<Memory.rooms_to_colonize.length;i++)
                    {
                        if(Memory.rooms_to_colonize[i].name==creep.room.name)
                        {
                            Memory.rooms_to_colonize[i].slice(i,1);
                            break;
                        }
                    }
                }
            }
            else if(creep.memory.harvesting!=true && creep.memory.target_room!=undefined){ // not in target room - go to it
                //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
                if(creep.memory.harvesting!=true)
                {
                    //console.log("coing to target_room");
                    creep.moveToRoom(creep.memory.target_room);
                    //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room, { reusePath: 15, avoidSk: true }),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
                }
                //creep.moveTo(Game.rooms[creep.memory.target_room].controller.pos);
                //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room, { reusePath: 15, avoidSk: true }),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
            }
        }
        else {
            creep.say("No Target");
            
        }
    }
};
module.exports = roleColonizer;