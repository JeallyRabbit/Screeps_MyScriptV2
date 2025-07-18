const Movement = require('screeps-movement');

Creep.prototype.roleColonizer = function roleColonizer(creep, spawn) {

    //creep.memory.target_room='W19N13'
    //creep.suicide()

    if(spawn.memory.to_colonize!=undefined && creep.memory.target_rampart!=spawn.memory.to_colonize.name)
    {
        creep.memory.target_room=spawn.memory.to_colonize.name
    }



    if (creep.memory.target_room) {
        if (creep.room.name == creep.memory.target_room) {// if in target room - go claim 
            if (creep.room.find(FIND_HOSTILE_CREEPS, {
                filter:
                    function (hostile) {
                        return hostile.owner.username != 'Invader'
                    }
            }).length > 0) {
                creep.room.controller.activateSafeMode()
            }
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
                    else if(Game.getObjectById(creep.memory.source_id)!= null  && Game.getObjectById(creep.memory.source_id).room.name!=creep.memory.target_rampart)
                    {
                        creep.memory.source_id=undefined
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
                        if (src_temp != null && src_temp.energy > 0
                            && ((src_temp.pos.getOpenPositions().length > 0 && !creep.pos.isNearTo(src_temp)) || creep.pos.isNearTo(src_temp))
                        ) {
                            src.push(src_temp)
                        }
                        else {
                            creep.memory.source_id = undefined
                            src = []
                        }
                    }
                    var target_src = creep.pos.findClosestByPath(src)
                    //creep.say(target_src)
                    //console.log("target_src: ",target_src)
                    if (target_src != null) {
                        //console.log("trying to harvest")
                        if (creep.harvest(target_src) == ERR_NOT_IN_RANGE) {
                            //creep.say(target_src.pos.x)
                            creep.moveTo(target_src, { reusePath: 11, maxRooms: 1 })
                        }
                        //creep.say(((target_src.pos.getOpenPositions().length>0  && !creep.pos.isNearTo(target_src))) )
                    }

                }

            }
            else { // harvesting ==false
                if (creep.room.controller.my) {
                    if (creep.room.controller.ticksToDowngrade < 5000) { creep.memory.upgrading_controler = true }
                    if (creep.room.controller.ticksToDowngrade > 7500) { creep.memory.upgrading_controler = false }
                    if (creep.room.controller.level < 2) { creep.memory.upgrading_controler = true }
                    if (creep.memory.upgrading_controler == true) {
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, { reusePath: 11, maxRooms: 1 })
                        }
                    }
                }


                if (creep.memory.upgrading_controler != true) {

                    /// find ramparts and repair them

                    var is_rampart_for_spawn = false;

                    if(spawn.memory.to_colonize!=undefined)
                    {
                        var spawn_rampart = creep.room.lookForAt(LOOK_STRUCTURES, spawn.memory.to_colonize.spawn_pos_x, spawn.memory.to_colonize.spawn_pos_y)
                        for (sr of spawn_rampart) {
                            if (sr.structureType == STRUCTURE_RAMPART) {
                                is_rampart_for_spawn = true
                                break;
                            }
                        }

                        if (is_rampart_for_spawn == true) {
                            creep.room.createConstructionSite(spawn.memory.to_colonize.spawn_pos_x, spawn.memory.to_colonize.spawn_pos_y,
                                STRUCTURE_SPAWN, creep.room.name + "_1")
                        }
                        else {
                            //creep.say("rampart")
                            creep.say(creep.room.createConstructionSite(spawn.memory.to_colonize.spawn_pos_x, spawn.memory.to_colonize.spawn_pos_y, STRUCTURE_RAMPART))
                        }
                    }
                    




                    var ramparts = creep.room.find(FIND_MY_STRUCTURES, {
                        filter:
                            function (str) {
                                return str.structureType == STRUCTURE_RAMPART
                            }
                    })

                    var min_rampart_hp = 10000
                    var max_rampart_hp = 15000

                    var found_min = 0;
                    //creep.memory.repair_ramparts=undefined

                    for (r of ramparts) {
                        if (r.hits > max_rampart_hp) { creep.memory.repair_ramparts = false; break; }
                    }


                    for (r of ramparts) {
                        if (r.hits < min_rampart_hp) { creep.memory.repair_ramparts = true; creep.memory.target_rampart = r.id; break; }
                    }

                    if (creep.memory.repair_ramparts == true) {
                        if (creep.repair(Game.getObjectById(creep.memory.target_rampart)) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(Game.getObjectById(creep.memory.target_rampart), { reusePath: 11, maxRooms: 1 })
                        }
                    }
                    else {
                        //creating ramparts around controller
                        var controller_pos = creep.room.controller.pos.getN_NearbyPositions(1)
                        for (p of controller_pos) {
                            creep.room.createConstructionSite(p.x, p.y, STRUCTURE_RAMPART)
                        }

                        var construction_sites_ramparts = creep.room.find(FIND_CONSTRUCTION_SITES, {
                            filter:
                                function (c) {
                                    return c.structureType == STRUCTURE_RAMPART
                                }
                        })


                        if (construction_sites_ramparts.length > 0) {
                            if (creep.build(construction_sites_ramparts[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(construction_sites_ramparts[0], { reusePath: 10, maxROoms: 1 })
                                return
                            }
                            creep.roleBuilder(creep, spawn);
                            return
                        }
                        else if (creep.room.find(FIND_CONSTRUCTION_SITES).length > 0) {
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
                                //creep.say("hauling")
                                //creep.drop(RESOURCE_ENERGY)
                                return
                                //}
                                //return
                            }
                        }
                    }


                    ////






                }

            }


        }
        else if (creep.memory.target_room != creep.room.name) { // not in target room - go to it
            //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
            
                //console.log("coing to target_room");

                //creep.moveToRoom(creep.memory.target_room,{reusePath: 11, avoidSk: true,avoidHostileRooms: true});
                /*
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
                    creep.moveTo(creep.memory.destination,{reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true})
                    //creep.move_avoid_hostile(creep, creep.memory.destination, reusePath, true)
                }
                    */
                roomsToAvoid= (Memory.manualAvoid!= undefined ? Memory.manualAvoid: []);
                creep.moveToRoom(creep.memory.target_room, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true,avoidHostileRooms: true, avoidRooms: roomsToAvoid })
            
            //creep.moveTo(Game.rooms[creep.memory.target_room].controller.pos);
            //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room, { reusePath: 15, avoidSk: true }),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
        }
    }

};