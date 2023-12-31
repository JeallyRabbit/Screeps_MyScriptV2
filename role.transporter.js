//const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

const { move_avoid_hostile } = require("./move_avoid_hostile");

var roleTransporter = {//transfer energy grom containers to storage

    /** @param {Creep} creep **/
    run: function(creep,spawn) 
    {
        //creep.say("");
        var containers=[];
        containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]>400;
            }
        }));
        //contaienrs=[];
        containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) { return structure.structureType==STRUCTURE_LINK &&
                structure.pos.x == spawn.pos.x+3 && structure.pos.y == spawn.pos.y-3
                && structure.store[RESOURCE_ENERGY]>0;
            }
        }));
        
        var deposit=creep.pos.findClosestByRange(containers);
        //creep.say(creep.store.getFreeCapacity());
        if(creep.store.getFreeCapacity()>0 && deposit!=null)
        {
            //creep.say("QWE");
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, deposit.store[RESOURCE_ENERGY]);
            if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE )
            {// if creep have no energy go to container and withdraw energy
                //creep.moveTo(deposit);
                move_avoid_hostile(creep,deposit.pos,1,false);
            }
        }
        else
        {
            //creep.say("T");
            var storage=[];
            storage=creep.room.find(FIND_STRUCTURES,{
                filter: function (structure)
                {
                    return structure.structureType==STRUCTURE_LAB
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
                }
            });
            storage=storage.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));
            

            if(storage.length>0)
            {
                //creep.say(storage[0].store[RESOURCE_ENERGY]);
                if(creep.transfer(storage[0],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE )
                {// if creep have no energy go to container and withdraw energy
                    //creep.moveTo(storage[0]);
                    move_avoid_hostile(creep,storage[0].pos,1,false);
                }
            }
        }

    }
};
module.exports = roleTransporter;