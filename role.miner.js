var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep,spawn) 
    {
        var mineral=creep.room.find(FIND_MINERALS);
        var storage=creep.room.find(FIND_STRUCTURES,{
            filter: function (structure)
            {
                return structure.structureType==STRUCTURE_STORAGE
                && structure.store.getFreeCapacity()>0;
            }
        })
        if(mineral!=undefined && mineral.length>0)
        {
            if(creep.store.getFreeCapacity()>0)
            {
                if(creep.harvest(mineral[0])==ERR_NOT_IN_RANGE)
                {
                    creep.say(creep.moveTo(mineral[0]));
                }
            }
            else{
                if(creep.transfer(storage[0],mineral[0].mineralType)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(storage[0]);
                }
            }
        }
	}
};
module.exports = roleMiner;