


var roleHauler = {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say("H");
        
        
        
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        var extensions_full = 1;//1 when all are full
        for (let i = 0; i < extensions.length; i++) {
            if (extensions[i].store[RESOURCE_ENERGY] < 50)
                extensions_full = 0;
        }
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY]>0;
                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
            }
        });
        var storages=creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY]>0;
            }
        });
        
        if(storages.length>0)
        {
            containers=storages;
        }

        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.collecting = true; // collecting from containers


        }
        if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.collecting = false;// filling extensions and spawn
        }


        //var cID=-1;
        //var cID_max = -1, cID_min = -1;
        var max_energy = 0;
        var min_energy = 100;
        if(creep.memory.cID_max==-1 || creep.memory.cID_max==undefined)
        {
            for (let i = 0; i < containers.length; i++) {
            //console.log(containers[i].store.getCapacity(RESOURCE_ENERGY));
                if (containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY) > max_energy) {
                    max_energy = containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY);
                    creep.memory.cID_max = i;
                }
            }
        }
        if(creep.memory.cID_min==-1 || creep.memory.cID_min==undefined)
        {
            for (let i = 0; i < containers.length; i++) 
            {
                if (containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY) < min_energy) {
                    min_energy = containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY);
                    creep.memory.cID_min = i;
                }
            //if(cID_max==cID_min){return 0;}
            
        }
        }
        
        //console.log(creep, containers[cID_max].pos);
        if (creep.memory.collecting == true) // if is empty go to container
        {// go to container

            var withdraw_amount = 1;
            if (creep.memory.cID_max >= 0 && containers[creep.memory.cID_max]!=undefined) {
                //creep.memory.cID_max=-1;
                withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[creep.memory.cID_max].store[RESOURCE_ENERGY]);
                if (creep.withdraw(containers[creep.memory.cID_max], RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(containers[creep.memory.cID_max]);
                }
                else if(containers[creep.memory.cID_max].store[RESOURCE_ENERGY]==0)
                {
                    creep.memory.cID_max=-1;
                }
                else
                {
                    creep.memory.cID_max=-1;
                }
            }

        }
        else if (extensions_full == 1)// if all extensions are full go to spawn
        {
            if (spawn.store[RESOURCE_ENERGY] == 300 && creep.memory.cID_min >= 0)//if spawn is full equalize containers
            {// go to container with minimum energy
                if (creep.transfer(containers[creep.memory.cID_min], RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and put energy there
                    creep.moveTo(containers[creep.memory.cID_min]);
                }
            }
            else // spawn is not full go fill the spawn
            {
                var transfered_amount = 1;
                transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], spawn.store[RESOURCE_ENERGY].getFreeCapacity);
                if (creep.transfer(spawn, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    ;
                    creep.moveTo(spawn);
                }
            }
        }
        else // go to extension and put all energy to extension ( if have some energy)
        {
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.energy < 50;;
                }
            });
            var closestExtension = creep.pos.findClosestByRange(extensions);
            if (closestExtension) {
                var transfered_amount = 1;
                transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                if (creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    creep.moveTo(closestExtension);
                }
            }
        }
    }
};
module.exports = roleHauler;
