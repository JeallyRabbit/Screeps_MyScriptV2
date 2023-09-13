var roleBuilder=require('role.builder');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
            /*
            if(creep.memory.sources==undefined)
            {
                creep.mmeory.sources = creep.room.find(FIND_SOURCES);
            }
            var sources = creep.memory.sources;
            */
            var sources=creep.room.find(FIND_SOURCES);
            //var source_index=creep.memory.myID%sources.length;
            var source_index=creep.memory.target_source;
            //console.log(sources[1]);
            if(creep.memory.harvesting==true)
            {
                creep.harvest(sources[source_index]);
            }
            else if(creep.harvest(sources[source_index]) == ERR_NOT_IN_RANGE)
            {
                creep.memory.harvesting=false;
                creep.moveTo(sources[source_index]);
            }   
            else if(creep.harvest(sources[source_index])==OK)
            {
                creep.memory.harvesting=true;
            }
            
            
                
                //creep.say(sources[source_index].pos.getOpenPositions().length);
               /*
                var sources = creep.room.find(FIND_SOURCES);
                for(let i=0;i<sources.length;i++)
                {
                    //console.log("creep.moveTo: ", creep.moveTo(sources[i]));
                    //creep.say(sources[i].pos.getOpenPositions().length);
                    if(sources[i].energy>0 && sources[i].pos.getOpenPositions().length>0)
                    {
                        //console.log("harvest: ",creep.harvest(sources[i]));
                        
                        if(creep.harvest(sources[i]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[i]);
                        }
                    }
                }*/
	}
};
module.exports = roleHarvester;