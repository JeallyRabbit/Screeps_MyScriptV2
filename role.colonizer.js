

Creep.prototype.roleColonizer = function roleColonizer(creep, spawn) {

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


                if (creep.memory.source_id != undefined) {
                    if (Game.getObjectById(creep.memory.source_id) != null && Game.getObjectById(creep.memory.source_id).energy == 0) {
                        creep.memory.source_id = undefined
                    }
                }
                if (creep.memory.source_id == undefined || creep.memory.source_id.length == 0) {
                    var sources = creep.room.find(FIND_SOURCES, {
                        filter: function (src) {
                            return src.energy > 0
                        }
                    });
                    creep.memory.source_id = [];
                    for (let temp_src of sources) {
                        creep.memory.source_id.push(temp_src.id)
                    }
                    /*
                    if (sources.length > 0) {
                        creep.memory.source_id = sources[0].id
                    }*/
                }

                if (creep.memory.source_id != undefined && creep.memory.source_id.length > 0) {
                    var src = [];
                    //console.log("asd")
                    for (src_id of creep.memory.source_id) {
                        //console.log(src_id)
                        var src_temp = Game.getObjectById(src_id)
                        if (src_temp != null && src_temp.energy > 0) {
                            src.push(src_temp)
                        }
                        else {
                            creep.memory.source_id = undefined
                            src = []
                        }
                    }
                    var target_src = creep.pos.findClosestByRange(src)
                    //console.log("target_src: ",target_src)
                    if (target_src != null) {
                        //console.log("trying to harvest")
                        if (creep.harvest(target_src) == ERR_NOT_IN_RANGE) {
                            //creep.say("mov")
                            creep.moveTo(target_src, { reusePath: 11, maxRooms: 1 })
                        }
                    }

                }

                //roleFarmer.run(creep, spawn);
                //creep.roleFarmer(creep,spawn)
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
            else { // harvesting ==false
                if (creep.room.controller.my && (creep.room.controller.level < 2 || creep.room.controller.ticksToDowngrade < 5000)) {
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, { reusePath: 11, maxRooms: 1 })
                    }
                }
                else {

                    if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
                        creep.roleBuilder(creep, spawn);
                        return
                    }
                    else {
                        var colonize_room_spawn = creep.room.find(FIND_STRUCTURES, {
                            filter:
                                function (str) {
                                    return str.my == true && str.structureType == STRUCTURE_SPAWN;
                                }
                        });
                        if (colonize_room_spawn != undefined && colonize_room_spawn.length > 0) {
                            // if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                            //creep.roleFarmer(creep, spawn)

                            //return;
                            //}
                            //else {
                            creep.memory.home_room.name = creep.memory.target_room;
                            creep.roleHauler(creep, spawn)
                            creep.say("hauling")
                            //creep.drop(RESOURCE_ENERGY)
                            return
                            //}
                            //return
                        }
                    }




                }

            }


        }
        else if (creep.memory.harvesting != true && creep.memory.target_room != undefined) { // not in target room - go to it
            //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
            if (creep.memory.harvesting != true) {
                //console.log("coing to target_room");

                //creep.moveToRoom(creep.memory.target_room,{reusePath: 11, avoidSk: true,avoidHostileRooms: true});
                var reusePath = 100;

                if (creep.memory.destination == undefined) {
                    creep.say("destination unknown")
                    var destination = [];
                    for (var i = 1; i < 50; i++) {
                        for (var j = 1; j < 50; j++) {
                            destination.push(new RoomPosition(i, j, creep.memory.target_room))
                        }
                    }
                    creep.memory.destination = destination;
                }

                if (creep.memory.destination != undefined) {
                    creep.move_avoid_hostile(creep, creep.memory.destination, reusePath, true)
                }
            }
            //creep.moveTo(Game.rooms[creep.memory.target_room].controller.pos);
            //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room, { reusePath: 15, avoidSk: true }),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
        }
    }
    else {
        creep.say("No Target");

    }

};