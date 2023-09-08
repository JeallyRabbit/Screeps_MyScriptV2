const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

var roleTransporter = {//transfer energy grom containers to extensions and spawn

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        var deposit=getClosestEnergyDeposit(creep);
        if(creep.store.getFreeCapacity()>0)
        {
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, deposit.store[RESOURCE_ENERGY]);
            if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE )
            {// if creep have no energy go to container and withdraw energy
                creep.moveTo(deposit);
            }
        }
        else
        {
            var storage=creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE
                    && structure.store[RESOURCE_ENERGY]<20000;
                }
            });
            if(storage)
            {
                if(creep.transfer(storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(storage);
                }
            }
        }

    }
};
module.exports = roleTransporter;