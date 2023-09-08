
var roleHarvester2 = {
    run: function(creep) {
        //creep.say(creep.room);
        console.log(creep.room);
        var target_room='W8N2';
        
        //8 0 (x,y)
        creep.moveTO
        creep.moveTo(new RoomPosition(8,1, target_room));
        if(creep.room=='[room '+target_room+']' && creep.store.getFreeCapacity() > 0)
        {// if have some free space and at destination room go harvest
            //creep.say("Harvesting");
            var sources = creep.room.find(FIND_SOURCES);
            for(let i=0;i<sources.length;i++)
            {
                if(sources[i].energy>0 && creep.moveTo(sources[i])!=-2)
                {
                    if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[i]);
                    }
                }
            }
        }
        else if(creep.store.getFreeCapacity()==0)
        {
            creep.moveTo(new RoomPosition(15,46,'W8N3'));
            creep.say("coming back");
            var containers=creep.room.find(FIND_STRUCTURES, {
                filter: (i) => {return i.structureType == STRUCTURE_CONTAINER}});
                containers.sort((a,b)=> a.store-b.store);
                
                for(let i =0;i<containers.length;i++)
                {
                    //console.log(containers[i].store);
                    if(containers[i].store.getFreeCapacity[RESOURCE_ENERGY]==0)
                    {
                        containers=containers.slice(0,i).concat(array.slice(i+1));
                        i--;
                    }
                }
    
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

                if (containers.length>0 )// if is full and there are containers, go to container with minimum energy
                {
                var withdraw_amount=1;
                withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[0].store[RESOURCE_ENERGY]);
                if(creep.transfer(containers[0],RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                {// if creep have no energy go to container and withdraw energy
                    //creep.say("Going to container");
                    creep.moveTo(containers[0]);
                }
                
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
                        if(creep.transfer(extensions[eID],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE /* && creep.store[RESOURCE_ENERGY]>0*/)
                        {// if creep have some energy go to extension and fill with energy
                            //creep.say("Going do extension");
                            creep.moveTo(extensions[eID]);
                        }
                    }
                }

        }

	}
};
module.exports = roleHarvester2;