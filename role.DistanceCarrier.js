//var RoomPositionFunctions = require('roomPositionFunctions');
const { boosting_driver } = require('boosting_driver');
const { move_avoid_hostile } = require("./move_avoid_hostile");
var roleHauler = require('role.hauler');
var roleCarrier = require('role.carrier');
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
                if (creep.memory.target_room_containers == undefined) {
                    var containers = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
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



                if (creep.pos.y >= 49) {
                    creep.move(TOP);
                }
                else if (creep.pos.y <= 1) {
                    creep.move(BOTTOM);
                }
                else if (creep.pos.x >= 49) {
                    creep.move(LEFT);
                }
                else if (creep.pos.x <= 1) {
                    creep.move(RIGHT);
                }

                if (creep.memory.energy_to_collect != undefined) {
                    if (Game.getObjectById(creep.memory.energy_to_collect) != null) {
                        creep.memory.max_container=undefined;
                        if (creep.pickup(Game.getObjectById(creep.memory.energy_to_collect)) == ERR_NOT_IN_RANGE) {
                            move_avoid_hostile(creep, Game.getObjectById(creep.memory.energy_to_collect).pos, 1, true);
                            //creep.say("E");
                        }
                    }
                    else {
                        delete creep.memory.energy_to_collect;
                    }
                    return;
                }

                if (creep.memory.energy_to_collect == undefined && Game.time%12==0) {
                    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: resource => resource.amount > 30
                    });
                    if (droppedEnergy != undefined && droppedEnergy != null && droppedEnergy.length > 0) {
                        var closestEnergy = creep.pos.findClosestByPath(droppedEnergy);
                        if (closestEnergy != null) {
                            creep.memory.energy_to_collect = closestEnergy.id;
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
                else if (Game.getObjectById(creep.memory.max_container) != undefined) {
                    if (Game.getObjectById(creep.memory.max_container).store[RESOURCE_ENERGY] == 0) {
                        creep.memory.max_container = undefined;
                    }
                }

                if (creep.memory.max_container != undefined) {
                    //console.log("creep.memory.max_container: ",creep.memory.max_container);
                    //console.log(creep.pos);
                    if (Game.getObjectById(creep.memory.max_container) == undefined) {
                        return 0;
                    }
                    var withdraw_amount = 1;
                    if (creep.memory.max_container != undefined) {
                        //creep.say("A");
                        withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, Game.getObjectById(creep.memory.max_container).store[RESOURCE_ENERGY]);
                        if (creep.withdraw(Game.getObjectById(creep.memory.max_container), RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have free space go colelct energy from containers
                            creep.moveTo(Game.getObjectById(creep.memory.max_container).pos);
                            //move_avoid_hostile(creep, Game.getObjectById(creep.memory.max_container).pos, 1, true);
                        }
                        else if (creep.withdraw(Game.getObjectById(creep.memory.max_container), RESOURCE_ENERGY, withdraw_amount) == OK) {
                            creep.memory.max_container = undefined;
                            delete creep.memory.my_path;
                        }
                    }
                }
                else {
                    var closest_source = creep.pos.findClosestByRange(FIND_SOURCES);
                    creep.moveTo(closest_source, { range: 6 });
                    // move_avoid_hostile(creep,closest_source,6,true);
                }

                // }


            }
            else if (creep.room.name != creep.memory.home_room.name && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                // not in home_room and no free space - go home_room
                const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name

                creep.moveTo(destination, { reusePath: 15 });
                //move_avoid_hostile(creep,destination.pos,5,false,4000);

            }
            else if (creep.room.name == creep.memory.home_room.name && creep.memory.collecting == false /*creep.store[RESOURCE_ENERGY] > 0*/) {
                // in home room and have energy - store it in container or storage
                //roleHauler.run(creep,spawn)
                //roleCarrier.run(creep,spawn);
                //return;
                //cache home_room_containers
                if (creep.memory.home_room.name == creep.memory.target_room) {
                    if (creep.room.controller.level < 4 || true) {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType != STRUCTURE_CONTAINER
                                    && structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                /*&& structure.structureType == STRUCTURE_SPAWN*
                               
                                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                            }
                        });
                    }
                    else {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType != STRUCTURE_CONTAINER && structure.structureType != STRUCTURE_EXTENSION
                                    && structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                /*&& structure.structureType == STRUCTURE_SPAWN*
                               
                                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                            }
                        });
                    }

                }
                else {
                    var storage = creep.room.find(FIND_STRUCTURES, {
                        filter: function (structure) {
                            return structure.structureType == STRUCTURE_STORAGE;
                        }
                    });
                    if (storage != undefined && storage.length > 0) {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                                    && structure.structureType != STRUCTURE_CONTAINER;
                                /*
                                return (structure.structureType === STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_SPAWN)
                                structure.store[RESOURCE_ENERGY] < 1800;*/
                                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                            }
                        });
                    }
                    else {
                        var containers = creep.room.find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return structure.store != undefined && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                                /*
                                return (structure.structureType === STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_SPAWN)
                                structure.store[RESOURCE_ENERGY] < 1800;*/
                                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                            }
                        });
                    }





                }

                /*
                containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_EXTENSION
                            && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }));
                

                var storage = (creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_STORAGE;
                    }
                }));

                if (storage != undefined && storage.length > 0) {
                    containers =containers.concat(storage);
                }
                */
                /*
                containers = containers.concat(creep.room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_LINK
                            && (structure.pos.x != spawn.pos.x + 3 || structure.pos.y != spawn.pos.y - 3)
                            && structure.store[RESOURCE_ENERGY] < 800
                    }
                })); 
                */

                if (containers != undefined && containers.length > 0) {
                    //console.log("containers: ", containers.length);
                    var closest_container = creep.pos.findClosestByPath(containers);
                    var transfer_amount = 1;
                    if (closest_container != null) {
                        transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                        if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store

                            var if_avoid = false;
                            if (creep.pos.y >= 48 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.x <= 1) {
                                if_avoid = true;
                            }
                            //if_avoid = true;
                            move_avoid_hostile(creep, closest_container.pos, 1, if_avoid);
                            creep.say("con");

                            //creep.moveTo(closest_container, { reusePath: 5 });
                        }
                        else {
                            delete creep.memory.my_path;
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
                //creep.moveTo(destination);
                move_avoid_hostile(creep, destination, 1, false, 8000);

            }

        }

    }
};
module.exports = roleDistanceCarrier;