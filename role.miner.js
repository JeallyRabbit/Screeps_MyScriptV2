const { move_avoid_hostile } = require("./move_avoid_hostile");
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
                    creep.say(creep.moveTo(mineral[0]),{reusePath:11});
                }
            }
            else{
                if(creep.transfer(storage[0],mineral[0].mineralType)==ERR_NOT_IN_RANGE)
                {
                    //move_avoid_hostile(creep,storage[0].pos,1,false);
                    creep.moveTo(storage[0],{reusePath:11});
                }
            }
        }
	}
};
module.exports = roleMiner;