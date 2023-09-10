const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

var roleTowerKeeper = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var deposit=getClosestEnergyDeposit(creep);
        //creep.say(creep.store.getFreeCapacity());
        if(creep.store.getFreeCapacity()>0 && deposit>=0)
        {
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, deposit.store[RESOURCE_ENERGY]);
            if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE )
            {// if creep have no energy go to container and withdraw energy
                creep.moveTo(deposit);
            }
        }

        var towers=creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_TOWER;
            }
        });

        if(towers.length>0)
            {
                //creep.say(storage[0].store[RESOURCE_ENERGY]);
                if(creep.transfer(towers[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(towers[0]);
                }
            }

	}
};
module.exports = roleTowerKeeper;