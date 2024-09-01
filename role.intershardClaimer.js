Creep.prototype.roleIntershardClaimer = function (creep) {
    console.log("claimer pos: ",creep.pos)
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
            if(creep.room.controller.my && creep.memory.planned!=true)
            {
                creep.say("planning spawn ")
                //plan_spawn_location(creep)
            }
            else 
            {
                creep.say("claiming")
                if(creep.claimController(creep.room.controller)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.controller,{reusePath:11,maxRooms:1})
                }
            }



        }
    }
}

function plan_spawn_location(creep) {
    seeds = []
    seeds.push(creep.room.controller.pos)
    //seeds.push(spawn.room.controller.pos);
    Memory.roomVisuals = false
    var floodCM = creep.room.floodFill(seeds)
    Memory.roomVisuals = false
    //return;
    let roomCM = new PathFinder.CostMatrix
    const terrain = new Room.Terrain(creep.room.name)
    for (let i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (terrain.get(i, j) == 1) {
                roomCM.set(i, j, 255)
            }

            //NEED TESTING
            if (i <= 2 || i >= 48 || j <= 2 || j >= 48) {
                roomCM.set(i, j, 255)
            }
        }
    }

    let distanceCM = creep.room.distanceTransform(roomCM, true)
    // I need position for spawnstamp - spawn stamp must be as close to controller as possible and at distance minimum 
    // 4 tiles from any other wall
    var spawn_pos_x = -1
    var spawn_pos_y = -1
    min_distance_from_controller = 100
    for (i = 0; i < 50; i++) {
        for (let j = 0; j < 50; j++) {
            if (distanceCM.get(i, j) > 5 && floodCM.get(i, j) < min_distance_from_controller
                && i > 4 && i < 46 && j > 4 && j < 46) {
                min_distance_from_controller = floodCM.get(i, j)
                spawn_pos_x = i
                spawn_pos_y = j
            }
        }
    }
    if (spawn_pos_x > 4 && spawn_pos_x < 46 && spawn_pos_y > 4 && spawn_pos_y < 46) {
        console.log("pos for new spawn: ", spawn_pos_x, " ", spawn_pos_y, " ", creep.room.name)
        var is_to_close = false
        for (let my_room in Game.rooms) {
            if (Game.map.getRoomLinearDistance(creep.room.name, Game.rooms[my_room].name) < 2 && my_room != creep.room.name) {
                console.log(" ")
                console.log("distance between: ", creep.room.name, " and ", Game.rooms[my_room].name,
                    " = ", Game.map.getRoomLinearDistance(creep.room.name, Game.rooms[my_room].name))
                console.log("Room is to close")
                console.log(" ")
                is_to_close = true
                break
            }
        }
        if (is_to_close == false || true) {
            var create_result=creep.room.createConstructionSite(spawn_pos_x, spawn_pos_y - 2,STRUCTURE_SPAWN,creep.room.name + "_1")
            if(create_result==OK)
            {
                creep.memory.planned=true;
            }
            creep.say(create_result)
           // if (Memory.colonizing == true) {
            //    Memory.rooms_to_colonize.push(new colonizeRoom(creep.room.name, spawn_pos_x, spawn_pos_y - 2))
            //}

        }

    }
    else {
        console.log("room: ", creep.room.name, " have wrong spawn position ", spawn_pos_x, " ", spawn_pos_y)
    }
}
