const getMaxEnergyDeposit = require("getMaxEnergyDeposit");
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        //creep.say(creep.store[RESOURCE_ENERGY], "energy");
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) { // if upgrading and no energy go harvest
            creep.memory.upgrading = false;
            //creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) { // if have energy and RCL
	        creep.memory.upgrading = true;
	       //creep.say('🚧 upgrade');
	    }
        if(creep.room.energyAvailable<creep.room.energyCapacityAvailable)
        {
            creep.moveTo(creep.room.controller);
            //creep.say("STOP");
            return 0;
        }
        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]>0;
            }
        });
        deposits=deposits.concat(creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        }));
        
        //creep.say("UP");

	    if(creep.memory.upgrading) // if upgrading go upgrade
        {
            //creep.say(creep.pos.getRangeTo(creep.room.controller));
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE )
            {
                creep.moveTo(creep.room.controller);
            }
        }
        else if(!creep.memory.upgrading && creep.pos.findClosestByRange(deposits)!=null)// if no energy and there are deposits
        {// go to deposits
            //creep.say("depo");
            
            var deposit= creep.pos.findClosestByRange(deposits);
            var withdraw_amount=0;
            if(deposit)
            {
                withdraw_amount=Math.min(creep.store.getFreeCapacity(), deposit.store[RESOURCE_ENERGY]);
                if(withdraw_amount>0)
                {
                    if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(deposit);
                    }
                }
            }
            
        }
        else { // collect dropped energy
            const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
               filter: resource => resource.resourceType == RESOURCE_ENERGY
           })
           const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
           if(droppedEnergy.length>0)
           {
               if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) 
               {
               // Move to it
               creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
               }
           }
       }
    }
};

module.exports=roleUpgrader;