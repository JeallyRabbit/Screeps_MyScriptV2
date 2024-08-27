Creep.prototype.roleIntershardUpgrader = function (creep) {
    console.log("upgrader pos: ", creep.pos)
    if (Game.shard.name == 'shard3') {
        //creep.say("2")
        if (creep.room.name == 'W19N13' /* || creep.room.name == 'W18N22'*/ ) {
            
            var exits = creep.room.findExitTo('W20N13')
            var closest_exit=creep.pos.findClosestByRange(exits)
            creep.moveTo(closest_exit, { reusePath: 10, maxRooms: 1 })
            
            
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
            if(creep.store[RESOURCE_ENERGY]==0)
            {
                var container=null;
                if(creep.room.storage!=undefined)
                {
                    container=creep.room.storage;
                }
                else
                {
                    container=creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES,{filter:
                        function (str)
                        {
                            return str.structureType==STRUCTURE_CONTAINER
                        }
                    })
                }
                
                if(container!=null)
                {
                    if(creep.withdraw(container,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(container,{reusePath:11,maxRooms:1})
                    }
                }
            }
            else
            {
                if(creep.upgradeController(creep.room.controller)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.controller,{reusePath:11,maxRooms:1})
                }
            }
        }
    }
}