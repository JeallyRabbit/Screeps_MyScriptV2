

var roleTransporter=require('role.transporter');
const { move_avoid_hostile } = require("./move_avoid_hostile");

var roleHauler = {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.move(TOP);
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION
                && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
            }
        });
        var extensions_full=0;// 1 when tyey are all full
        if(extensions==undefined || extensions.length<1)
        {
            //creep.say("EX");
            extensions_full=1;
        }
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY]>0;
                /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
            }
        });
        //if(full_containers!=undefined && full_containers.length>0)
        
        if(extensions_full==1 && spawn.store[RESOURCE_ENERGY]==300)
        {
            //creep.say("T");
            roleTransporter.run(creep,spawn);
            return;
        }

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
        var min_energy = 1;
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
                var withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[creep.memory.cID_max].store[RESOURCE_ENERGY]);
                if (creep.withdraw(containers[creep.memory.cID_max], RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                    //creep.moveTo(containers[creep.memory.cID_max]);
                    move_avoid_hostile(creep,containers[creep.memory.cID_max].pos,1,false);
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
            if (spawn.store[RESOURCE_ENERGY] == 300 /* && creep.memory.cID_min >= 0*/)//if spawn is full equalize containers
            {// go to container with minimum energy
                roleTransporter.run(creep,spawn);
                /*
                if (creep.transfer(containers[creep.memory.cID_min], RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and put energy there
                    creep.moveTo(containers[creep.memory.cID_min]);
                }*/
            }
            else // spawn is not full go fill the spawn
            {
                var transfered_amount = 1;
                transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], spawn.store[RESOURCE_ENERGY].getFreeCapacity);
                if (creep.transfer(spawn, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    
                   // creep.moveTo(spawn);
                    move_avoid_hostile(creep,spawn.pos,1,false);;
                }
            }
        }
        else // go to extension and put all energy to extension ( if have some energy)
        {
            //creep.say("ext");
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
                }
            });
            //creep.say(extensions.length);
            var closestExtension = creep.pos.findClosestByPath(extensions);
            if (closestExtension) {
                var transfered_amount = 1;
                transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                if (creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    //creep.moveTo(closestExtension);
                    move_avoid_hostile(creep,closestExtension.pos,1,false);
                }
                else if(creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == OK)
                {
                    //creep.memory.is_working=true;
                }
            }
            /*
            else
            {
                var terminal=creep.room.find(FIND_STRUCTURES,{
                    filter: function(structure)
                    {
                        return structure.structureType==STRUCTURE_TERMINAL
                        && structure.store[RESOURCE_ENERGY]<5000;
                    }
                });
                console.log("TERMINAL POS: ", terminal.pos);
                if(terminal!=undefined)
                {
                    var transfered_amount = 1;
                    transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], terminal[0].store.getFreeCapacity(RESOURCE_ENERGY));
                    if (creep.transfer(terminal[0], RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                        creep.moveTo(terminal[0]);
                    }
                }
                

            }*/
        }
    }
};
module.exports = roleHauler;
