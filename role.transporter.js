const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

var roleTransporter = {//transfer energy grom containers to storage

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        //creep.say("!");
        var deposit=getClosestEnergyDeposit(creep);
        //creep.say(creep.store.getFreeCapacity());
        if(creep.store.getFreeCapacity()>0 && deposit!=-1)
        {
            //creep.say("QWE");
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, deposit.store[RESOURCE_ENERGY]);
            if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE )
            {// if creep have no energy go to container and withdraw energy
                creep.moveTo(deposit);
            }
        }
        else
        {
            //creep.say("T");
            var storage=creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            });
            
            //console.log("storages: ",storage.length);
            if(storage.length>0)
            {
                //creep.say(storage[0].store[RESOURCE_ENERGY]);
                if(creep.transfer(storage[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(storage[0]);
                }
            }
        }

    }
};
module.exports = roleTransporter;