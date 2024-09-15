
//var routeCreep = require('routeCreep');
Creep.prototype.energySupport = function energySupport(creep, spawn) {


    if(creep.store[RESOURCE_ENERGY]==0)
    {
        creep.memory.collecting=true
    }
    else{
        creep.memory.collecting=false;  
    }


    if(creep.memory.collecting)
    { // go home_room and take resources
        if(creep.room.name==creep.memory.home_room)
        {
            if(creep.room.stora !=undefined)
            {
                if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.stora,{reusePath: 11})
                }
            }
        }
        else
        {
            creep.moveTo(new RoomPosition(25,25,creep.memory.home_room.name),{range: 22, reusePath: 21})
        }
    }
    else 
    {
        if(creep.room.name==creep.memory.target_room)
        {
            if(creep.memory.target_containers==undefined)
            {
                var target_spawn=creep.room.find(FIND_MY_STRUCTURES,{filter:
                    function (str)
                    {
                        return str.structureType==STRUCTURE_SPAWN
                    }
                })
                if(target_spawn.length>0)
                {
                    creep.memory.target_spawn==target_spawn[0].id;

                    var cont=creep.room.find(FIND_STRUCTURES,{filter: function
                        (str)
                        {
                            return str.structureType==STRUCTURE_STORAGE || (str.structureType==STRUCTURE_CONTAINER && str.pos.inRangeTo(target_spawn[0],4))
                        }
                    })
                    if(cont.length>0)
                    {
                        creep.memory.target_containers=[]
                        for(c of cont)
                        {
                            creep.memory.target_containers.push(c.id)
                        }
                    }
                }
                
            }
            if(creep.memory.target_containers!=undefined){
                var all_stores=[];
                all_stores.push(Game.getObjectById(creep.memory.target_spawn))
                for(t of creep.memory.target_containers)
                {
                    if(Game.getObjectById(t)!=null)
                    {
                        all_stores.push(Game.getObjectById(t))
                    }
                }

                var closest=creep.pos.findClosestByRange(all_stores)
                
                if(closest.store.getFreeCapacity(RESOURCE_ENERGY)==0)
                {
                    creep.memory.target_containers=undefined
                }
            }
        }
    }


};