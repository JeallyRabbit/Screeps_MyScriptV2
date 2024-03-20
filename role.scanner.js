
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");


class colonizeRoom {
    constructor(name, spawn_pos_x, spawn_pos_y) {
        this.name = name;
        this.spawn_pos_x = spawn_pos_x;
        this.spawn_pos_y = spawn_pos_y;
    }
}


function generateRoomsInRangeAndSort(tileName, range = 5) {
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

    // Sort the rooms by distance from the initial room.
    roomsInRange.sort((a, b) => a.distance - b.distance);

    // If you only need the room names in sorted order:
    return roomsInRange.map(room => room.name);
}

const sortedRooms = generateRoomsInRangeAndSort('A1B2', 5);
//console.log(sortedRooms);


var roleScanner = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.suicide();
        /*
        creep.memory.target_room='W8N2';
        if(creep.room.name==creep.memory.target_room)
        {
            creep.moveTo(creep.room.controller);
        }
        */

        
        creep.say("SCAN");
        console.log("scanner pos: ", creep.room.name, " heading to: ", creep.memory.target_room);
        if (spawn.memory.scanner_rooms == undefined) {
            spawn.memory.scanner_rooms = []
            spawn.memory.scanner_rooms = generateRoomsInRangeAndSort(spawn.room.name);

            creep.say("gen");
        }
        else {
            if (creep.memory.target_room == undefined && spawn.memory.scanner_rooms != undefined && spawn.memory.scanner_rooms.length > 0) {
                creep.say("assign");
                creep.memory.target_room = spawn.memory.scanner_rooms[0];
            }
        }

        if (creep.memory.target_room != undefined && creep.room.name != creep.memory.target_room) {
            if (creep.memory.target_room == creep.memory.home_room.name) {
                spawn.memory.scanner_rooms.shift()
                creep.memory.target_room = undefined;
                creep.say("rem");
                return;
            }

            if (creep.memory.target_room != undefined) {
                const destination = new RoomPosition(25, 25, creep.memory.target_room);
                creep.moveTo(destination, { reusePath: 7, avoidSk: false, avoidHostileRooms: false });
                creep.say(creep.memory.target_room);
            }




        }

        if (creep.memory.target_room == creep.memory.home_room.name) {
            creep.memory.target_room = undefined;
            spawn.memory.scanner_rooms.shift();
        }



        if (creep.room.name == creep.memory.target_room && creep.memory.target_room != creep.memory.home_room.name) {
            creep.say("at target");
            console.log("scanner at target_room");
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
                 /* && Math.abs(Game.map.getRoomLinearDistance(spawn.room.name, creep.room.name)) >=3 */ ) {
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
                        if (distanceCM.get(i, j) >=6 && floodCM.get(i, j) < min_distance_from_controller) {
                            min_distance_from_controller = floodCM.get(i, j);
                            spawn_pos_x = i;
                            spawn_pos_y = j;
                        }
                    }
                }
                if (spawn_pos_x > 4 && spawn_pos_x < 46 && spawn_pos_y > 4 && spawn_pos_y < 46) {
                    console.log("pos for new spawn: ", spawn_pos_x, " ", spawn_pos_y, " ", creep.room.name);
                    Memory.rooms_to_colonize.push(new colonizeRoom(creep.room.name, spawn_pos_x, spawn_pos_y - 2));
                }
                // 19 38

                //Memory.rooms_to_colonize.push(new colonizeRoom(creep.room.name,spawn_pos_x,spawn_pos_y-2));
                //return;
                //check if there is a place in room to fit main spawn stamp
                // if yes add room to list of rooms_to_colnize
            }
            creep.memory.target_room = undefined;
            spawn.memory.scanner_rooms.shift();


        }

        


    }
}

module.exports = roleScanner;