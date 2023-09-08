
var roleBuilder = require('role.builder');

var roleCarrier = {//transfer energy grom containers to extensions and spawn

    /** @param {Creep} creep **/
    run: function(creep) {
        
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY
        })
        const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
        if(droppedEnergy.length>0 && creep.store.getFreeCapacity()>0)
        {
            if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) 
            {
                // Move to it
                creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else{
            //creep.say("carrier");
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });
            var closestContainer=creep.pos.findClosestByRange(containers);
            var transfer_amount=1;
            transfer_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                if(creep.transfer(closestContainer,RESOURCE_ENERGY,transfer_amount)==ERR_NOT_IN_RANGE )
                {
                creep.moveTo(closestContainer);
                }
            
        }

    }
};
module.exports = roleCarrier;