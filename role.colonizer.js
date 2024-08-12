

Creep.prototype.roleColonizer = function roleColonizer(creep,spawn){

        //creep.memory.target_room='W19N13'
        if (creep.memory.target_room) {
            if (creep.room.name == creep.memory.target_room) {// if in target room - go claim 

                if (creep.store[RESOURCE_ENERGY] == 0) {
                    creep.memory.harvesting = true;
                }

                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    //creep.say("FULL");
                    creep.memory.harvesting = false;
                }

                if (creep.memory.harvesting == true) {

                    //creep.moveTo(Game.rooms[creep.memory.target_room].controller.pos);

                    if (creep.memory.source_id != undefined) {
                        if(Game.getObjectById(creep.memory.source_id)!=null && Game.getObjectById(creep.memory.source_id).energy==0)
                            {
                                creep.memory.source_id=undefined
                            }
                    }
                    if (creep.memory.source_id == undefined) {
                        var sources = creep.room.find(FIND_SOURCES, {
                            filter: function (src) {
                                return src.energy > 0
                            }
                        });
                        if (sources.length > 0) {
                            creep.memory.source_id = sources[0].id
                        }
                    }
                    
                    //roleFarmer.run(creep, spawn);
                    creep.roleFarmer(creep,spawn)
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
                    creep.roleBuilder(creep, spawn);
                }

                var colonize_room_spawn = creep.room.find(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.my == true && str.structureType == STRUCTURE_SPAWN;
                        }
                });
                if (colonize_room_spawn != undefined && colonize_room_spawn.length > 0) {
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        creep.roleFarmer(creep, spawn)
                        return;
                    }
                    else {
                        creep.memory.home_room.name=creep.memory.target_room;
                        creep.roleHauler(creep,spawn)
                        creep.say("hauling")
                        //creep.drop(RESOURCE_ENERGY)
                        return
                    }
                    //return
                }
            }
            else if (creep.memory.harvesting != true && creep.memory.target_room != undefined) { // not in target room - go to it
                //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
                if (creep.memory.harvesting != true) {
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
    
};