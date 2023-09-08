var roleBuilder=require('role.builder');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        /*
        var containers=creep.room.find(FIND_STRUCTURES, {
            filter: (i) => {return i.structureType == STRUCTURE_CONTAINER}});
            //containers.sort((a,b)=> a.store-b.store);
            
            //console.log("num of containers: ",containers.length);
            
            
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
        */

            var sources = creep.room.find(FIND_SOURCES);
            var source_index=creep.memory.myID%sources.length;
            //source_index=0;
            //console.log(sources[0]);
            if(sources[source_index].energy>0 && creep.moveTo(sources[source_index])!=-2)
                {
                    if(creep.harvest(sources[source_index]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[source_index]);
                    }
                }
            
        /*
        else if (containers.length>0 )// if is full and there are containers, go to container with minimum energy
        {
            var closestContainer=containers[0];
            var closestDistance=10000000;
           
            for(let i =0;i<containers.length;i++)
            {
                var distance=creep.pos.findClosestByRange(containers[i].pos);
                //console.log("DISTANCE: ",distance);
                //console.log("free capacity: ",containers[i].store.getFreeCapacity());
                if(containers[i].store.getFreeCapacity()>0)
                {
                    if(distance<closestDistance)
                    {
                        closestDistance=distance;
                        closestContainer=containers[i];
                        console.log("FOUND CLOSEST ", closestContainer.pos);
                    }
                }
            }

            var withdraw_amount=1;
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
            if(creep.transfer(closestContainer,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
            {// if creep have no energy go to container and withdraw energy
                //creep.say("Going to container");
                creep.moveTo(closestContainer);
            }
            
            //creep.drop(RESOURCE_ENERGY,creep.store[RESOURCE_ENERGY]);
        }
        else if(Game.spawns['Spawn1'].store.getFreeCapacity([RESOURCE_ENERGY])>0)//containers full and spawn is not full
        {
            if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }
        }
        else // go to extension
        {
            //console.log("spawn is full !!!");
            var eID=-1;
            for(let i=0;i<extensions.length;i++)
            {// finding not full extensions
                if(extensions[i].store[RESOURCE_ENERGY]<50)
                {
                    eID=i;
                    break;
                }
            }//console.log('eID: ',eID);
            if(eID>=0)
            {
                
                var transfered_amount=1;
                transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], extensions[eID].store[RESOURCE_ENERGY].getFreeCapacity);
                if(creep.transfer(extensions[eID],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE )
                {// if creep have some energy go to extension and fill with energy
                    //creep.say("Going do extension");
                    creep.moveTo(extensions[eID]);
                }
            }
            

        }
        */
	}
};
module.exports = roleHarvester;