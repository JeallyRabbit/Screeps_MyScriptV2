//var RoomPositionFunctions = require('roomPositionFunctions');
const { boosting_driver } = require('boosting_driver');
//const { move_avoid_hostile } = require("./move_avoid_hostile");
//var roleHauler = require('role.hauler');
var roleDistanceCarrier = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say(creep.memory.home_room);
        //creep.move(RIGHT);
        //return;
        //creep.drop(RESOURCE_ENERGY);
        //creep.suicide();


        //creep.move(TOP);
        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["KH", "KH2O", "XKH2O"];//boost types that creep accepts
        }
        if (boosting_driver(creep, spawn, creep.memory.boosting_list, CARRY) == -1) {

            if (creep.memory.target_room_containers != undefined && creep.memory.target_room_containers.length > 0) {
                for (let i = 0; i < creep.memory.target_room_containers.length; i++) {
                    if (Game.getObjectById(creep.memory.target_room_containers[i]) == null) {
                        creep.memory.target_room_containers = undefined;
                        console.log('clearing creep.memory.target_room_containers');
                        break;
                    }
                }
            }

            if (creep.store.getFreeCapacity() == 0) {
                creep.memory.collecting = false;
            }
            else if (creep.store[RESOURCE_ENERGY] == 0 || creep.memory.collecting == undefined) {
                creep.memory.collecting = true;
            }

            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.closest_home_container = undefined;
            }
            if (creep.room.name == creep.memory.target_room && creep.memory.collecting == true /*creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0*/) {
                // in target room and have free space - collect dropped energy or energy from containers
                if (creep.memory.target_room_containers == undefined || (creep.memory.target_room_containers != undefined && creep.memory.target_room_containers.length == 0)) {
                    if (creep.memory.target_room == creep.memory.home_room.name) {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType === STRUCTURE_CONTAINER
                                    && ((structure.pos.x != spawn.pos.x - 2 || structure.pos.y != spawn.pos.y - 2) &&
                                        (structure.pos.x != spawn.pos.x + 2 || structure.pos.y != spawn.pos.y - 2))
                                    && (structure.pos.inRangeTo(spawn.room.controller.pos, 4) == false);
                            }
                        });
                    }
                    else {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType === STRUCTURE_CONTAINER;
                            }
                        });
                    }

                    creep.memory.target_room_containers = [];
                    for (let i = 0; i < containers.length; i++) {
                        creep.memory.target_room_containers.push(containers[i].id);
                    }
                }
                /*
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && structure.store[RESOURCE_ENERGY] > 0;
                    }
                });
                */



                if (creep.memory.energy_to_collect != undefined) {
                    if (Game.getObjectById(creep.memory.energy_to_collect) != null) {
                        creep.memory.max_container = undefined;
                        if (creep.pickup(Game.getObjectById(creep.memory.energy_to_collect)) == ERR_NOT_IN_RANGE) {
                            //move_avoid_hostile(creep, Game.getObjectById(creep.memory.energy_to_collect).pos, 1, true);
                            creep.moveTo(Game.getObjectById(creep.memory.energy_to_collect), { reUsePath: 25 });
                            //creep.say("E");
                        }
                    }
                    else {
                        delete creep.memory.energy_to_collect;
                    }
                    return;
                }

                if (creep.memory.energy_to_collect == undefined && (Game.time % 12 == 0 || Game.time % 13 == 0)) {
                    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: resource => resource.amount > 30
                    });
                    if (droppedEnergy != undefined && droppedEnergy != null && droppedEnergy.length > 0) {
                        var closestEnergy = creep.pos.findClosestByPath(droppedEnergy);
                        if (closestEnergy != null) {
                            creep.memory.energy_to_collect = closestEnergy.id;
                        }

                    }
                    else {
                        if (creep.memory.closest_source == undefined) {
                            var closest_source = creep.pos.findClosestByRange(FIND_SOURCES);
                            if (closest_source != null) {
                                creep.memory.closest_source = closest_source.id;
                            }
                        }
                        else if (Game.getObjectById(creep.memory.closest_source) != null) {
                            creep.moveTo(Game.getObjectById(creep.memory.closest_source), { range: 6, reusePath: 12 });
                        }
                    }

                }

                if (creep.memory.max_container == undefined) {
                    var biggest_energy = 0;
                    for (let i = 0; i < creep.memory.target_room_containers.length; i++) {
                        var container = Game.getObjectById(creep.memory.target_room_containers[i]);
                        if (container.store[RESOURCE_ENERGY] > biggest_energy) {
                            creep.memory.max_container = container.id;
                            biggest_energy = container.store[RESOURCE_ENERGY];
                        }
                    }
                }
                else if (Game.getObjectById(creep.memory.max_container) != null) {
                    if (Game.getObjectById(creep.memory.max_container).store[RESOURCE_ENERGY] == 0) {
                        creep.memory.max_container = undefined;
                    }
                }

                if (creep.memory.max_container != undefined) {
                    //console.log("creep.memory.max_container: ",creep.memory.max_container);
                    //console.log(creep.pos);

                    if (Game.getObjectById(creep.memory.max_container) == null) {
                        creep.memory.max_container = undefined;
                        creep.memory.target_room_containers = undefined;
                    }
                    var withdraw_amount = 1;
                    if (creep.memory.max_container != undefined) {
                        //creep.say("A");
                        withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, Game.getObjectById(creep.memory.max_container).store[RESOURCE_ENERGY]);
                        if (creep.withdraw(Game.getObjectById(creep.memory.max_container), RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have free space go colelct energy from containers
                            creep.moveTo(Game.getObjectById(creep.memory.max_container).pos, { reUsePath: 25 });
                            //move_avoid_hostile(creep, Game.getObjectById(creep.memory.max_container).pos, 1, true);
                        }
                        else if (creep.withdraw(Game.getObjectById(creep.memory.max_container), RESOURCE_ENERGY, withdraw_amount) == OK) {
                            creep.memory.max_container = undefined;
                            delete creep.memory.my_path;
                        }
                    }
                }


            }
            else if (creep.room.name != creep.memory.home_room.name && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                // not in home_room and no free space - go home_room
                const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name

                creep.moveTo(destination, { reUsePath: 25, avoidCreeps: false });
                //move_avoid_hostile(creep,destination.pos,5,false,4000);

            }
            else if (creep.room.name == creep.memory.home_room.name && creep.memory.collecting == false /*creep.store[RESOURCE_ENERGY] > 0*/) {
                // in home room and have energy - store it in container or storage
                //roleHauler.run(creep,spawn)
                //roleCarrier.run(creep,spawn);
                //return;
                //cache home_room_containers

                //creep.memory.home_container=undefined;
                if (creep.memory.home_room.name == creep.memory.target_room || true) {
                    if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) == null
                        || (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container).store.getFreeCapacity(RESOURCE_ENERGY) == 0)) {
                        creep.memory.home_container = undefined
                    }
                    if (creep.memory.home_container == undefined) {
                        //creep.say("un");
                        if (creep.room.controller.level >= 4 && false) {
                            var storage = creep.room.find(FIND_STRUCTURES, {
                                filter: function (structure) {
                                    return structure.structureType == STRUCTURE_STORAGE;
                                }
                            });
                            if (storage != undefined && storage.length > 0) {
                                creep.memory.home_container = storage[0].id;
                            }
                        }
                        else {
                            var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                                        && structure.structureType != STRUCTURE_TERMINAL &&
                                        ((structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawn.pos.x + 2 && structure.pos.y == spawn.pos.y - 2)
                                            || (structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawn.pos.x - 2 && structure.pos.y == spawn.pos.y - 2)
                                            || structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(spawn.room.controller, 4));
                                }
                            });
                            if (container != null) {
                                creep.memory.home_container = container.id;
                            }
                            else {
                                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                    filter: function (structure) {
                                        return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                    }
                                });
                                if (container != null) {
                                    creep.memory.home_container = container.id;
                                }
                                else {
                                    conatiner = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                        filter: function (structure) {
                                            return structure.structureType == STRUCTURE_TERMINAL && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                        }
                                    });
                                    if (container == null) {
                                        container = spawn;
                                        if (spawn.store[RESOURCE_ENERGY] == 300) {
                                            creep.drop(RESOURCE_ENERGY);
                                        }
                                    }
                                }
                                if (container != null) {
                                    creep.memory.home_container = container.id;
                                }
                            }
                            //creep.say("no con");
                        }

                    }

                    if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) != null) {
                        if (creep.transfer(Game.getObjectById(creep.memory.home_container), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

                            creep.moveTo(Game.getObjectById(creep.memory.home_container), { reUsePath: 25, avoidSk: true });
                        }
                        if (Game.getObjectById(creep.memory.home_container).structureType == STRUCTURE_STORAGE) {
                            for (let resource in creep.store) {
                                creep.transfer(Game.getObjectById(creep.memory.home_container), resource);
                            }
                        }
                        else{
                            creep.transfer(Game.getObjectById(creep.memory.home_container), RESOURCE_ENERGY);
                        }

                    }


                }
            }
            else if (creep.room.name != creep.memory.target_room && creep.store[RESOURCE_ENERGY] == 0) {
                // not in target room and no energy - go target room

                //if(creep.memory.target_room==undefined){creep.suicide();}
                //var extensions_in_home = spawn.room.find()
                //creep.say("target");
                const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name
                creep.moveTo(destination, { reUsePath: 25 });
                //move_avoid_hostile(creep, destination, 1, false, 8000);

            }

        }

    }
};
module.exports = roleDistanceCarrier;