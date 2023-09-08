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

	    if(creep.memory.upgrading) // if upgrading go upgrade
        {
            
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(creep.room.controller);
            }
        }
        else if(!creep.memory.upgrading && getMaxEnergyDeposit(creep)!=-1)// if no energy and there are deposits
        {// go to deposits
            
            var deposit=getMaxEnergyDeposit(creep);
            var withdraw_amount=0;
            withdraw_amount=Math.min(creep.store.getFreeCapacity(), deposit.store[RESOURCE_ENERGY]);
            if(withdraw_amount>0)
            {
                if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(deposit);
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