//const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

var roleMerchant = {//transfer energy grom containers to storage

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        if (creep.pos.x != spawn.pos.x + 1 || creep.pos.y != spawn.pos.y - 2) {
            creep.moveTo(spawn.pos.x + 1, spawn.pos.y - 2);
        }
        else {
            var terminal = creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_TERMINAL;
                }
            });
            if (terminal != undefined) {

                //if(creep.memory.to_terminal==true)
                //{

                var storage = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_STORAGE;
                    }
                });

                var lab = creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_LAB;
                        //&& structure.store.getFreeCapacity()>0;
                    }
                });

                if (terminal[0].store[RESOURCE_ENERGY] < 30000) {
                    creep.memory.energy_to_terminal = true;
                    creep.memory.energy_from_terminal=false;
                }
                if (terminal[0].store[RESOURCE_ENERGY] > 40000) {
                    creep.memory.energy_from_terminal = true;
                    creep.memory.energy_to_terminal=false;
                }
                else if(terminal[0].store[RESOURCE_ENERGY]>=30000 && 
                    terminal[0].store[RESOURCE_ENERGY]<=40000){
                    creep.memory.energy_from_terminal = -1;
                    creep.memory.energy_to_terminal = -1;
                }
                if (terminal[0].store[RESOURCE_ENERGY] == 0) {
                    if (creep.store[RESOURCE_ENERGY] == 0) {
                        if (creep.withdraw(storage[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(storage[0]);
                        }
                    }
                    else {
                        if (creep.transfer(terminal[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            creep.mpveTo(terminal[0]);
                        }
                    }
                }

                for (const resource in terminal[0].store) {

                    if(creep.memory.energy_to_terminal==true && creep.memory.energy_from_terminal==false)
                    {
                        if(creep.store[RESOURCE_ENERGY]==0)
                        {
                            creep.withdraw(storage[0],RESOURCE_ENERGY);
                        }
                        else{
                            creep.transfer(terminal[0],RESOURCE_ENERGY);
                        }
                    }
                    else if(creep.memory.energy_from_terminal==true && creep.memory.energy_to_terminal==false)
                    {
                        if(creep.store[RESOURCE_ENERGY]==0)
                        {
                            creep.withdraw(terminal[0],RESOURCE_ENERGY);
                        }
                        else{
                            creep.transfer(storage[0],RESOURCE_ENERGY);
                        }
                    }
                    else if(creep.memory.energy_from_terminal==-1 && creep.memory.energy_to_terminal==-1)
                    {
                        
                        for(const resource in terminal[0].store)
                        {
                            
                            if(resource!=RESOURCE_ENERGY)
                            {
                                if(creep.store.getUsedCapacity(resource)==0)
                                {
                                    creep.withdraw(terminal[0],resource);
                                }
                                
                            }
                            
                        } 
                        for(const resource in creep.store)
                        {
                            if(resource=="XGHO2")
                            {
                                //creep.say("B");
                                if(creep.store.getUsedCapacity(resource)>0)
                                {
                                    //creep.say("A");
                                    creep.transfer(terminal[0],resource);
                                }
                            }
                            else if(resource!=RESOURCE_ENERGY)
                            {
                                if(creep.store.getUsedCapacity(resource)>0)
                                {
                                    creep.transfer(storage[0],resource)
                                }
                            }
                        }
                        for(const resource in storage[0].store)
                        {
                            if(resource=="XGHO2")
                            {
                                if(creep.store.getUsedCapacity(resource)==0)
                                {
                                    creep.withdraw(storage[0],resource);
                                }
                            }
                        }
                    }
                }

            }
        }

    }
};
module.exports = roleMerchant;