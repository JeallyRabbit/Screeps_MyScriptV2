var roleBuilder=require('role.builder');
var RoomPositionFunctions=require('roomPositionFunctions');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
            var sources=creep.room.find(FIND_SOURCES);
            //var source_index=creep.memory.myID%sources.length;
            var source_index=creep.memory.target_source;
            var construction_sites=creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3);

            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                    && structure.pos.inRangeTo(creep.pos,3);
                }
            });

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
                            }
                        }
                    }
                    if(construction_sites.length<1 && containers.length<1)
                        {// build container next to source
                            
                            creep.say("BU");
                            var positions=new RoomPosition(sources[creep.memory.source_id].pos.x,sources[creep.memory.source_id].pos.y,creep.room.name).getOpenPositions2();
                            
                            if(positions!= undefined && positions.length>0)
                            {
                                positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                            }
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