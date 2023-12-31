const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require('./move_avoid_hostile');
var RoomPositionFunctions = require('roomPositionFunctions');


class farmingRoom {
    constructor(name, harvesting_power, carry_power, sources_num,distance,max_farmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sources_num = sources_num;
        this.distance = distance;
        this.max_farmers=max_farmers;

        this.farmers=0;
    }
}

class keeperRoom {
    constructor(name, harvesting_power, carry_power, sources_num,distance,max_farmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sources_num = sources_num;
        this.distance=distance;
        this.max_farmers=max_farmers;
        this.farmers=0;
        this.killer=undefined;
        this.healer=undefined;
    }
}


function generateAdjacentRooms(tileName) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const adjacentTiles = [];

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

function areRoomsAdjacent(tileName1, tileName2) {
    const [letterA1, numX1, letterB1, numY1] = tileName1.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);
    const [letterA2, numX2, letterB2, numY2] = tileName2.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const xDiff = Math.abs(Number(numX1) - Number(numX2));
    const yDiff = Math.abs(Number(numY1) - Number(numY2));

    return (
        xDiff <= 1 && yDiff <= 1 &&
        (letterA1 === letterA2 || Math.abs(letterA1.charCodeAt(0) - letterA2.charCodeAt(0)) <= 1) &&
        (letterB1 === letterB2 || Math.abs(letterB1.charCodeAt(0) - letterB2.charCodeAt(0)) <= 1)
    );
}
var roleScout = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.suicide();
        /*
        spawn.memory.rooms_to_scan=undefined;
        spawn.memory.farming_rooms=undefined;
        spawn.memory.keepers_rooms=undefined;
        */
        //delete spawn.memory.rooms_to_scan;
        //delete spawn.memory.keepers_rooms;
        creep.say("scout");
        //creep.memory.rooms_to_scan = generateAdjacentRooms(creep.room.name);

        if (spawn.memory.rooms_to_scan == undefined ) {
            spawn.memory.rooms_to_scan = generateAdjacentRooms(spawn.room.name);
        }
        
        /*
        var pos = creep.pos;
        if (pos.x > 48) {
            creep.move(LEFT);
            return;
        }
        else if (pos.x < 2) {
            creep.move(RIGHT);
            return;
        }
        if (pos.y > 48) {
            creep.move(TOP);
            return;
        }
        else if (pos.y < 2) {
            creep.move(BOTTOM);
            return;
        }
        */
 
        if (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length>0) {
            if (creep.room.name != spawn.memory.rooms_to_scan[0]) {
                creep.say("MOV");
                const destination = new RoomPosition(25, 25, spawn.memory.rooms_to_scan[0]);
                console.log("destination: ", destination);
                creep.say(spawn.memory.rooms_to_scan[0]);
                creep.moveTo(destination,{reusePath: 10});
                //move_avoid_hostile(creep, destination, 1, true,4000);
            }
            else {
                spawn.memory.rooms_to_scan.shift();
                var is_keeper_room = false;
                var is_farming_room = false;
                if ((creep.room.find(FIND_HOSTILE_CREEPS).length > 0 || creep.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_KEEPER_LAIR;
                    }}).length>0 )
                    && creep.room.find(FIND_SOURCES).length > 2
                    /*&& areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true */)
                     {
                    creep.say("Keepers");
                    is_keeper_room = true;
                    var sources = creep.room.find(FIND_SOURCES);
                    var sources_num = sources.length;
                    var max_farmers=0;
                    var avg_source_x = 0;
                    var avg_source_y = 0;
                    for (let i = 0; i < sources_num; i++) {
                        avg_source_x += sources[i].pos.x;
                        avg_source_y = sources[i].pos.y;
                        max_farmers+=sources[i].pos.getOpenPositions().length;
                    }
                    avg_source_x /= sources_num;
                    avg_source_y /= sources_num;
                    var distance = 0;
                    var ret = PathFinder.search(spawn.pos,
                        new RoomPosition(avg_source_x, avg_source_y, creep.room.name),
                        {

                            plainCost: 2,
                            swampCost: 10,

                            roomCallback: function () {

                                let room = creep.memory.home_room.name;
                                // In this example `room` will always exist, but since 
                                // PathFinder supports searches which span multiple rooms 
                                // you should be careful!
                                if (!room) return;
                                let costs = new PathFinder.CostMatrix;

                                creep.room.find(FIND_STRUCTURES).forEach(function (struct) {
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
                                return costs;
                            }
                        });
                        
                    //if(ret.incomplete==false)
                    //{
                        distance=ret.path.length;
                   // }
                    var new_keeper = new keeperRoom(creep.room.name, 0,0, sources_num,distance,max_farmers);
                    var already_scanned = false;

                    for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                        if (spawn.memory.keepers_rooms[i].name == creep.room.name) {
                            already_scanned = true;
                        }
                    }
                    if (already_scanned == false) {
                        spawn.memory.keepers_rooms.push(new_keeper);
                    }


                    //spawn.memory.keepers_rooms.push(creep.room.name);
                }
                else if (creep.room.find(FIND_HOSTILE_CREEPS).length == 0 && 
                (creep.room.find(FIND_SOURCES).length == 2 || creep.room.find(FIND_SOURCES).length == 1)
                    /*&& areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true*/) {
                    creep.say("farming");
                    var sources = creep.room.find(FIND_SOURCES);
                    var sources_num = sources.length;
                    var max_farmers=0;
                    var avg_source_x = 0;
                    var avg_source_y = 0;
                    for (let i = 0; i < sources_num; i++) {
                        avg_source_x += sources[i].pos.x;
                        avg_source_y = sources[i].pos.y;
                        max_farmers+=sources[i].pos.getOpenPositions().length;
                    }
                    avg_source_x /= sources_num;
                    avg_source_y /= sources_num;

                    var distance = 0; 
                    var ret = PathFinder.search(spawn.pos,
                        new RoomPosition(avg_source_x, avg_source_y, creep.room.name),
                        {

                            plainCost: 2,
                            swampCost: 10,

                            roomCallback: function () {

                                let room = creep.memory.home_room.name;
                                // In this example `room` will always exist, but since 
                                // PathFinder supports searches which span multiple rooms 
                                // you should be careful!
                                if (!room) return;
                                let costs = new PathFinder.CostMatrix;

                                creep.room.find(FIND_STRUCTURES).forEach(function (struct) {
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
                                return costs;
                            }
                        });
                        
                    /*if(ret.incomplete==false)
                    {
                        distance=ret.path.length;
                    }*/
                    distance=ret.path.length;
                    /*
                    for(let i=0;i<20;i++)
                    {
                        console.log("distance: ", distance);
                    }*/
                    var new_farming = new farmingRoom(creep.room.name, 0,0, sources_num,distance,max_farmers);
                    //creep.say(creep.room.controller.owner);
                    var already_scanned = false;
                    for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                        if (spawn.memory.farming_rooms[i].name == creep.room.name) {
                            already_scanned = true;
                        }

                        if(creep.room.controller!=undefined)
                        {
                            /*if(Creep.room.controller.owner!=undefined)
                            {
                                already_scanned=true;
                            }*/
                            if(creep.room.controller.reservation.username=='Jeally_Rabbit')
                            {
                                already_scanned=false;
                            }
                        }

                    }
                    /*
                    if(creep.room.controller!=undefined)
                    {
                        if(Creep.room.controller.owner!=undefined)
                        {
                            already_scanned=true;
                        }
                        if(creep.room.controller.reservation.username=='Jeally_Rabbit')
                        {
                            already_scanned=false;
                        }
                    }
                    */
                  //  if(creep.room.controller!=undefined)
                   // {
                        if (already_scanned == false){
                        spawn.memory.farming_rooms.push(new_farming);
                        }
                   // }
                    

                }

            }
        }
           
        //if(creep.room.controller.owner!=undefined)
        //{//asd
        //    creep.say(creep.room.controller.owner.username);
        //}
        

    }
}

module.exports = roleScout;