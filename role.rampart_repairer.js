var roleRepairer = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        
        if(creep.store[RESOURCE_ENERGY]==0 || creep.memory.target_rampart==undefined)
        {
            creep.memory.target_rampart=undefined;
            var ramparts=creep.room.find(FIND_MY_STRUCTURES,{
                filter:function(str)
                {
                    return str.structureType==STRUCTURE_RAMPART && str.hits<str.hitsMax;
                }
            });

            if(ramparts.length>0)
            {
                var min_rampart_hits=ramparts[0].hits;
                var min_rampart_id=ramparts[0].id;

                for(let i=1;i<ramparts.length;i++)
                {
                    if(ramparts[i].hits+(creep.store.getCapacity()*REPAIR_POWER)<=min_rampart_hits)
                    {
                        min_rampart_hits=ramparts[i].hits;
                        min_rampart_id=ramparts[i].id;
                    }
                }
                creep.memory.target_rampart=min_rampart_id;
            }

        }
        else if(creep.memory.target_rampart!=undefined && creep.store[RESOURCE_ENERGY]>0)
        {
            var rampart=Game.getObjectById(creep.memory.target_rampart);
            if(rampart==null)
            {
                creep.memory.target_rampart=undefined;
                return;
            }
            if(creep.repair(rampart)==ERR_NOT_IN_RANGE)
            {
                creep.moveTo(rampart,{reusePath:13});
            }
            creep.say('🛠');
        }

        if(creep.store[RESOURCE_ENERGY]==0)
        {
            if(spawn.room.storage!=undefined)
            {
                if(creep.withdraw(spawn.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn.room.storage,{reusePath:13})
                }
            }
        }







    }
}
module.exports = roleRepairer;