var roleBuilder = require('role.builder');
var RoomPositionFunctions=require('roomPositionFunctions');

var roleFarmer = {
    run: function(creep) {
        
        var home_room=creep.memory.home_room.name;
        //var x_source=25,y_source=25;
        if(creep.room.name==creep.memory.target_room && creep.store.getFreeCapacity() > 0)
        {// if have some free space and at destination room go harvest
            var sources = creep.room.find(FIND_SOURCES);
            //creep.say(sources.length);
            if(creep.memory.source_id==undefined)
            {
                for(let i=0;i<sources.length;i++)
                {
                    if(sources[i].energy>0 && sources[i].pos.getOpenPositions().length>0)
                    {
                        //creep.say(i+100);
                        creep.memory.source_id=i;
                        //console.log("harvest: ",creep.harvest(sources[i]));
                        
                    }
                }
            }
            else if(sources[creep.memory.source_id].pos.getOpenPositions().length<1 && !creep.pos.isNearTo(sources[creep.memory.source_id]))
            {// if sources became unavailable ( due to creeps around it) and creep is not near this source 
                creep.memory.source_id=undefined;
            }
            else{
                if(creep.harvest(sources[creep.memory.source_id]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.source_id]);
                    }
            }
            
        }
        else if(creep.store.getFreeCapacity() > 0)
        {// not in target room and have free space
            
            creep.moveTo(new RoomPosition(25,25, creep.memory.target_room));
        }
        else if(creep.store.getFreeCapacity()==0 /*&& creep.room.name==home_room*/)//if not in home room and no free space, put energy to most empty container
        {
            
            creep.moveTo(new RoomPosition(18,35,home_room));
            //creep.say("coming back");
            var containers=creep.room.find(FIND_STRUCTURES, {
                filter: (i) => {return i.structureType == STRUCTURE_CONTAINER 
                    && i.store[RESOURCE_ENERGY]<2000}});

                //containers.sort((a,b)=> a.store-b.store);
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
                        return structure.structureType == STRUCTURE_EXTENSION
                        && structure.store[RESOURCE_ENERGY]<50
                    }
                });
                var extensions_full=1;//1 when all are full
                if(extensions.length>0)
                {
                    extensions_full=0;
                }

                if (containers.length>0 )// if is full and there are containers, go to container with minimum energy
                {
                var withdraw_amount=1;
                withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[0].store[RESOURCE_ENERGY]);
                var closest_container=creep.pos.findClosestByRange(containers);
                if(creep.transfer(closest_container,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                {// if creep have no energy go to container and withdraw energy
                    creep.moveTo(closest_container);
                }
                
                }
                else if(Game.spawns['Spawn1'].store.getFreeCapacity([RESOURCE_ENERGY])>0)
                { //containers full and spawn is not full
                    if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.spawns['Spawn1']);
                    }
                }
                else // go to extension
                {
                    
                    var extensions = creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_EXTENSION
                            && structure.energy<50;;
                        }
                    });
                    var closestExtension=creep.pos.findClosestByRange(extensions);
                    if(closestExtension!=null)
                    {
                        var transfered_amount=1;
                        transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                        if(creep.transfer(closestExtension,RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE )
                        {// if creep have some energy go to extension and fill with energy
                            creep.moveTo(closestExtension);
                        }
                    }
                    else{
                        //creep.say("bu");
                        roleBuilder.run(creep);
                    }
                }
        }

	}
};
module.exports = roleFarmer;