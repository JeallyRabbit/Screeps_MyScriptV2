
var roleBuilder = require('role.builder');

var roleHauler = {//transfer energy grom containers to extensions and spawn

    /** @param {Creep} creep **/
    run: function(creep) {
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        var extensions_full=1;//1 when all are full
        for(let i=0;i<extensions.length;i++)
        {
            if(extensions[i].store[RESOURCE_ENERGY]<50)
            extensions_full=0;
        }
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });
        containers=containers.concat(creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        }));
        if(containers.length==0)
        {
            roleBuilder.run(creep);
        }
        
        var cID=-1;
        var cID_max=-1, cID_min=-1;
            var max_energy=0;
            var min_energy=5000000;
            for(let i=0;i<containers.length;i++)
            {
                if(containers[i].store[RESOURCE_ENERGY]>=max_energy)
                {
                    max_energy=containers[i].store[RESOURCE_ENERGY];
                    cID_max=i;
                }
                if(containers[i].store[RESOURCE_ENERGY]<min_energy)
                {
                    min_energy=containers[i].store[RESOURCE_ENERGY];
                    cID_min=i;
                }

            }
            
	    if(creep.store[RESOURCE_ENERGY] == 0) // if is empty go to container
        {// go to container
            var cID=-1;
            for(let i=0;i<containers.length;i++)
            {// finding not empty container
                if(containers[i].store[RESOURCE_ENERGY]>0)
                {
                    cID=i;
                    break;
                }
            }
            var withdraw_amount=1;
            if(cID_max>=0)
            {
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[cID_max].store[RESOURCE_ENERGY]);
            if(creep.withdraw(containers[cID_max],RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE )
                {// if creep have no energy go to container and withdraw energy
                creep.moveTo(containers[cID_max]);
                }
            }
            
        }
        else if(extensions_full==1)// if all extensions are full go to spawn
        {
            if(Game.spawns['Spawn1'].store[RESOURCE_ENERGY]==300)//if spawn is full equalize containers
            {// go to container with minimum energy
                if(creep.transfer(containers[cID_min],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE  && cID_min>=0)
                {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(containers[cID_min]);
                }
            }
            else // spawn is not full
            {
                var transfered_amount=1;
            transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], Game.spawns['Spawn1'].store[RESOURCE_ENERGY].getFreeCapacity);
            if(creep.transfer(Game.spawns['Spawn1'],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE )
                {// if creep have some energy go to extension and fill with energy
                   ;
                    creep.moveTo(Game.spawns['Spawn1']);
                }
            }
        }
        else // go to extension and put all energy to extension ( if have some energy)
        {
            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                    && structure.energy<50;;
                }
            });
            var closestExtension=creep.pos.findClosestByRange(extensions);
            if(closestExtension)
            {
                var transfered_amount=1;
                transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                if(creep.transfer(closestExtension,RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE )
                {// if creep have some energy go to extension and fill with energy
                    creep.moveTo(closestExtension);
                }
            }
        }
	}
};
module.exports = roleHauler;
