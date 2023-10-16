var roleBuilder=require('role.builder');
var RoomPositionFunctions=require('roomPositionFunctions');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        if(creep.memory.sources==undefined)
        {
            creep.memory.sources=creep.room.find(FIND_SOURCES);
        }
            
            //var source_index=creep.memory.myID%sources.length;
            var source_index=creep.memory.target_source;
            var construction_sites=creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3);

            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                    && structure.pos.inRangeTo(creep.pos,3);
                }
            });

            //console.log(creep.memory.sources[1]);
            if(creep.memory.harvesting==true)
            {
                creep.harvest(Game.getObjectById(creep.memory.sources[source_index].id));
                //console.log("source pos: ", creep.memory.sources[source_index]);
                if(Game.time%50==0 )
                {
                    var positions=Game.getObjectById(creep.memory.sources[source_index].id).pos.getNearbyPositions();
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
                                {//creep is alligning
                                   // creep.memory.harvesting=false;
                                    creep.moveTo(positions[i]);
                                    //creep.say("ALLIGNING");
                                    break;
                                }
                            }
                        }
                    }
                    if(construction_sites.length<1 && containers.length<1)
                        {// build container next to source
                            
                           
                            var positions=new RoomPosition(Game.getObjectById(creep.memory.sources[source_index].id).pos.x,Game.getObjectById(creep.memory.sources[source_index].id).pos.y,creep.room.name).getOpenPositions2();
                            
                            if(positions!= undefined && positions.length>0)
                            {
                                positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                            }
                        }
                }
            }
            else if(creep.harvest(Game.getObjectById(creep.memory.sources[source_index].id)) == ERR_NOT_IN_RANGE)
            {
               // creep.say("-1");
                creep.memory.harvesting=false;
                creep.moveTo(Game.getObjectById(creep.memory.sources[source_index].id));
            }   
            else if(creep.harvest(Game.getObjectById(creep.memory.sources[source_index].id))==OK)
            {
                creep.memory.harvesting=true;
            }
            /*
            else{
                var a=creep.memory.sources[0];
                creep.say(Game.getObjectById(creep.memory.sources[0].id));
                creep.memory.harvesting=false;
            }*/
	}
};
module.exports = roleHarvester;