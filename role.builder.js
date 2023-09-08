var roleUpgrader=require('role.upgrader');
const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
        if(targets.length==0) // if no constructuin sites go upgrade
        {
            roleUpgrader.run(creep);
        }

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) { // if building and no energy go harvest
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) { // if have energy and construstion site go build
	        creep.memory.building = true;
	    }

	    if(creep.memory.building) { // if building go to construction site and build
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
        else if(!creep.memory.building && getMaxEnergyDeposit(creep)!=-1)
        {
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
	    else {
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

module.exports = roleBuilder;
