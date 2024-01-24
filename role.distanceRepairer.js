var roleBuilder = require('role.builder');
const { move_avoid_hostile } = require("./move_avoid_hostile");
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.suicide();
        //creep.say("R");
        //var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
        if (creep.room.name == creep.memory.target_room) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: function (object) {
                    return object.hits < object.hitsMax && object.hits<300000
                   // && object.owner=='JeallyRabbit'; /*&& object.structureType != STRUCTURE_CONTAINER;*/
                }
            });

            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            });

            if (targets.length < 5) {
                //creep.say("no repair");
                roleBuilder.run(creep, spawn);
            }
            else {
                targets.sort((a, b) => a.hits - b.hits);
                //console.log("require repair: ", targets.length);
                creep.memory.repairing = true;

                if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) { // if don't have energy go harvest
                    creep.memory.repairing = false;
                    //creep.say('🔄 harvest');

                }
                //console.log("wolne miejsce: ",creep.store.getFreeCapacity());
                if (creep.memory.repairing == false && creep.store.getFreeCapacity() == 0) { // go repair
                    creep.memory.repairing = true;
                    //creep.say('🚧 Repairing');
                }

                if (creep.memory.repairing) {
                    //creep.say("QWERT");
                    var source = creep.pos.findClosestByRange(containers);
                    if (Game.time % 5 == 0 && creep.store.getFreeCapacity() > 0 && creep.pos.isNearTo(source)) {
                        creep.withdraw(source, RESOURCE_ENERGY, withdraw_amount);
                    }
                    //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                    if (targets.length) {
                        var closest_target = creep.pos.findClosestByRange(targets);
                        if (creep.repair(closest_target) == ERR_NOT_IN_RANGE) {
                            //creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ff0000' } });
                            //move_avoid_hostile(creep,closest_target.pos,2,false);
                        }
                        move_avoid_hostile(creep, closest_target.pos, 2, false);
                    }
                }
                else if (creep.store[RESOURCE_ENERGY] == 0 && containers != undefined && containers.length > 0) {// go to deposits
                    var source = creep.pos.findClosestByRange(containers);
                    var withdraw_amount = 0;
                    withdraw_amount = Math.min(creep.store.getFreeCapacity(), source.store[RESOURCE_ENERGY]);
                    //console.log("withdraw_amount: ",withdraw_amount);
                    if (withdraw_amount > 0) {
                        //console.log("energy");
                        if (creep.withdraw(source, RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {
                            //creep.say("Going to Cintainer");
                            //creep.moveTo(source);
                            move_avoid_hostile(creep, source.pos);
                        }
                    }
                    //console.log("qwert");
                }
                else if (creep.store[RESOURCE_ENERGY] == 0) {
                    const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: resource => resource.resourceType == RESOURCE_ENERGY
                    })
                    const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                    if (droppedEnergy.length > 0) {
                        if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                            // Move to it
                            //creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
                            move_avoid_hostile(creep, closestDroppedEnergy.pos)
                        }
                    }
                }
            }
        }
        else {

            var if_avoid = false;
            if (creep.pos.y >= 48 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.x <= 1) {
                if_avoid = true;
            }

            //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room));
            move_avoid_hostile(creep, new RoomPosition(25, 25, creep.memory.target_room), 5, if_avoid);
        }



    }
};

module.exports = roleRepairer;
