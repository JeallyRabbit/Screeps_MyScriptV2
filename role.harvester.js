var roleBuilder=require('role.builder');
var RoomPositionFunctions=require('roomPositionFunctions');

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
                if(Game.time%50==0 )
                {
                    var positions=sources[source_index].pos.getNearbyPositions();
                    //console.log("Creep at: ",creep.pos)
                    for(let i=0;i<positions.length;i++)
                    {
                        //console.log("A");
                        var structures_at_pos=creep.room.lookForAt(LOOK_STRUCTURES,positions[i]);
                        var creeps_at_pos=creep.room.lookForAt(LOOK_CREEPS,positions[i]);
                        if(structures_at_pos!=undefined)
                        {
                            //console.log("QWE");
                            for(let j=0;j<structures_at_pos.length;j++)
                            {
                                if(structures_at_pos[j].structureType==STRUCTURE_CONTAINER &&
                                creeps_at_pos[0]==undefined)
                                {
                                    console.log(creep.moveTo(positions[i]));
                                    //creep.say("ALLIGNING");
                                    break;
                                }
                                //else{console.log("CREEP");}
                                //console.log("STRUCTURES AT: ",positions[i]," ",structures_at_pos[j].structureType);
                                //console.log("CREEPS AT: ", positions[i]," ",creeps_at_pos);
                            }
                            
                            
                            
                        }
                    
                   // if(creep.room.lookForAt(LOOK_STRUCTURES,positions[i]))
                }
                }
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
            
            
               
	}
};
module.exports = roleHarvester;