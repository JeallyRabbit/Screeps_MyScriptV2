
const { drop } = require('lodash');
var roleHauler = require('role.hauler');
const { move_avoid_hostile } = require('./move_avoid_hostile');

var roleCarrier = {//collect dropped energy and store it into extensions and containers

    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        
        //creep.memory.target_energy=undefined;
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.collecting = true;
        }
        else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.collecting = false;
        }

        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: function (resource)
            {
                return /* resource.resourceType=RESOURCE_ENERGY &&*/ resource.amount>=30;
            }
        });
        
        
        var storage=creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }});
            
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]<2000;
            }
        });

        containers=containers.concat(creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        }));

        //creep.say(droppedEnergy.length);
        if (droppedEnergy.length < 1 /*|| containers.length<1 || containers==undefined*/) {
            //creep.say("Ha");
            roleHauler.run(creep, spawn);
        }
        else if (droppedEnergy.length > 0 && creep.memory.collecting == true)//if there is dropped energy and creep have free space, go collect it
        {
            if(creep.memory.target_energy==undefined)
            {
                
                 //var closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                var closestDroppedEnergy=droppedEnergy[0];
                creep.memory.target_energy=0;
                //var biggestDroppedEnergy=droppedEnergy[0];
                for (var i = 1; i < droppedEnergy.length; i++) {
                    if (droppedEnergy[i].energy > closestDroppedEnergy.energy+50) {
                        closestDroppedEnergy = droppedEnergy[i];
                        creep.memory.target_energy=i;
                    }
                }
            }
            else if(creep.memory.target_energy!=undefined)
            {
                if (creep.pickup(droppedEnergy[creep.memory.target_energy]) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    //creep.moveTo(droppedEnergy[creep.memory.target_energy]);
                    move_avoid_hostile(creep,droppedEnergy[creep.memory.target_energy].pos,1,false);
                }
                else// if(creep.pickup(droppedEnergy[creep.memory.target_energy])==OK)
                {
                    creep.memory.target_energy=undefined;
                }
            }
            
        }
        else if (creep.memory.collecting == false && creep.store[RESOURCE_ENERGY]>0) {// go try fill extensions
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
                }
            });
            if (extensions.length > 0) {// if there are extensions go fill them


                var closestExtension = creep.pos.findClosestByRange(extensions);
                if (closestExtension) {
                    var transfered_amount = 1;
                    transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                    if (creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                        //creep.moveTo(closestExtension);
                        move_avoid_hostile(creep,closestExtension.pos,1,false);
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
                        //creep.moveTo(closestContainer.pos);
                        move_avoid_hostile(creep,closestContainer.pos,1,false);
                    }

                }
                else // no extensions - fill spawn
                {
                    if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        //creep.moveTo(spawn);
                        move_avoid_hostile(creep,spawn.pos,1,false);
                    }
                }

            }
        }
        else
        {
            creep.say("RES");
            for(resource in creep.store)
            {
                if(creep.transfer(storage[0],resource)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(storage[0]);
                }
                
            }
            
        }

    }
};
module.exports = roleCarrier;