
const { drop } = require('lodash');
var roleHauler = require('role.hauler');

var roleCarrier = {//collect dropped energy and store it into extensions and containers

    /** @param {Creep} creep **/
    run: function(creep,spawn) 
    {
        
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY
        })
        creep.say(droppedEnergy.length);
        if(droppedEnergy.length<1){
            roleHauler.run(creep);
        //creep.say("H");
    }
        else if(droppedEnergy.length>0 && creep.store.getFreeCapacity()>0)//if there is dropped energy and creep have free space, go collect it
        {
            const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
            
            var biggestDroppedEnergy=droppedEnergy[0];
            for(var i=1;i<droppedEnergy.length;i++)
            {
                if(droppedEnergy[i].energy>biggestDroppedEnergy.energy)
                {
                    biggestDroppedEnergy=droppedEnergy[i];
                }
            }
            if (creep.pickup(biggestDroppedEnergy) == ERR_NOT_IN_RANGE) 
            {
                // Move to it
                creep.moveTo(biggestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else
        {// go fill containers
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                    && structure.store[RESOURCE_ENERGY]<2000;
                }
            });
            if(containers.length>0)
            {// if there are containers go fill them
                var closestContainer=creep.pos.findClosestByRange(containers);
                var transfer_amount=1;
                transfer_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                if(creep.transfer(closestContainer,RESOURCE_ENERGY,transfer_amount)==ERR_NOT_IN_RANGE )
                {
                    creep.moveTo(closestContainer);
                }
            }
            else // if there are no containers  -  extensions
            {
                
                if(spawn.store[RESOURCE_ENERGY]==300)
                {// if spawn is full, fill extensions
                    var extensions = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_EXTENSION
                            && structure.energy<50;;
                        }
                    });
                    var closestExtension=creep.pos.findClosestByRange(extensions);
                    if(closestExtension)
                    {
                        var transfered_amount=1;
                        transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                        if(creep.transfer(closestExtension,RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE )
                        {// if creep have some energy go to extension and fill with energy
                            creep.moveTo(closestExtension);
                        }
                    }
                }
                else // no extensions - fill spawn
                {
                    if(creep.transfer(spawn,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                    {
                        creep.moveTo(spawn);
                    }
                }
                
            }
        }

    }
};
module.exports = roleCarrier;