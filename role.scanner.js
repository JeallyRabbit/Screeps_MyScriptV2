
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");


function findRouteTestScanner(starting_pos, destination) {

    var ret = PathFinder.search(starting_pos, destination, {
        //maxRooms: 64,
        
        plainCost: 2,
        range: 5 ,
        swampCost: 2,
        maxOps: 8000,

        roomCallback: function (roomName) {

            //let room = spawn.room.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            //costs = new PathFinder.CostMatrix;

            let room = Game.rooms[roomName];
            if (!room) { return; }

           // if (roomName == spawn.room.name) {
           //     costs = roomCM;
           // }
           // else {
                // setting costmatrix for for rooms other than spawnRoom
                //console.log(roomName);
                costs = new PathFinder.CostMatrix;
                const terrain = room.getTerrain()

                for (let y = 0; y < 50; y++) {
                    for (let x = 0; x < 50; x++) {
                        const tile = terrain.get(x, y);
                        const weight =
                            tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                                tile === TERRAIN_MASK_SWAMP ? 10 : // swamp => weight:  10
                                    2; // plain => weight:  2
                        costs.set(x, y, weight);
                    }
                }
            //}
            //let 



            //spawn.
            room.find(FIND_STRUCTURES).forEach(function (struct) {
                if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                    (struct.structureType !== STRUCTURE_RAMPART ||
                        !struct.my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(struct.pos.x, struct.pos.y, 255);
                }
            });

            // avoid construction sites
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType != STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 255);
            });

            //favour roads under construction
            //spawn.
            room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (construction) {
                    return construction.structureType == STRUCTURE_ROAD;
                }
            }).forEach(function (struct) {
                costs.set(struct.pos.x, struct.pos.y, 1);
            });


            room.find(FIND_HOSTILE_CREEPS).forEach(function (a) {
                costs.set(a.pos.x, a.pos.y, 255);
                console.log(a.pos.x," ",a.pos.y)
                for(var i=a.pos.x-5;i<a.pos.x+5;i++)
                {
                    for(var j=a.pos.y-5;j<a.pos.y+5;j++)
                    {
                        if(i>=0 && i<=49 && j>=0 && j<=49)
                        {
                            costs.set(i, j, 255)
                        }
                    }
                }
            });

            room.find(FIND_HOSTILE_STRUCTURES).forEach(function (a) {
                costs.set(a.pos.x, a.pos.y, 255);
            });
            /*
            //ignore walls
            if (roomName == spawn.room.name) {

                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (spawn.memory.room_plan[i][j] == STRUCTURE_RAMPART && costs.get(i, j) < 255) {
                            costs.set(i, j, 1);
                        }
                    }
                }
            }
            */

           // costs.set(destination.x, destination.y, 255);

            return costs;
        }
    });

    

    for (a of ret.path) {
        //console.log(a)
        if(Game.rooms[a.roomName]!=undefined)
        {
            Game.rooms[a.roomName].visual.circle(a.x, a.y, { fill: 'white', radius: 0.5, stroke: 'red' });
        }
    }

    //console.log("Route from: ", starting_pos, " to: ", destination, " incomplete: ", ret.incomplete," length: ",ret.path.length)

    return ret
}

class colonizeRoom {
    constructor(name, spawn_pos_x, spawn_pos_y) {
        this.name = name;
        this.spawn_pos_x = spawn_pos_x;
        this.spawn_pos_y = spawn_pos_y;
    }
}

function generateAdjacentRooms(tileName) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const adjacentTiles = [];
    adjacentTiles.push(tileName);
    for (let x = Number(numX) - 1; x <= Number(numX) + 1; x++) {
        for (let y = Number(numY) - 1; y <= Number(numY) + 1; y++) {
            if (x === Number(numX) && y === Number(numY) || x < 1 || y < 1) {
                continue; // Skip the original tile and invalid coordinates.
            }
            adjacentTiles.push(`${letterA}${x}${letterB}${y}`);
        }
    }

    return adjacentTiles;
}

function checkRoomNameEndsWith5(roomName) {
    // Use a regular expression to extract the numbers from the room name
    const numbers = roomName.match(/\d+/g);

    // Check if there are exactly two numbers extracted
    if (numbers && numbers.length === 2) {
        // Check if both numbers end with '5'
        return numbers.every(number => number.endsWith('5'));
    }

    // Return false if the format doesn't match or the condition is not met
    return false;
}


function generateRoomsInRangeAndSort(tileName, range = 8) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);
    const roomsInRange = [];

    // Generate rooms within the specified range.
    for (let x = Number(numX) - range; x <= Number(numX) + range; x++) {
        for (let y = Number(numY) - range; y <= Number(numY) + range; y++) {
            if (x <= 1 || y <= 1) {
                continue; // Skip invalid coordinates.
            }
            roomsInRange.push({ name: `${letterA}${x}${letterB}${y}`, distance: Math.sqrt(Math.pow(x - numX, 2) + Math.pow(y - numY, 2)) });
        }
    }

    //console.log("scanner generating");
    for (let i = 0; i < roomsInRange.length; i++) {
        //console.log("room in range[",i,"]: ",roomsInRange[i].name);
        for (let main_spawn_id of Memory.main_spawns) {
            //console.log(main_spawn_id)
            for (farming of Game.getObjectById(main_spawn_id).memory.farming_rooms) {
                //console.log(farming.name, " ",roomsInRange[i].name);
                if (farming != undefined && roomsInRange[i] != undefined && roomsInRange[i].name == farming.name) {
                    //console.log("removing my room; ", roomsInRange[i].name);
                    roomsInRange.splice(i, 1)
                    i--;
                }

            }

            if (roomsInRange[i] != undefined && checkRoomNameEndsWith5(roomsInRange[i].name) == true) {
                //console.log("center room: ", roomsInRange[i].name)
                roomsInRange.splice(i, 1);
                var keepers_rooms = generateAdjacentRooms(roomsInRange[i].name);
                for (let keeper_room of keepers_rooms) {
                    // console.log("generated keeper room: ",keeper_room);
                    for (let j = 0; j < roomsInRange.length; j++) {
                        if (roomsInRange[j].name == keeper_room) {
                            //console.log("removing keeper room: ",keeper_room);
                            roomsInRange.splice(j, 1);
                            j--;
                        }
                    }
                }
            }

        }
    }


    // Sort the rooms by distance from the initial room.
    roomsInRange.sort((a, b) => a.distance - b.distance);



    // If you only need the room names in sorted order:
    return roomsInRange.map(room => room.name);
}

//const sortedRooms = generateRoomsInRangeAndSort('A1B2', 5);
//console.log(sortedRooms);


Creep.prototype.roleScanner = function roleScanner(creep, spawn) {
    //creep.suicide();

    //creep.memory.target_room='W3N6'


    if(Memory.colonizing==false)
    {
        creep.suicide()
    }

    if(spawn.memory.manual_colonize!=undefined)
    {
        creep.memory.target_room=spawn.memory.manual_colonize;
    }

    console.log("scanner from: ", creep.memory.home_room.name, " is at: ", creep.room.name)
    //creep.memory.target_room='W19N13'
    console.log("scanner pos: ", creep.room.name, " heading to: ", creep.memory.target_room);
    if ((spawn.memory.scanner_rooms == undefined || (spawn.memory.scanner_rooms != undefined && spawn.memory.scanner_rooms.length == 0) ) && creep.memory.target_room==undefined) {
        spawn.memory.scanner_rooms = []
        spawn.memory.scanner_rooms = generateRoomsInRangeAndSort(spawn.room.name);

        creep.say("gen");
    }
    else {
        if (creep.memory.target_room == undefined && spawn.memory.scanner_rooms != undefined && spawn.memory.scanner_rooms.length > 0
            && Game.map.getRoomStatus(spawn.memory.scanner_rooms[0]).status == 'normal') {
            creep.say("assign");

            creep.memory.target_room = spawn.memory.scanner_rooms[0];
        }
        else if (spawn.memory.scanner_rooms!=undefined && Game.map.getRoomStatus(spawn.memory.scanner_rooms[0]).status != "normal") {
            spawn.memory.scanner_rooms.shift();
            return;
        }
    }

    if (creep.memory.target_room != undefined) {
        if (creep.memory.target_room == creep.memory.home_room.name) {//removing home room
            spawn.memory.scanner_rooms.shift()
            creep.memory.target_room = undefined;
            creep.say("removing home_room");
            return;
        }
        if (Game.map.findRoute(creep.room.name, creep.memory.target_room) == ERR_NO_PATH || Game.map.getRoomStatus(creep.memory.target_room!='normal')) {
            console.log("removing: ", creep.memory.target_room);
            creep.say("A")
            spawn.memory.scanner_rooms.shift()
            creep.memory.target_room = undefined;
        }

        if (creep.memory.target_room != undefined && creep.room.name != creep.memory.target_room) {
            

            var reusePath=100;

            if(creep.memory.destination==undefined)
            {
                creep.say("destination unknown")
                var destination=[];
                for(var i=1;i<50;i++)
                {
                    for(var j=1;j<50;j++)
                    {
                        destination.push(new RoomPosition(i,j,creep.memory.target_room))
                    }
                }
                creep.memory.destination=destination;
            }

            if(creep.memory.destination!=undefined)
            {
                creep.move_avoid_hostile(creep,creep.memory.destination,reusePath,true)
            }
            

            
            
            
            
            
            
            
            /*
            //const destination = new RoomPosition(25, 25, creep.memory.target_room);

            creep.say(creep.memory.target_room);


            var exits = creep.room.find(creep.room.findExitTo(creep.memory.target_room))

            if (exits != undefined && exits.length > 0) {
                var closest_exit = creep.pos.findClosestByRange(exits)
                if (closest_exit != null) {
                   
                    creep.moveTo(closest_exit, { maxRooms: 1 })
                }
                else {
                    creep.moveTo(exits[0], { maxRooms: 1,avoidSk: true, reusePath: 21,avoidHostileRooms: true })
                }

            }
            */

        }

        


    }



    if (creep.room.name == creep.memory.target_room && creep.memory.target_room != creep.memory.home_room.name) {
        creep.say("at target");
        //console.log("scanner at target_room");
        var is_reserved = false;
        var is_owned = false;
        var is_guarded = false;
        var is_already_scanned = false;
        if (creep.room.controller != undefined && creep.room.controller.reservation != undefined) {
            is_reserved = true;
            //creep.say("reserved");
        }
        if (creep.room.controller != undefined && creep.room.controller.owner != undefined &&
            creep.room.controller.owner.username != 'JeallyRabbit' && creep.room.controller.owner.username != 'Jeally_Rabbit') {
            //creep.say("owned");
            is_owned = true;
        }

        for (let colonizeRoom in Memory.rooms_to_colonize) {
            if (colonizeRoom.name == creep.room.name) {
                is_already_scanned = true;
                break;
            }
        }



        var sources_num = creep.room.find(FIND_SOURCES).length;

        var towers_num = creep.room.find(FIND_STRUCTURES, {
            filter:
                function (str) {
                    return str.structureType == STRUCTURE_TOWER && str.my == false;
                }
        }).length;
        console.log(creep.room.name, " have: ", towers_num, " towers ___________________________________________________________");

        if (towers_num > 0) {
            is_guarded = true;
        }


        ///////////
        //move to some global function so it is checked after generating rooms_list - before creep try to reach the room
        var is_farming_room = false;
        for (let spawn_id of Memory.main_spawns) {
            var other_spawn = Game.getObjectById(spawn_id);
            if (other_spawn != null) {
                for (let farming_room of other_spawn.memory.farming_rooms) {
                    if (farming_room.name == creep.room.name) {
                        is_farming_room = true;
                        creep.say("farmed");
                        break;
                    }
                }
            }
        }

        if (is_owned == false && is_reserved == false && is_farming_room == false && is_guarded == false && sources_num == 2
                 /* && Math.abs(Game.map.getRoomLinearDistance(spawn.room.name, creep.room.name)) >=3 */) {
            seeds = [];
            seeds.push(creep.room.controller.pos);
            //seeds.push(spawn.room.controller.pos);
            Memory.roomVisuals = false
            var floodCM = creep.room.floodFill(seeds);
            Memory.roomVisuals = false;
            //return;

            let roomCM = new PathFinder.CostMatrix;
            const terrain = new Room.Terrain(creep.room.name);
            for (let i = 0; i < 50; i++) {
                for (let j = 0; j < 50; j++) {
                    if (terrain.get(i, j) == 1) {
                        roomCM.set(i, j, 255);
                    }

                    //NEED TESTING
                    if (i <= 2 || i >= 48 || j <= 2 || j >= 48) {
                        roomCM.set(i, j, 255);
                    }
                }
            }

            let distanceCM = creep.room.distanceTransform(roomCM, true);
            // I need position for spawnstamp - spawn stamp must be as close to controller as possible and at distance minimum 
            // 4 tiles from any other wall
            var spawn_pos_x = -1;
            var spawn_pos_y = -1;
            min_distance_from_controller = 100;
            for (i = 0; i < 50; i++) {
                for (let j = 0; j < 50; j++) {
                    if (distanceCM.get(i, j) > 4 && floodCM.get(i, j) < min_distance_from_controller
                        && i > 4 && i < 46 && j > 4 && j < 46) {
                        min_distance_from_controller = floodCM.get(i, j);
                        spawn_pos_x = i;
                        spawn_pos_y = j-2;
                    }
                }
            }
            if (spawn_pos_x > 4 && spawn_pos_x < 46 && spawn_pos_y > 4 && spawn_pos_y < 46) {
                console.log("pos for new spawn: ", spawn_pos_x, " ", spawn_pos_y, " ", creep.room.name);
                var is_to_close = false;
                for (let my_room in Game.rooms) {
                    if (Game.map.getRoomLinearDistance(creep.room.name, Game.rooms[my_room].name) < 2 && my_room != creep.room.name) {
                        console.log(" ");
                        console.log("distance between: ", creep.room.name, " and ", Game.rooms[my_room].name,
                            " = ", Game.map.getRoomLinearDistance(creep.room.name, Game.rooms[my_room].name));
                        console.log("Room is to close");
                        console.log(" ");
                        is_to_close = true;
                        break;
                    }
                }
                if (is_to_close == false /* || true */) {
                    if (Memory.colonizing == true) {
                        Memory.rooms_to_colonize.push(new colonizeRoom(creep.room.name, spawn_pos_x, spawn_pos_y - 2));
                    }

                }

            }
            else {
                console.log("room: ", creep.room.name, " have wrong spawn position ", spawn_pos_x, " ", spawn_pos_y);
            }
            // 19 38

            //Memory.rooms_to_colonize.push(new colonizeRoom(creep.room.name,spawn_pos_x,spawn_pos_y-2));
            //return;
            //check if there is a place in room to fit main spawn stamp
            // if yes add room to list of rooms_to_colnize
        }
        creep.memory.target_room = undefined;
        if(spawn.memory.scanner_rooms!=undefined && spawn.memory.scanner_rooms.length>0)
        {
            spawn.memory.scanner_rooms.shift();
        }
        


    }

}
