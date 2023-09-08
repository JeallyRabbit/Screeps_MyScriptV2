
const { drop } = require('lodash');
var roleBuilder = require('role.builder');

var roleCarrier = {//transfer energy grom containers to extensions and spawn

    /** @param {Creep} creep **/
    run: function(creep) {
        
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY
        })
        if(droppedEnergy.length>0 && creep.store.getFreeCapacity()>0)
        {
            creep.say("Q");
            const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
            var biggestDroppedEnergy=droppedEnergy[0];
            //console.log(biggestDroppedEnergy.energy);
            for(var i=0;i<droppedEnergy.length;i++)
            {
                //console.log(droppedEnergy[i].energy);
                if(droppedEnergy[i].energy>biggestDroppedEnergy.energy)
                {
                    biggestDroppedEnergy=droppedEnergy[i];
                }
            }
            //console.log(biggestDroppedEnergy.energy);
            if (creep.pickup(biggestDroppedEnergy) == ERR_NOT_IN_RANGE) 
            {
                // Move to it
                creep.moveTo(biggestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else{
            //creep.say("carrier");
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });
            if(containers.length>0)
            {
                var closestContainer=creep.pos.findClosestByRange(containers);
                var transfer_amount=1;
                transfer_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                if(creep.transfer(closestContainer,RESOURCE_ENERGY,transfer_amount)==ERR_NOT_IN_RANGE )
                {
                creep.moveTo(closestContainer);
                }
            }
            else{
                //go to spawn
                if(creep.transfer(Game.spawns['Spawn1'],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                {// if creep have some energy go to extension and fill with energy
                    //creep.say("Going do spawn");
                    creep.moveTo(Game.spawns['Spawn1']);
                }
            }
            
            
        }

    }
};
module.exports = roleCarrier;