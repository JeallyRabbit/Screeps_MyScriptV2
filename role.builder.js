var roleUpgrader=require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
        creep.say("B");
        var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
        if(targets.length==0) // if no constructuin sites go upgrade
        {
            roleUpgrader.run(creep);
        }

	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) { // if building and no energy go harvest
            creep.memory.building = false;
	    }
	    if(!creep.memory.building && creep.store[RESOURCE_ENERGY] > 0) { // if have energy and construstion site go build
	        creep.memory.building = true;
	    }

        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]>50;
            }
        });
        deposits=deposits.concat(creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE
                && structure.store[RESOURCE_ENERGY]>50;
            }
        }));

	    if(creep.memory.building) { // if building go to construction site and build
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0]);
                }
            }
	    }
        else if(!creep.memory.building && creep.pos.findClosestByRange(deposits)!=null)// not building and there are deposits
        {
            //var deposit=getMaxEnergyDeposit(creep);
            var deposit=creep.pos.findClosestByRange(deposits);
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
	    else 
        {// else collect dropped energy
            const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > 10
            });
            var closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
            if(closestDroppedEnergy!=undefined)
            {
                if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) 
                {
                // Move to it
                creep.moveTo(closestDroppedEnergy);
                }
            }
	    }
	    
	}
};

module.exports = roleBuilder;
