//const { goOutOfRange } = require("./goOutOfRange");
//const { move_avoid_hostile } = require('./move_avoid_hostile');
//var RoomPositionFunctions = require('roomPositionFunctions');
const findRouteTest = require('./findRouteTest');

class farmingRoom {
    constructor(name, harvesting_power, carry_power, sources_num, distance, max_farmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sources_num = sources_num;
        this.distance = distance;
        this.max_farmers = max_farmers;

        this.farmers = 0;

        var body_parts_cost = (sources_num * 12);//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sources_num * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class farmingSource {
    constructor(id, name, harvesting_power, carry_power, distance, max_farmers) {
        this.id = id;
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.distance = distance;
        this.max_farmers = max_farmers;
        this.farmers = 0;
        this.sources_num = 1;
        var sources_num = 1;
        var body_parts_cost = sources_num * 27;//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sources_num * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class keeperRoom {
    constructor(name, harvesting_power, carry_power, sources_num, distance, max_farmers) {
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.sources_num = sources_num;
        this.distance = distance;
        this.max_farmers = 5;
        this.farmers = 0;
        this.killer = undefined;
        this.healer = undefined;
    }
}

class keeperSource {
    constructor(id, name, harvesting_power, carry_power, distance, max_farmers) {
        this.id = id;
        this.name = name;
        this.harvesting_power = harvesting_power;
        this.carry_power = carry_power;
        this.distance = distance;
        this.max_farmers = max_farmers;
        this.farmers = 0;
        this.sources_num = 1;
        var sources_num = 1;
        var body_parts_cost = sources_num * 27;//parts for farmers (max farmer is made off 12 bodyparts);
        body_parts_cost += 14;//maxRepairer
        body_parts_cost += Math.ceil((sources_num * 10 * distance * 2 * 3) / 100);//distanceCarriers
        this.body_parts_cost = body_parts_cost;
    }
}

class keeperMineral {
    constructor(id, name, harvesting_power, carry_power, distance) {
        this.id = id;
        this.name = name
        this.harvesting_power = harvesting_power
        this.carry_power = carry_power
        this.distance = distance;
    }
}


function generateAdjacentRooms(tileName) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const adjacentTiles = [];
    adjacentTiles.push(tileName);
    for (let x = Number(numX) - 1; x <= Number(numX) + 1; x++) {
        for (let y = Number(numY) - 1; y <= Number(numY) + 1; y++) {
            if (x === Number(numX) && y === Number(numY) || x < 1 || y < 1) {
                //continue; // Skip the original tile and invalid coordinates.
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
Creep.prototype.roleScout = function roleScout(creep, spawn) {


    //creep.suicide();
    //console.log(creep.pos," -> ",spawn.memory.rooms_to_scan[0])
    //creep.say("scout");
    //creep.memory.rooms_to_scan = generateAdjacentRooms(creep.room.name);
    /*if(creep.memory.home_room.name=='W5N3')
    {
        spawn.memory.rooms_to_scan[0]='W5N3';
    }*/

    if (spawn.memory.rooms_to_scan == undefined) {
        spawn.memory.rooms_to_scan = [];
        spawn.memory.rooms_to_scan = generateAdjacentRooms(spawn.room.name);
    }
    else if (spawn.memory.rooms_to_scan.length == 0) {
       // creep.suicide();
    }

    if (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length > 0) {
        if (creep.room.name != spawn.memory.rooms_to_scan[0]) {
            //creep.say("MOV");




            if(creep.memory.destination==undefined)
                {
                    creep.say("destination unknown")
                    var destination=[];
                    for(var i=1;i<50;i++)
                    {
                        for(var j=1;j<50;j++)
                        {
                            destination.push(new RoomPosition(i,j,spawn.memory.rooms_to_scan[0]))
                        }
                    }
                    creep.memory.destination=destination;
                }
    
                if(creep.memory.destination!=undefined)
                {
                    creep.move_avoid_hostile(creep,creep.memory.destination,30,true)
                }

        }
        else {
            spawn.memory.rooms_to_scan.shift();
            var is_keeper_room = false;
            var is_farming_room = false;
            if ((creep.room.find(FIND_HOSTILE_CREEPS).length > 0 || creep.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_KEEPER_LAIR;
                }
            }).length > 0)
                && creep.room.find(FIND_SOURCES).length > 2
                    /*&& areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true */) {
                creep.say("Keepers");
                is_keeper_room = true;
                var sources = creep.room.find(FIND_SOURCES);
                var sources_num = sources.length;
                var mineral = creep.room.find(FIND_MINERALS);
                var max_farmers = 0;
                for (let i = 0; i < sources_num; i++) {
                    max_farmers += sources[i].pos.getOpenPositions().length;
                }
                var avg_distance = 0;
                for (let i = 0; i < sources.length; i++) {
                    var ret = findRouteTest(spawn.pos, sources[i].pos.getNearbyPositions())
                    
                   if (ret.incomplete == false) {
                        avg_distance += ret.path.length;

                        var new_keeper_source = new keeperSource(sources[i].id, creep.room.name, 0, 0, ret.path.length, sources[i].pos.getOpenPositions().length)

                        // check if this source is already scanned or in other use
                        var is_already_scanned = false;
                        for (let src of spawn.memory.keepers_sources) {
                            if (src.id == new_keeper_source.id) {
                                already_scanned = true;
                                break
                            }
                        }

                        var in_other_use = false;
                        for (let main_spawn_id of Memory.main_spawns) {
                            //console.log("main spawn id: ",main_spawn_id)
                            var other_spawn = Game.getObjectById(main_spawn_id);
                            if (other_spawn != null && other_spawn != spawn && other_spawn.room.name != creep.memory.home_room.name) {
                                for (let other_keeper_source of other_spawn.memory.keepers_sources) {
                                    //console.log(other_keeper_source.id," ",other_keeper_source.name)
                                    if ((other_keeper_source.id == sources[i].id)){// || other_keeper_source.name == sources[i].name) && other_keeper_source.name != spawn.room.name) {
                                        //cconsole.log("source: ", sources[i].id, " in use by: ", other_spawn.name);
                                        
                                        //console.log("SKIIIIIIIIIIIPING")
                                        in_other_use = true;
                                        break
                                    }
                                }
                            }
                        }
                        if (!is_already_scanned && !in_other_use && ret.path.length<100) {
                            spawn.memory.keepers_sources.push(new_keeper_source)
                        }

                    }

                }
                var new_keeper_room = new keeperRoom(creep.room.name, 0, 0, sources_num, avg_distance, max_farmers);
                var in_other_use = false;
                var already_scanned = false;

                for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {


                    for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                        if (spawn.memory.keepers_rooms[i].name == creep.room.name) {
                            already_scanned = true;
                        }
                    }


                    //console.log("BEFORE OTHER SPAWNS FARMING SOURCES LOOP")
                    for (let main_spawn_id of Memory.main_spawns) {
                        //console.log("main spawn id: ",main_spawn_id)
                        var other_spawn = Game.getObjectById(main_spawn_id);
                        if (other_spawn != null && other_spawn != spawn && other_spawn.room.name != creep.memory.home_room.name) {
                            for (let other_keeper_source of other_spawn.memory.keepers_sources) {
                                //console.log(other_keeper_source.id," ",other_keeper_source.name)
                                if (sources != undefined && sources.length > 0 && (other_keeper_source.id == sources[i].id || other_keeper_source.name == sources[i].name) && other_keeper_source.name != spawn.room.name) {
                                    //cconsole.log("source: ", sources[i].id, " in use by: ", other_spawn.name);
                                    //console.log("SKIIIIIIIIIIIPING")
                                    in_other_use = true;
                                    break
                                }
                            }
                        }
                    }
                }
                
                spawn.memory.keeper_room_already_scanned = already_scanned;
                spawn.memory.keeper_room_in_other_use = in_other_use;
                
                if (already_scanned == false && in_other_use == false && ret.path.length<100) {
                    spawn.memory.keepers_rooms.push(new_keeper_room);

                }

            }
            else if (creep.room.find(FIND_HOSTILE_CREEPS).length == 0 &&
                (creep.room.find(FIND_SOURCES).length >= 1 /* || creep.room.find(FIND_SOURCES).length == 1*/)
                    /*&& areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true*/) {
                creep.say("farming");
                var sources = creep.room.find(FIND_SOURCES);
                var sources_num = sources.length;
                var max_farmers = 0;
                for (let i = 0; i < sources_num; i++) {
                    max_farmers += sources[i].pos.getOpenPositions().length;
                }
                var avg_distance = 0;
                for (let i = 0; i < sources.length; i++) {
                    var ret = findRouteTest(spawn.pos, sources[i].pos.getNearbyPositions())
                    
                    avg_distance += ret.path.length;

                    var new_farming_source = new farmingSource(sources[i].id, creep.room.name, 0, 0, ret.path.length, sources[i].pos.getOpenPositions().length)

                    var already_scanned = false;
                    for (let j = 0; j < spawn.memory.farming_sources.length; j++) {
                        if (spawn.memory.farming_sources[j].id == sources[i].id) {
                            already_scanned = true;
                        }

                        if (creep.room.controller != undefined) {
                            /*if(Creep.room.controller.owner!=undefined)
                            {
                                already_scanned=true;
                            }*/
                            if (creep.room.controller.reservation != undefined) {

                                if ((creep.room.controller.reservation.username == 'JeallyRabbit' || creep.room.controller.reservation.username == 'Jeally_Rabbit') && already_scanned == false) {
                                    //already_scanned = true;
                                }
                                else if (creep.room.controller.reservation.username == 'Invader') {
                                    var invader_core = creep.room.find(FIND_STRUCTURES, {
                                        filter: function (hostile) {
                                            return hostile.structureType == STRUCTURE_INVADER_CORE;
                                        }
                                    });
                                    if (invader_core != undefined && invader_core.length > 0) {
                                        already_scanned = false;
                                    }

                                }
                            }

                            var in_other_use = false;
                            //console.log("BEFORE OTHER SPAWNS FARMING SOURCES LOOP")
                            for (let main_spawn_id of Memory.main_spawns) {
                                //console.log("main spawn id: ",main_spawn_id)
                                var other_spawn = Game.getObjectById(main_spawn_id);
                                if (other_spawn != null && other_spawn != spawn && other_spawn.room.name != creep.memory.home_room.name) {
                                    for (let other_farming_source of other_spawn.memory.farming_sources) {
                                        //console.log(other_farming_source.id," ",other_farming_source.name)
                                        if ((other_farming_source.id == sources[i].id || other_farming_source.name == sources[i].name) && other_farming_source.name != spawn.room.name) {
                                            //cconsole.log("source: ", sources[i].id, " in use by: ", other_spawn.name);
                                            //console.log("SKIIIIIIIIIIIPING")
                                            in_other_use = true;
                                            break
                                        }
                                    }
                                }
                            }
                            //console.log("AFTER THE LOOP")

                        }

                    }
                    //console.log(already_scanned, " ",in_other_use)
                    if (already_scanned == false && ret.path.length < 100 && in_other_use != true
                        // next condition need testing
                        //&& ret.incomplete==false
                    ) {
                        spawn.memory.farming_sources.push(new_farming_source);
                        
                        //console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
                        //console.log("added source: ", sources[i].id, " in ", creep.room.name);
                        //creep.say("ADD")
                    }



                }

                /*
                for(let i=0;i<20;i++)
                {
                    console.log("distance: ", distance);
                }*/
                avg_distance = avg_distance / sources.length;
                var new_farming = new farmingRoom(creep.room.name, 0, 0, sources_num, avg_distance, max_farmers);
                //creep.say(creep.room.controller.owner);
                var already_scanned = false;
                for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                    if (spawn.memory.farming_rooms[i].name == creep.room.name) {
                        already_scanned = true;
                    }

                    if (creep.room.controller != undefined) {
                        /*if(Creep.room.controller.owner!=undefined)
                        {
                            already_scanned=true;
                        }*/
                        if (creep.room.controller.reservation != undefined) {

                            if ((creep.room.controller.reservation.username == 'JeallyRabbit' || creep.room.controller.reservation.username == 'Jeally_Rabbit') && already_scanned == false) {
                                already_scanned = true;
                            }
                            else if (creep.room.controller.reservation.username == 'Invader') {
                                var invader_core = creep.room.find(FIND_STRUCTURES, {
                                    filter: function (hostile) {
                                        return hostile.structureType == STRUCTURE_INVADER_CORE;
                                    }
                                });
                                if (invader_core != undefined && invader_core.length > 0) {
                                    already_scanned = false;
                                }

                            }
                        }

                        var in_other_use = false;
                        for (let main_spawn_id in Memory.main_spawns) {
                            var other_spawn = Game.getObjectById(main_spawn_id);
                            if (other_spawn != null && other_spawn != spawn && other_spawn.room.name != creep.memory.home_room.name) {
                                for (let other_farming in other_spawn.memory.farming_rooms) {

                                    if (other_farming == creep.room.name && creep.room.name != creep.memory.home_room.name) {
                                        //cconsole.log("room: ", creep.room.name, " in use by: ", other_spawn.name);
                                        in_other_use = true;
                                        break
                                    }
                                }
                            }
                        }

                    }

                }

                //console.log(' ')
                //console.log(already_scanned, " ",in_other_use)
                if (already_scanned == false && avg_distance < 100 && in_other_use != true) {
                    spawn.memory.farming_rooms.push(new_farming);
                    //console.log("adding source from: ", creep.room.name)
                }
                else {
                    //console.log("skipping source in room: ", creep.room.name)
                }
                //console.log(" ")
                // }


            }

        }
    }

}
