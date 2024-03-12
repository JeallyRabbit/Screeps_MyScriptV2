var roleHauler = require('role.hauler');
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer')
var roleSoldier = require('role.soldier');
var roleFarmer = require('role.farmer');
var roleBerserk = require('role.berserk');
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
var roleScout = require('role.scout');
var roleDistanceRepairer = require('role.distanceRepairer');
var roleFiller = require('role.filler');
var _ = require('lodash');

const Movement = require("screeps-movement");




const profiler = require('screeps-profiler');
const setRequiredPopulation = require('setRequiredPopulation');



const maxRepairer = require('maxRepairer');
const maxBuilder = require('maxBuilder');
const maxHauler = require('maxHauler');
const maxUpgrader = require('maxUpgrader');
const maxDistanceCarrier = require('maxDistanceCarrier');
const maxFarmer = require('maxFarmer');
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
        var pop_builders = 0;
        var pop_upgraders = 0;
        var pop_haulers = 0;
        var pop_berserkers = 0;
        var pop_towerKeepers = 0;
        var pop_claimers = 0;
        var pop_distanceBuilders = 0;
        var pop_reservers = 0;
        var pop_distanceCarriers = 0;
        var pop_merchants = 0;
        var pop_miners = 0;
        var pop_doctors = 0;
        var pop_scouts = 0;
        var pop_fillers = 0
        var spawned_body_parts = 0;
        var pop_soldiers = 0;

        if (Memory.main_spawns == undefined || Game.time % 127 == 0 || Memory.main_spawns == []) {
            for (let spawnName in Game.spawns) {
                Memory.main_spawns = [];
                var spawn = Game.spawns[spawnName];
                var name = spawn.name;
                var name_length = name.length;

                if (name[name_length - 1] == "1") {
                    //console.log('spawn Name: ',name[name_length - 1]);
                    Memory.main_spawns.push(spawn.id);
                    //console.log(Memory.main_spawns[0]);
                }
            }
        }




        for (let spawnName in Game.spawns) {

            var spawn = Game.spawns[spawnName];
            if (spawnName != 'Spawn1') {
                if (spawn.room.controller < 7) {
                    spawn.destroy();
                }
                spawn.memory = Game.spawns['Spawn1'].memory;
                continue;
                //return;
            }
            else {
                if (Game.time % 10== 0) {
                    setRequiredPopulation(Game.spawns);
                    if (Game.cpu.bucket == 10000) {
                        //Game.cpu.generatePixel();
                    }

                }
            }

            if (spawn == undefined) { continue; }
            if (spawnName == 'Spawn1') {
                //console.log("QQQQQQQQQQQQQQQQQQQQQQ");
                //delete spawn.memory;




                if (Game.time % 1007== 0 && Game.cpu.bucket > 400 ) {
                    setBaseLayout(spawn);
                    //return;
                }
                //spawn.memory.farming_rooms=undefined;
                //spawn.memory.rooms_to_scan=undefined;
                spawn.memory.progress_old = spawn.memory.progress;
                spawn.memory.progress = spawn.room.controller.progress;
                if (spawn.memory.progress_old != 0) {
                    spawn.memory.progress_sum += (spawn.memory.progress - spawn.memory.progress_old);
                }
                spawn.memory.progress_counter += 1;


                if (spawn.room.controller.level >= 3) {
                    towers.tick(spawn);

                    if (spawn.room.controller.level >= 5) {
                        links.tick(spawn);
                        if (spawn.room.controller.level >= 6) {
                            terminal.tick(spawn);
                            lab.tick(spawn);
                        }
                    }
                }

                if (spawn.memory.farming_rooms != undefined && spawn.memory.farming_rooms.length > 0) {
                    for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                        spawn.memory.farming_rooms[i].harvesting_power = 0;
                        spawn.memory.farming_rooms[i].carry_power = 0;
                        spawn.memory.farming_rooms[i].farmers = 0;
                        spawn.memory.farming_rooms[i].distanceRepairer = undefined;
                        spawn.memory.farming_rooms[i].soldier = undefined;
                        spawn.memory.farming_rooms[i].reserver = undefined;
                    }
                }

                if (spawn.memory.keepers_rooms != undefined && spawn.memory.keepers_rooms.length > 0) {
                    for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                        spawn.memory.keepers_rooms[i].harvesting_power = 0;
                        spawn.memory.keepers_rooms[i].carry_power = 0;
                        spawn.memory.keepers_rooms[i].farmers = 0;
                        spawn.memory.keepers_rooms[i].carriers = 0;
                        spawn.memory.keepers_rooms[i].keeperKiller = undefined;
                        spawn.memory.keepers_rooms[i].keeperHealer = undefined;
                    }
                }

                for (var name in Game.creeps) {
                    var creep = Game.creeps[name];
                    //creep.suicide();
                    if (creep.memory.home_room == undefined) { creep.suicide() }
                    if (creep.memory.home_room.name == spawn.room.name) {
                        //creep.memory.my_path=undefined;
                        //creep.suicide();
                        spawned_body_parts += creep.body.length;
                        if (creep.memory.role == 'upgrader') {
                            roleUpgrader.run(creep, spawn);
                            if (creep.ticksToLive > 50) {
                                pop_upgraders++;
                            }
                        }
                        else if (creep.memory.role == 'hauler') {
                            //creep.suicide();

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
                        else if (creep.memory.role == 'soldier') {
                            roleSoldier.run(creep, spawn);

                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (creep.memory.target_room == spawn.memory.farming_rooms[i].name) {
                                    if (creep.memory.target_room == spawn.memory.need_soldier) {
                                        spawn.memory.need_soldier = undefined;
                                    }
                                    spawn.memory.farming_rooms[i].soldier = creep.id;
                                }
                            }


                        }
                        else if (creep.memory.role == 'farmer') {
                            //creep.suicide();

                            if (creep.memory.harvesting_power == undefined) {
                                const workParts = _.filter(creep.body, { type: WORK }).length;
                                creep.memory.harvesting_power = workParts * 2;
                            }

                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (spawn.memory.farming_rooms[i].name == creep.memory.target_room) {
                                    spawn.memory.farming_rooms[i].harvesting_power += creep.memory.harvesting_power;
                                    spawn.memory.farming_rooms[i].farmers++;
                                    break;
                                }
                            }
                            //sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                            roleFarmer.run(creep, spawn);

                        }
                        else if (creep.memory.role == 'berserk') {
                            //creep.suicide();
                            roleBerserk.run(creep, spawn);
                            if (creep.ticksToLive > 200) {
                                pop_berserkers++;
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
                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (creep.memory.target_room == spawn.memory.farming_rooms[i].name) {
                                    if (creep.memory.target_room == spawn.memory.need_reserver) {
                                        spawn.memory.need_reserver = undefined;
                                    }
                                    spawn.memory.farming_rooms[i].reserver = creep.id;
                                }
                            }

                            if (creep.ticksToLive > 200) {
                                pop_reservers++;
                            }
                        }
                        else if (creep.memory.role == 'distanceCarrier') {
                            //creep.suicide();

                            roleDistanceCarrier.run(creep, spawn);

                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (spawn.memory.farming_rooms[i].name == creep.memory.target_room) {

                                    spawn.memory.farming_rooms[i].carry_power += creep.store.getCapacity() / (spawn.memory.farming_rooms[i].distance * 2);
                                    creep.memory.carry_power = creep.store.getCapacity() / (spawn.memory.farming_rooms[i].distance * 2);
                                }
                            }
                            pop_distanceCarriers++;
                        }
                        else if (creep.memory.role == 'distanceRepairer') {
                            roleDistanceRepairer.run(creep, spawn);
                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (creep.memory.target_room == spawn.memory.farming_rooms[i].name) {
                                    if (creep.memory.target_room == spawn.memory.need_distanceRepairer) {
                                        spawn.memory.need_distanceRepairer = undefined;
                                    }
                                    spawn.memory.farming_rooms[i].distanceRepairer = creep.id;
                                }
                            }
                        }
                        else if (creep.memory.role == 'keeperKiller') {
                            //creep.suicide();

                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target) {
                                    if (creep.memory.target == spawn.memory.need_keeperKiller) {
                                        spawn.memory.need_keeperKiller = undefined;
                                    }
                                    spawn.memory.keepers_rooms[i].keeperKiller = creep.id;
                                    break;
                                }
                            }
                            roleKeeperKiller.run(creep, spawn);
                        }
                        else if (creep.memory.role == 'keeperHealer') {
                            roleKeeperHealer.run(creep, spawn);
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target) {
                                    if (creep.memory.target == spawn.memory.need_keeperHealer) {
                                        spawn.memory.need_keeperHealer = undefined;
                                    }
                                    spawn.memory.keepers_rooms[i].keeperHealer = creep.id;
                                    break;
                                }
                            }
                        }
                        else if (creep.memory.role == 'keeperCarrier') {
                            //creep.suicide();
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target_room) {

                                    spawn.memory.keepers_rooms[i].carry_power += creep.store.getCapacity() / (spawn.memory.keepers_rooms[i].distance * 2);
                                    creep.memory.carry_power = creep.store.getCapacity() / (spawn.memory.keepers_rooms[i].distance * 2);
                                    spawn.memory.keepers_rooms[i].carriers++;
                                }
                            }

                            roleKeeperCarrier.run(creep, spawn);
                        }
                        else if (creep.memory.role == 'keeperFarmer') {
                            roleKeeperFarmer.run(creep, spawn);
                            const workParts = _.filter(creep.body, { type: WORK }).length;
                            //creep.say(workParts);
                            creep.memory.harvesting_power = workParts * 2;
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target_room) {
                                    spawn.memory.keepers_rooms[i].harvesting_power += creep.memory.harvesting_power;
                                    spawn.memory.keepers_rooms[i].farmers++;
                                    break;
                                }
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
                        else if (creep.memory.role == 'scout') {
                            roleScout.run(creep, spawn);
                            pop_scouts++;
                        }
                        else if (creep.memory.role == 'filler') {
                            roleFiller.run(creep, spawn);
                            pop_fillers++;
                        }
                        else {
                            creep.say('no role');
                        }
                        //pos_exchange(creep);
                    }
                }
            }

            //console.log(spawn.room.controller.progress);

            var energyCap = spawn.room.energyAvailable;

            if (spawn.room.storage != undefined && pop_haulers > 0 && false) {
                var rcl = spawn.room.controller.level;
                var max_energy = 300;
                if (rcl == 2) { max_energy = 550; }
                else if (rcl == 3) { max_energy = 800; }
                else if (rcl == 4) { max_energy = 1300; }
                else if (rcl == 5) { max_energy = 1800; }
                else if (rcl == 6) { max_energy = 2300; }
                else if (rcl == 7) { max_energy = 5600; }
                else { max_energy = 12900; }
                if (spawn.room.storage.store[RESOURCE_ENERGY] > max_energy / 3 && energyCap < max_energy / 3) {
                    energyCap = max_energy / 3;
                    //  console.log("changing energy cap");
                }
            }
            console.log("energyCap: ", energyCap);
            //console.log("carrying power: ", carrying_power);


            console.log("----------------------------------------------", spawn, "----------------------------------------------");
            console.log("Upgraders: ", pop_upgraders, "/", spawn.memory.req_upgraders, " | ",
                "Builders: ", pop_builders, "/", spawn.memory.req_builders, " | fillers:", pop_fillers, "/", spawn.memory.req_fillers,
                " | haulers: ", pop_haulers, "/", spawn.memory.req_haulers, " | TowerKeepers: ", pop_towerKeepers, "/", spawn.memory.req_towerKeepers,
                " | Claimers: ", pop_claimers, "/", spawn.memory.req_claimers, " | DistanceBuilders: ", pop_distanceBuilders, "/", spawn.memory.req_distanceBuilders,
                " | DistanceCarriers: ", pop_distanceCarriers, " | Doctors: ", pop_doctors, "/", spawn.memory.req_doctors, " | ",
                "Scouts: ", pop_scouts, "/", spawn.memory.req_scouts, " | ", "Spawned Body parts: ", spawned_body_parts, "/500");
            if (spawn.memory.progress != 0 && spawn.memory.progress_old != 0 &&
                spawn.memory.progress_sum != 0 && spawn.memory.progress_counter > 4 &&
                spawn.memory.progress != spawn.memory.progress_old) {
                console.log("Progress/tick: ", (spawn.memory.progress_sum / spawn.memory.progress_counter));
            }


            for (let spawnName2 in Game.spawns) {

                var spawn2 = Game.spawns[spawnName2];
                if (spawn2.spawning) {
                    var aux_role = Game.creeps[spawn2.spawning.name].memory.role;
                    console.log('spawning role: ', aux_role);
                    if (aux_role == "upgrader") { pop_upgraders++; }
                    else if (aux_role == "builder") { pop_builders++; }
                    else if (aux_role == "hauler") { pop_haulers++; }
                    else if (aux_role == "soldier") { pop_soldiers++; }
                    else if (aux_role == "berserk") { pop_berserkers++; }
                    else if (aux_role == "towerKeeper") { pop_towerKeepers++; }
                    else if (aux_role == "claimer") { pop_claimers++; }
                    else if (aux_role == "distanceBuilder") { pop_distanceBuilders++; }
                    else if (aux_role == "reserver") { pop_reservers++; }
                    else if (aux_role == "distanceCarrier") { pop_distanceCarriers++; }
                    else if (aux_role == "scout") { pop_scouts++; }
                }

            }

            //passing spawning to second spawn
            if (spawn.spawning != null && Game.spawns['Spawn2'] != undefined) {
                if (spawn.spawning) {
                    if (spawn.spawning.remainingTime < spawn.spawning.needTime - 5
                        && Game.spawns['Spawn2'].spawning == null) {
                        var aux_memory = spawn.memory;
                        spawn = Game.spawns['Spawn2'];
                        spawn.memory = aux_memory;
                        console.log("passing spawning to another spawn");

                    }
                }

                if (spawn.spawning != null && Game.spawns['Spawn3'] != undefined) {
                    if (spawn.spawning.remainingTime < spawn.spawning.needTime - 5
                        && Game.spawns['Spawn3'].spawning == null) {
                        var aux_memory = spawn.memory;
                        spawn = Game.spawns['Spawn3'];
                        spawn.memory = aux_memory;
                        console.log("passing spawning to another spawn");

                    }
                }

            }
            else if (Game.spawns['Spawn2'] != undefined) {
                Game.spawns['Spawn2'].memory = Game.spawns['Spawn1'].memory;
            }



            if (pop_haulers > 0) {
                if (spawn.memory.need_keeperHealer != undefined) {
                    var healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                    if (spawn.room.controller.level == 5 || spawn.room.controller.level == 6) {
                        healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                    }
                    if (spawn.spawnCreep(healer_body, 'KeeperHealer' + Game.time, { memory: { role: 'keeperHealer', target: spawn.memory.need_keeperHealer, home_room: spawn.room } }) == 0) {
                        console.log("Spawning KeeperHealer");
                        return;
                    }
                }
                if (spawn.memory.need_keeperKiller != undefined) {
                    var killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                    if (spawn.room.controller.level >= 6) {
                        killer_body = [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                            RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                    }
                    if (spawn.room.controller.level >= 7) {
                        killer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                            RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK];
                    }
                    if (spawn.spawnCreep(killer_body, 'KeeperKiller' + Game.time, { memory: { role: 'keeperKiller', target: spawn.memory.need_keeperKiller, home_room: spawn.room } }) == 0) {
                        console.log("Spawning KeeperKiller");
                        return;
                    }
                }
                if (spawn.memory.need_keeperCarrier != undefined) {
                    if (spawn.spawnCreep(maxHauler(energyCap, spawn, false), 'KeeperCarrier' + Game.time, { memory: { role: 'keeperCarrier', target_room: spawn.memory.need_keeperCarrier, home_room: spawn.room } }) == 0) {
                        console.log("Spawning KeeperCarrier");
                        return;
                    }
                }
                if (spawn.memory.need_keeperFarmer != undefined) {
                    if (spawn.spawnCreep(maxKeeperFarmer(energyCap - 200, spawn), 'KeeperFarmer' + Game.time, { memory: { role: 'keeperFarmer', target_room: spawn.memory.need_keeperFarmer, home_room: spawn.room, closest_source: undefined } }) == 0) {
                        console.log("Spawning KeeperFarmer");
                        return;
                    }
                }
            }

            if (pop_fillers < spawn.memory.req_fillers) {
                var body = [MOVE, CARRY];
                if (spawn.room.controller.level == 7) {
                    body.push(CARRY);
                }
                else if (spawn.room.controller.level == 8) {
                    body.push(CARRY);
                    body.push(CARRY);
                    body.push(CARRY);
                }
                if (spawn.spawnCreep(body, 'Filler' + Game.time, { memory: { role: 'filler', home_room: spawn.room } }) == OK) {
                    console.log("Spawning filler");
                }
                console.log(spawn.spawnCreep([MOVE, CARRY], 'Filler' + Game.time, { memory: { role: 'filler', home_room: spawn.room } }));
                return;
            }

            if (spawn.memory.need_soldier != undefined) {
                if (spawn.spawnCreep(maxSoldier(energyCap), 'Soldier' + Game.time, {
                    memory: {
                        role: 'soldier', target_room:
                            spawn.memory.need_soldier, home_room: spawn.room
                    }
                }) == 0) {
                    spawn.memory.soldiers_counter++;
                    console.log("Spawning Soldier");
                    return;
                }
            }

            if (pop_scouts < spawn.memory.req_scouts) {
                if (spawn.spawnCreep([MOVE], 'Scout' + Game.time, { memory: { role: 'scout', home_room: spawn.room } }) == 0) {
                    console.log("Spawning Scout");
                }
                return;
            }


            if (pop_berserkers < spawn.memory.req_berserk && false) {
                var berserk_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK];
                if (spawn.spawnCreep(berserk_body, 'Berserker' + Game.time, { memory: { role: 'berserk', home_room: spawn.room, target_room: 'E7S5' } }) == 0) {//costs 520 energy
                    console.log("Spawning Berserker");
                    // return;
                }
            }
            if (spawn.memory.need_farmer != undefined) {
                if (spawn.spawnCreep(maxFarmer(energyCap, spawn, true), 'Farmer' + Game.time, {
                    memory: {
                        role: 'farmer', home_room: spawn.room,
                        target_room: spawn.memory.need_farmer, path: undefined
                    }
                }) == 0) {
                    console.log("Spawning Farmer");
                    //spawn.memory.farmers_counter++;
                    return;
                }
                if (spawn.memory.farming_rooms[0].farmers == 0) {
                    return;
                }

            }
            if (spawn.memory.need_distanceRepairer != undefined) {
                if (spawn.spawnCreep(maxRepairer(energyCap), 'distanceRepairer' + Game.time, {
                    memory: {
                        role: 'distanceRepairer', home_room: spawn.room,
                        target_room: spawn.memory.need_distanceRepairer
                    }
                }) == 0) {
                    console.log('Spawning distanceRepairer');
                    return;
                }
            }
            if (pop_builders < spawn.memory.req_builders) // spawning new builder
            {
                spawn.spawnCreep(maxBuilder(energyCap, spawn), 'Builder' + Game.time, { memory: { role: 'builder', home_room: spawn.room } });
                if (spawn.spawnCreep(maxBuilder(energyCap / 2, spawn), 'Builder' + Game.time, { memory: { role: 'builder', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Builder');
                    return;
                }
                return;
            }
            if (pop_haulers < spawn.memory.req_haulers)//spawning new hauler
            {
                if (spawn.spawnCreep(maxHauler(energyCap, spawn), 'hauler' + Game.time, { memory: { role: 'hauler', home_room: spawn.room } }) == 0) {
                    console.log("Spawning hauler");
                    return;
                }
            }
            if (pop_upgraders < spawn.memory.req_upgraders && spawn.memory.farming_rooms!=undefined && spawn.memory.farming_rooms.length>0 && spawn.memory.farming_rooms[0].carry_power > 0
                && pop_upgraders / spawn.memory.req_upgraders < spawn.memory.farming_rooms[0].carry_power / spawn.memory.farming_rooms[0].sources_num * 10) // spawning new upgrader
            {
                if (spawn.spawnCreep(maxUpgrader(energyCap, spawn), 'Upgrader' + Game.time, { memory: { role: 'upgrader', home_room: spawn.room } }) == 0) {
                    console.log('Spawning Upgrader');
                    return;
                }
            }
            if (pop_towerKeepers < spawn.memory.req_towerKeepers) {
                if (spawn.spawnCreep(maxHauler(energyCap % 1000, spawn), 'TowerKeeper' + Game.time, { memory: { role: 'towerKeeper', home_room: spawn.room } }) == 0) {
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
            if (pop_distanceBuilders < spawn.memory.req_distanceBuilders) {
                if (spawn.spawnCreep(maxDistanceBuilder(energyCap), 'DistanceBuilder' + Game.time, {
                    memory: {
                        role: 'distanceBuilder',
                        target_room: spawn.memory.claiming_rooms[pop_distanceBuilders % spawn.memory.claiming_rooms.length].name,
                        home_room: spawn.room, path: undefined, home_room: spawn.room
                    }
                }) == 0) {

                    console.log('Spawning DistanceBuilder');
                    return;
                }
            }
            if (spawn.memory.need_reserver != undefined) {
                //if(pop_reservers==0){pop_reservers=1;}
                if (spawn.spawnCreep(maxReserver(energyCap), 'R' + Game.time, {
                    memory: {
                        role: 'reserver',
                        target_room: spawn.memory.need_reserver, path: undefined, home_room: spawn.room
                    }
                }) == 0) {
                    console.log('Spawning Reserver');
                    return;
                }
            }
            if (spawn.memory.need_DistanceCarrier != undefined && pop_distanceCarriers < 30) {
                if (spawn.spawnCreep(maxDistanceCarrier(energyCap, spawn, false), 'distnaceCarrier' + Game.time, {
                    memory: {
                        role: 'distanceCarrier', home_room: spawn.room,
                        target_room: spawn.memory.need_DistanceCarrier, path: undefined
                    }
                }) == 0) {
                    spawn.memory.distance_carriers_counter++;
                    console.log("Spawning DistanceCarrier");
                    return;
                }
                if (spawn.memory.need_DistanceCarrier == spawn.room.name) {
                    return;
                }

            }
            if (pop_merchants < spawn.memory.req_merchants && spawn.room.terminal != undefined) {
                if (spawn.spawnCreep([MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                    CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], 'Merchant' + Game.time, { memory: { role: 'merchant', home_room: spawn.room } }) == 0) {
                    console.log("Spawning Merchant");
                    return;
                }
            }
            if (pop_miners < spawn.memory.req_miners && spawn.memory.farming_rooms[0].carry_power >= spawn.memory.farming_rooms[0].harvesting_power) {
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





        }
    });
}