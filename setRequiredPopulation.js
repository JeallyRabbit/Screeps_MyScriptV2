

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

function calculateDistance(point1, point2) {
    // Adjusted regular expression to match the new format
    const regex = /^([WE])(\d+)([NS])(\d+)$/;
    const match1 = point1.match(regex);
    const match2 = point2.match(regex);

    if (!match1 || !match2) {
        console.log("Invalid point format");
        console.log(point1);
        console.log(point2);
    }

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



function setRequiredPopulation(spawn) {


    //console.log("repairer for [0] in set pop: ",spawn.memory.farming_rooms[0].distanceRepairer)

    if (Memory.colonizing == true && spawn.room.controller.level>=5) {
        spawn.memory.req_scanners = 1
        //console.log("need scannerrrrrrrrrrrrrrrrrrrrrrrrrr")
    }
    else {
        spawn.memory.req_scanners = 0;
        //console.log("no scannerssssssssssssssssssssssssssssssssssssssssssssssssssssss");
    }



    spawn.memory.req_carriers = 0;


    spawn.memory.req_scouts = 1;

    if (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0) {
        spawn.memory.req_scouts = 0;
    }

   

    spawn.memory.req_harvesters = 0;// role num 0
    //spawn.memory.req_c
    spawn.memory.req_upgraders_parts = 1;
    spawn.memory.req_fillers = 4;
    if ((spawn.memory.building != true && Game.time % 5 == 0) || Game.time % 15 == 0) {
        if (spawn.memory.farming_sources != undefined) {
            var farming_sources_num = spawn.memory.farming_sources.length;
            if (farming_sources_num > 0 && spawn.memory.farming_sources[Math.floor(farming_sources_num / 2)].carry_power >=spawn.memory.farming_sources[Math.floor(farming_sources_num / 2)].harvesting_power) {
                var construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
                if (construction_sites.length > 0) {
                    spawn.memory.building = true;
                    spawn.memory.upgrading = undefined;
                }
                else {
                    spawn.memory.building = undefined;
                    spawn.memory.upgrading = true;
                }
            }
        }
    }
    if (spawn.room.controller.level == 1) {
        // spawn.memory.req_harvesters = 6;
        spawn.memory.req_upgraders_parts = 1;
        spawn.memory.req_fillers = 0;
    }
    else if (spawn.room.controller.level == 2) {
        //spawn.memory.req_harvesters = 4;
        if (spawn.memory.upgrading || spawn.memory.building==undefined || spawn.memory.building==false) {
            spawn.memory.req_upgraders_parts = 10;
        }

        spawn.memory.req_fillers = 4;
    }
    else if (spawn.room.controller.level == 3) {
        spawn.memory.req_upgraders_parts = 10;
        spawn.memory.req_fillers = 4;
    }

    if (spawn.room.storage != undefined && spawn.room.controller.level < 8 && spawn.room.controller.level > 3) {
        if (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 0) {
            spawn.memory.req_upgraders_parts = spawn.room.storage.store[RESOURCE_ENERGY] / 20000;

        }
        else{
            spawn.memory.req_upgraders_parts=1;
        }
    }
    if (spawn.memory.building == true) {
        spawn.memory.req_upgraders_parts = 1;
        spawn.memory.req_builders = 4;
    }
    spawn.memory.req_farmers = 0;//role num 2
    spawn.memory.req_builders = 0;// role num 3
    if (spawn.memory.building == true && spawn.room.controller.level == 2) {
        spawn.memory.req_builders = 5;
    }
    if (spawn.memory.building == true && spawn.room.controller.level > 2) {
        spawn.memory.req_builders = 2;
    }
    spawn.memory.req_haulers = 1;// role num 4
    spawn.memory.req_berserk = 1;//role num 8
    spawn.memory.req_transporters = 0;//role numm 9
    spawn.memory.req_towerKeepers = 0;//role num 10
    spawn.memory.req_rampart_repairers=1;

    if(spawn.room.controller.level>=3)
    {
        if(spawn.memory.towers_id!=undefined && spawn.memory.towers_id.length>0)
        {
            for(tower_id of spawn.memory.towers_id)
            {
                if(Game.getObjectById(tower_id)==null)
                {
                    spawn.memory.towers_id=undefined;
                    break;
                }
            }
        }
        if(spawn.memory.tower_id==undefined)
        {
            var towers=spawn.room.find(FIND_MY_STRUCTURES,{
                filter: function(str)
                {
                    return str.structureType==STRUCTURE_TOWER;
                }
            });
            if(towers!=undefined && towers.length>0)
            {
                spawn.memory.towers_id=[];
                for(tower of towers)
                {
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

    if (spawn.memory.towers_id!=undefined && spawn.memory.towers_id.length>0) {
        spawn.memory.req_towerKeepers = 1;
    }
    else{
        spawn.memory.req_towerKeepers=0;
    }
    /*
    spawn.memory.req_keeperKillers = 0;//role num 15
    spawn.memory.req_keeperHealers = 0;//role num 16
    spawn.memory.req_keeperCarriers = 0;//role num 17
    spawn.memory.req_keeperFarmers = 0;//role num 17
    */
    spawn.memory.req_claimers = 0;//role num 11
    spawn.memory.req_doctors = 0;
    if (spawn.memory.farming_rooms == undefined) {
        spawn.memory.farming_rooms = [];

    }
    if (spawn.memory.farming_sources == undefined) {
        spawn.memory.farming_sources = [];

    }
    else {
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
                spawn.memory.farming_sources[i].income_per_body_part = spawn.memory.farming_sources[i].calculatedIncome / spawn.memory.farming_sources[i].body_parts_cost;

            }

        }


        ////////////FARMING_ROOMS
        /*
        var farming_body_parts = 0;
        var farming_rooms_num = 0;
        spawn.memory.farming_rooms.sort((a, b) => b.income_per_body_part - a.income_per_body_part);
        while (farming_body_parts < 350 && farming_rooms_num < spawn.memory.farming_rooms.length) {
            farming_body_parts += spawn.memory.farming_rooms[farming_rooms_num].body_parts_cost;
            if (farming_body_parts < 350) {
                farming_rooms_num++;
            }

        }

        if (spawn.memory.farming_rooms.length > farming_rooms_num && spawn.memory.farming_rooms.length > 0) {
            while (spawn.memory.farming_rooms.length > farming_rooms_num) {
                spawn.memory.farming_rooms.pop();
            }
        }
        */
        


        /////////////FARMING_SOURCES
        var farming_body_parts=0;
        var farming_sources_num=0;
        spawn.memory.farming_sources.sort((a, b) => b.income_per_body_part - a.income_per_body_part);
        while (farming_body_parts < 350 && farming_sources_num < spawn.memory.farming_sources.length) {
            farming_body_parts += spawn.memory.farming_sources[farming_sources_num].body_parts_cost;
            if (farming_body_parts < 350) {
                farming_sources_num++;
            }
            else{
                break;
            }

        }

        if (spawn.memory.farming_sources.length > farming_sources_num && spawn.memory.farming_sources.length > 0) {
            while (spawn.memory.farming_sources.length > farming_sources_num) {
                spawn.memory.farming_sources.pop();
            }
        }

    }


    if (spawn.memory.claiming_rooms == undefined) {
        spawn.memory.claiming_rooms = [];
    }
    if (spawn.memory.keepers_rooms == undefined) {
        spawn.memory.keepers_rooms = [];
    }
    else if (spawn.memory.keepers_rooms.length > 1) {
        spawn.memory.keepers_rooms.sort((a, b) => a.distance - b.distance);
        while (spawn.memory.keepers_rooms.length > 1) {
            spawn.memory.keepers_rooms.pop();
        }
    }

    spawn.memory.need_keeperKiller = undefined;
    spawn.memory.need_keeperHealer = undefined;
    spawn.memory.need_keeperCarrier = undefined;
    spawn.memory.need_keeperFarmer = undefined;


    if (spawn.memory.keepers_rooms != undefined && spawn.memory.keepers_rooms.length > 0
        && spawn.room.controller.level >= 7 && false) {
        for (let keeper_room of spawn.memory.keepers_rooms) {
            if (keeper_room.keeperKiller == undefined && spawn.memory.need_keeperKiller == undefined) {
                spawn.memory.need_keeperKiller = keeper_room.name;
            }
            if (keeper_room.keeperHealer == undefined && spawn.memory.need_keeperHealer == undefined) {
                spawn.memory.need_keeperHealer = keeper_room.name;
            }

            if (keeper_room.carry_power < keeper_room.harvesting_power && keeper_room.carry_power < 50 && spawn.memory.need_keeperCarrier == undefined
                && keeper_room.carriers < keeper_room.max_carriers) {
                spawn.memory.need_keeperCarrier = keeper_room.name;
            }
            if (keeper_room.harvesting_power < 40 && keeper_room.farmers < keeper_room.max_farmers && spawn.memory.need_keeperFarmer == undefined
                && keeper_room.farmers < keeper_room.max_farmers && keeper_room.keeperKiller != undefined && keeper_room.keeperHealer != undefined) {
                spawn.memory.need_keeperFarmer = keeper_room.name;
            }
        }
    }
    if(spawn.memory.sources_links_id!=undefined && spawn.memory.sources_links_id.length>0)
    {
        console.log("no need for distanceCarrier")
        for(let i=0;i<spawn.memory.farming_rooms.length;i++)
        {
            if(spawn.memory.farming_rooms[i].name==spawn.room.name)
            {
                spawn.memory.farming_rooms[i].carry_power=Infinity;
                spawn.memory.farming_rooms[i].carry_power=99999999999
                console.log("infiniging: ",spawn.memory.farming_rooms[i].name);
                //break
            }
        }

        for(let i=0;i<spawn.memory.farming_sources.length;i++)
        {
            if(spawn.memory.farming_sources[i].name==spawn.room.name)
            {
                spawn.memory.farming_sources[i].carry_power=Infinity
                //break
            }
        }

    }

    spawn.memory.req_repairers = 0;// 1 - (100 * spawn.memory.req_towerKeepers);

    spawn.memory.need_DistanceCarrier = undefined;
    spawn.memory.need_ddistance_carrier_source_id=undefined
    spawn.memory.need_farmer = undefined;
    spawn.memory.need_source_farmer=undefined;
    spawn.memory.need_source_farmer_room=undefined;
    spawn.memory.need_distanceRepairer = undefined;
    spawn.memory.need_soldier = undefined;
    spawn.memory.need_melee_soldier = undefined;
    //spawn.memory.need_melee_soldier = 'W41N15';
    spawn.memory.need_reserver = undefined;
    if (spawn.memory.farming_sources != undefined && spawn.memory.farming_sources.length > 0 &&
        (spawn.memory.rooms_to_scan != undefined)) {
        //spawn.memory.need_DistanceCarrier = undefined;
        //  CARRIERS //
        for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
            if (spawn.memory.farming_sources[i].carry_power < spawn.memory.farming_sources[i].sources_num * 10
                && spawn.memory.farming_sources[i].carry_power < spawn.memory.farming_sources[i].harvesting_power) {
                if (Game.rooms[spawn.memory.farming_sources[i].name] != undefined && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', spawn.memory.farming_sources[i].name, ' reserved by invader');
                    continue;
                }
                spawn.memory.need_DistanceCarrier = spawn.memory.farming_sources[i].name;
                spawn.memory.need_ddistance_carrier_source_id=spawn.memory.farming_sources[i].id;
                break;
            }
        }

        //spawn.memory.need_farmer = undefined;
        //  FARMERS //
        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (spawn.memory.farming_rooms[i].harvesting_power < spawn.memory.farming_rooms[i].sources_num * 11
                && spawn.memory.farming_rooms[i].farmers < spawn.memory.farming_rooms[i].max_farmers) {

                if (Game.rooms[spawn.memory.farming_rooms[i].name] != undefined
                    && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', spawn.memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }
                spawn.memory.need_farmer = spawn.memory.farming_rooms[i].name;
                //consone.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                break;
            }
        }

        // FARMERS AFTER UPGRADE //
        for(let i=0;i<spawn.memory.farming_sources.length;i++)
        {
            if(spawn.memory.farming_sources[i].harvesting_power<SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME && 
            spawn.memory.farming_sources[i].farmers<spawn.memory.farming_sources[i].max_farmers)
            {
                if (Game.rooms[spawn.memory.farming_sources[i].name] != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_sources[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', spawn.memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }
                spawn.memory.need_source_farmer = spawn.memory.farming_sources[i].id;
                spawn.memory.need_source_farmer_room = spawn.memory.farming_sources[i].name;
                //consone.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                break;
            }
        }

        // REPAIRERS //
        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (/* spawn.memory.farming_rooms[i].harvesting_power > 0 && */ spawn.memory.farming_rooms[i].distanceRepairer == undefined) {
                if ((Game.rooms[spawn.memory.farming_rooms[i].name] != undefined && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[spawn.memory.farming_rooms[i].name].controller.reservation.username == 'Invader')
                    /* || (spawn.memory.farming_rooms[i].name==spawn.room.name && spawn.memory.towers_id!=undefined && spawn.memory.towers_id.length>0) */ //skip home_rooms with towers
                ) {
                    continue;
                }
                spawn.memory.need_distanceRepairer = spawn.memory.farming_rooms[i].name;
                break;
            }
        }

        //  SOLDIERS //

        if (Game.time % 1 == 0) {
            loop1:
            for (let myRoom in Game.rooms) {
                for (let keeperRoom of spawn.memory.keepers_rooms) {
                    if (myRoom == keeperRoom.name) {
                        //console.log("ignoring hostile at: ", keeperRoom.name);
                        continue loop1;
                    }
                }
                if (Game.rooms[myRoom].name != spawn.room.name) {
                    var is_farming_room = false;
                    for (let farmingRoom of spawn.memory.farming_rooms) {
                        if (myRoom == farmingRoom.name) {
                            is_farming_room = true;
                            break;
                        }
                    }

                    for (let farmingRoom of spawn.memory.farming_sources) {
                        if (myRoom == farmingRoom.name) {
                            is_farming_room = true;
                            break;
                        }
                    }

                    if (is_farming_room == true || 
                        (is_farming_room==false && Game.rooms[myRoom].controller!=undefined && Game.rooms[myRoom].my==true && Game.rooms[myRoom].controller.level<4)) {
                        if(Game.rooms[myRoom].soldier !=undefined || Game.rooms[myRoom].melee_soldier!=undefined)
                        {
                            continue loop1;
                        }
                        var hostile = Game.rooms[myRoom].find(FIND_HOSTILE_CREEPS);
                        if (hostile != undefined) {
                            if (hostile.length == 0) {
                                hostile = Game.rooms[myRoom].find(FIND_STRUCTURES, {
                                    filter: function (structure) {
                                        return structure.structureType == STRUCTURE_INVADER_CORE;
                                    }
                                });
                                if (hostile.length > 0) {
                                    //found invaderCore
                                    spawn.memory.need_melee_soldier = Game.rooms[myRoom].name;

                                    break;
                                }
                            }
                            else {
                                //found hostile creeps
                                if (hostile.length > 0) {
                                    spawn.memory.need_soldier = Game.rooms[myRoom].name;
                                    break;
                                }
                            }


                        }
                    }

                }

            }
        }

        // RESERVERS //


        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
            if (spawn.memory.farming_rooms[i].harvesting_power >=0 && spawn.memory.farming_rooms[i].reserver == undefined
                && spawn.memory.farming_rooms[i].name != spawn.room.name) {
                spawn.memory.need_reserver = spawn.memory.farming_rooms[i].name;
                break;
            }
        }
        console.log('need DistanceCarrier: ', spawn.memory.need_DistanceCarrier, ' | need_distance_carrier_source_id: ',spawn.memory.need_ddistance_carrier_source_id,
        ' | need source_farmer: ', spawn.memory.need_source_farmer,
            ' | need distanceRepairer ', spawn.memory.need_distanceRepairer, ' | need soldier: ', spawn.memory.need_soldier,
            ' | need reserver ', spawn.memory.need_reserver,' | need melee_soldier: ',spawn.memory.need_melee_soldier);




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

    if (spawn.memory.claiming_rooms == undefined && spawn.memory.claiming_rooms.length > 0) {
        spawn.memory.req_claimers = spawn.memory.claiming_rooms.length;
        //spawn.memory.claiming_rooms.push('E3N59');
        //spawn.memory.req_berserk = spawn.memory.claiming_rooms.length*2;
        spawn.memory.req_distanceBuilders = 2 * spawn.memory.claiming_rooms.length;//role num12
    }
    else {
        spawn.memory.req_claimers = 0;
        //spawn.memory.req_berserk =0;
        spawn.memory.req_distanceBuilders = 0;
    }




    var terminal = spawn.room.terminal;
    if (spawn.room.terminal != undefined || spawn.room.storage!=undefined) {
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


    if (spawn.room.controller.level >= 6 && Game.time % 1400 == 1) {
        var labs = spawn.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_LAB;
            }
        });
        if (labs != undefined && labs.length > 0) {
            //spawn.memory.req_doctors=1;
            spawn.memory.req_doctors = 1;
        }
    }
    else {
        spawn.memory.req_doctors = 0;
    }





    if (Game.time % 2000 == 0) {
        spawn.memory.progress = 0;
        spawn.memory.progress_old = 0;
        spawn.memory.progress_sum = 0;
        spawn.memory.progress_counter = 0;
    }
    if (spawn.memory.reservers_counter == undefined || spawn.memory.reservers_counter > 500) {
        spawn.memory.reservers_counter = 0;
    }
    if (spawn.memory.soldiers_counter == undefined || spawn.memory.soldiers_counter > 500) {
        spawn.memory.soldiers_counter = 0;
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
    /*
    if(Memory.rooms_to_scan!=undefined && Memory.rooms_to_scan.length>0 && spawn.room.controller.level>=4)
    {
        spawn.memory.to_colonize=Memory.rooms_to_scan[0];
    }
    */
    if(Memory.rooms_to_colonize.length>0)
    {
        spawn.memory.to_colonize=Memory.rooms_to_colonize[0];
    }
    if (spawn.memory.to_colonize != undefined && spawn.room.controller.level>=4) {
        spawn.memory.req_claimers = 1;
        spawn.memory.req_colonizers = 8;
    }
    else{
        spawn.memory.req_claimers = 0;
        spawn.memory.req_colonizers = 0;
    }


}
module.exports = setRequiredPopulation;