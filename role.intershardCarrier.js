Creep.prototype.roleIntershardCarrier = function (creep) {
    console.log("carrier pos: ", creep.pos)
    if (Game.shard.name == 'shard3') {
        //creep.say("2")
        if (creep.room.name == 'W19N13' /* || creep.room.name == 'W18N22'*/ ) {
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY)>0)
            {
                if(creep.withdraw(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.storage,{reusePath:11, maxRooms:1})
                }
            }
            else
            {
                var exits = creep.room.findExitTo('W20N13')
                var closest_exit=creep.pos.findClosestByRange(exits)
                creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
            }
            
        }
        else if (creep.room.name == 'W20N13') {
            var exits = creep.room.findExitTo('W20N12')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W20N12') {
            var exits = creep.room.findExitTo('W20N11')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W20N11') {
            var exits = creep.room.findExitTo('W20N10')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }/*
        else if (creep.room.name == 'W19N20') {
            var exits = creep.room.findExitTo('W20N20')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }*/
        else if (creep.room.name == 'W20N10') {
            var portal=creep.room.find(FIND_STRUCTURES,{filter:
                function(str)
                {
                    return str.structureType==STRUCTURE_PORTAL && str.destination.shard=='shard2' // && str.pos.x==40 && str.pos.y==16
                }
            })
            creep.moveTo(portal[0], { reusePath: 10, maxRooms: 1 })
        }
    }
    else if(Game.shard.name=='shard2' && creep.room.name=='W20N10')
    {
        var portal=creep.room.find(FIND_STRUCTURES,{filter:
            function(str)
            {
                return str.structureType==STRUCTURE_PORTAL && str.destination.shard=='shard1' //&& str.pos.x==13 && str.pos.y==12
            }
        })
        creep.moveTo(portal[0], { reusePath: 10, maxRooms: 1 })
    }
    else if(Game.shard.name=='shard1')
    {
        if (creep.room.name == 'W20N10') {
            var exits = creep.room.findExitTo('W21N10')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        
        else if (creep.room.name == 'W21N10') {
            var exits = creep.room.findExitTo('W21N11')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }/*
        else if (creep.room.name == 'W21N19') {
            var exits = creep.room.findExitTo('W22N19')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W23N20') {
            var exits = creep.room.findExitTo('W24N20')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W24N20') {
            var exits = creep.room.findExitTo('W25N20')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W25N20') {
            var exits = creep.room.findExitTo('W26N20')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }
        else if (creep.room.name == 'W26N20') {
            var exits = creep.room.findExitTo('W26N21')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
            //creep.moveTo(new RoomPosition(25,25,'W27N21'))
        }
        else if (creep.room.name == 'W26N21') {
            var exits = creep.room.findExitTo('W27N21')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
            //creep.moveTo(new RoomPosition(25,25,'W27N21'))
        }
        else if (creep.room.name == 'W27N20') {
            var exits = creep.room.findExitTo('W28N20')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
        }*/
        else if(creep.room.name == 'W21N11')
        {
            if(creep.store[RESOURCE_ENERGY]==0){creep.suicide()}
            if(creep.room.storage!=undefined)
            {
                if(creep.transfer(creep.room.storage,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.storage,{reusePath:21,maxRooms:1})
                }
            }
            else
            {
                var spawn=creep.room.find(FIND_STRUCTURES,{filter:
                    function(str)
                    {
                        return str.structureType==STRUCTURE_SPAWN
                    }
                })
                var containers=creep.room.find(FIND_STRUCTURES,{filter:
                    function (str)
                    {
                        return str.structureType==STRUCTURE_CONTAINER && (str.pos.inRangeTo(creep.room.controller,4) || str.pos.inRangeTo(spawn[0],4))
                        && str.store.getFreeCapacity(RESOURCE_ENERGY)>0
                    }
                })
                var closest_container=creep.pos.findClosestByRange(containers)
                if(closest_container!=null)
                {
                    if(creep.transfer(closest_container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(closest_container,{reusePath:17,maxRooms: 1})
                    }
                }
            }
        }
    }
}
