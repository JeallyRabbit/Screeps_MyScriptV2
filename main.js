var roleHarvester = require('role.harvester');
var roleCarrier = require('role.carrier');
var roleHauler = require('role.hauler');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer')
var roleSoldier = require('role.soldier');
var roleFarmer = require('role.farmer');
var roleBerserk = require('role.berserk');
var roleTransporter = require('role.transporter');
var towers = require('towers');
var links = require('links');
var terminal = require('terminal');
var lab = require('labs');
var roleTowerKeeper = require('role.TowerKeeper');
var roleClaimer = require('role.Claimer');
var roleDistanceBuilder = require('role.DistanceBuilder');
var roleReserver = require('role.reserver');
var roleDistanceCarrier = require('role.DistanceCarrier');
var roleKeeperKiller = require('role.keeper_killer');
var roleKeeperHealer = require('role.keeper_healer');
var roleKeeperCarrier = require('role.keeper_carrier');
var roleKeeperFarmer = require('role.keeper_farmer');
var roleMerchant = require('role.merchant');
var roleMiner = require('role.miner');
var roleDoctor = require('role.doctor');
var _ = require('lodash');

const profiler = require('screeps-profiler');
const setRequiredPopulation = require('setRequiredPopulation');



const maxHarvester = require('maxHarvester');
const maxRepairer = require('maxRepairer');
const maxBuilder = require('maxBuilder');
const maxHauler = require('maxHauler');
const maxUpgrader = require('maxUpgrader');
const maxCarrier = require('maxCarrier');
const maxTransporter = require('maxTransporter');
const maxFarmer = require('maxFarmer');
const minSource = require('minSource');
const maxClaimer = require('maxClaimer');
const maxDistanceBuilder = require('maxDistanceBuilder');

var RoomPositionFunctions = require('roomPositionFunctions');
const maxSoldier = require('./maxSoldier');
const maxReserver = require('./maxReserver');
const setBaseLayout = require('./setBaseLayout');
const maxKeeperFarmer = require('./maxKeeperFarmer');
const { pos_exchange } = require('./pos_exchange');




profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function () {

        for (var i in Memory.creeps) {  //clearing data about dead creeps
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        //var mySpawns=Game.spawns;
        
        var pop_harvesters = 0;
        var pop_carriers = 0;
        var pop_builders = 0;
        var pop_upgraders = 0;
        var pop_repairers = 0;
        var pop_haulers = 0;
        var pop_soldiers = 0;
        var pop_farmers = 0;
        var pop_berserkers = 0;
        var pop_transporters = 0;
        var pop_towerKeepers = 0;
        var pop_claimers = 0;
        var pop_distanceBuilders = 0;
        var pop_reservers = 0;
        var pop_distanceCarriers = 0;
        var pop_keeperKillers = 0;
        var pop_keeperHealers = 0;
        var pop_keeperCarriers = 0;
        var pop_keeperFarmers = 0;
        var smallest_carrier = 100;
        var pop_merchants = 0;
        var pop_miners = 0;
        var pop_doctors = 0;
        var carrying_power = 0;


        for (let spawnName in Game.spawns) {
            
            /*
            const myRooms = Object.keys(Game.rooms).filter(roomName => {
                const room = Game.rooms[roomName];
                return room.controller && room.controller.my;
            });*/

            var spawn = Game.spawns[spawnName];
            if (spawnName != 'Spawn1') {
                spawn.memory=Game.spawns['Spawn1'].memory;

            }
            else{
                if (Game.time % 1 == 0) {
                    setRequiredPopulation(Game.spawns);
                    if (Game.cpu.bucket == 10000) {
                        Game.cpu.generatePixel();
                    }
        
                }
            }

            if (spawn == undefined) { continue; }
            if (spawnName == 'Spawn1') {

                //spawn.memory.avg_source_dist=undefined;
                if(spawn.memory.avg_source_dist==undefined)
                {
                    spawn.memory.avg_source_dist=0;
                    var room_sources=spawn.room.find(FIND_SOURCES);
                    if(room_sources!=undefined && room_sources.length>0)
                    {
                        for(const room_source of room_sources)
                        {
                            spawn.memory.avg_source_dist+=spawn.pos.findPathTo(room_source).length;
                            //console.log("distance: ",spawn.pos.findPathTo(room_source).length);
                        }
                        spawn.memory.avg_source_dist/=room_sources.length;
                    }
                }

                if (Game.time % 50 == 0) {
                    setBaseLayout(spawn);
                }
                if (Game.time % 1 == 0) {
                    spawn.memory.progress_old = spawn.memory.progress;
                    spawn.memory.progress = spawn.room.controller.progress;
                    if (spawn.memory.progress_old != 0) {
                        spawn.memory.progress_sum += (spawn.memory.progress - spawn.memory.progress_old);
                    }
                    spawn.memory.progress_counter += 1;

                    var hostile_creeps = spawn.room.find(FIND_HOSTILE_CREEPS);
                    console.log("hostile_Creeps: ", hostile_creeps);
                    if (hostile_creeps.length == 0) {
                        spawn.memory.req_soldiers = 1;
                    }
                    else {
                        //spawn.memory.req_soldiers=3;
                    }
                }

                //const room=Game.rooms[myRooms[0]];
            const sources = spawn.room.find(FIND_SOURCES);
            //console.log(sources_hp.length);
            var sources_hp = [];// harvesting power assigned to every source in my room (working only for first room)
            for (let i = 0; i < sources.length; i++) {
                sources_hp[i] = 0;
            }
            var terminals = spawn.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_TERMINAL;
                }
            });
            towers.tick(spawn);
            links.tick(spawn);
            terminal.tick(spawn);
            lab.tick(spawn);


            for (var name in Game.creeps) {
                var creep = Game.creeps[name];
                if (creep.memory.home_room.name == spawn.room.name) {
                    //creep.memory.my_path=undefined;
                    if (creep.memory.role == 'harvester') {
                        if (creep.ticksToLive > 50) {
                            const workParts = _.filter(creep.body, { type: WORK }).length;
                            creep.memory.harvesting_power = workParts * 2;
                            sources_hp[creep.memory.target_source] += creep.memory.harvesting_power;
                            pop_harvesters++;
                        }
                        roleHarvester.run(creep, spawn);
                    }
                    else if (creep.memory.role == 'carrier') {
                        //creep.suicide();
                       // if(creep.memory.)
                        if(creep.memory.carry_speed==undefined)
                        {
                            creep.memory.carry_speed=creep.store.getCapacity()/(spawn.memory.avg_source_dist*2);
                        }


                        roleCarrier.run(creep, spawn);
                        if (creep.ticksToLive > 100) {
                            pop_carriers++;
                        }
                        if (creep.body.length < smallest_carrier) {
                            smallest_carrier = creep.body.length;
                        }
                    }
                    else if (creep.memory.role == 'upgrader') {
                        roleUpgrader.run(creep, spawn);
                        if (creep.ticksToLive > 50) {
                            pop_upgraders++;
                        }
                    }
                    else if (creep.memory.role == 'hauler') {
                        roleHauler.run(creep, spawn);
                        if (creep.ticksToLive > 50) {
                            pop_haulers++;
                        }

                    }
                    else if (creep.memory.role == 'builder') {
                        roleBuilder.run(creep, spawn);
                        if (creep.ticksToLive > 50) {
                            pop_builders++;
                        }
                    }
                    else if (creep.memory.role == 'repairer') {
                        pop_repairers++;
                        roleRepairer.run(creep, spawn);
                    }
                    else if (creep.memory.role == 'soldier') {
                        roleSoldier.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_soldiers++;
                        }

                    }
                    else if (creep.memory.role == 'farmer') {
                        //creep.suicide();
                        const workParts = _.filter(creep.body, { type: WORK }).length;
                        creep.memory.harvesting_power = workParts * 2;
                        //sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                        roleFarmer.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_farmers++;
                        }


                    }
                    else if (creep.memory.role == 'berserk') {
                        //creep.suicide();
                        roleBerserk.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_berserkers++;
                        }
                    }
                    else if (creep.memory.role == 'transporter') {
                        roleTransporter.run(creep, spawn);
                        if (creep.ticksToLive > 50) {
                            pop_transporters++;
                        }
                    }
                    else if (creep.memory.role == 'towerKeeper') {
                        roleTowerKeeper.run(creep, spawn);
                        if (creep.ticksToLive > 50) {
                            pop_towerKeepers++;
                        }
                    }
                    else if (creep.memory.role == 'claimer') {
                        //console.log("CLAIMING");
                        roleClaimer.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_claimers++;
                        }
                    }
                    else if (creep.memory.role == 'distanceBuilder') {
                        roleDistanceBuilder.run(creep);
                        if (creep.ticksToLive > 200) {
                            pop_distanceBuilders++;
                        }
                    }
                    else if (creep.memory.role == 'reserver') {
                        roleReserver.run(creep);
                        if (creep.ticksToLive > 200) {
                            pop_reservers++;
                        }
                    }
                    else if (creep.memory.role == 'distanceCarrier') {
                        //creep.suicide();
                        if (creep.memory.carrying_power != undefined) {
                            carrying_power += creep.memory.carrying_power;
                        }
                        roleDistanceCarrier.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_distanceCarriers++;
                        }
                    }
                    else if (creep.memory.role == 'keeperKiller') {
                        //creep.suicide();
                        roleKeeperKiller.run(creep, spawn);
                        if (creep.ticksToLive > 250) {
                            pop_keeperKillers++;
                        }
                    }
                    else if (creep.memory.role == 'keeperHealer') {
                        roleKeeperHealer.run(creep, spawn);
                        if (creep.ticksToLive > 250) {
                            pop_keeperHealers++;
                        }
                    }
                    else if (creep.memory.role == 'keeperCarrier') {
                        //creep.suicide();
                        roleKeeperCarrier.run(creep, spawn);
                        if (creep.ticksToLive > 200) {
                            pop_keeperCarriers++;
                        }
                    }
                    else if (creep.memory.role == 'keeperFarmer') {
                        roleKeeperFarmer.run(creep, spawn);
                        if (creep.ticksToLive > 100) {
                            pop_keeperFarmers++;
                        }
                    }
                    else if (creep.memory.role == 'merchant') {
                        roleMerchant.run(creep, spawn);
                        pop_merchants++;
                    }
                    else if (creep.memory.role == 'miner') {
                        roleMiner.run(creep);
                        pop_miners++;
                    }
                    else if (creep.memory.role == 'doctor') {
                        roleDoctor.run(creep, spawn)
                        pop_doctors++;
                    }
                    pos_exchange(creep);
                }
            }
        }

            //console.log(spawn.room.controller.progress);

            var energyCap = spawn.room.energyAvailable;

            var storage = spawn.room.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_STORAGE
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if (storage != undefined && storage.length > 0 && pop_haulers > 0) {
                var rcl = spawn.room.controller.level;
                var max_energy = 300;
                if (rcl == 2) { max_energy = 550; }
                else if (rcl == 3) { max_energy = 800; }
                else if (rcl == 4) { max_energy = 1300; }
                else if (rcl == 5) { max_energy = 1800; }
                else if (rcl == 6) { max_energy = 2300; }
                else if (rcl == 7) { max_energy = 5600; }
                else { max_energy = 12900; }
                if (storage[0].store[RESOURCE_ENERGY] > max_energy/3 && energyCap < max_energy / 3) {
                    energyCap = max_energy / 3;
                  //  console.log("changing energy cap");
                }
            }
            //console.log("energyCap: ", energyCap);
            //console.log("carrying power: ", carrying_power);

            
            console.log("-----------------------", spawn, "---------------------------------");
            console.log("Harvesters:", pop_harvesters, "/", spawn.memory.req_harvesters, " | ",
                "Carriers: ", pop_carriers, "/", spawn.memory.req_carriers, " | ",
                "Upgraders: ", pop_upgraders, "/", spawn.memory.req_upgraders, " | ",
                "Builders: ", pop_builders, "/", spawn.memory.req_builders, " | ",
                "Repairers: ", pop_repairers, "/", spawn.memory.req_repairers);

            console.log("haulers: ", pop_haulers, "/", spawn.memory.req_haulers, " | ",
                "Soldiers: ", pop_soldiers, "/", spawn.memory.req_soldiers, " | ",
                "Farmers: ", pop_farmers, "/", spawn.memory.req_farmers, " | ",
                'Berskerkers: ', pop_berserkers, "/", spawn.memory.req_berserk, " | ",
                "Transporters: ", pop_transporters, "/", spawn.memory.req_transporters);

            console.log("TowerKeepers: ", pop_towerKeepers, "/", spawn.memory.req_towerKeepers, " | ",
                "Claimers: ", pop_claimers, "/", spawn.memory.req_claimers, " | ",
                "DistanceBuilders: ", pop_distanceBuilders, "/", spawn.memory.req_distanceBuilders, " | ",
                "Reservers: ", pop_reservers, "/", spawn.memory.req_reservers);

            console.log("DistanceCarriers: ", pop_distanceCarriers, "/", spawn.memory.req_DistanceCarriers, " | ",
                "Keeper Killers: ", pop_keeperKillers, "/", spawn.memory.req_keeperKillers, " | ",
                "Keeper Healers: ", pop_keeperHealers, "/", spawn.memory.req_keeperHealers, " | ",
                "Keeper Carriers: ", pop_keeperCarriers, "/", spawn.memory.req_keeperCarriers, " | ",
                "Keeper Farmers: ", pop_keeperFarmers, "/", spawn.memory.req_keeperFarmers);
            console.log("Farmers_counter: ", spawn.memory.farmers_counter,
                " | distance_carriers_counter: ", spawn.memory.distance_carriers_counter,
                " | reservers_counter: ", spawn.memory.reservers_counter,
                " | soldiers_counter: ", spawn.memory.soldiers_counter);
            console.log("Merchants: ", pop_merchants, "/", spawn.memory.req_merchants,
                " | Miners: ", pop_miners, "/", spawn.memory.req_miners);
            console.log("Doctors: ", pop_doctors, "/", spawn.memory.req_doctors);
            if (spawn.memory.progress != 0 && spawn.memory.progress_old != 0 &&
                spawn.memory.progress_sum != 0 && spawn.memory.progress_counter > 4 &&
                spawn.memory.progress != spawn.memory.progress_old) {
                console.log("Progress/tick: ", (spawn.memory.progress_sum / spawn.memory.progress_counter));
                //console.log("Spawn points: ",spawn.memory.progress);
            }
            



            if (pop_keeperKillers > 0 && pop_keeperHealers == 0 && spawn.memory.keepers_rooms.length>0) {
                var healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                if (spawn.room.controller.level == 5) {
                    healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                }
                if (spawn.spawnCreep(healer_body, 'KeeperHealer' + Game.time, { memory: { role: 'keeperHealer', target: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                    console.log("Spawning KeeperHealer");
                    return;
                }
            }
            if (pop_keeperHealers > 0 && pop_keeperKillers == 0 && spawn.memory.keepers_rooms.length>0 ) {
                var killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                if (spawn.room.controller.level >= 6) {
                    killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                }
                if (spawn.room.controller.level == 7) {
                    killer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                }
                if (spawn.spawnCreep(killer_body, 'KeeperKiller' + Game.time, { memory: { role: 'keeperKiller', target: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                    console.log("Spawning KeeperKiller");
                    return;
                }
            }
            if(pop_keeperKillers>0 && pop_keeperHealers>0)
            {
                if (spawn.spawnCreep(maxHauler(energyCap, spawn, false), 'KeeperCarrier' + Game.time, { memory: { role: 'keeperCarrier', target_room: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                    console.log("Spawning KeeperCarrier");
                    return;
                }
            }

            //console.log("ASDASD");

            if (pop_harvesters < spawn.memory.req_harvesters /* && spawn.memory.roles_counter==0*/) // spawning new harvester
            {
                var assigned_source = -1;
                var assigned_source = minSource(sources_hp);

                //console.log("assigned_source: ", sources_hp[assigned_source]);
                if (assigned_source >= 0 && sources_hp[assigned_source] < 12) {
                    if (spawn.spawnCreep(maxHarvester(energyCap), 'Harvester' + Game.time, {
                        memory: {
                            role: 'harvester',
                            target_source: assigned_source, home_room: spawn.room
                        }
                    }) == 0) {
                        const workParts = _.filter(creep.body, { type: WORK }).length;
                        //creep.say(workParts);
                        creep.memory.harvesting_power = workParts * 2;
                        sources_hp[assigned_source] += energyCap / 150;//harvesting power approximately
                        console.log('Spawning Harvester');
                        return;
                    }
                    else {
                        //console.log("not spawned");
                        //console.log(spawn.spawnCreep(maxHarvester(energyCap),'Harvester'+Game.time, {memory: {role: 'harvester',
                        //target_source: assigned_source, home_room: spawn.room}}));
                    }

                }
            }
            if (pop_carriers < spawn.memory.req_carriers && pop_carriers <= pop_harvesters) // spawning new Carrier
            {
                if (spawn.spawnCreep(maxCarrier(energyCap, spawn), 'Carrier' + Game.time, { memory: { role: 'carrier', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Carrier');
                    return;
                }
            }
            if (pop_soldiers < spawn.memory.req_soldiers) {
                if (spawn.spawnCreep(maxSoldier(energyCap), 'Soldier' + Game.time, {
                    memory: {
                        role: 'soldier', target:
                            spawn.memory.farming_rooms[spawn.memory.soldiers_counter % spawn.memory.farming_rooms.length], home_room: spawn.room
                    }
                }) == 0) {
                    spawn.memory.soldiers_counter++;
                    console.log("Spawning Soldier");
                    return;
                }
                /*
                else{
                    console.log("spawning soldier result");
                    console.log(spawn.spawnCreep(maxSoldier(energyCap),'Soldier'+Game.time,{memory: {role: 'soldier', target: 'E34N53',home_room: spawn.room}}));
                }*/
            }
            if (pop_berserkers < spawn.memory.req_berserk /*&& spawn.memory.roles_counter==8 */ && pop_harvesters > 0) {
                if (spawn.spawnCreep([TOUGH, TOUGH, MOVE, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE], 'Berserker' + Game.time, { memory: { role: 'berserk', home_room: spawn.room, target_room: 'W2N8' } }) == 0) {//costs 520 energy
                    console.log("Spawning Berserker");
                    // return;
                }
            }
            if (pop_farmers < spawn.memory.req_farmers/* && spawn.memory.roles_counter==2 */ && pop_harvesters > 0
                && pop_farmers <= pop_distanceCarriers + 2)//spawning new farmer
            {
                //console.log("ASD");
                //if(pop_farmers==0){pop_farmers=1;}
                if (spawn.spawnCreep(maxFarmer(energyCap, spawn, true), 'Farmer' + Game.time, {
                    memory: {
                        role: 'farmer', home_room: spawn.room,
                        target_room: spawn.memory.farming_rooms[spawn.memory.farmers_counter % spawn.memory.farming_rooms.length], path: undefined
                    }
                }) == 0) {
                    console.log("Spawning Farmer");
                    spawn.memory.farmers_counter++;
                    return;
                }
            }
            if (pop_builders < spawn.memory.req_builders /* && spawn.memory.roles_counter==3*/ && pop_carriers >= spawn.memory.req_carriers) // spawning new builder
            {
                console.log(spawn.spawnCreep(maxBuilder(energyCap, spawn), 'Builder' + Game.time, { memory: { role: 'builder', home_room: spawn.room } }));
                if (spawn.spawnCreep(maxBuilder(energyCap / 2, spawn), 'Builder' + Game.time, { memory: { role: 'builder', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Builder');
                    return;
                }
            }
            if (pop_haulers < spawn.memory.req_haulers && pop_carriers >= spawn.memory.req_carriers)//spawning new hauler
            {
                if (spawn.spawnCreep(maxCarrier(energyCap, spawn), 'hauler' + Game.time, { memory: { role: 'hauler', home_room: spawn.room, cID_min: -1, cID_max: -1 } }) == 0) {
                    console.log("Spawning hauler");
                    return;
                }
            }
            if (pop_upgraders < spawn.memory.req_upgraders && pop_carriers >= spawn.memory.req_carriers) // spawning new upgrader
            {
                if (spawn.spawnCreep(maxUpgrader(energyCap, spawn), 'Upgrader' + Game.time, { memory: { role: 'upgrader', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Upgrader');
                    return;
                }
            }
            if (pop_repairers < spawn.memory.req_repairers /*&& spawn.memory.roles_counter==6*/ && pop_carriers >= spawn.memory.req_carriers / 2)//spawning new repairer
            {
                if (spawn.spawnCreep(maxRepairer(energyCap), 'Repairer' + Game.time, { memory: { role: 'repairer', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Repairer');
                    return;
                }
            }
            if (pop_transporters < spawn.memory.req_transporters /* && spawn.memory.roles_counter==9*/ && pop_carriers > 0) {
                var storages_num = spawn.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_STORAGE }
                });
                if (storages_num.length > 0) {
                    if (spawn.spawnCreep(maxTransporter(energyCap, spawn), 'Transporter' + Game.time, { memory: { role: 'transporter', home_room: spawn.room } }) == 0) {
                        console.log('Spawning Transporter')
                        return;
                    }
                }

            }
            if (pop_towerKeepers < spawn.memory.req_towerKeepers /* && spawn.memory.roles_counter==10 */ && pop_carriers >= spawn.memory.req_carriers) {
                if (spawn.spawnCreep(maxTransporter(energyCap % 1000, spawn), 'TowerKeeper' + Game.time, { memory: { role: 'towerKeeper', home_room: spawn.room } }) == 0) {
                    console.log('Spawning TowerKeeper')
                    return;
                }


            }
            if (pop_claimers < spawn.memory.req_claimers && spawn.memory.claiming_rooms.length > 0) {
                //if(pop_claimers==0){pop_claimers=1;}
                if (spawn.spawnCreep(maxClaimer(energyCap), 'C' + Game.time, {
                    memory: {
                        role: 'claimer',
                        target_room: spawn.memory.claiming_rooms[pop_claimers % spawn.memory.claiming_rooms.length], path: undefined, home_room: spawn.room
                    }
                }) == 0) {
                    console.log('Spawning Claimer');
                    return;
                }
            }
            if (pop_distanceBuilders < spawn.memory.req_distanceBuilders && pop_farmers > 0/*&& spawn.memory.roles_counter==12 && pop_distanceCarriers<pop_farmers*/) {
                if (spawn.spawnCreep(maxDistanceBuilder(energyCap), 'DistanceBuilder' + Game.time, {
                    memory: {
                        role: 'distanceBuilder',
                        target_room: spawn.memory.claiming_rooms[pop_distanceBuilders % spawn.memory.claiming_rooms.length],
                        home_room: spawn.room, path: undefined, home_room: spawn.room
                    }
                }) == 0) {

                    console.log('Spawning DistanceBuilder');
                    return;
                }
            }
            if (pop_reservers < spawn.memory.req_reservers && spawn.memory.farming_rooms.length > 0 /* && spawn.memory.roles_counter==13*/
                && pop_farmers >= spawn.memory.req_farmers / 2) {
                //if(pop_reservers==0){pop_reservers=1;}
                if (spawn.spawnCreep(maxReserver(energyCap), 'R' + Game.time, {
                    memory: {
                        role: 'reserver',
                        target_room: spawn.memory.farming_rooms[spawn.memory.reservers_counter % spawn.memory.farming_rooms.length], path: undefined, home_room: spawn.room
                    }
                }) == 0) {
                    spawn.memory.reservers_counter++;
                    console.log('Spawning Reserver');
                    return;
                }
            }
            if (pop_distanceCarriers < spawn.memory.req_DistanceCarriers /* && spawn.memory.roles_counter==14 */ && pop_distanceCarriers <= pop_farmers
                && pop_harvesters >= spawn.memory.req_harvesters / 2)//spawning new DistanceCarrier
            {
                //console.log("ASD")
                if (spawn.spawnCreep(maxCarrier(energyCap, spawn, false), 'distnaceCarrier' + Game.time, {
                    memory: {
                        role: 'distanceCarrier', home_room: spawn.room,
                        target_room: spawn.memory.farming_rooms[spawn.memory.distance_carriers_counter % spawn.memory.farming_rooms.length], path: undefined
                    }
                }) == 0) {
                    spawn.memory.distance_carriers_counter++;
                    console.log("Spawning DistanceCarrier");
                    return;
                }
                /*
                else{
                    console.log("spawn result: ",spawn.spawnCreep(maxCarrier(energyCap,spawn,false),'distnaceCarrier'+Game.time,{memory: {role: 'distanceCarrier', home_room: spawn.room,
                    target_room: spawn.memory.farming_rooms[spawn.memory.distance_carriers_counter%spawn.memory.farming_rooms.length], path: undefined}}));
                }*/

            }
            if (pop_keeperKillers < spawn.memory.req_keeperKillers) {
                var killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                if (spawn.room.controller.level >= 6) {
                    killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                }
                if (spawn.spawnCreep(killer_body, 'KeeperKiller' + Game.time, { memory: { role: 'keeperKiller', target: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                    console.log("Spawning KeeperKiller");
                    return;
                }
            }
            if (pop_keeperHealers < spawn.memory.req_keeperHealers) {
                var healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                if (spawn.room.controller.level == 5) {
                    healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                }
                if (spawn.spawnCreep(healer_body, 'KeeperHealer' + Game.time, { memory: { role: 'keeperHealer', target: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                    console.log("Spawning KeeperHealer");
                    return;
                }
            }
            if (pop_keeperCarriers < spawn.memory.req_keeperCarriers && pop_keeperKillers > 0 && pop_keeperHealers > 0 && pop_keeperFarmers > 0) {
                if (energyCap > 1000) {
                    if (spawn.spawnCreep(maxHauler(energyCap, spawn, false), 'KeeperCarrier' + Game.time, { memory: { role: 'keeperCarrier', target_room: spawn.memory.keepers_rooms[0], home_room: spawn.room } }) == 0) {
                        console.log("Spawning KeeperCarrier");
                        return;
                    }
                }

            }
            if (pop_keeperFarmers < spawn.memory.req_keeperFarmers && pop_keeperKillers > 0 && pop_keeperHealers > 0) {
                var a = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK];
                if (spawn.spawnCreep(maxKeeperFarmer(energyCap, spawn), 'KeeperFarmer' + Game.time, { memory: { role: 'keeperFarmer', target_room: spawn.memory.keepers_rooms[0], home_room: spawn.room, closest_source: undefined } }) == 0) {
                    console.log("Spawning KeeperFarmer");
                    return;
                }
            }
            if (pop_merchants < spawn.memory.req_merchants && terminals != undefined) {
                if (spawn.spawnCreep([MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], 'Merchant' + Game.time, { memory: { role: 'merchant', home_room: spawn.room } }) == 0) {
                    console.log("Spawning Merchant");
                    return;
                }
            }
            if (pop_miners < spawn.memory.req_miners) {
                if (spawn.spawnCreep(maxFarmer(energyCap, spawn), 'Miner' + Game.time, { memory: { role: 'miner', home_room: spawn.room } }) == 0) {
                    console.log("Spawning Miner");
                    return;
                }
            }
            if (pop_doctors < spawn.memory.req_doctors) {
                if (spawn.spawnCreep([MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY], 'Doctor' + Game.time, { memory: { role: 'doctor', home_room: spawn.room } }) == 0) {
                    console.log("Spawning Doctor");
                    return;
                }
            }

            if (spawn.spawning != null /*&& Game.spawns['Spawn2'] != undefined*/) {
                
                var aux_role = Game.creeps[spawn.spawning.name].memory.role;
                console.log('spawning role: ', aux_role);
                if (aux_role == 'harvester') { pop_harvesters++; }
                else if (aux_role == "carrier") { pop_carriers++; }
                else if (aux_role == "upgrader") { pop_upgraders++; }
                else if (aux_role == "builder") { pop_builders++; }
                else if (aux_role == "repairer") { pop_repairers++; }
                else if (aux_role == "hauler") { pop_haulers++; }
                else if (aux_role == "soldier") { pop_soldiers++; }
                else if (aux_role == "farmer") { pop_farmers++; }
                else if (aux_role == "berserk") { pop_berserkers++; }
                else if (aux_role == "transporter") { pop_transporters++; }
                else if (aux_role == "towerKeeper") { pop_towerKeepers++; }
                else if (aux_role == "claimer") { pop_claimers++; }
                else if (aux_role == "distanceBuilder") { pop_distanceBuilders++; }
                else if (aux_role == "reserver") { pop_reservers++; }
                else if (aux_role == "distanceCarrier") { pop_distanceCarriers++; }
                else if (aux_role == "keeperKiller") { pop_keeperKillers++; }
                else if (aux_role == "keeperHealer") { pop_keeperHealers++; }
                else if (aux_role == "keeperCarrier") { pop_keeperCarriers++; }
                
                //console.log(Game.creeps[spawn.spawning.name].memory.role);
                /*
                if (spawn.spawning.remainingTime < spawn.spawning.needTime /* && energyCap > 1000
                && Game.spawns['Spawn2'].spawning==null) {
                    var aux_memory = spawn.memory;
                    spawn = Game.spawns['Spawn2'];
                    spawn.memory = aux_memory;
                    console.log("passing spawning to another spawn");

                }*/

            }

            

        }
    });
}