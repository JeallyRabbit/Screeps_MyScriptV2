const STATE_DEVELOPING = 'STATE_DEVELOPING'
const STATE_UNDER_ATTACK = 'STATE_UNDER_ATTACK'
const STATE_NEED_MILITARY_SUPPORT = 'STATE_NEED_MILITARY_SUPPORT'
const STATE_NEED_ENERGY = 'STATE_NEED_ENERGY'
const STATE_STATE_NEED_MILITARY_ENERGY = 'STATE_NEED_MILITARY_ENERGY'


function contains_rooms(array, roomName) {
    if (Array.isArray(array)) {
        for (a of array) {
            if (a.roomName == roomName) {
                return true
            }
        }
    }
    return false
}
/*
Array.prototype.contains_rooms = function contains_rooms(roomName) {
    if (this != undefined && this.length > 0) {
        //console.log("contains_rooms: ")
        for (a of this) {
            //console.log(a)
            if (a.roomName == roomName) {
                return true;
            }
        }
    }
    return false
}
    */

function contains_target_room(array, roomName) {
    if (Array.isArray(array)) {
        for (a of array) {
            if (a.target_room == roomName) {
                return true
            }
        }
    }
    return false
}
/*
Array.prototype.contains_target_room = function contains_target_room(roomName) {
    if (this != undefined && this.length > 0) {
        //console.log("contains_rooms: ")
        for (a of this) {
            //console.log(a)
            if (a.target_room == roomName) {
                return true;
            }
        }
    }
    return false
}
    */

class blockadeRoom {
    constructor(name) {
        this.roomName = name
    }
}

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

class keeperQuad {
    constructor(roomName, strongholdLevel) {
        this.roomName = roomName;
        this.strongholdLevel = strongholdLevel;
    }
}

function calculateDistance(point1, point2) {
    // Adjusted regular expression to match the new format
    const regex = /^([WE])(\d+)([NS])(\d+)$/;
    const match1 = point1.match(regex);
    const match2 = point2.match(regex);

    /*
    if (!match1 || !match2) {
        console.log("Invalid point format");
        console.log(point1);
        console.log(point2);
    }*/

    // Extracting coordinates
    const x1 = parseInt(match1[2]) * (match1[1] === 'E' ? 1 : -1);
    const y1 = parseInt(match1[4]) * (match1[3] === 'N' ? 1 : -1);

    const x2 = parseInt(match2[2]) * (match2[1] === 'E' ? 1 : -1);
    const y2 = parseInt(match2[4]) * (match2[3] === 'N' ? 1 : -1);

    // Calculating distance using the Pythagorean theorem
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    return distance;
}

class Duo {
    constructor(duoId, duoHome, target_room) {
        this.id = duoId;
        this.home = duoHome;
        this.target_room = target_room
        //this.leaderId =duoleaderId 
        //this.followerId=duoFollowerId
    }
}

class Swarm {
    constructor(swarmId, reqPopulation, target_room, home_rom) {
        this.id = swarmId;
        this.req_population = reqPopulation;
        this.target_room = target_room;
        this.home_rom = home_rom;
    }
}

class Quad{
    constructor(quadId,target_room, home_room,grouping_pos)
    {
        this.id=quadId;
        this.target_room=target_room;
        this.home_room=home_room
        this.grouping_pos=grouping_pos
        this.minEnergyOnCreep=-1;
        this.members=[];
    }
}



Spawn.prototype.setRequiredPopulation = function setRequiredPopulation(spawn) {

    if (Memory.allies == undefined) {
        Memory.allies = [];
    }
    
    //console.log("soldiersss")

    //Finding hostiles in every room
    for (room in Game.rooms) {

        //console.log(room , " ",global.heap.soldiers[room])

        var r = Game.rooms[room]
        if (r != undefined) {
            r.memory.hostiles = [];
            var hostiles = r.find(FIND_HOSTILE_CREEPS, {
                filter:
                    function (enemy) {
                        return !Memory.allies.includes(enemy.owner.username) //&& enemy.owner.username!='Alphonzo'
                    }
            })
            if (hostiles.length > 0) {
                for (a of hostiles) {
                    r.memory.hostiles.push(a.id)
                }
            }

            r.memory.allies = [];
            var allies = r.find(FIND_HOSTILE_CREEPS, {
                filter:
                    function (ally) {
                        return Memory.allies.includes(ally.owner.username) //&& enemy.owner.username!='Alphonzo'
                    }
            })
            if (allies.length > 0) {
                for (a of allies) {
                    r.memory.allies.push(a.id)
                }
            }

            r.memory.hostileStructures=[];
            var str=r.find(FIND_HOSTILE_STRUCTURES,{
                filter:
                    function (s) {
                        return !Memory.allies.includes(s.owner.username) //&& enemy.owner.username!='Alphonzo'
                    }
            })

            if (str.length > 0) {
                for (s of str) {
                    r.memory.hostileStructures.push(s.id)
                }
            }





            r.memory.soldiers=[]
        }
    }





    if (Memory.rooms_to_colonize.length > 0 && Memory.rooms_to_colonize.colonizer == spawn.room.name
        && spawn.memory.to_colonize == undefined
    ) {
        spawn.memory.to_colonize = Memory.rooms_to_colonize[0];
    }

    if (spawn.memory.to_colonize != undefined && spawn.room.storage!= undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 25000
    ) {
        spawn.memory.req_claimers = 1;
        spawn.memory.req_colonizers = 8;
    }
    else {
        spawn.memory.req_claimers = 0;
        spawn.memory.req_colonizers = 0;
    }

    //console.log(spawn.room.name," ", (Memory.colonizing == true && spawn.room.controller.level >= 6) )
    if (Memory.colonizing == true && spawn.room.controller.level >= 4) {
        spawn.memory.req_scanners = 1
    }
    else {
        spawn.memory.req_scanners = 0;
    }
    spawn.memory.req_doctors = 0;


    spawn.memory.req_carriers = 0;


    spawn.memory.req_scouts = 1;

    if (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0) {
        spawn.memory.req_scouts = 0;
    }



    spawn.memory.req_harvesters = 0;// role num 0
    //spawn.memory.req_c
    spawn.memory.req_upgraders_parts = 1;
    spawn.memory.req_fillers = 4;
    if (spawn.memory.farming_sources != undefined && spawn.memory.farming_sources.length != undefined) {
        var farming_sources_num = spawn.memory.farming_sources.length;
    }
    else {
        var farming_sources_num = 0;
    }
    if ((spawn.memory.building != true && Game.time % 1 == 0) || Game.time % 1 == 0) {
        if (spawn.memory.farming_sources != undefined && spawn.memory.farming_rooms != undefined && spawn.memory.farming_rooms.length > 0) {


            if ((farming_sources_num > 0) && (spawn.memory.farming_rooms[0].harvesting_power >= spawn.memory.farming_rooms[0].sources_num * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * 0.7 || spawn.memory.farming_rooms[0].farmers >= spawn.memory.farming_rooms[0].max_farmers)
                && (spawn.memory.farming_rooms[0].carry_power >= spawn.memory.farming_rooms[0].harvesting_power * 0.9)) {


                var construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
                if (construction_sites.length > 0) {
                    if (spawn.room.controller.level > 5 && ((spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 40000) || spawn.room.storage == undefined)) {
                        spawn.memory.building = true;
                        spawn.memory.upgrading = undefined;
                    }
                    if (spawn.room.controller.level <= 5) {
                        spawn.memory.building = true;
                        spawn.memory.upgrading = undefined;
                    }

                }
                else {
                    spawn.memory.building = undefined;
                    spawn.memory.upgrading = true;
                }
            }
            else {
                spawn.memory.building = undefined;
                spawn.memory.upgrading = true;
            }
        }
    }
    if (spawn.room.controller.level == 1) {
        // spawn.memory.req_harvesters = 6;
        spawn.memory.req_upgraders_parts = 1;
        spawn.memory.req_fillers = 0;
    }
    else if (spawn.room.controller.level == 2 || spawn.room.controller.level == 3) {
        //spawn.memory.req_harvesters = 4;
        if (spawn.memory.upgrading || spawn.memory.building == undefined || spawn.memory.building == false) {
            var sources_num = 0;
            if (spawn.memory.farming_sources != undefined && spawn.memory.farming_sources.length > 0) {
                sources_num = spawn.memory.farming_sources.length
                if (spawn.memory.total_calculated_income_per_tick != undefined && (spawn.memory.farming_sources[sources_num - 1].carry_power >= spawn.memory.farming_sources[sources_num - 1].harvesting_power
                    || spawn.memory.farming_sources[sources_num - 1].carry_power >= SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) /2
                    && (spawn.memory.farming_sources[sources_num - 1].harvesting_power > (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) / 2 || spawn.memory.farming_sources[sources_num - 1].farmers>=spawn.memory.farming_sources[sources_num - 1].max_farmers)
                    && spawn.memory.building != true
                ) {
                    spawn.memory.req_upgraders_parts = Math.round((spawn.memory.total_calculated_income_per_tick / 1.5) * 100) / 100
                }

            }
            else {
                spawn.memory.req_upgraders_parts = 1
            }


        }

        spawn.memory.req_fillers = 4;
    }

    if (spawn.room.controller.level >= 6) {
        spawn.memory.req_doctors = 1;
    }
    if (spawn.room.storage != undefined && spawn.room.controller.level < 8 && spawn.room.controller.level > 3) {
        if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 5000) {

            spawn.memory.req_upgraders_parts = Math.max(1, Math.floor(spawn.room.storage.store[RESOURCE_ENERGY] / 20000));
            if(spawn.room.storage.store[RESOURCE_ENERGY] > 50000)
            {
                spawn.memory.req_upgraders_parts = Math.max(1, Math.floor(spawn.room.storage.store[RESOURCE_ENERGY] / 10000));
            }

        }
        else {
            spawn.memory.req_upgraders_parts = 1;
        }
    }
    if (spawn.room.controller.level == 8) {

        var is_any_room_developing = false;
        for (id of Memory.main_spawns) {
            if (Game.getObjectById(id) != null && Game.getObjectById(id).room.controller.level < 8) {
                is_any_room_developing = true;
                break;
            }
        }
        if (is_any_room_developing == false) {

            if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 200000) {
                spawn.memory.req_upgraders_parts = 10;
            }
            else {
                spawn.memory.req_upgraders_parts = 1;
            }
        }
        else {
            if (spawn.room.controller.level == 8 && spawn.room.controller.ticksToDowngrade < CONTROLLER_DOWNGRADE[8] * 0.5) {
                spawn.memory.req_upgraders_parts = 1;
            }
            if (spawn.room.controller.level == 8 && spawn.room.controller.ticksToDowngrade > CONTROLLER_DOWNGRADE[8] * 0.9) {
                spawn.memory.req_upgraders_parts = 0;
            }
        }


    }
    if (spawn.memory.building == true) {
        spawn.memory.req_upgraders_parts = 1;
        spawn.memory.req_builders = 2;
    }
    spawn.memory.req_farmers = 0;//role num 2
    spawn.memory.req_builders = 0;// role num 3
    if (spawn.memory.building == true && spawn.room.controller.level == 2) {
        spawn.memory.req_builders = 5;
        //spawn.memory.req_builders = spawn.memory.farming_rooms[0].harvesting_power / 5;
    }
    if (spawn.memory.building == true && spawn.room.controller.level > 2) {
        spawn.memory.req_builders = 4;
    }
    if (spawn.memory.building == true && spawn.room.controller.level > 3) {
        spawn.memory.req_builders = 2;
    }
    if (spawn.memory.building == true && spawn.room.controller.level == 8) {
        spawn.memory.req_builders = 3;
    }
    spawn.memory.req_haulers = 1;// role num 4
    if (Game.shard.name == 'shard1') {
        // spawn.memory.req_haulers = 2;
    }
    spawn.memory.req_berserk = 1;//role num 8
    spawn.memory.req_transporters = 0;//role numm 9
    spawn.memory.req_towerKeepers = 0;//role num 10
    if (Game.shard.name != 'shard3' && Game.shard.name!='jaysee' && spawn.room.controller.level > 3 /* && (spawn.room.storage!=undefined  && spawn.room.storage[RESOURCE_ENERGY]>20000)*/) {
        spawn.memory.req_rampart_repairers = 2;
        if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 35000) {
            spawn.memory.req_rampart_repairers = Math.floor(spawn.room.storage.store[RESOURCE_ENERGY] / 35000);
        }
        if (spawn.memory.state.includes(STATE_UNDER_ATTACK) && spawn.memory.total_attack_power != undefined) {
            spawn.memory.req_rampart_repairers = Math.floor(spawn.memory.total_attack_power / 25);
        }
    }
    else {
        spawn.memory.req_rampart_repairers = 0;
    }


    if (spawn.room.controller.level >= 3) {
        if (spawn.memory.towers_id != undefined && spawn.memory.towers_id.length > 0) {
            for (tower_id of spawn.memory.towers_id) {
                if (Game.getObjectById(tower_id) == null) {
                    spawn.memory.towers_id = undefined;
                    break;
                }
            }
        }
        if (spawn.memory.tower_id == undefined) {
            var towers = spawn.room.find(FIND_MY_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_TOWER;
                }
            });
            if (towers != undefined && towers.length > 0) {
                spawn.memory.towers_id = [];
                for (tower of towers) {
                    spawn.memory.towers_id.push(tower.id);
                }
            }
        }
    }
    /*
    if (spawn.memory.num_towers == undefined || Game.time % 2003 == 0) {
        spawn.memory.num_towers = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_TOWER;
            }
        });

        spawn.memory.num_towers = spawn.memory.num_towers.length;
    }
    */

    if (spawn.memory.towers_id != undefined && spawn.memory.towers_id.length > 0) {
        spawn.memory.req_towerKeepers = 1;
    }
    else {
        spawn.memory.req_towerKeepers = 0;
    }
    /*
    spawn.memory.req_keeperKillers = 0;//role num 15
    spawn.memory.req_keeperHealers = 0;//role num 16
    spawn.memory.req_keeperCarriers = 0;//role num 17
    spawn.memory.req_keeperFarmers = 0;//role num 17
    */
    spawn.memory.req_claimers = 0;//role num 11

    if (spawn.memory.farming_rooms == undefined) {
        spawn.memory.farming_rooms = [];

    }
    if (spawn.memory.farming_sources == undefined) {
        spawn.memory.farming_sources = [];

    }
    else {
        var total_calculated_income_per_tick = 0;
        for (let i = 0; i < spawn.memory.farming_sources.length; i++) {

            if (spawn.memory.farming_sources[i].body_parts_cost == undefined) {

                var body_parts_cost = (spawn.memory.farming_sources[i].sources_num * 12);//parts for farmers (max farmer is made off 12 bodyparts);
                body_parts_cost += 14;//maxRepairer
                body_parts_cost += Math.ceil((spawn.memory.farming_sources[i].sources_num * 10 * spawn.memory.farming_sources[i].distance * 2 * 3) / 100);//distanceCarriers
                spawn.memory.farming_sources[i].body_parts_cost = body_parts_cost;
            }

            if (spawn.memory.farming_sources[i].carry_power == undefined) {
                spawn.memory.farming_sources[i].carry_power = 0;
            }
            if (spawn.memory.farming_sources[i].harvesting_power == undefined) {
                spawn.memory.farming_sources[i].harvesting_power = 0;
            }
            if (spawn.memory.farming_sources[i].calculatedIncome == undefined || true) {
                var sources_num = spawn.memory.farming_sources[i].sources_num;
                var distance = spawn.memory.farming_sources[i].distance;
                //source_income = raw income from sources per CREEP_LIFE_TIME (1500 ticks)
                var raw_source_income = (sources_num * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME) * SOURCE_ENERGY_CAPACITY);
                var farmers_cost = sources_num * 950;
                var repairer_cost = 750;
                var distanceCarrier_parts = (sources_num * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * distance * 2 * 3) / 100;
                var distanceCarriers_cost = distanceCarrier_parts * 50;
                var cost = farmers_cost + repairer_cost + distanceCarriers_cost;
                var final_income = raw_source_income - cost;
                spawn.memory.farming_sources[i].calculatedIncome = final_income;
                spawn.memory.farming_sources[i].calculated_income_per_tick = final_income / CREEP_LIFE_TIME
                total_calculated_income_per_tick += final_income / CREEP_LIFE_TIME;
                spawn.memory.farming_sources[i].income_per_body_part = spawn.memory.farming_sources[i].calculatedIncome / spawn.memory.farming_sources[i].body_parts_cost;

            }

        }
        spawn.memory.total_calculated_income_per_tick = Math.round(total_calculated_income_per_tick * 100) / 100;

        if (Game.shard.name != 'shard3') {
            if (spawn.room.controller.level == 7 && spawn.memory.lvl7_scan == undefined) {
                spawn.memory.rooms_to_scan = undefined;
                spawn.memory.lvl7_scan = true
            }
            else if (spawn.room.controller.level == 8 && spawn.memory.lvl8_scan == undefined) {
                spawn.memory.rooms_to_scan = undefined;
                spawn.memory.lvl8_scan = true
            }
        }




        /////////////FARMING_SOURCES
        var farming_body_parts = 0;
        var farming_sources_num = 0;
        spawn.memory.farming_sources.sort((a, b) => b.income_per_body_part - a.income_per_body_part);
        var spawn_num = 1
        if (Game.spawns[spawn.room.name + '_2'] != undefined) { spawn_num++; }
        if (Game.spawns[spawn.room.name + '_3'] != undefined) { spawn_num++; }
        while (farming_body_parts < spawn_num * 400 && farming_sources_num < spawn.memory.farming_sources.length) {
            farming_body_parts += spawn.memory.farming_sources[farming_sources_num].body_parts_cost;
            if (farming_body_parts < spawn_num * 400) {
                farming_sources_num++;
            }
            else {
                break;
            }

        }
        spawn.memory.body_parts_for_farming = farming_body_parts

        /////////////////////////////////
        if (Game.shard.name == 'shard3') {
            for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                if (spawn.memory.farming_sources[i].name != spawn.room.name) {
                    spawn.memory.farming_sources.splice(i, 1);
                    i--;
                }
            }
        }
        else {
            //console.log("farming_sources_num: ",farming_sources_num);
            if (spawn.memory.farming_sources.length > farming_sources_num && spawn.memory.farming_sources.length > 0) {
                var ii = spawn.memory.farming_sources.length;
                while (spawn.memory.farming_sources.length > farming_sources_num) {
                    /* if (spawn.memory.farming_sources[ii].name != spawn.room.name) {
                        spawn.memory.farming_sources.splice(ii, 1);
                        }
                        ii--;*/

                    spawn.memory.farming_sources.pop();
                }
            }
        }

        /*
        
        */

    }


    /*

    if (spawn.memory.claiming_rooms == undefined) {
        spawn.memory.claiming_rooms = [];
    }
        */



    if (spawn.memory.keepers_rooms == undefined) {
        spawn.memory.keepers_rooms = [];
    }
    if (spawn.memory.keepers_sources == undefined) {
        spawn.memory.keepers_sources = [];
    }
    else if (spawn.memory.keepers_sources.length > 4) {
        spawn.memory.keepers_sources.sort((a, b) => a.distance - b.distance);
        while (spawn.memory.keepers_sources.length > 4) {
            spawn.memory.keepers_sources.pop();
        }
    }
    else if (spawn.memory.keepers_rooms.length > 1) {
        spawn.memory.keepers_rooms.sort((a, b) => a.distance - b.distance);
        while (spawn.memory.keepers_rooms.length > 1) {
            spawn.memory.keepers_rooms.pop();
        }

        for (let i = 0; i < spawn.memory.keepers_sources.length; i++) {

            if (spawn.memory.keepers_sources[i].body_parts_cost == undefined) {

                var body_parts_cost = (spawn.memory.keepers_sources[i].sources_num * 12);//parts for farmers (max farmer is made off 12 bodyparts);
                body_parts_cost += 14;//maxRepairer
                body_parts_cost += Math.ceil((spawn.memory.keepers_sources[i].sources_num * 10 * spawn.memory.keepers_sources[i].distance * 2 * 3) / 100);//distanceCarriers
                spawn.memory.keepers_sources[i].body_parts_cost = body_parts_cost;
            }

            if (spawn.memory.keepers_sources[i].carry_power == undefined) {
                spawn.memory.keepers_sources[i].carry_power = 0;
            }
            if (spawn.memory.keepers_sources[i].harvesting_power == undefined) {
                spawn.memory.keepers_sources[i].harvesting_power = 0;
            }
            if (spawn.memory.keepers_sources[i].calculatedIncome == undefined || true) {
                var sources_num = spawn.memory.keepers_sources[i].sources_num;
                var distance = spawn.memory.keepers_sources[i].distance;
                //source_income = raw income from sources per CREEP_LIFE_TIME (1500 ticks)
                var raw_source_income = (sources_num * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME) * SOURCE_ENERGY_CAPACITY);
                var farmers_cost = sources_num * 950;
                var repairer_cost = 750;
                var distanceCarrier_parts = (sources_num * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * distance * 2 * 3) / 100;
                var distanceCarriers_cost = distanceCarrier_parts * 50;
                var cost = farmers_cost + repairer_cost + distanceCarriers_cost;
                var final_income = raw_source_income - cost;
                spawn.memory.keepers_sources[i].calculatedIncome = final_income;
                spawn.memory.keepers_sources[i].income_per_body_part = spawn.memory.keepers_sources[i].calculatedIncome / spawn.memory.keepers_sources[i].body_parts_cost;

            }

        }

    }

    if (spawn.memory.keepers_minerals == undefined) {
        spawn.memory.keepers_minerals = [];
    }
    else {
        /// add logic for minerals
    }

    spawn.memory.need_keeperKiller = undefined;
    spawn.memory.need_keeperHealer = undefined;
    spawn.memory.need_keeperCarrier = undefined;
    spawn.memory.need_keeperCarrier_room = undefined;
    spawn.memory.need_keeperFarmer = undefined;
    spawn.memory.need_keeperFarmer_room = undefined
    spawn.memory.need_keeperRepairer = undefined;
    spawn.memory.need_keeper_quad = undefined;
    if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 30000) {
        spawn.memory.spawning_keepers = true
    }
    if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] < 10000) {
        spawn.memory.spawning_keepers = false
    }
    //console.log("invader quad before killers: ",spawn.memory.need_invader_quad.name)
    if (spawn.memory.spawning_keepers == true) {
        //keeper repairers and killers
        if (spawn.memory.keepers_rooms != undefined && spawn.memory.keepers_rooms.length > 0
            && spawn.room.controller.level >= 8) {
            for (let keeper_room of spawn.memory.keepers_rooms) {

                if (spawn.memory.need_invader_quad == keeper_room.name) {
                    continue
                }
                if (keeper_room.keeperKiller == undefined && spawn.memory.need_keeperKiller == undefined) {
                    spawn.memory.need_keeperKiller = keeper_room.name;
                }

                if (keeper_room.keeperRepairer == undefined && spawn.memory.need_keeperRepairer == undefined
                    && keeper_room.keeperKiller != undefined
                ) {
                    if (Game.rooms[keeper_room.name] != undefined && Game.rooms[keeper_room.name].memory.invaded == true) {
                        continue;
                    }
                    spawn.memory.need_keeperRepairer = keeper_room.name
                }

            }
        }
        //console.log("a: ",spawn.room.name)
        //keeper farmers and keeper Carriers
        spawn.memory.is_for_mineral = false;
        if (spawn.memory.keepers_sources != undefined && spawn.memory.keepers_sources.length > 0 && spawn.room.controller.level >= 8) {
            // Finding keeper farmers
            //console.log("b ",spawn.room.name)
            for (let keeper_source of spawn.memory.keepers_sources) {

                if (spawn.memory.need_invader_quad == keeper_source.name) {
                    continue
                }

                if (Game.rooms[keeper_source.name] != undefined && Game.rooms[keeper_source.name].memory.invaded == true) {

                    //console.log("room: ",keeper_source.name," is invaded")
                    continue
                }


                // for mineral
                if (Game.getObjectById(keeper_source.id)!=null && Game.getObjectById(keeper_source.id).density != undefined) {
                    if (Game.getObjectById(keeper_source.id).mineralAmount == 0) {
                        console.log("mineral empty")
                        continue;
                    }
                    if (keeper_source.harvesting_power == 0) {
                        spawn.memory.is_for_mineral = true;
                        spawn.memory.need_keeperFarmer = keeper_source.id
                        spawn.memory.need_keeperFarmer_room = keeper_source.name
                        console.log("need keeperFarmer for mineral ", keeper_source.id)
                        break
                    }

                }

                // for energy source
                if (keeper_source.harvesting_power <= (SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME)
                    && keeper_source.keeperKiller != undefined && Game.getObjectById(keeper_source.id)!=null &&  Game.getObjectById(keeper_source.id).density == undefined) {
                    //console.log("need keeperFarmer for: ",keeper_source.name," ",keeper_source.id)
                    //console.log(keeper_source.harvesting_power,"\\",SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME)

                    spawn.memory.need_keeperFarmer = keeper_source.id
                    spawn.memory.need_keeperFarmer_room = keeper_source.name
                    break;
                }
            }

            // keeper carriers
            for (let keeper_source of spawn.memory.keepers_sources) {

                if (Game.rooms[keeper_source.name] != undefined && Game.rooms[keeper_source.name].memory.invaded == true) {
                    continue;
                }

                if (keeper_source.carry_power < SOURCE_ENERGY_KEEPER_CAPACITY / ENERGY_REGEN_TIME
                    && keeper_source.carry_power < keeper_source.harvesting_power && keeper_source.keeperKiller != undefined

                ) {
                    spawn.memory.need_keeperCarrier = keeper_source.id
                    spawn.memory.need_keeperCarrier_room = keeper_source.name
                    break;
                }
            }


        }
    }



    if (spawn.memory.sources_links_id != undefined && spawn.memory.sources_links_id.length > 0) {
        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (spawn.memory.farming_rooms[i].name == spawn.room.name) {
                spawn.memory.farming_rooms[i].carry_power = Infinity;
                spawn.memory.farming_rooms[i].carry_power = 99999999999
                //break
            }
        }

        for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
            if (spawn.memory.farming_sources[i].name == spawn.room.name) {
                spawn.memory.farming_sources[i].carry_power = Infinity
                //break
            }
        }

    }

    spawn.memory.req_repairers = 0;// 1 - (100 * spawn.memory.req_towerKeepers);

    spawn.memory.need_DistanceCarrier = undefined;
    spawn.memory.need_ddistance_carrier_source_id = undefined
    spawn.memory.need_farmer = undefined;
    spawn.memory.need_source_farmer = undefined;
    spawn.memory.need_source_farmer_distance=undefined;
    spawn.memory.need_source_farmer_room = undefined;
    spawn.memory.need_distanceRepairer = undefined;
    spawn.memory.need_soldier = undefined;



    //manuall sponge

    if (spawn.memory.manual_sponge != undefined && spawn.memory.sponge_id == undefined) {
        spawn.memory.need_sponge = spawn.memory.manual_sponge
    }

    // manual adding quads
    if(spawn.memory.quads==undefined){spawn.memory.quads=[]}
    if(spawn.memory.manual_quad!=undefined)
    {
        if (contains_target_room(spawn.memory.quads, spawn.memory.manual_quad) == false && spawn.memory.pos_for_quad!=undefined) {
            spawn.memory.quads.push(new Quad(spawn.room.name + "_" + Game.time, spawn.memory.manual_quad, spawn.room,spawn.memory.pos_for_quad))
            //Game.spawns["Spawn1"]
            
            //Game.spawns["Spawn1"].memory.quads.push(new Quad(Game.spawns["Spawn1"].room.name + "_" + Game.time, Game.spawns["Spawn1"].memory.manual_quad, Game.spawns["Spawn1"].room,Game.spawns["Spawn1"].memory.pos_for_quad))
        }
    }

    //Adding quads
    if(spawn.memory.req_quads!=undefined)
    {
        for(var key in spawn.memory.req_quads)
        {
            quads_amount=0;
            for(q of spawn.memory.quads)
            {
                //console.log("q.target_room: ",q.id," ",q.target_room," <-> key: ",key)
                if(q.target_room===key)
                {
                    quads_amount++
                }
            }
            //console.log(quads_amount," -- ",key," -- ",spawn.memory.req_quads[key])
            if(quads_amount<spawn.memory.req_quads[key])
            {
                spawn.memory.quads.push(new Quad(spawn.room.name + "_" + Game.time, key, spawn.room,spawn.memory.pos_for_quad))
                break
            }
            //console.log(spawn.memory.req_quads[key])
        }
    }

    //Removing redundant Quads
    if (spawn.memory.req_quads !== undefined && spawn.memory.quads !== undefined) {
        const quadsByRoom = {};
    
        // Group quads by target_room
        for (const quad of spawn.memory.quads) {
            const room = quad.target_room;
            if (!quadsByRoom[room]) {
                quadsByRoom[room] = [];
            }
            quadsByRoom[room].push(quad);
        }
    
        // Rebuild the quad list based on req_quads
        const cleanedQuads = [];
    
        for (const room in quadsByRoom) {
            const quadsForRoom = quadsByRoom[room];
    
            // If the room is not in req_quads, skip it (removing all its quads)
            if (!(room in spawn.memory.req_quads)) {
                continue;
            }
    
            const allowedAmount = spawn.memory.req_quads[room];
    
            // Keep only up to the allowed number of quads
            cleanedQuads.push(...quadsForRoom.slice(0, allowedAmount));
        }
    
        spawn.memory.quads = cleanedQuads;
    }


    //manuall adding swarm
    if (spawn.room.name == 'W3N7' || true) {
        if (spawn.memory.swarms == undefined) { spawn.memory.swarms = []; }

        if (spawn.memory.manual_swarm != undefined) {
            if (spawn.memory.swarms != undefined) {
                //if (spawn.memory.swarms.contains_target_room(spawn.memory.manual_swarm) == false) 
                if (contains_target_room(spawn.memory.swarms, spawn.memory.manual_swarm) == false) {
                    spawn.memory.swarms.push(new Swarm(spawn.room.name + "_" + Game.time, 4, spawn.memory.manual_swarm, spawn.room))
                }
            }
        }


    }

    //manually adding duo
    if (spawn.memory.duos == undefined) { spawn.memory.duos = []; }
    if(spawn.memory.manual_duo!=undefined)
    {
        if (!contains_target_room(spawn.memory.duos, spawn.memory.manual_duo)) {
            spawn.memory.duos.push(new Duo(spawn.room.name + "_" + Game.time, spawn.room,spawn.memory.manual_duo))
        }
    }
  
    /*
    if (spawn.room.name == 'W3S38') {
        if (spawn.memory.duos == undefined) { spawn.memory.duos = []; }
        if (spawn.memory.duos != undefined) {
            // if (spawn.memory.duos.contains_target_room('W3S37') == false) asdasds
            if (contains_target_room(spawn.memory.duos, 'W3S37')) {
                //spawn.memory.duos.push(new Duo(spawn.room.name + "_" + Game.time, spawn.room,'W3S37'))
            }

            if (spawn.memory.duos.length == 1) {
                // spawn.memory.duos.push(new Duo(spawn.room.name + "_" + Game.time, spawn.room,'W2S37'))
            }
        }
    }
        */


    if (spawn.memory.rooms_to_blockade == undefined) {
        spawn.memory.rooms_to_blockade = [];
    }
    if (spawn.memory.manual_blockade != undefined) {
        //if (spawn.memory.rooms_to_blockade.contains_rooms(spawn.memory.manual_blockade) == false) 
        if (contains_rooms(spawn.memory.rooms_to_blockade, spawn.memory.manual_blockade) == false) {
            console.log("new blockade room")
            spawn.memory.rooms_to_blockade.push(new blockadeRoom(spawn.memory.manual_blockade))
        }
    }
    //
    spawn.memory.need_claimer = undefined;
    spawn.memory.need_melee_soldier = undefined;
    spawn.memory.need_melee_defenders = undefined;

    if (spawn.memory.state.includes(STATE_UNDER_ATTACK)) {
        spawn.memory.need_melee_defenders = spawn.room.controller.level * 2;
    }
    spawn.memory.need_reserver = undefined;
    if (spawn.memory.farming_sources != undefined && spawn.memory.farming_sources.length > 0 &&
        (spawn.memory.rooms_to_scan != undefined)) {
        //spawn.memory.need_DistanceCarrier = undefined;
        //  CARRIERS //
        for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
            if (spawn.memory.farming_sources[i].carry_power < spawn.memory.farming_sources[i].sources_num * (SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME)
                && spawn.memory.farming_sources[i].carry_power < spawn.memory.farming_sources[i].harvesting_power) {
                if (Game.rooms[spawn.memory.farming_sources[i].name] != undefined && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', spawn.memory.farming_sources[i].name, ' reserved by invader');
                    continue;
                }
                if (Game.rooms[spawn.memory.farming_sources[i].name] != undefined && Game.rooms[spawn.memory.farming_sources[i].name].memory.hostiles.length > 1 && spawn.memory.farming_sources[i].name != spawn.room.name) {
                    continue;
                }
                spawn.memory.need_DistanceCarrier = spawn.memory.farming_sources[i].name;
                console.log("need distance Carrier: ",spawn.memory.farming_sources[i].name)
                spawn.memory.need_ddistance_carrier_source_id = spawn.memory.farming_sources[i].id;
                spawn.memory.need_distance_carrier_source_distance=spawn.memory.farming_sources[i].distance
                break;
            }
        }
        // FARMERS AFTER UPGRADE //
        for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
            if (spawn.memory.farming_sources[i].harvesting_power < SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME &&
                spawn.memory.farming_sources[i].farmers < spawn.memory.farming_sources[i].max_farmers) {
                if (Game.rooms[spawn.memory.farming_sources[i].name] != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation.username == 'Invader') {
                    continue;
                }

                spawn.memory.need_source_farmer = spawn.memory.farming_sources[i].id;
                spawn.memory.need_source_farmer_room = spawn.memory.farming_sources[i].name;
                spawn.memory.need_source_farmer_distance=spawn.memory.farming_sources[i].distance;
                //console.log("asdasdasdasd: ",spawn.memory.need_source_farmer_distance)
                //consone.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                break;
            }
        }


        // if room is under attack do not spawn farmers
        if (spawn.memory.state.includes("STATE_UNDER_ATTACK")) {
            spawn.memory.need_source_farmer = undefined
            spawn.memory.need_source_farmer_room = undefined
        }


        //  SOLDIERS //


        for (let myRoom in Game.rooms) {
            //console.log("myRoom: ", myRoom)




            var creeps_to_heal = Game.rooms[myRoom].find(FIND_MY_CREEPS, {
                filter:
                    function (cr) {
                        return cr.hits < cr.hitsMax
                    }
            })


            Game.rooms[myRoom].memory.damagedCreeps = [];
            for (cr of creeps_to_heal) {
                Game.rooms[myRoom].memory.damagedCreeps.push(cr.id);
            }



            const inFarmingRooms = spawn.memory.farming_rooms.some(room => room.name === myRoom);

            const inKeepersRooms = spawn.memory.keepers_rooms.some(room => room.name === myRoom);

            if (Game.rooms[myRoom] != undefined && (inFarmingRooms || inKeepersRooms)) {
                //console.log("room is definied")
                //console.log(" my creeps: ",Game.rooms[myRoom].find(FIND_MY_CREEPS).length)
                var invaders = Game.rooms[myRoom].find(FIND_CREEPS, {
                    filter:
                        function (hostile) {
                            return hostile.owner.username == 'Invader'
                        }
                })

                var enemy_creeps = Game.rooms[myRoom].find(FIND_HOSTILE_CREEPS, {
                    filter:
                        function (en) {
                            return  !Memory.allies.includes(en.owner.username) &&
                                (en.getActiveBodyparts(WORK) > 0 || en.getActiveBodyparts(ATTACK) > 0 || en.getActiveBodyparts(RANGED_ATTACK) > 0 || en.getActiveBodyparts(CLAIM) > 0)
                        }
                })
                //console.log(myRoom, " enemy_creeps: ", enemy_creeps.length)

                var cores = Game.rooms[myRoom].find(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.structureType == STRUCTURE_INVADER_CORE
                        }
                })


                //console.log("towers at : ",myRoom," : ", towers.length)
                // if there are towers do not send soldiers
                //console.log(invaders.length > 0, " ", cores.length > 0, " ", Game.rooms[myRoom].memory.soldiers < 3)
                //console.log("invaders: ", invaders.length)
                if(Game.rooms[myRoom].memory.soldiers==undefined)
                {
                    Game.rooms[myRoom].memory.soldiers=[]
                }
                if (inFarmingRooms && !inKeepersRooms && (invaders.length > 0 || enemy_creeps.length > 0) && Game.rooms[myRoom].memory.soldiers.length < 2
            && global.heap.soldiers[myRoom]!=undefined && global.heap.soldiers[myRoom]<3) {
                    spawn.memory.need_soldier = myRoom;
                }
                else if (inFarmingRooms && !inKeepersRooms && (cores.length > 0) && global.heap.soldiers[myRoom] < 2) {
                    spawn.memory.need_melee_soldier = myRoom;
                    console.log("need melee soldier: ",spawn.memory.need_melee_soldier)
                    if(spawn.memory.need_DistanceCarrier==myRoom)
                    {
                        spawn.memory.need_DistanceCarrier=undefined;
                        spawn.memory.need_ddistance_carrier_source_id=undefined;
                        spawn.memory.need_distance_carrier_source_distance=undefined;
                    }
                    if(spawn.memory.need_source_farmer==myRoom)
                    {
                        spawn.memory.need_source_farmer=undefined
                        spawn.memory.need_source_farmer_distance=undefined
                        spawn.memory.need_source_farmer_room=undefined
                    }
                }


                else if (!inFarmingRooms && inKeepersRooms && cores.length > 0) {
                    var towers = Game.rooms[myRoom].find(FIND_HOSTILE_STRUCTURES, {
                        filter:
                            function (str) {
                                return str.structureType == STRUCTURE_TOWER
                            }
                    })
                    spawn.memory.need_keeper_quad = new keeperQuad(myRoom, towers.length)
                }
                else if (!inFarmingRooms && inKeepersRooms && invaders.length > 0) {// adding swarms to attack keepers rooms that are under invasion of invaders
                    if (!spawn.memory.swarms.some(swarm => swarm.target_room === myRoom)) {
                        spawn.memory.swarms.push(new Swarm(spawn.room.name + "_" + Game.time, 4, myRoom, spawn.room))
                    }
                }
                else if (!inFarmingRooms && inKeepersRooms && invaders.length == 0) {// if there is no invaders remove swarm from memory
                    var index = spawn.memory.swarms.findIndex(swarm => swarm.target_room === myRoom)
                    if (index !== -1) {
                        spawn.memory.swarms.splice(index, 1);
                    }
                }


                if (spawn.memory.rooms_to_blockade != undefined && spawn.memory.rooms_to_blockade.length > 0) {
                    for (r of spawn.memory.rooms_to_blockade) {
                        if (r.soldier_id != undefined && Game.getObjectById(r.soldier_id) == null) {
                            console.log("creep is dead")
                            r.soldier_id = undefined
                        }
                        if (r.soldier_id == undefined && global.heap.soldiers[myRoom]<3) {
                            spawn.memory.need_soldier = r.roomName
                        }
                    }
                }



            }

            // finding dropped energy in all my rooms
            if (Game.time % 3 == 0) {
                Game.rooms[myRoom].memory.dropped_energy = [];
                var en = Game.rooms[myRoom].find(FIND_DROPPED_RESOURCES, {
                    filter:
                        function (res) {
                            return res.resourceType == RESOURCE_ENERGY
                        }
                });
                if (en.length > 0) {
                    for (a of en) {
                        Game.rooms[myRoom].memory.dropped_energy.push(a.id)
                    }
                }

            }


        }







        // REPAIRERS //
        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (spawn.memory.farming_rooms[i].distanceRepairer == undefined && spawn.memory.farming_rooms[i].harvesting_power > 0 && spawn.memory.farming_rooms[i].carry_power > 0) {
                if ((Game.rooms[spawn.memory.farming_rooms[i].name] != undefined && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation.username == 'Invader'
                ) && spawn.memory.farming_rooms[i].harvesting_power > 0 && spawn.memory.farming_rooms[i].carry_power > 0
                    /* || (spawn.memory.farming_rooms[i].name==spawn.room.name && spawn.memory.towers_id!=undefined && spawn.memory.towers_id.length>0) */ //skip home_rooms with towers
                ) {
                    continue;
                }
                spawn.memory.need_distanceRepairer = spawn.memory.farming_rooms[i].name;
                break;
            }
        }


        // soldiers for colonization
        if (spawn.memory.need_soldier == undefined && spawn.memory.to_colonize != undefined
            && spawn.room.storage != undefined && spawn.memory.have_energy_to_colonize == true
        ) {

            //console.log("2")
            if (spawn.memory.to_colonize.soldier != undefined && Game.getObjectById(spawn.memory.to_colonize.soldier) == null) {
                spawn.memory.to_colonize.soldier = undefined
                console.log("reseting colonization soldier")
            }

            if (spawn.memory.to_colonize.soldier == undefined) {
                console.log(spawn.room.name, " need soldier for colonization of ", spawn.memory.to_colonize.name)
                spawn.memory.need_soldier = spawn.memory.to_colonize.name
            }


            if (spawn.memory.to_colonize.claimer != undefined && Game.getObjectById(spawn.memory.to_colonize.claimer) == null) {
                spawn.memory.to_colonize.claimer = undefined
            }

            if (spawn.memory.to_colonize.claimer == undefined) {
                spawn.memory.need_claimer = spawn.memory.to_colonize.name
            }

        }

        // RESERVERS //


        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (spawn.memory.farming_rooms[i].harvesting_power >= 0 && spawn.memory.farming_rooms[i].reserver == undefined
                && spawn.memory.farming_rooms[i].name != spawn.room.name) {
                spawn.memory.need_reserver = spawn.memory.farming_rooms[i].name;
                break;
            }
        }



        spawn.memory.req_reservers = spawn.memory.farming_rooms.length * 1; // role num 13
        //spawn.memory.req_farmers = spawn.memory.farming_rooms.length*2;
        //spawn.memory.req_DistanceCarriers=spawn.memory.farming_rooms.length*2;//role num 14
        spawn.memory.req_soldiers = spawn.memory.farming_rooms.length * 0;



    }
    else {
        spawn.memory.req_reservers = 0;
        spawn.memory.req_farmers = 0;
        spawn.memory.req_DistanceCarriers = 0;
        spawn.memory.req_soldiers = 0;
    }


    var terminal = spawn.room.terminal;
    if (spawn.room.terminal != undefined || spawn.room.storage != undefined) {
        spawn.memory.req_merchants = 1;
    }
    else {
        spawn.memory.req_merchants = 0;
    }

    //EXTRACTOR
    if (spawn.memory.extractor == undefined) {
        var extractor = spawn.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_EXTRACTOR;
            }
        });
        if (extractor.length > 0) {
            spawn.memory.extractor = extractor[0].id;
        }

    }

    //MINERAL
    if (spawn.memory.mineral == undefined) {
        var mineral = spawn.room.find(FIND_MINERALS);
        if (mineral.length > 0) {
            spawn.memory.mineral = mineral[0].id;
        }

    }

    if (Game.getObjectById(spawn.memory.extractor) != null &&
        Game.getObjectById(spawn.memory.mineral) != null && Game.getObjectById(spawn.memory.mineral).mineralAmount > 0) {
        spawn.memory.req_miners = 1;
    }
    else {
        spawn.memory.req_miners = 0;
    }






    if (Game.time % Memory.step == 0) {
        spawn.memory.progress = 0;
        spawn.memory.progress_old = 0;
        spawn.memory.progress_sum = 0;
        spawn.memory.progress_counter = 0;

        spawn.room.memory.delivered_energy = 0;
        spawn.room.memory.energy_on_creeps = 0;
        spawn.room.memory.energy_on_ramparts = 0;

        spawn.room.memory.energy_on_repair=0;
        for (room in Game.rooms) {
            var r = Game.rooms[room]
            if (r != undefined) {
                r.memory.energy_on_repair=0;
            }
        }
        
    }
    if (spawn.memory.reservers_counter == undefined || spawn.memory.reservers_counter > 500) {
        spawn.memory.reservers_counter = 0;
    }

    for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
        if (spawn.memory.keepers_rooms[i].carry_power == undefined) {
            spawn.memory.keepers_rooms[i].carry_power = 0;
        }
        if (spawn.memory.keepers_rooms[i].harvesting_power == undefined) {
            spawn.memory.keepers_rooms[i].harvesting_power = 0;
        }
        if (spawn.memory.keepers_rooms[i].max_carriers == undefined) {
            spawn.memory.keepers_rooms[i].max_carriers = 6;
        }
        if (spawn.memory.keepers_rooms[i].max_farmers == undefined || true) {
            spawn.memory.keepers_rooms[i].max_farmers = 3;
        }

    }


    module.exports = Quad;
}
