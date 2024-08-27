var _ = require('lodash');
var RoomPositionFunctions = require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");
const { boosting_driver } = require('boosting_driver');

Creep.prototype.roleKeeperFarmer = function roleKeeperFarmer(creep, spawn) {

    //creep.suicide();

    var active_carry=_.filter(creep.body, function(part){return part.type==CARRY && part.hits>0 })
    if(active_carry.length==0)
    {
        creep.suicide()
    }

    if (creep.memory.boosting_list == undefined) {
        creep.memory.boosting_list = ["UO", "UHO2", "XUHO2"];

    }
    //creep.say("^^");
    creep.memory.closest_container = undefined;
    //console.log("farmer pos: ",creep.pos)
    //creep.memory.target_room
    //creep.memory.target_source
    //Memory.lairs

    if (creep.room.name == creep.memory.target_room) {
        if (creep.memory.lair != undefined && Game.getObjectById(creep.memory.lair) == null) {
            //console.log("resetting lair")
            creep.memory.lair = undefined;
        }

        if (creep.memory.lair == undefined && Game.getObjectById(creep.memory.target_source) != null) {
            var temp_lair = Game.getObjectById(creep.memory.target_source).pos.findClosestByRange(FIND_STRUCTURES, {
                filter:
                    function (str) {
                        return str.structureType == STRUCTURE_KEEPER_LAIR
                    }
            })

            if (temp_lair != null) {
                //console.log("saving lair")
                creep.memory.lair = temp_lair.id;
            }
        }

        if (creep.memory.lair != undefined) {
            //console.log("creep.memory.lair is defined")
            var lair = Game.getObjectById(creep.memory.lair)
            //console.log(lair)

            if (lair.ticksToSpawn > 10 && lair.ticksToSpawn < 285) {
                //harvest energy
                creep.say("1")
                //console.log("lair: ", creep.memory.lair," is safe")
                if (creep.memory.closest_container != undefined && Game.getObjectById(creep.memory.closest_container) == null) {
                    //creep.say("reset");
                    creep.memory.closest_container = undefined;
                }
                if (creep.memory.closest_container == undefined) {

                    //creep.say("11")
                    if (creep.memory.target_room == creep.room.name) {
                        if (Game.getObjectById(creep.memory.target_source) != null) {
                            //creep.say("12")
                            var closest_container = Game.getObjectById(creep.memory.target_source).pos.findInRange(FIND_STRUCTURES, 3, {
                                filter: (structure) => {
                                    return structure.structureType == STRUCTURE_CONTAINER;
                                }
                            });

                            //creep.say(closest_container)
                            if (closest_container.length > 0 && closest_container[0].pos.inRangeTo(Game.getObjectById(creep.memory.target_source).pos, 5)) {
                                //creep.say("13")
                                creep.memory.closest_container = closest_container[0].id
                            }
                        }
                    }


                }


                if (Game.getObjectById(creep.memory.closest_container) != null &&
                    Game.getObjectById(creep.memory.closest_container).hits < Game.getObjectById(creep.memory.closest_container).hitsMax
                    && false) {
                    creep.say("repair")
                    if (creep.repair(Game.getObjectById(creep.memory.closest_container)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closest_container), { maxRooms: 1 })
                    }

                }
                else if (creep.memory.closest_container != undefined && creep.store.getFreeCapacity(RESOURCE_ENERGY) <= creep.memory.harvesting_power) {

                    /*
                    creep.say("transfer")
                    if (creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closest_container), { maxRooms: 1 })
                        //creep.say("C");
                    };
                    */
                    var energy_amount = creep.store[RESOURCE_ENERGY]
                    var transfer_result = creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY)
                    if (transfer_result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.closest_container))
                        creep.say("C");
                    }
                    else if (transfer_result == OK) {
                        if (Game.rooms[creep.room.name].memory.raw_energy_income == undefined) {
                            Game.rooms[creep.room.name].memory.raw_energy_income = energy_amount
                        }
                        else {
                            Game.rooms[creep.room.name].memory.raw_energy_income += energy_amount
                        }
                    }


                }
                //else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) < creep.memory.harvesting_power) {
                //    creep.drop(RESOURCE_ENERGY)
                //}
                // creep.say(Game.getObjectById(creep.memory.closest_container).structureType)
                //creep.say(creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                if (Game.getObjectById(creep.memory.target_source) != null && Game.getObjectById(creep.memory.target_source).energy > 0
                    && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    creep.say("5")
                    if (creep.harvest(Game.getObjectById(creep.memory.target_source)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.target_source), { reusePath: 11, maxRooms: 1,avoidCreeps: true });
                        creep.say("harv");
                        //creep.say(Game.getObjectById(creep.memory.target_source).pos.y)
                        //move_avoid_hostile(creep, Game.getObjectById(creep.memory.target_source).pos, 1, false);
                        //creep.memory.is_working = false;
                    }

                }
                else if (creep.memory.closest_container == undefined) {

                    creep.say("2")
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= creep.memory.harvesting_power) {
                        var construcion_container = undefined
                        //if(Game.time%5==0)
                        //{
                        construcion_container = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
                            filter:
                                function (constr) {
                                    return constr.structureType == STRUCTURE_CONTAINER
                                }
                        })
                        //}
                        //creep.say(construcion_container.length+10)
                        if (construcion_container != undefined && construcion_container.length > 0) {
                            creep.say("bu")
                            creep.build(construcion_container[0])
                        }
                        else {
                            creep.drop(RESOURCE_ENERGY)
                        }

                    }
                    else {
                        creep.moveTo(Game.getObjectById(creep.memory.target_source), { reusePath: 17, range: 1, maxRooms: 1 });
                    }


                }
                //creep.say(creep.store.getFreeCapacity(RESOURCE_ENERGY) > creep.memory.harvesting_power)
                /*
                else if (Game.getObjectById(creep.memory.target_source) != null && Game.getObjectById(creep.memory.target_source).energy == 0 && creep.room.name == creep.memory.target_room
                    && creep.pos.isNearTo(Game.getObjectById(creep.memory.target_source))) {
                    creep.sleep(Game.getObjectById(creep.memory.target_source).ticksToRegeneration)
                }*/
            }
            else {
                creep.say("flee")
                creep.fleeFrom({ lair }, 7, 0)
            }
        }

        var hostiles = [];
        if (Game.rooms[creep.room.name].memory.hostiles != undefined && Game.rooms[creep.room.name].memory.hostiles.length > 0) {
            for (a of Game.rooms[creep.room.name].memory.hostiles) {
                if (Game.getObjectById(a) != null) {
                    hostiles.push(Game.getObjectById(a))
                }

            }

        }
        creep.fleeFrom(hostiles, 7)

    }
    else {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { reusepath: 11, range: 22 })
    }

};




