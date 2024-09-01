Creep.prototype.roleIntershardColonizer = function (creep) {
    console.log("colonizer pos: ", creep.pos)
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
            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.farming = true;
            }
            else if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                creep.memory.farming = false;
            }

            if (creep.memory.farming) {
                var sources = creep.room.find(FIND_SOURCES, {
                    filter:
                        function (src) {
                            return src.energy > 0
                        }
                });

                var target_source = creep.pos.findClosestByPath(sources);
                // if (target_source.energy == 0) { target_source = sources[1]; }

                if (target_source != null && creep.harvest(target_source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_source, { reusePath: 11, maxRooms: 1 })
                }
            }
            else {
                //creep.say("bl")
                var constr_spawn = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter:
                        function (str) {
                            return str.structureType == STRUCTURE_SPAWN
                        }
                })
                if (creep.room.controller.level < 2) {
                    if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, { reusePath: 11, maxRooms: 1 })
                    }
                }

                else if (constr_spawn.length > 0) {
                    //creep.say("bl2")
                    if (creep.build(constr_spawn[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constr_spawn[0], { reusePath: 11, maxRooms: 1 })
                    }
                }
                else {
                    var construction_sites=creep.room.find(FIND_CONSTRUCTION_SITES,{filter:
                        function (str)
                        {
                            return str.my
                        }
                    })
                    if(construction_sites.length>0)
                    {
                        var closest=creep.pos.findClosestByRange(construction_sites)
                        if(closest!=null)
                        {
                            if(creep.build(closest)==ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(closest,{reusePath:21,maxRooms: 1})
                            }
                        }
                    }
                    else
                    {
                        var room_spawn = creep.room.find(FIND_STRUCTURES, {
                        filter:
                            function (str) {
                                return str.structureType == STRUCTURE_SPAWN && str.my
                            }
                    })
                    if (room_spawn.length > 0)
                        var haul_result = creep.transfer(room_spawn[0], RESOURCE_ENERGY);
                    if (haul_result == ERR_NOT_IN_RANGE) {
                        creep.moveTo(room_spawn[0], { reusePath: 11, maxRooms: 1 })
                    }
                    else if (haul_result == ERR_FULL) {
                        creep.drop(RESOURCE_ENERGY)
                    }
                    }
                    
                }
            }

        }
    }
}
