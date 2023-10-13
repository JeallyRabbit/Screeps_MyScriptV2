
const { drop } = require('lodash');
var roleHauler = require('role.hauler');

var roleCarrier = {//collect dropped energy and store it into extensions and containers

    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.collecting = true;
        }
        else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.collecting = false;
        }

        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > 10
        })

        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });

        //creep.say(droppedEnergy.length);
        if (droppedEnergy.length < 1) {
            //creep.say("Ha");
            roleHauler.run(creep, spawn);
        }
        else if (droppedEnergy.length > 0 && creep.memory.collecting == true)//if there is dropped energy and creep have free space, go collect it
        {


            //var closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
            var closestDroppedEnergy=droppedEnergy[0];
            //var biggestDroppedEnergy=droppedEnergy[0];
            for (var i = 1; i < droppedEnergy.length; i++) {
                if (droppedEnergy[i].energy > closestDroppedEnergy.energy+50) {
                    closestDroppedEnergy = droppedEnergy[i];
                }
            }
            if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                // Move to it
                creep.moveTo(closestDroppedEnergy);
            }
        }
        else if (creep.memory.collecting == false) {// go try fill extensions
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.store[RESOURCE_ENERGY] < 50;
                }
            });
            if (extensions.length > 0) {// if there are extensions go fill them


                var closestExtension = creep.pos.findClosestByRange(extensions);
                if (closestExtension) {
                    var transfered_amount = 1;
                    transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                    if (creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                        creep.moveTo(closestExtension);
                    }
                }


            }
            else // if there are no extensions - go spawn 
            {

                if (spawn.store[RESOURCE_ENERGY] == 300 && containers.length>0) {// if spawn is full, fill containers

                    var closestContainer = creep.pos.findClosestByRange(containers);
                    var transfer_amount = 1;
                    transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                    if (creep.transfer(closestContainer, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestContainer);
                    }

                }
                else // no extensions - fill spawn
                {
                    if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(spawn);
                    }
                }

            }
        }

    }
};
module.exports = roleCarrier;