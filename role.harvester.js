var roleBuilder=require('role.builder');

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
            var sources = creep.room.find(FIND_SOURCES);
            var source_index=creep.memory.myID%sources.length;
            if(sources[source_index].energy>0 && creep.moveTo(sources[source_index])!=-2)
                {
                    if(creep.harvest(sources[source_index]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[source_index]);
                    }
                }
	}
};
module.exports = roleHarvester;