
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



function setRequiredPopulation(mySpawns) {


    mySpawns['Spawn1'].memory.req_carriers = 0;


    mySpawns['Spawn1'].memory.req_scouts = 1;

    if (mySpawns['Spawn1'].memory.rooms_to_scan != undefined && mySpawns['Spawn1'].memory.rooms_to_scan.length == 0) {
        mySpawns['Spawn1'].memory.req_scouts = 0;
    }

    if (mySpawns['Spawn1'].memory.num_towers == undefined || Game.time % 50001 == 0) {
        mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_TOWER;
            }
        });

        mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].memory.num_towers.length;
    }

    mySpawns['Spawn1'].memory.req_harvesters = 0;// role num 0
    //mySpawns['Spawn1'].memory.req_c
    mySpawns['Spawn1'].memory.req_upgraders = 1;
    mySpawns['Spawn1'].memory.req_fillers = 4;
    if ((mySpawns['Spawn1'].memory.building != true && Game.time % 1 == 0) || Game.time % 11 == 0) {
        if (mySpawns['Spawn1'].memory.farming_rooms != undefined) {
            var farming_rooms_num = mySpawns['Spawn1'].memory.farming_rooms.length;
            if (farming_rooms_num>0 && mySpawns['Spawn1'].memory.farming_rooms[Math.floor(farming_rooms_num/2)].carry_power > 0) {
                var construction_sites = mySpawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES);
                if (construction_sites.length > 0) {
                    mySpawns['Spawn1'].memory.building = true;
                    mySpawns['Spawn1'].memory.upgrading = undefined;
                }
                else {
                    mySpawns['Spawn1'].memory.building = undefined;
                    mySpawns['Spawn1'].memory.upgrading = true;
                }
            }
        }



    }
    if (mySpawns['Spawn1'].room.controller.level == 1) {
        // mySpawns['Spawn1'].memory.req_harvesters = 6;
        mySpawns['Spawn1'].memory.req_upgraders = 1;
        mySpawns['Spawn1'].memory.req_fillers = 0;
    }
    else if (mySpawns['Spawn1'].room.controller.level == 2) {
        //mySpawns['Spawn1'].memory.req_harvesters = 4;
        if(mySpawns['Spawn1'].memory.upgrading)
        {
            mySpawns['Spawn1'].memory.req_upgraders = 6;
        }
        
        mySpawns['Spawn1'].memory.req_fillers = 1;
    }
    else if (mySpawns['Spawn1'].room.controller.level == 3) {
        mySpawns['Spawn1'].memory.req_upgraders = 6;
        mySpawns['Spawn1'].memory.req_fillers = 3;
    }

    if (mySpawns['Spawn1'].room.storage != undefined && mySpawns['Spawn1'].room.controller.level < 8 && mySpawns['Spawn1'].room.controller.level > 3) {
        if (mySpawns['Spawn1'].room.storage.store[RESOURCE_ENERGY] > 100000) {
            mySpawns['Spawn1'].memory.req_upgraders = 2;
        }

        if (mySpawns['Spawn1'].room.storage != undefined && mySpawns['Spawn1'].room.storage.store[RESOURCE_ENERGY] > 200000) {
            mySpawns['Spawn1'].memory.req_upgraders = mySpawns['Spawn1'].room.storage.store[RESOURCE_ENERGY] / 100000;
        }
    }
    if (mySpawns['Spawn1'].memory.building == true) {
        mySpawns['Spawn1'].memory.req_upgraders = 1;
        mySpawns['Spawn1'].memory.req_builders=4;
    }
    mySpawns['Spawn1'].memory.req_farmers = 0;//role num 2
    mySpawns['Spawn1'].memory.req_builders = 0;// role num 3
    if (mySpawns['Spawn1'].memory.building == true && mySpawns['Spawn1'].room.controller.level > 1) {
        mySpawns['Spawn1'].memory.req_builders = 6;
    }
    mySpawns['Spawn1'].memory.req_haulers = 1;// role num 4
    mySpawns['Spawn1'].memory.req_berserk = 1;//role num 8
    mySpawns['Spawn1'].memory.req_transporters = 0;//role numm 9
    mySpawns['Spawn1'].memory.req_towerKeepers = 0;//role num 10
    if (mySpawns['Spawn1'].memory.num_towers > 0) {
        mySpawns['Spawn1'].memory.req_towerKeepers = 1;
    }
    /*
    mySpawns['Spawn1'].memory.req_keeperKillers = 0;//role num 15
    mySpawns['Spawn1'].memory.req_keeperHealers = 0;//role num 16
    mySpawns['Spawn1'].memory.req_keeperCarriers = 0;//role num 17
    mySpawns['Spawn1'].memory.req_keeperFarmers = 0;//role num 17
    */
    mySpawns['Spawn1'].memory.req_claimers = 0;//role num 11
    mySpawns['Spawn1'].memory.req_doctors = 0;
    if (mySpawns['Spawn1'].memory.farming_rooms == undefined) {
        mySpawns['Spawn1'].memory.farming_rooms = [];

    }
    else {
        for (let i = 0; i < mySpawns['Spawn1'].memory.farming_rooms.length; i++) {

            if (mySpawns['Spawn1'].memory.farming_rooms[i].body_parts_cost == undefined) {

                var body_parts_cost = (mySpawns['Spawn1'].memory.farming_rooms[i].sources_num * 12);//parts for farmers (max farmer is made off 12 bodyparts);
                body_parts_cost += 14;//maxRepairer
                body_parts_cost += Math.ceil((mySpawns['Spawn1'].memory.farming_rooms[i].sources_num * 10 * mySpawns['Spawn1'].memory.farming_rooms[i].distance * 2 * 3) / 100);//distanceCarriers
                mySpawns['Spawn1'].memory.farming_rooms[i].body_parts_cost = body_parts_cost;
            }

            if (mySpawns['Spawn1'].memory.farming_rooms[i].carry_power == undefined) {
                mySpawns['Spawn1'].memory.farming_rooms[i].carry_power = 0;
            }
            if (mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power == undefined) {
                mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power = 0;
            }
            if (mySpawns['Spawn1'].memory.farming_rooms[i].calculatedIncome == undefined || true) {
                var sources_num = mySpawns['Spawn1'].memory.farming_rooms[i].sources_num;
                var distance = mySpawns['Spawn1'].memory.farming_rooms[i].distance;
                //source_income = raw income from sources per CREEP_LIFE_TIME (1500 ticks)
                var raw_source_income = (sources_num * (CREEP_LIFE_TIME / ENERGY_REGEN_TIME) * SOURCE_ENERGY_CAPACITY);
                //console.log(mySpawns['Spawn1'].memory.farming_rooms[i].name);
                //console.log("raw_source_income: ",raw_source_income);
                var farmers_cost = sources_num * 950;
                var repairer_cost = 750;
                //var distanceCarrier_cost=(((3*sources_num*(SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME)*mySpawns['Spawn1'].memory.farming_rooms[i].distance*2)/100)/3)*50;
                var distanceCarrier_parts = (sources_num * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * distance * 2 * 3) / 100;
                var distanceCarriers_cost = distanceCarrier_parts * 50;
                //console.log("farmers_cost; ",farmers_cost);
                //console.log("repairer_cost: ", repairer_cost);
                //console.log("distanceCarrier_parts; ",distanceCarrier_parts);
                //console.log("distanceCarrier_cost: ",distanceCarriers_cost);
                var cost = farmers_cost + repairer_cost + distanceCarriers_cost;
                var final_income = raw_source_income - cost;
                //console.log("cost: ",cost);
                //console.log("final_income: ",final_income);
                mySpawns['Spawn1'].memory.farming_rooms[i].calculatedIncome = final_income;
                mySpawns['Spawn1'].memory.farming_rooms[i].income_per_body_part = mySpawns['Spawn1'].memory.farming_rooms[i].calculatedIncome / mySpawns['Spawn1'].memory.farming_rooms[i].body_parts_cost;

            }

        }
        var farming_body_parts = 0;
        var farming_rooms_num = 0;
        mySpawns['Spawn1'].memory.farming_rooms.sort((a, b) => b.income_per_body_part - a.income_per_body_part);
        while (farming_body_parts < 400 && farming_rooms_num < mySpawns['Spawn1'].memory.farming_rooms.length) {
            farming_body_parts += mySpawns['Spawn1'].memory.farming_rooms[farming_rooms_num].body_parts_cost;
            if (farming_body_parts < 400) {
                farming_rooms_num++;
            }

        }

        if (mySpawns['Spawn1'].memory.farming_rooms.length > farming_rooms_num && mySpawns['Spawn1'].memory.farming_rooms.length > 0) {
            while (mySpawns['Spawn1'].memory.farming_rooms.length > farming_rooms_num) {
                mySpawns['Spawn1'].memory.farming_rooms.pop();
            }
        }

    }
    /*
    else if (mySpawns['Spawn1'].memory.farming_rooms.length > 3) {
        mySpawns['Spawn1'].memory.farming_rooms.sort((a, b) => a.distance - b.distance);
        while (mySpawns['Spawn1'].memory.farming_rooms.length > 3) {
            mySpawns['Spawn1'].memory.farming_rooms.pop();
        }
    }
    */


    if (mySpawns['Spawn1'].memory.claiming_rooms == undefined) {
        mySpawns['Spawn1'].memory.claiming_rooms = [];
    }
    if (mySpawns['Spawn1'].memory.keepers_rooms == undefined) {
        mySpawns['Spawn1'].memory.keepers_rooms = [];
    }
    else if (mySpawns['Spawn1'].memory.keepers_rooms.length > 1) {
        mySpawns['Spawn1'].memory.keepers_rooms.sort((a, b) => a.distance - b.distance);
        while (mySpawns['Spawn1'].memory.keepers_rooms.length > 1) {
            mySpawns['Spawn1'].memory.keepers_rooms.pop();
        }
    }

    mySpawns['Spawn1'].memory.need_keeperKiller = undefined;
    mySpawns['Spawn1'].memory.need_keeperHealer = undefined;
    mySpawns['Spawn1'].memory.need_keeperCarrier = undefined;
    mySpawns['Spawn1'].memory.need_keeperFarmer = undefined;


    if (mySpawns['Spawn1'].memory.keepers_rooms != undefined && mySpawns['Spawn1'].memory.keepers_rooms.length > 0
        && mySpawns['Spawn1'].room.controller.level >= 5) {
        for (let keeper_room of mySpawns['Spawn1'].memory.keepers_rooms) {
            if (keeper_room.keeperKiller == undefined && mySpawns['Spawn1'].memory.need_keeperKiller == undefined) {
                mySpawns['Spawn1'].memory.need_keeperKiller = keeper_room.name;
            }
            if (keeper_room.keeperHealer == undefined && mySpawns['Spawn1'].memory.need_keeperHealer == undefined) {
                mySpawns['Spawn1'].memory.need_keeperHealer = keeper_room.name;
            }

            if (keeper_room.carry_power < keeper_room.harvesting_power && keeper_room.carry_power < 50 && mySpawns['Spawn1'].memory.need_keeperCarrier == undefined
                && keeper_room.carriers < keeper_room.max_carriers) {
                mySpawns['Spawn1'].memory.need_keeperCarrier = keeper_room.name;
            }
            if (keeper_room.harvesting_power < 40 && keeper_room.farmers < keeper_room.max_farmers && mySpawns['Spawn1'].memory.need_keeperFarmer == undefined
                && keeper_room.farmers < keeper_room.max_farmers && keeper_room.keeperKiller != undefined && keeper_room.keeperHealer != undefined) {
                mySpawns['Spawn1'].memory.need_keeperFarmer = keeper_room.name;
            }
        }
    }
    console.log('KeeperKiller, keeperHealer, keeperCarrier, keeperFarmer');
    console.log(mySpawns['Spawn1'].memory.need_keeperKiller, "  ", mySpawns['Spawn1'].memory.need_keeperHealer, "  ",
        mySpawns['Spawn1'].memory.need_keeperCarrier, "  ", mySpawns['Spawn1'].memory.need_keeperFarmer);



    mySpawns['Spawn1'].memory.req_repairers = 0;// 1 - (100 * mySpawns['Spawn1'].memory.req_towerKeepers);

    mySpawns['Spawn1'].memory.need_DistanceCarrier = undefined;
    mySpawns['Spawn1'].memory.need_farmer = undefined;
    mySpawns['Spawn1'].memory.need_distanceRepairer = undefined;
    mySpawns['Spawn1'].memory.need_soldier = undefined;
    mySpawns['Spawn1'].memory.need_reserver = undefined;
    if (mySpawns['Spawn1'].memory.farming_rooms != undefined && mySpawns['Spawn1'].memory.farming_rooms.length > 0 &&
        (mySpawns['Spawn1'].memory.rooms_to_scan != undefined)) {
        //mySpawns['Spawn1'].memory.need_DistanceCarrier = undefined;
        //  CARRIERS //
        for (let i = 0; i < mySpawns['Spawn1'].memory.farming_rooms.length; i++) {
            if (mySpawns['Spawn1'].memory.farming_rooms[i].carry_power < mySpawns['Spawn1'].memory.farming_rooms[i].sources_num * 10
                && mySpawns['Spawn1'].memory.farming_rooms[i].carry_power < mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power) {
                if (Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name] != undefined && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', mySpawns['Spawn1'].memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }
                mySpawns['Spawn1'].memory.need_DistanceCarrier = mySpawns['Spawn1'].memory.farming_rooms[i].name;

                break;
            }
        }

        //mySpawns['Spawn1'].memory.need_farmer = undefined;
        //  FARMERS //
        for (let i = 0; i < mySpawns['Spawn1'].memory.farming_rooms.length; i++) {
            if (mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power < mySpawns['Spawn1'].memory.farming_rooms[i].sources_num * 11
                && mySpawns['Spawn1'].memory.farming_rooms[i].farmers < mySpawns['Spawn1'].memory.farming_rooms[i].max_farmers) {

                if (Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name] != undefined
                    && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', mySpawns['Spawn1'].memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }
                mySpawns['Spawn1'].memory.need_farmer = mySpawns['Spawn1'].memory.farming_rooms[i].name;
                //consone.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
                //break;
            }
        }

        // REPAIRERS //
        for (let i = 0; i < mySpawns['Spawn1'].memory.farming_rooms.length; i++) {
            if (mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power > 0 && mySpawns['Spawn1'].memory.farming_rooms[i].distanceRepairer == undefined) {

                if (Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name] != undefined && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation != undefined
                    && Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name].controller.reservation.username == 'Invader') {
                    //console.log('ROom: ', mySpawns['Spawn1'].memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }
                mySpawns['Spawn1'].memory.need_distanceRepairer = mySpawns['Spawn1'].memory.farming_rooms[i].name;

                break;
            }
        }

        //  SOLDIERS //

        if (Game.time % 1 == 0) {
            loop1:
            for (let myRoom in Game.rooms) {
                for (let keeperRoom of mySpawns['Spawn1'].memory.keepers_rooms) {
                    if (myRoom == keeperRoom.name) {
                        console.log("ignoring hostile at: ", keeperRoom.name);
                        continue loop1;
                    }
                }
                if (Game.rooms[myRoom].name != mySpawns['Spawn1'].room.name) {
                    var is_farming_room = false;
                    for (let farmingRoom of mySpawns['Spawn1'].memory.farming_rooms) {
                        if (myRoom == farmingRoom.name) {
                            is_farming_room = true;
                            break;
                        }
                    }
                    if (is_farming_room == true) {
                        var hostile = Game.rooms[myRoom].find(FIND_HOSTILE_CREEPS);
                        if (hostile != undefined) {
                            if (hostile.length == 0) {
                                hostile = Game.rooms[myRoom].find(FIND_STRUCTURES, {
                                    filter: function (structure) {
                                        return structure.structureType == STRUCTURE_INVADER_CORE;
                                    }
                                });
                            }

                            if (hostile.length > 0) {
                                mySpawns['Spawn1'].memory.need_soldier = Game.rooms[myRoom].name;

                                break;
                            }
                        }
                    }

                }

            }
        }

        // RESERVERS //


        for (let i = 0; i < mySpawns['Spawn1'].memory.farming_rooms.length; i++) {




            if (mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power > 0 && mySpawns['Spawn1'].memory.farming_rooms[i].reserver == undefined
                && mySpawns['Spawn1'].memory.farming_rooms[i].name != mySpawns['Spawn1'].room.name) {

                /*
                if (Game.rooms[mySpawns['Spawn1'].memory.farming_rooms[i].name] != undefined) {
                    //console.log('ROom: ', mySpawns['Spawn1'].memory.farming_rooms[i].name, ' reserved by invader');
                    continue;
                }*/

                mySpawns['Spawn1'].memory.need_reserver = mySpawns['Spawn1'].memory.farming_rooms[i].name;

                break;
            }
        }
        console.log('need DistanceCarrier: ', mySpawns['Spawn1'].memory.need_DistanceCarrier, ' | need farmer: ', mySpawns['Spawn1'].memory.need_farmer,
            ' | need distanceRepairer ', mySpawns['Spawn1'].memory.need_distanceRepairer, ' | need soldier', mySpawns['Spawn1'].memory.need_soldier,
            ' | need reserver ', mySpawns['Spawn1'].memory.need_reserver);



        //console.log('Need farmer: ',mySpawns['Spawn1'].memory.need_farmer);
        //console.log('Need DistanceCarrier: ',mySpawns['Spawn1'].memory.need_DistanceCarrier);
        mySpawns['Spawn1'].memory.req_reservers = mySpawns['Spawn1'].memory.farming_rooms.length * 1; // role num 13
        //mySpawns['Spawn1'].memory.req_farmers = mySpawns['Spawn1'].memory.farming_rooms.length*2;
        //mySpawns['Spawn1'].memory.req_DistanceCarriers=mySpawns['Spawn1'].memory.farming_rooms.length*2;//role num 14
        mySpawns['Spawn1'].memory.req_soldiers = mySpawns['Spawn1'].memory.farming_rooms.length * 0;



    }
    else {
        mySpawns['Spawn1'].memory.req_reservers = 0;
        mySpawns['Spawn1'].memory.req_farmers = 0;
        mySpawns['Spawn1'].memory.req_DistanceCarriers = 0;
        mySpawns['Spawn1'].memory.req_soldiers = 0;
    }

    if (mySpawns['Spawn1'].memory.claiming_rooms == undefined && mySpawns['Spawn1'].memory.claiming_rooms.length > 0) {
        mySpawns['Spawn1'].memory.req_claimers = mySpawns['Spawn1'].memory.claiming_rooms.length;
        //mySpawns['Spawn1'].memory.claiming_rooms.push('E3N59');
        //mySpawns['Spawn1'].memory.req_berserk = mySpawns['Spawn1'].memory.claiming_rooms.length*2;
        mySpawns['Spawn1'].memory.req_distanceBuilders = 2 * mySpawns['Spawn1'].memory.claiming_rooms.length;//role num12
    }
    else {
        mySpawns['Spawn1'].memory.req_claimers = 0;
        //mySpawns['Spawn1'].memory.req_berserk =0;
        mySpawns['Spawn1'].memory.req_distanceBuilders = 0;
    }




    var terminal = mySpawns['Spawn1'].room.terminal;
    if (terminal != undefined && terminal.length > 0) {
        mySpawns['Spawn1'].memory.req_merchants = 1;
    }
    else {
        mySpawns['Spawn1'].memory.req_merchants = 0;
    }

    //EXTRACTOR
    if (mySpawns['Spawn1'].memory.extractor == undefined) {
        var extractor = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_EXTRACTOR;
            }
        });
        if (extractor.length > 0) {
            mySpawns['Spawn1'].memory.extractor = extractor[0].id;
        }

    }

    //MINERAL
    if (mySpawns['Spawn1'].memory.mineral == undefined) {
        var mineral = mySpawns['Spawn1'].room.find(FIND_MINERALS);
        if (mineral.length > 0) {
            mySpawns['Spawn1'].memory.mineral = mineral[0].id;
        }

    }

    if (Game.getObjectById(mySpawns['Spawn1'].memory.extractor) != null &&
        Game.getObjectById(mySpawns['Spawn1'].memory.mineral) != null && Game.getObjectById(mySpawns['Spawn1'].memory.mineral).mineralAmount > 0) {
        mySpawns['Spawn1'].memory.req_miners = 1;
    }
    else {
        mySpawns['Spawn1'].memory.req_miners = 0;
    }


    if (mySpawns['Spawn1'].room.controller.level >= 6 && Game.time % 1400 == 1) {
        var labs = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_LAB;
            }
        });
        if (labs != undefined && labs.length > 0) {
            //mySpawns['Spawn1'].memory.req_doctors=1;
            mySpawns['Spawn1'].memory.req_doctors = 1;
        }
    }
    else {
        mySpawns['Spawn1'].memory.req_doctors = 0;
    }





    if (Game.time % 2000 == 0) {
        mySpawns['Spawn1'].memory.progress = 0;
        mySpawns['Spawn1'].memory.progress_old = 0;
        mySpawns['Spawn1'].memory.progress_sum = 0;
        mySpawns['Spawn1'].memory.progress_counter = 0;
    }
    if (mySpawns['Spawn1'].memory.reservers_counter == undefined || mySpawns['Spawn1'].memory.reservers_counter > 500) {
        mySpawns['Spawn1'].memory.reservers_counter = 0;
    }
    if (mySpawns['Spawn1'].memory.soldiers_counter == undefined || mySpawns['Spawn1'].memory.soldiers_counter > 500) {
        mySpawns['Spawn1'].memory.soldiers_counter = 0;
    }

    for (let i = 0; i < mySpawns['Spawn1'].memory.keepers_rooms.length; i++) {
        if (mySpawns['Spawn1'].memory.keepers_rooms[i].carry_power == undefined) {
            mySpawns['Spawn1'].memory.keepers_rooms[i].carry_power = 0;
        }
        if (mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power == undefined) {
            mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power = 0;
        }
        if (mySpawns['Spawn1'].memory.keepers_rooms[i].max_carriers == undefined) {
            mySpawns['Spawn1'].memory.keepers_rooms[i].max_carriers = 6;
        }
        if (mySpawns['Spawn1'].memory.keepers_rooms[i].max_farmers == undefined || true) {
            mySpawns['Spawn1'].memory.keepers_rooms[i].max_farmers = 3;
        }

    }


}
module.exports = setRequiredPopulation;