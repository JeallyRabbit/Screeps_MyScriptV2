
//test git 3
//duo git test
var roleHauler2 = require('role.hauler2')
var roleBuilder = require('role.builder');
var roleUpgrader = require('role.upgrader');
var roleSoldier = require('role.soldier');
var roleFarmer = require('role.farmer');

var towers = require('towers');
var links = require('links');
var terminal = require('terminal');
var lab = require('labs');
var reactions = require('reactions')
var visualize = require('visualize');

var roleTowerKeeper = require('role.TowerKeeper');
var roleClaimer = require('role.Claimer');
var roleReserver = require('role.reserver');
var roleKeeperKiller = require('role.keeper_killer');
var roleKeeperCarrier = require('role.keeper_carrier');
var roleMerchant = require('role.merchant');
var roleMiner = require('role.miner');
var roleDoctor = require('role.doctor');
var roleScout = require('role.scout');
var roleDistanceRepairer = require('role.distanceRepairer');
var roleFiller = require('role.filler');
var roleScanner = require('role.scanner');
var roleColonizer = require('role.colonizer');
var roleRampartRepairer = require('role.rampart_repairer');
var roleKeeperRepairer = require('role.keeper_repairer');
var roleMeleeDefender = require('role.meleeDefender')
var roleEnergySupport = require('role.energySupport')
var roleKeeperFarmer = require('role.keeper_farmer');

//var roleDistanceCarrier = require('role.DistanceCarrier');
var roleDistanceCarrier2 = require('role.DistanceCarrier2')
var roleDuoLeader = require('role.duoLeader')
var roleDuoFollower = require('role.duoFollower')
var operateDuo = require('operateDuo')
var operateSwarm = require('operateSwarm')
var operateQuad = require('operateQuad')
var roleSponge = require('roleSponge')

var _ = require('lodash');

const Movement = require('screeps-movement');


const movementConfig = {
    allies: ["Alphonzo", "insain", "noe","Trepidimous"],
    visualize: true,
    trackHostileRooms: true
}
Movement.setConfig(movementConfig)



const setRequiredPopulation = require('setRequiredPopulation');
const setBaseState = require('setBaseState')
const baseDefense = require('baseDefense')
const operateKeepersRooms = require('operateKeepersRooms')

const maxRepairer = require('maxRepairer');
const maxBuilder = require('maxBuilder');
const maxUpgrader = require('maxUpgrader');
const maxColonizer = require('maxColonizer');
const maxRampartRepairer = require('maxRampartRepairer')
const maxDistanceCarrier = require('maxDistanceCarrier');
const maxFarmer = require('maxFarmer');
const maxClaimer = require('maxClaimer');
const maxDuoHealer = require('maxDuoHealer')
const maxSponge = require('maxSponge')

var RoomPositionFunctions = require('roomPositionFunctions');
const maxSoldier = require('./maxSoldier');
const maxMeleeSoldier = require('./maxMeleeSoldier');
const maxReserver = require('./maxReserver');
const setBaseLayout = require('./setBaseLayout');
const maxKeeperFarmer = require('./maxKeeperFarmer');
const findRouteTest = require('./findRouteTest');
const maxMerchant = require('./maxMerchant');
const maxQuadRanger = require('./maxQuadRanger')
const maxQUadHealer = require('./maxQuadHealer')

const C =require('./constants')

//const move_avoid_hostile=require('./move_avoid_hostile')
const profiler = require('screeps-profiler');


const heap = {}
global.heap = heap;


class colonizeRoom {
    constructor(name, spawn_pos_x, spawn_pos_y) {
        this.name = name;
        this.spawn_pos_x = spawn_pos_x;
        this.spawn_pos_y = spawn_pos_y;
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
    constructor(swarmId, reqPopulation, target_room, home_room) {
        this.id = swarmId;
        this.req_population = reqPopulation;
        this.target_room = target_room;
        this.home_rom = home_room;
        this.members = [];
    }
}

class Quad {
    constructor(quadId, target_room, home_room) {
        this.id = quadId;
        this.target_room = target_room;
        this.home_room = home_room
    }
}

global.bucket = [];
global.CPU = [];
require('module.chartCPU');


profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function () {
        //return;
        console.log()
        console.log("test constant: ",C.TEST_CONST)
        console.log(Game.shard.name, " Bucket: ", Game.cpu.bucket);
        //console.log("Construction sites; ", Object.keys(Game.constructionSites).length);
        console.log("GCL: ", Game.gcl.level, Math.round((Game.gcl.progress / Game.gcl.progressTotal) * 100), "% to next")

        Memory.allies = ["Alphonzo", "insain", "noe"];
        Memory.enemies=["IronVengeance"];

        if(Memory.roomsToAvoid==undefined)
        {
            Memory.roomsToAvoid=[]
        }

        global.heap.soldiers={}

        if(global.heap.rooms==undefined)
        {
            global.heap.rooms={}
        }
        
        

        Memory.step = 10000

        var step = Memory.step;

            for (var roomName in Game.rooms) {

                if(global.heap.rooms[roomName]==undefined)
                {
                    global.heap.rooms[roomName]={};
                }
                
                if(global.heap.rooms[roomName].boostingRequests==undefined)
                {
                    console.log("Setting requests to 0")
                    global.heap.rooms[roomName].boostingRequests=[]
                }
                global.heap.soldiers[roomName]=0;
                var room = Game.rooms[roomName]
                if (room.memory.raw_energy_income != undefined) {
                    room.memory.raw_last_mean_energy_income = room.memory.raw_energy_income / step
                    room.memory.raw_energy_income = 0;

                }

                if (room.memory.raw_keepers_energy_income != undefined) {
                    room.memory.raw_last_mean_keepers_energy_income = room.memory.raw_keepers_energy_income / step
                    room.memory.raw_keepers_energy_income = 0
                }


            }

        







        // loop for intershardColonizer and intershardClaimer

        for (var name in Game.creeps) {

            var creep = Game.creeps[name];
            if (creep.name.startsWith('IsCol')) {
                //creep.say("WTF")
                creep.roleIntershardColonizer(creep);
            }
            else if (creep.name.startsWith('IsCLA')) {
                //creep.say("WFT2")
                creep.roleIntershardClaimer(creep);
            }
            else if (creep.name.startsWith('IsCar')) {
                creep.roleIntershardCarrier(creep);
            }
            else if (creep.name.startsWith('IsUpg')) {
                creep.roleIntershardUpgrader(creep);
            }
        }
        for (var i in Memory.creeps) {  //clearing data about dead creeps
            if (!Game.creeps[i]) {
                delete Memory.creeps[i];
            }
        }
        for (var i in Memory.spawns) {
            if (!Game.spawns[i]) { // spawn is undefined
                delete Memory.spawns[i];
            }
        }

        if (Memory.rooms_to_colonize == undefined) {
            Memory.rooms_to_colonize = [];
        }
        if (Memory.main_spawns == undefined || Game.time % 1 == 0 || Memory.main_spawns == []) {
            Memory.main_spawns = [];
            for (let spawnName in Game.spawns) {

                var aux_spawn = Game.spawns[spawnName];
                var name = aux_spawn.name;

                if (name.slice(-1) == '1' && aux_spawn.room.controller.my) {
                    Memory.main_spawns.push(aux_spawn.id);
                    for (let i = 0; i < Memory.rooms_to_colonize.length; i++) {
                        if (Memory.rooms_to_colonize[i].name == aux_spawn.room.name) {//if i have spawn in room_to_colonize it is no longer room to colonize - it will progress on its own
                            Memory.rooms_to_colonize.splice(i, 1);
                        }
                    }
                }
            }
        }

        Memory.colonizing = false;
        if (Game.shard.name == 'shard3' && Memory.main_spawns.length + Memory.rooms_to_colonize.length < 3) {
            Memory.colonizing = true;
        }
        console.log("shardname: ", Game.shard.name)
        if (Game.shard.name != 'shard3' && Memory.main_spawns.length + Memory.rooms_to_colonize.length < Game.cpu.limit / 15 && Memory.main_spawns.length + Memory.rooms_to_colonize.length < Game.gcl.level) {
            Memory.colonizing = true;
            if (Game.shard.name == 'newbieland' && Memory.main_spawns.length + Memory.rooms_to_colonize.length >= 3) {
                Memory.colonizing = false;
            }

            if(Memory.colonizingStop==true)
            {
                Memory.colonizing=false;
            }
            

        }



        if (Memory.rooms_to_colonize != undefined && Memory.rooms_to_colonize.length > 0) {
            var closest_distance = Infinity;
            for (let spawn_id of Memory.main_spawns) {
                var spawn = Game.getObjectById(spawn_id);
                if (spawn.room.controller.level < 4) { continue }
                for (let to_colonize of Memory.rooms_to_colonize) {
                    if (to_colonize.distance_to_closest == undefined ||
                        (to_colonize.distance_to_closest >= Game.map.getRoomLinearDistance(Game.getObjectById(spawn_id).room.name, to_colonize.name))) {
                        if (spawn.memory.to_colonize == undefined) {
                            to_colonize.distance_to_closest = Game.map.getRoomLinearDistance(Game.getObjectById(spawn_id).room.name, to_colonize.name);
                            to_colonize.colonizer = Game.getObjectById(spawn_id).room.name;

                            Game.getObjectById(spawn_id).memory.to_colonize = new colonizeRoom(to_colonize.name, to_colonize.spawn_pos_x, to_colonize.spawn_pos_y);
                        }

                        /*
                        Game.getObjectById(spawn_id).memory.to_colonize.name=to_colonize.name;
                        Game.getObjectById(spawn_id).memory.to_colonize.spawn_pos_x=to_colonize.spawn_pos_x;
                        Game.getObjectById(spawn_id).memory.to_colonize.spawn_pos_y=to_colonize.spawn_pos_y;
                        */
                    }
                }
            }
        }

        // loop for counting soldiers
        for (var name in Game.creeps) {
                var creep = Game.creeps[name];
                //creep.suicide()
                if (creep.memory.role == 'soldier') {
                    global.heap.soldiers[creep.memory.target_room]++;
                }
            }



        spawn_num = 0;
        console.log("i have: ", Memory.main_spawns.length, " rooms");
        for (spawn_num; spawn_num < Memory.main_spawns.length; spawn_num++) {

            var spawn_start_cpu = Game.cpu.getUsed()
            var spawn = Game.getObjectById(Memory.main_spawns[spawn_num]);
            console.log("---------------- ",spawn.room.name," ---------------- ")

            if (spawn.memory.lvl_1_time == undefined /* && spawn.room.controller.level <= 2*/) {
                spawn.memory.lvl_1_time = Game.time;
            }
            if (spawn.memory.lvl_2_time == undefined && spawn.room.controller.level == 2) {
                spawn.memory.lvl_2 = Game.time - spawn.memory.lvl_1_time
            }
            if (spawn.memory.lvl_3_time == undefined && spawn.room.controller.level == 3) {
                spawn.memory.lvl_3_time = Game.time - spawn.memory.lvl_1_time;
            }
            if (spawn.memory.lvl_4_time == undefined && spawn.room.controller.level == 4) {
                spawn.memory.lvl_4_time = Game.time - spawn.memory.lvl_1_time;
            }
            if (spawn.memory.lvl_5_time == undefined && spawn.room.controller.level == 5) {
                spawn.memory.lvl_5_time = Game.time - spawn.memory.lvl_1_time;
            }
            if (spawn.memory.lvl_6_time == undefined && spawn.room.controller.level == 6) {
                spawn.memory.lvl_6_time = Game.time - spawn.memory.lvl_1_time;
            }
            if (spawn.memory.lvl_7_time == undefined && spawn.room.controller.level == 7) {
                spawn.memory.lvl_7_time = Game.time - spawn.memory.lvl_1_time;
                if (spawn.memory.scan_reset_7 == undefined) {
                    spawn.memory.scan_reset_7 = true;
                    spawn.memory.if_success_planning_base = false;
                    spawn.memory.rooms_to_scan = undefined;
                }
            }
            if (spawn.memory.lvl_8_time == undefined && spawn.room.controller.level == 8) {
                spawn.memory.lvl_8_time = Game.time - spawn.memory.lvl_1_time;
                spawn.memory.lvl_7_time = Game.time - spawn.memory.lvl_1_time;
                if (spawn.memory.scan_reset_8 == undefined) {
                    spawn.memory.scan_reset_8 = true;
                    spawn.memory.if_success_planning_base = false;
                    spawn.memory.rooms_to_scan = undefined;
                }
            }
            if (spawn.memory.manual_colonize != undefined) {
                for (let main_spawn_id of Memory.main_spawns) {
                    var main = Game.getObjectById(main_spawn_id)
                    if (main != null && main.room.name == spawn.memory.manual_colonize) {
                        spawn.memory.manual_colonize = undefined
                        break;
                    }

                    if (spawn.memory.manual_colonize != undefined) {
                        spawn.memory.scanner_rooms = undefined
                    }
                }
            }
            if (spawn == null) {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11");
                console.log("spawn: ", Memory.main_spawns[spawn_num], " is null");
                //continue;
            }







            if (Memory.colonizing == undefined || Memory.colonizing != true && spawn.memory.manual_colonize == undefined) {
                spawn.memory.to_colonize = undefined
            }

            for (let other_spawn in Game.spawns) {
                if (spawn.memory.to_colonize != undefined && Game.spawns[other_spawn].room.name == spawn.memory.to_colonize.name) {
                    spawn.memory.to_colonize = undefined;
                }
            }


            var pop_builders = 0;
            var upgraders_parts = 0;
            var pop_haulers = 0;
            var pop_towerKeepers = 0;
            var pop_claimers = 0;
            var pop_reservers = 0;
            var pop_distanceCarriers = 0;
            var pop_merchants = 0;
            spawn.memory.merchant = undefined;
            var pop_miners = 0;
            var pop_doctors = 0;
            var pop_scouts = 0;
            var pop_fillers = 0
            var spawned_body_parts = 0;
            var pop_soldiers = 0;
            var pop_scanners = 0;
            var pop_colonizers = 0;
            var pop_rampart_repairers = 0;
            var pop_melee_defenders = 0;
            var pop_keeperKillers = 0;
            var pop_keeperFarmers = 0;
            var pop_keeperCarriers = 0;
            var pop_keeperRepairers = 0


            for (var name in Game.creeps) {
                var creep = Game.creeps[name];
                //creep.suicide()
                if (creep.memory.role == 'soldier') {


                    if (spawn.memory.rooms_to_blockade != undefined && spawn.memory.rooms_to_blockade.length > 0) {
                        // creep.say()
                        for (a of spawn.memory.rooms_to_blockade) {
                            if (a.roomName == creep.memory.target_room) {
                                a.soldier_id = creep.id;
                                break;
                            }
                        }
                    }

                    if (spawn.memory.to_colonize != undefined && creep.memory.target_room == spawn.memory.to_colonize.name) {
                        spawn.memory.to_colonize.soldier = creep.id
                    }


                }
            }



            spawn.setBaseState(spawn);
            spawn.baseDefense();
            spawn.operateKeepersRooms()
            spawn.setRequiredPopulation(spawn);


            spawn.memory.farming_rooms = [];
            if (spawn.memory.farming_sources != undefined) {
                for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                    var found = false
                    for (let j = 0; j < spawn.memory.farming_rooms.length; j++) {
                        if (spawn.memory.farming_sources[i].name == spawn.memory.farming_rooms[j].name) {
                            spawn.memory.farming_rooms[j].sources_num++;
                            spawn.memory.farming_rooms[j].max_farmers += spawn.memory.farming_sources[i].max_farmers;
                            found = true
                            continue;
                        }

                    }
                    if (found == false) {
                        spawn.memory.farming_rooms.push(new farmingRoom(spawn.memory.farming_sources[i].name, 0, 0, 1, spawn.memory.farming_sources[i].distance,
                            spawn.memory.farming_sources[i].max_farmers));
                    }

                }
            }

            if (spawn.memory.swarms != undefined && spawn.memory.swarms.length > 0) {
                for (sw of spawn.memory.swarms) {
                    sw.members = []
                }
            }

            if (spawn.memory.req_quads == undefined) {
                aux = spawn.room.name
                spawn.memory.req_quads = { aux: 0 };
            }
            else {
                //spawn.memory.req_quads={"W3N7":2}
            }

            if (spawn.memory.quads != undefined && spawn.memory.quads.length > 0) {
                for (q of spawn.memory.quads) {
                    //q.members = []
                }
            }

            /*
            if (spawn.memory.keepers_rooms != undefined && spawn.memory.keepers_rooms.length > 0) {
                spawn.room.visual.text("raw_keepers_income: " + spawn.room.memory.raw_keepers_energy_income, 25, 13, { color: '#fc03b6' })
                spawn.room.visual.text("raw_last_mean_keepers_income/t: " + Math.round(spawn.room.memory.raw_last_mean_keepers_energy_income * 100) / 100, 25, 14, { color: 'lightblue' })

            }
                */



            if ((Game.shard.name == 'shard2' || Game.shard.name == 'shard1' || Game.shard.name == 'shard0') && Game.cpu.bucket == 10000) {
                Game.cpu.generatePixel();
            }



            if ((Game.time % 1500 == spawn_num /* * 7 */ && Game.cpu.bucket > 200
                && Object.keys(Game.constructionSites).length < 100)
                // || spawn.room.name == 'E16N13'
            ) {


                spawn.setBaseLayout(spawn);
                //return;
            }




            if (spawn.memory.forced_upgrades == undefined) {
                spawn.memory.forced_upgrades = []
                for (var i = 0; i < 7; i++) {
                    spawn.memory.forced_upgrades.push(0)
                }
            }
            if (Game.cpu.bucket > 200 && spawn.memory.forced_upgrades[spawn.room.controller.level - 1] <= 8 &&
                (spawn.memory.rooms_to_scan != undefined && spawn.memory.rooms_to_scan.length == 0)
            ) {
                if (spawn.memory.forced_upgrades[spawn.room.controller.level - 1] == 0) {
                    spawn.memory.if_success_planning_base = false
                }
                spawn.setBaseLayout(spawn)
                spawn.memory.forced_upgrades[spawn.room.controller.level - 1]++;
            }

            spawn.memory.progress_old = spawn.memory.progress;
            spawn.memory.progress = spawn.room.controller.progress;
            if (spawn.memory.progress_old != 0) {
                spawn.memory.progress_sum += (spawn.memory.progress - spawn.memory.progress_old);
            }
            spawn.memory.progress_counter += 1;



            

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

            if (spawn.memory.farming_sources != undefined && spawn.memory.farming_sources.length > 0) {
                for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                    spawn.memory.farming_sources[i].harvesting_power = 0;
                    spawn.memory.farming_sources[i].carry_power = 0;
                    spawn.memory.farming_sources[i].farmers = 0;
                }
            }

            if (spawn.memory.keepers_rooms != undefined && spawn.memory.keepers_rooms.length > 0) {
                for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                    spawn.memory.keepers_rooms[i].harvesting_power = 0;
                    spawn.memory.keepers_rooms[i].carry_power = 0;
                    spawn.memory.keepers_rooms[i].farmers = 0;
                    spawn.memory.keepers_rooms[i].carriers = 0;
                    spawn.memory.keepers_rooms[i].keeperHealer = undefined;
                    spawn.memory.keepers_rooms[i].keeperRepairer = undefined;
                    spawn.memory.keepers_rooms[i].keeperKiller = undefined;
                }
            }

            if (spawn.memory.keepers_sources != undefined && spawn.memory.keepers_sources.length > 0) {
                for (let i = 0; i < spawn.memory.keepers_sources.length; i++) {
                    spawn.memory.keepers_sources[i].harvesting_power = 0;
                    spawn.memory.keepers_sources[i].carry_power = 0;
                    spawn.memory.keepers_sources[i].farmers = 0;
                    spawn.memory.keepers_sources[i].carriers = 0;
                    spawn.memory.keepers_sources[i].keeperKiller = undefined;
                }
            }

            if (spawn.memory.duos != undefined && spawn.memory.duos.length > 0) {
                for (d of spawn.memory.duos) {
                    d.followerId = undefined;
                    d.leaderId = undefined;
                }
            }

            spawn.memory.sponge_id = undefined;



            for (var name in Game.creeps) {

                var creep = Game.creeps[name];
                if (creep.memory.role == 'merchant' && creep.memory.home_room.name == spawn.room.name) {
                    spawn.memory.merchant = creep.id;
                    creep.roleMerchant(creep, spawn);
                    pop_merchants++;
                }
            }
            for (var name in Game.creeps) {
                var creep = Game.creeps[name];
                if (creep.memory.home_room == undefined && (!creep.name.startsWith('IsC') && !creep.name.startsWith('IsU'))) { creep.suicide() }
                if (creep.memory.home_room != undefined && creep.memory.home_room.name == spawn.room.name) {
                    spawned_body_parts += creep.body.length;
                    if (creep.memory.role == 'upgrader') {

                        //creep.suicide()
                        if (creep.ticksToLive > 20 || creep.spawning) {
                            upgraders_parts += _.filter(creep.body, { type: WORK }).length;

                        }

                        if (upgraders_parts > 0 && spawn.memory.building == true && spawn.room.controller.ticksToDowngrade > 5000
                            && spawn.room.controller.level >= 2
                        )//spawn.memory.req_builders > 0 && false) {
                        {
                            pop_builders++;
                            creep.roleBuilder(creep, spawn)
                            //continue;
                        }
                        else {
                            creep.roleUpgrader(creep, spawn);
                        }



                    }
                    else if (creep.memory.role == 'hauler') {
                        if (creep.ticksToLive > 50 || creep.spawning) {
                            pop_haulers++;
                        }
                        if (creep.ticksToLive > creep.memory.time_to_sleep) {
                            //creep.say('💤')
                            continue;
                        }
                        if (creep.store.getCapacity(RESOURCE_ENERGY) < 200) {
                            spawn.memory.req_haulers = 2;
                        }
                        creep.roleHauler2(creep, spawn);


                    }
                    else if (creep.memory.role == 'builder') {
                        creep.roleBuilder(creep, spawn);
                        if (creep.ticksToLive > 50 || creep.spawning) {
                            pop_builders++;
                        }
                    }
                    else if (creep.memory.role == 'soldier') {
                        creep.roleSoldier(creep, spawn);



                        if (spawn.memory.rooms_to_blockade != undefined && spawn.memory.rooms_to_blockade.length > 0) {
                            // creep.say()
                            for (a of spawn.memory.rooms_to_blockade) {
                                if (a.roomName == creep.memory.target_room) {
                                    a.soldier_id = creep.id;
                                    break;
                                }
                            }
                        }


                        if (spawn.memory.to_colonize != undefined && creep.memory.target_room == spawn.memory.to_colonize.name) {
                            spawn.memory.to_colonize.soldier = creep.id
                        }


                    }
                    else if (creep.memory.role == 'farmer') {
                        //creep.suicide();


                        if ((creep.memory.source_distance != undefined && creep.ticksToLive > (creep.memory.source_distance * 2) + creep.body.length) || creep.spawning) {
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

                            for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                                if (spawn.memory.farming_sources[i].id == creep.memory.source_id) {
                                    spawn.memory.farming_sources[i].harvesting_power += creep.memory.harvesting_power;
                                    spawn.memory.farming_sources[i].farmers++;
                                    break;
                                }
                            }
                        }



                        if (creep.ticksToLive > creep.memory.time_to_sleep) {
                            creep.say('💤')
                            continue;
                        }

                        //sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                        creep.roleFarmer(creep, spawn);

                    }
                    else if (creep.memory.role == 'towerKeeper') {
                        creep.roleTowerKeeper(creep, spawn);
                        if (creep.ticksToLive > 50 || creep.spawning) {
                            pop_towerKeepers++;
                        }
                    }
                    else if (creep.memory.role == 'claimer') {
                        creep.roleClaimer(creep, spawn);
                        if (creep.ticksToLive > 200 || creep.spawning) {
                            pop_claimers++;
                        }
                        if (spawn.memory.to_colonize != undefined && creep.memory.target_room == spawn.memory.to_colonize.name) {
                            spawn.memory.to_colonize.claimer = creep.id
                        }
                    }
                    else if (creep.memory.role == 'reserver') {
                        creep.roleReserver(creep);
                        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                            if (creep.memory.target_room == spawn.memory.farming_rooms[i].name) {
                                if (creep.memory.target_room == spawn.memory.need_reserver) {
                                    spawn.memory.need_reserver = undefined;
                                }
                                spawn.memory.farming_rooms[i].reserver = creep.id;
                            }
                        }

                        if (creep.ticksToLive > 200 || creep.spawning) {
                            pop_reservers++;
                        }
                    }
                    else if (creep.memory.role == 'distanceCarrier') {
                        //creep.suicide();

                        if (creep.ticksToLive > creep.memory.source_distance || creep.spawning) {
                            for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                                if (spawn.memory.farming_rooms[i].name == creep.memory.target_room) {

                                    spawn.memory.farming_rooms[i].carry_power += creep.store.getCapacity() / (spawn.memory.farming_rooms[i].distance * 2);
                                    creep.memory.carry_power = creep.store.getCapacity() / (spawn.memory.farming_rooms[i].distance * 2);
                                }
                            }

                            for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                                if (spawn.memory.farming_sources[i].id == creep.memory.source_id && spawn.memory.farming_sources[i].name == creep.memory.target_room) {

                                    spawn.memory.farming_sources[i].carry_power += creep.store.getCapacity() / (spawn.memory.farming_sources[i].distance * 2);
                                    creep.memory.carry_power = creep.store.getCapacity() / (spawn.memory.farming_sources[i].distance * 2);
                                }
                            }
                        }



                        if (creep.ticksToLive > creep.memory.time_to_sleep) {
                            //creep.say('Dsleep')
                            if (creep.memory.time_to_sleep != null) {
                                if (creep.pos.isNearTo(spawn)) {
                                    creep.fleeFrom(spawn, 3)
                                }
                                continue;
                            }
                            else {
                                creep.memory.time_to_sleep = undefined;
                            }
                        }

                        creep.roleDistanceCarrier2(creep, spawn)
                        //roleDistanceCarrier.run(creep, spawn);


                        pop_distanceCarriers++;
                    }
                    else if (creep.memory.role == 'distanceRepairer') {
                        creep.roleDistanceRepairer(creep, spawn);
                        for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                            if (creep.memory.target_room == spawn.memory.farming_rooms[i].name) {
                                if (creep.memory.target_room == spawn.memory.need_distanceRepairer) {
                                    //creep.say("cl")
                                    spawn.memory.need_distanceRepairer = undefined;
                                }

                                spawn.memory.farming_rooms[i].distanceRepairer = creep.id;
                                //creep.say(spawn.memory.farming_rooms[i].name)
                            }
                        }
                    }
                    else if (creep.memory.role == 'keeperRepairer') {
                        if (creep.ticksToLive > 100 || creep.spawning == true) {
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target_room) {
                                    if (creep.memory.target_room == spawn.memory.need_keeperRepairer) {
                                        spawn.memory.keeperRepairer = undefined;
                                    }
                                    spawn.memory.keepers_rooms[i].keeperRepairer = creep.id;
                                    break;
                                }
                            }
                            pop_keeperRepairers++;
                        }

                        creep.roleKeeperRepairer(creep, spawn)

                    }

                    else if (creep.memory.role == 'keeperKiller') {
                        //creep.suicide();
                        if (creep.ticksToLive > 100 || creep.spawning == true) {
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target_room) {
                                    if (creep.memory.target_room == spawn.memory.need_keeperKiller) {
                                        spawn.memory.need_keeperKiller = undefined;
                                    }
                                    spawn.memory.keepers_rooms[i].keeperKiller = creep.id;
                                    break;
                                }
                            }

                            for (keeper_source of spawn.memory.keepers_sources) {
                                if (keeper_source.name == creep.memory.target_room) {
                                    keeper_source.keeperKiller = creep.id
                                }
                            }

                            pop_keeperKillers++;
                        }


                        creep.roleKeeperKiller(creep, spawn);
                    }
                    else if (creep.memory.role == 'keeperHealer') {
                        creep.roleKeeperHealer(creep, spawn);
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
                        //creep.memory.carry_power = creep.store.getCapacity() / (spawn.memory.keepers_sources[i].distance * 2);
                        for (let i = 0; i < spawn.memory.keepers_sources.length; i++) {
                            if (spawn.memory.keepers_sources[i].id == creep.memory.target_source) {

                                if (Game.getObjectById(spawn.memory.keepers_sources[i].id).density != undefined) {
                                    spawn.memory.keepers_sources[i].carry_power += (creep.store.getCapacity() / (spawn.memory.keepers_sources[i].distance * 2)) * EXTRACTOR_COOLDOWN;
                                }
                                else {
                                    spawn.memory.keepers_sources[i].carry_power += creep.store.getCapacity() / (spawn.memory.keepers_sources[i].distance * 2);
                                }

                                //spawn.memory.keepers_sources[i].carry_power += creep.store.getCapacity() / (spawn.memory.keepers_sources[i].distance );
                                spawn.memory.keepers_sources[i].carriers++;
                                break;
                            }
                        }

                        creep.roleKeeperCarrier(creep, spawn);
                        pop_keeperCarriers++;
                    }
                    else if (creep.memory.role == 'keeperFarmer') {
                        creep.roleKeeperFarmer(creep, spawn);
                        const workParts = _.filter(creep.body, { type: WORK }).length;
                        //creep.say(workParts);
                        creep.memory.harvesting_power = workParts * 2;

                        if (creep.ticksToLive > 50 || creep.spawning) {
                            for (let i = 0; i < spawn.memory.keepers_rooms.length; i++) {
                                if (spawn.memory.keepers_rooms[i].name == creep.memory.target_room) {
                                    spawn.memory.keepers_rooms[i].harvesting_power += creep.memory.harvesting_power;
                                    spawn.memory.keepers_rooms[i].farmers++;
                                    break;
                                }
                            }
                            for (let i = 0; i < spawn.memory.keepers_sources.length; i++) {
                                if (spawn.memory.keepers_sources[i].id == creep.memory.target_source) {

                                    if (Game.getObjectById(spawn.memory.keepers_sources[i].id).density != undefined) {
                                        spawn.memory.keepers_sources[i].harvesting_power += creep.memory.harvesting_power / EXTRACTOR_COOLDOWN;
                                    }
                                    else {
                                        spawn.memory.keepers_sources[i].harvesting_power += creep.memory.harvesting_power;
                                    }


                                    spawn.memory.keepers_sources[i].farmers++;
                                    break;
                                }
                            }
                        }


                        pop_keeperFarmers++;
                    }


                    else if (creep.memory.role == 'miner') {
                        creep.roleMiner(creep, spawn);
                        pop_miners++;
                    }
                    else if (creep.memory.role == 'doctor') {
                        creep.roleDoctor(creep, spawn)
                        pop_doctors++;
                    }
                    else if (creep.memory.role == 'scout') {
                        creep.roleScout(creep, spawn);
                        pop_scouts++;
                    }
                    else if (creep.memory.role == 'filler') {
                        pop_fillers++;
                        if (creep.ticksToLive > creep.memory.time_to_sleep) {
                            creep.say('💤')
                            continue;
                        }
                        creep.roleFiller(creep, spawn);

                    }
                    else if (creep.memory.role == 'scanner') {
                        creep.roleScanner(creep, spawn);
                        pop_scanners++;
                    }
                    else if (creep.memory.role == 'colonizer') {
                        creep.roleColonizer(creep, spawn);
                        pop_colonizers++;
                    }
                    else if (creep.memory.role == 'rampartRepairer') {
                        const workParts = _.filter(creep.body, { type: WORK }).length;
                        pop_rampart_repairers += workParts
                        creep.roleRampartRepairer(creep, spawn);
                    }
                    else if (creep.memory.role == 'meleeDefender') {
                        const workParts = _.filter(creep.body, { type: ATTACK }).length;
                        pop_melee_defenders += workParts
                        creep.roleMeleeDefender(creep, spawn);
                    }
                    else if (creep.memory.role == 'duoLeader') {
                        if (spawn.memory.duos != undefined) {
                            //find itself a duo object to be assigned to
                            for (d of spawn.memory.duos) {
                                if (d.id == creep.memory.duoId) {
                                    //creep.say(d.id)
                                    d.leaderId = creep.id;
                                    break;
                                }
                            }
                        }

                    }
                    else if (creep.memory.role == 'duoFollower') {
                        if (spawn.memory.duos != undefined) {
                            for (d of spawn.memory.duos) {
                                if (d.id == creep.memory.duoId) {
                                    //creep.say(d.id)
                                    d.followerId = creep.id;
                                    break;
                                }
                            }
                        }

                    }
                    else if (creep.memory.role == 'swarmMember') {
                        if (spawn.memory.swarms != undefined) {
                            for (s of spawn.memory.swarms) {
                                if (s.id == creep.memory.swarmId) {
                                    if (!s.members.includes(creep.id)) {
                                        s.members.push(creep.id)
                                    }

                                    break;
                                }
                            }
                        }
                    }
                    else if (creep.memory.role == 'quadMember') {
                        //creep.suicide()
                        if (spawn.memory.quads != undefined) {
                            for (q of spawn.memory.quads) {
                                //if (q.members == undefined) {
                                //    q.members = [];
                                //}
                                if (q.members != undefined && q.id === creep.memory.quadId && !q.members.includes(creep.id)) {
                                    q.members.push(creep.id) && q.members.length<4

                                    if (q.topLeftId == undefined || q.topLeftId == creep.id) {
                                        q.topLeftId = creep.id
                                        break;
                                    }
                                    else if (q.topRightId == undefined || q.topRightId == creep.id) {
                                        q.topRightId = creep.id
                                        break;
                                    }
                                    else if (q.bottomLeftId == undefined || q.bottomLeftId == creep.id) {
                                        q.bottomLeftId = creep.id
                                        break;
                                    }
                                    else if (q.bottomRightId == undefined || q.bottomRightId == creep.id) {
                                        q.bottomRightId = creep.id
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    else if (creep.memory.role == 'energySupport') {
                        creep.roleEnergySupport(creep, spawn)
                    }
                    else if (creep.memory.role == 'sponge') {
                        creep.roleSponge(creep, spawn)
                        spawn.memory.sponge_id = creep.id
                        spawn.memory.need_sponge = undefined
                    }
                    else {
                        //creep.say('no role');
                    }

                    /*
                    
                        */
                    //pos_exchange(creep);
                }
            }


            //swarms
            if (spawn.memory.swarms == undefined) {
                spawn.memory.swarms = [];
            }
            if (spawn.memory.swarms != undefined && spawn.memory.swarms.length > 0) {
                for (let i = 0; i < spawn.memory.swarms.length; i++) {
                    var swarm = spawn.memory.swarms[i]
                    spawn.operateSwarm(swarm)
                }
            }

            //quads
            if (spawn.memory.quads == undefined) {
                spawn.memory.quads = [];
            }
            if (spawn.memory.quads != undefined && spawn.memory.quads.length > 0) {
                for (let i = 0; i < spawn.memory.quads.length; i++) {
                    var quad = spawn.memory.quads[i]
                    spawn.operateQuad(quad)
                }
            }



            // proceeding with duos
            if (spawn.memory.duos == undefined) {
                spawn.memory.duos = [];
            }
            if (spawn.memory.duos != undefined && spawn.memory.duos.length > 0) {
                for (let i = 0; i < spawn.memory.duos.length; i++) {
                    var duo = spawn.memory.duos[i]
                    var leader = Game.getObjectById(duo.leaderId)
                    var follower = Game.getObjectById(duo.followerId)
                    if (leader != null && follower != null) {


                        //console.log("suo is setting ")
                        leader.memory.follower = duo.followerId
                        //leader.roleDuoLeader(spawn)

                        follower.memory.leader = duo.leaderId
                        //follower.roleDuoFollower(spawn)

                        spawn.operateDuo(duo)


                    }

                    if ((leader == null && duo.leaderId != undefined) || (follower == null && duo.followerId != undefined)) {
                        duo.isDead = true
                    }

                }
            }

            if (spawn.room.controller.level >= 3) {
                //towers.tick(spawn);
                spawn.towers(spawn);

                if (spawn.room.controller.level >= 5) {
                    //links.tick(spawn);
                    spawn.links(spawn);
                    if (spawn.room.controller.level >= 6) {
                        //terminal.tick(spawn);

                        spawn.terminal(spawn);

                        spawn.lab(spawn);
                        //lab.tick(spawn);
                    }
                }
            }





            if (spawn.memory.sources_links_id != undefined && spawn.memory.sources_links_id.length > 0) {
                for (let i = 0; i < spawn.memory.farming_rooms.length; i++) {
                    if (spawn.memory.farming_rooms[i].name == spawn.room.name) {
                        spawn.memory.farming_rooms[i].carry_power = 99999999999999;
                    }
                }

                for (let i = 0; i < spawn.memory.farming_sources.length; i++) {
                    if (spawn.memory.farming_sources[i].name == spawn.room.name) {
                        spawn.memory.farming_sources[i].carry_power = 99999999999999
                    }
                }

            }
            var energyCap = spawn.room.energyAvailable;
            //spawn.room.visual.text("Upgraders: " + upgraders_parts + "/" + spawn.memory.req_upgraders_parts, 4, 2, { color: '#fc03b6' })
            //spawn.room.visual.text("Builders: " + pop_builders + "/" + spawn.memory.req_builders, 4, 3, { color: '#fc03b6' })
            //spawn.room.visual.text("Fillers:" + pop_fillers + "/" + spawn.memory.req_fillers, 4, 4, { color: '#fc03b6' })
            //spawn.room.visual.text("TowerKeepers: " + pop_towerKeepers + "/" + spawn.memory.req_towerKeepers, 4, 6, { color: '#fc03b6' })
            //spawn.room.visual.text("DistanceCarriers: " + pop_distanceCarriers, 4, 8, { color: '#fc03b6' })
            //spawn.room.visual.text("Merchants: " + pop_merchants + "/" + spawn.memory.req_merchants, 4, 10, { color: '#fc03b6' })
            //spawn.room.visual.text("Scouts: " + pop_scouts + "/" + spawn.memory.req_scouts, 4, 11, { color: '#fc03b6' })
            spawn.room.visual.text("KeeperKillers; " + pop_keeperKillers, 4, 14, { color: '#fc03b6' })
            spawn.room.visual.text("KeeperFarmers; " + pop_keeperFarmers, 4, 15, { color: '#fc03b6' })
            spawn.room.visual.text("KeeperCarriers; " + pop_keeperCarriers, 4, 16, { color: '#fc03b6' })
            spawn.room.visual.text("KeeperrRepairers; " + pop_keeperRepairers, 4, 17, { color: '#fc03b6' })
            //spawn.room.visual.text("Miners: " + pop_miners + "/" + spawn.memory.req_miners, 4, 18, { color: '#fc03b6' })
            

            //spawn.room.visual.text("RampartRepairers: " + pop_rampart_repairers + "/" + spawn.memory.req_rampart_repairers, 20, 2, { color: '#fc03b6' })
            spawn.room.visual.text("MeleeDefenders: " + pop_melee_defenders + "/" + spawn.memory.need_melee_defenders, 20, 3, { color: '#fc03b6' })
            spawn.room.visual.text("Building stage: " + spawn.memory.building_stage, 20, 4, { color: '#fc03b6' })

            spawn.room.visual.text("Time: " + Game.time, 20, 0, { color: '#fc03b6' })

            spawn.room.visual.text("Calculated final income/t: " + spawn.memory.total_calculated_income_per_tick, 44, 3, { color: 'lightblue' })

            spawn.room.visual.text("mean used Cpu: " + Math.round(spawn.memory.mean_cpu * 100) / 100, 44, 5, { color: '#fc03b6' })

            
            
            


            if (spawn.room.memory.energy_on_ramparts != undefined) {
                spawn.room.visual.text("Energy spent on ramparts: " + (spawn.room.memory.energy_on_ramparts), 41, 7, { color: '#fc03b6' })

                var temp_en_ramp = spawn.room.memory.energy_on_ramparts / ((Game.time % step) + 1)
                temp_en_ramp = Math.round((temp_en_ramp) * 100) / 100

                spawn.room.memory.mean_energy_on_ramparts = temp_en_ramp


            }
            if (spawn.room.memory.mean_energy_on_ramparts != undefined) {
                spawn.room.visual.text("Energy on ramparts/t: " + (spawn.room.memory.mean_energy_on_ramparts), 41, 8, { color: 'lightblue' })
            }

            // delivered energy works only with storage and distanceCarriers2 - not including links at rcl8
            // it should be close to "Calculated final Income"
            if (spawn.room.memory.delivered_energy != undefined) {
                //spawn.room.visual.text("Delivered energy: " + (spawn.room.memory.delivered_energy), 41, 9, { color: '#fc03b6' })
                var temp_energy = spawn.room.memory.delivered_energy / ((Game.time % step) + 1)
                temp_energy = Math.round((temp_energy) * 100) / 100
                spawn.room.memory.mean_delivered_energy = temp_energy
            }
            if (spawn.room.memory.mean_delivered_energy != undefined) {
                if(spawn.room.storage!=undefined)
                {
                    spawn.room.visual.text((spawn.room.memory.mean_delivered_energy) + "/" + (spawn.memory.farming_sources.length * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)+"/t"),
                    spawn.room.storage.pos.x, spawn.room.storage.pos.y, { color: '#fc03b6', font: 0.6 })
                }
                
            }


            if (spawn.room.memory.energy_on_creeps != undefined) {
                //spawn.room.visual.text("energy spent on creeps: " + (spawn.room.memory.energy_on_creeps), 41, 11, { color: '#fc03b6' })
                var temp_energy = spawn.room.memory.energy_on_creeps / ((Game.time % step) + 1)
                temp_energy = Math.round((temp_energy) * 100) / 100
                spawn.room.memory.mean_energy_on_creeps = temp_energy


            }
            if (spawn.room.memory.mean_energy_on_creeps != undefined) {
                //spawn.room.visual.text("energy on creeps/t: " + (spawn.room.memory.mean_energy_on_creeps), 41, 12, { color: 'lightblue' })
            }

            if (spawn.room.memory.energy_sent != undefined && Game.time % step == 0) {
                spawn.room.memory.mean_energy_sent = spawn.room.memory.energy_sent / step
                spawn.room.memory.energy_sent = 0;
            }
            spawn.room.memory.total_repairers_energy = 0;
            for (farming_room of spawn.memory.farming_rooms) {
                
                if (Game.rooms[farming_room.name] != undefined) {
                    if (Game.rooms[farming_room.name].memory.energy_on_repair != undefined) {
                        if (spawn.room.memory.total_repairers_energy != undefined) {
                            spawn.room.memory.total_repairers_energy += Game.rooms[farming_room.name].memory.energy_on_repair
                        }
                        else {
                            spawn.room.memory.total_repairers_energy = Game.rooms[farming_room.name].memory.energy_on_repair
                        }
                    }
                }
            }
            if (spawn.room.memory.total_repairers_energy != undefined) {
                var temp_energy = spawn.room.memory.total_repairers_energy / ((Game.time % step) + 1)
                spawn.room.memory.mean_total_repairers_energy = Math.round((temp_energy) * 100) / 100
                // energy on repair in all farming rooms
                spawn.room.visual.text("energy on repair/t: " + (spawn.room.memory.mean_total_repairers_energy), 41, 13, { color: 'lightblue' })
            }
            if (spawn.room.memory.mean_delivered_energy != undefined && spawn.room.memory.mean_energy_on_creeps != undefined
                && spawn.room.memory.mean_energy_on_ramparts != undefined) {
                //spawn.room.memory.energy_income_t=(spawn.memory.farming_sources.length*(SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME))
                spawn.room.memory.energy_income_t = spawn.room.memory.mean_delivered_energy - spawn.room.memory.mean_energy_on_creeps
                    - spawn.room.memory.mean_energy_on_ramparts - (Math.round((spawn.memory.progress_sum / spawn.memory.progress_counter) * 100) / 100)
                    - spawn.room.memory.mean_total_repairers_energy
                spawn.room.visual.text("final energy income/t: " + Math.round(spawn.room.memory.energy_income_t * 100) / 100, 41, 14, { color: 'lightblue' })
            }
            spawn.room.visual.text((Game.time % step) + 1 + "/" + step, 48, 4, { fill: 'transparent', font: '0.5' })
            spawn.room.visual.rect(48, 4.5, 1, 11, { fill: 'transparent', stroke: '#fff' })
            spawn.room.visual.rect(48, 4.5, 1, (((Game.time % step) + 1) / step) * 11, { stroke: '#fff' })
            

            
            


            for (let spawnName2 in Game.spawns) {

                if (spawnName2 != spawn.name) {
                    continue;
                }
                var aux_spawn = Game.spawns[spawnName2];
                if (aux_spawn.spawning) {
                    var aux_role = Game.creeps[aux_spawn.spawning.name].memory.role;
                    if (aux_role == "upgrader") { upgraders_parts += _.filter(creep.body, { type: WORK }).length; }
                    else if (aux_role == "builder") { pop_builders++; }
                    else if (aux_role == "hauler") { pop_haulers++; }
                    else if (aux_role == "soldier") { pop_soldiers++; }
                    else if (aux_role == "towerKeeper") { pop_towerKeepers++; }
                    else if (aux_role == "claimer") { pop_claimers++; }
                    else if (aux_role == "distanceBuilder") { pop_distanceBuilders++; }
                    else if (aux_role == "reserver") { pop_reservers++; }
                    else if (aux_role == "distanceCarrier") { pop_distanceCarriers++; }
                    else if (aux_role == "scout") { pop_scouts++; }
                    else if (aux_role == "colonizer") { pop_colonizers++; }
                    else if (aux_role == "rampartRepairer") { pop_rampart_repairers += _.filter(creep.body, { type: WORK }).length; }
                    else if (aux_role == "meleeDefender") { pop_melee_defenders += _.filter(creep.body, { type: ATTACK }).length; }
                    else if (aux_role == 'keeperKiller') { pop_keeperKillers++ }
                }

            }


            //passing spawning to second spawn
            if (spawn.spawning != null && spawn.spawning.remainingTime + 2 < spawn.spawning.needTime && Game.spawns[spawn.room.name + '_2'] != undefined) {
                if (spawn.spawning) {
                    if (spawn.spawning.remainingTime < spawn.spawning.needTime - 5
                        && Game.spawns[spawn.room.name + '_2'].spawning == null) {
                        var aux_memory = spawn.memory;
                        spawn = Game.spawns[spawn.room.name + '_2'];
                        spawn.memory = aux_memory;

                    }
                }

                //passing spawning to third spawn
                if (spawn.spawning != null && spawn.spawning.remainingTime + 4 < spawn.spawning.needTime && Game.spawns[spawn.room.name + '_3'] != undefined) {
                    if (spawn.spawning) {
                        if (spawn.spawning.remainingTime < spawn.spawning.needTime - 5
                            && Game.spawns[spawn.room.name + '_3'].spawning == null) {
                            var aux_memory = spawn.memory;
                            spawn = Game.spawns[spawn.room.name + '_3'];
                            spawn.memory = aux_memory;

                        }
                    }

                }

            }

            var farming_needs_satisfied = false;
            var farming_sources_length = Math.max(1,Math.floor(spawn.memory.farming_sources.length / 2)-1);
            
            if (spawn.memory.farming_rooms != undefined && spawn.memory.farming_sources.length > 0 && 
                Math.ceil(spawn.memory.farming_sources[farming_sources_length].carry_power) >= Math.min(spawn.memory.farming_sources[farming_sources_length].harvesting_power * 0.5, (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * 0.5)
                && (spawn.memory.farming_sources[farming_sources_length].harvesting_power > (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * 0.5 || spawn.memory.farming_sources[farming_sources_length].farmers>=spawn.memory.farming_sources[farming_sources_length].max_farmers )
            ) {
                farming_needs_satisfied = true
            }

            spawn.visualize(spawn,farming_needs_satisfied,spawned_body_parts,pop_haulers,pop_claimers,pop_scanners,pop_colonizers,pop_doctors)
            


            //spawning swarm
            spawn.memory.isSpawningSwarm = false;
            for (s of spawn.memory.swarms) {
                if (!s.completed && pop_fillers == spawn.memory.req_fillers && farming_needs_satisfied && pop_haulers >= spawn.memory.req_haulers) {
                    
                    spawn.memory.isSpawningSwarm = true
                    var spawn_result = spawn.spawnCreep(maxSoldier(energyCap), 'swarm' + spawn.room.name + '_' + Game.time, {
                        memory: {
                            role: 'swarmMember',
                            home_room: spawn.room,
                            swarmId: s.id
                        }
                    })
                    if (spawn_result == 0) {
                        spawn.memory.isSpawningSwarm = true
                        continue;
                    }
                }
            }

            spawn.memory.isSpawningQuad = false;
            for (q of spawn.memory.quads) {
                //console.log(q.id, " ",(((!q.completed) && pop_fillers == spawn.memory.req_fillers && farming_needs_satisfied && pop_haulers >= spawn.memory.req_haulers
                //    && (q.members != undefined && q.members.length < 4))))

                //console.log(q.id," asdasd ", farming_needs_satisfied)
                var ifSpawn=!q.completed && pop_fillers == spawn.memory.req_fillers && farming_needs_satisfied && pop_haulers >= spawn.memory.req_haulers
                    && (q.members != undefined && q.members.length < 4)

                if(ifSpawn==false && q.members!=undefined && q.members.length>0 && q.members.length<4)
                {//spawn already started spawning
                    ifSpawn=true
                }
                if (ifSpawn) {

                    //console.log("entering spawning quad")
                    //skipping starting spawning another quad if not enough energy
                    if(q.members.length==0 && spawn.room.storage!=undefined && spawn.room.storage.store[RESOURCE_ENERGY]<35000)
                    {
                        console.log("skipping spawning quad")
                        continue;
                    }

                    //spawn.memory.isSpawningQuad = true;
                    body=[];
                    // (ENERGY_CAPACITY)*()
                    var minBodyCost=EXTENSION_ENERGY_CAPACITY[spawn.room.controller.level]*CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][spawn.room.controller.level];
                    
                    minBodyCost*=0.8
                    
                    console.log("min bodyCost: ",minBodyCost,", energyCap:",energyCap)
                    if(q.members.length%2){
                        body=maxQuadRanger(Math.max(energyCap, q.minEnergyOnCreep,minBodyCost))
                    }
                    else{
                        body=maxQUadHealer(Math.max(energyCap, q.minEnergyOnCreep,minBodyCost))
                    }
                    //for movement caching work
                    //body=[MOVE]
                    //
                    var spawn_result = spawn.spawnCreep(body, 'quad' + spawn.room.name + '_' + Game.time, {
                        memory: {
                            role: 'quadMember',
                            home_room: spawn.room,
                            quadId: q.id
                        }
                    })
                    //console.log("quad spawning result: ", spawn_result)
                    if (spawn_result == 0 || spawn_result==-10) {
                        if (energyCap > q.minEnergyOnCreep) {
                            q.minEnergyOnCreep = energyCap
                        }

                        console.log("spawning creep for quad: ",q.id, ", it have ",q.members.length," members")
                        spawn.memory.isSpawningQuad = true
                        break;
                    }
                }
                else{
                    /*
                    console.log("not spawning quad because: ")
                    console.log("!q.completed: ",!q.completed)
                    console.log("pop_fillers == spawn.memory.req_fillers: ",pop_fillers == spawn.memory.req_fillers )
                    console.log("farming_needs_satisfied: ", farming_needs_satisfied)
                    console.log("pop_haulers >= spawn.memory.req_haulers: ",pop_haulers >= spawn.memory.req_haulers)
                    console.log("(q.members != undefined && q.members.length < 4) ",(q.members != undefined && q.members.length < 4))
                    */
                   
                    //(!q.completed && pop_fillers == spawn.memory.req_fillers && farming_needs_satisfied && pop_haulers >= spawn.memory.req_haulers
                     //   && (q.members != undefined && q.members.length < 4))
                }
            }







            //spawning duo
            spawn.memory.isSpawningDuo = false
            // loop for spawning duos
            if (spawn.spawning == null || true) {
                for (d of spawn.memory.duos) {
                    if (!d.isDead)// if duo is not dead
                    {
                        if (d.leaderId == undefined) {
                            spawn.memory.isSpawningDuo = true
                            var leaderBody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL];
                            leaderBody = maxSoldier(energyCap)
                            spawn.memory.leaderSpawningResult = spawn.spawnCreep(leaderBody, "DL" + d.id, { memory: { home_room: spawn.room, role: 'duoLeader', duoId: d.id } })
                            if (spawn.spawnCreep(leaderBody, "DL" + d.id, { memory: { homeRoom: spawn.room, role: 'duoLeader', duoId: d.id } }) == 0) {

                                spawn.memory.isSpawningDuo = true
                            }
                        }
                        else if (d.followerId == undefined) {
                            spawn.memory.isSpawningDuo = true
                            var followerBody = [MOVE, HEAL]

                            //followerBody=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]

                            //5400 energy
                            followerBody = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL]
                            followerBody = maxDuoHealer(energyCap)
                            spawn.memory.followerSpawningResult = spawn.spawnCreep(followerBody, "DF" + d.id, { memory: { home_room: spawn.room, role: 'duoFollower', duoId: d.id } })
                            if (spawn.spawnCreep(followerBody, "DF" + d.id, { memory: { homeRoom: spawn.room, role: 'duoFollower', duoId: d.id } }) == 0) {

                                spawn.memory.isSpawningDuo = true
                            }
                        }
                    }
                }
            }
            if (pop_haulers < spawn.memory.req_haulers)//spawning new hauler
            {
                var limit = false;
                if (spawn.room.controller.level == 8) {
                    limit = true;
                }
                if (spawn.spawnCreep(maxDistanceCarrier(energyCap, spawn, limit), 'hauler_' + spawn.room.name + '_' + Game.time, { memory: { role: 'hauler', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }

            if ((spawn.memory.isSpawningDuo == true || spawn.memory.isSpawningSwarm == true || spawn.memory.isSpawningQuad)
                //&& pop_haulers>0
            ) { continue; }

            if (pop_haulers > 0 && pop_merchants > 0) {
                if (spawn.memory.need_keeperHealer != undefined && false) {
                    var healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                    if (spawn.room.controller.level == 5 || spawn.room.controller.level == 6) {
                        healer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL];
                    }
                    if (spawn.spawnCreep(healer_body, 'KeeperHealer_' + spawn.room.name + '_' + Game.time, { memory: { role: 'keeperHealer', target: spawn.memory.need_keeperHealer, home_room: spawn.room } }) == 0) {
                        
                        continue;
                    }
                }
                if (spawn.memory.need_keeperKiller != undefined) {

                    var killer_body = [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL]
                    //var killer_body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL]

                    if (spawn.spawnCreep(killer_body, 'KeeperKiller_' + spawn.room.name + '_' + Game.time, { memory: { role: 'keeperKiller', target_room: spawn.memory.need_keeperKiller, home_room: spawn.room } }) == 0) {
                        
                        continue;
                    }
                }
                if (spawn.memory.need_keeperCarrier != undefined) {
                    if (spawn.spawnCreep(maxDistanceCarrier(energyCap, spawn, false), 'KeeperCarrier_' + spawn.room.name + '_' + Game.time, { memory: { role: 'keeperCarrier', target_source: spawn.memory.need_keeperCarrier, target_room: spawn.memory.need_keeperCarrier_room, home_room: spawn.room } }) == 0) {
                        
                        continue;
                    }
                }
                if (spawn.memory.need_keeperFarmer != undefined) {
                    // update target_source

                    if (spawn.spawnCreep(maxKeeperFarmer(energyCap, spawn), 'KeeperFarmer_' + spawn.room.name + '_' + Game.time, { memory: { role: 'keeperFarmer', target_room: spawn.memory.need_keeperFarmer_room, home_room: spawn.room, target_source: spawn.memory.need_keeperFarmer } }) == 0) {
                        ;
                        continue;
                    }
                }
                if (spawn.memory.need_keeperRepairer != undefined) {
                    if (spawn.spawnCreep(maxColonizer(energyCap, 3200, 1200), 'keeperRepairer' + spawn.room.name + '_' + Game.time, { memory: { role: 'keeperRepairer', target_room: spawn.memory.need_keeperRepairer, home_room: spawn.room } }) == 0) {
                        
                        continue;
                    }
                }
            }

            if (pop_melee_defenders < spawn.memory.need_melee_defenders) {
               
                if (spawn.spawnCreep(maxMeleeSoldier(energyCap), 'MS_' + Game.time, { memory: { role: 'meleeDefender', home_room: spawn.room } }) == OK) {
                    continue;
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
                if (spawn.spawnCreep(body, 'Filler_' + spawn.room.name + '_' + Game.time, { memory: { role: 'filler', home_room: spawn.room } }) == OK) {
                    
                }
                continue;
            }

            if (spawn.memory.need_soldier != undefined && spawn.memory.state != undefined && !spawn.memory.state.includes("STATE_UNDER_ATTACK" )) {

                
                if (spawn.spawnCreep(maxSoldier(energyCap), 'Soldier_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'soldier', target_room:
                            spawn.memory.need_soldier, home_room: spawn.room
                    }
                }) == 0) {
                    continue;
                }
            }

            if (spawn.memory.need_melee_soldier != undefined
                && Game.rooms[spawn.memory.need_melee_soldier] != undefined ) {
                if (spawn.spawnCreep(maxMeleeSoldier(energyCap), 'Soldier_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'soldier', target_room:
                            spawn.memory.need_melee_soldier, home_room: spawn.room
                    }
                }) == 0) {
                    continue;
                }
            }


            if (pop_scouts < spawn.memory.req_scouts) {
                if (spawn.spawnCreep([MOVE], 'Scout_' + spawn.room.name + '_' + Game.time, { memory: { role: 'scout', home_room: spawn.room } }) == 0) {
                }
                continue;
            }

            if (pop_scanners < spawn.memory.req_scanners && farming_needs_satisfied /* && Memory.main_spawns.length + Memory.rooms_to_colonize.length < 4*/) {
                if (spawn.spawnCreep([MOVE], 'Scanner_' + spawn.room.name + '_' + Game.time, { memory: { role: 'scanner', home_room: spawn.room } }) == 0) {
                }
                continue;
            }
            if (spawn.memory.need_sponge != undefined && farming_needs_satisfied) {
                if (spawn.spawnCreep(maxSponge(energyCap, spawn), 'Sp_' + spawn.room.name + '_' + Game.time, { memory: { role: 'sponge', home_room: spawn.room, target_room: spawn.memory.need_sponge } }) == OK) {
                    continue;
                }
            }
            
            
            if (pop_colonizers < spawn.memory.req_colonizers && pop_claimers > 0 && spawn.room.controller.level >= 4
                && spawn.memory.to_colonize != undefined && farming_needs_satisfied
            ) {
                if (spawn.spawnCreep(maxColonizer(energyCap), 'Colonizer_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'colonizer',
                        home_room: spawn.room,
                        target_room: spawn.memory.to_colonize.name
                    }
                }) == 0) {
                }
                continue;
            }
            //if (spawn.memory.need_farmer != undefined) {
            if (spawn.memory.need_source_farmer != undefined && (spawn.memory.need_source_farmer != spawn.memory.need_soldier)) {
                
                
                var aux=spawn.spawnCreep(maxFarmer(energyCap, spawn, true), 'Farmer_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'farmer', home_room: spawn.room,
                        source_id: spawn.memory.need_source_farmer,
                        source_distance: spawn.memory.need_source_farmer_distance,
                        target_room: spawn.memory.need_source_farmer_room

                    }
                })
                if (aux== 0) {
                    //spawn.memory.farmers_counter++;
                    continue;
                }
                if (spawn.memory.farming_rooms[0].farmers == 0) {
                    continue;
                }

            }
            if (spawn.memory.need_distanceRepairer != undefined) {
                var if_limit = true;
                if (spawn.memory.need_distanceRepairer == spawn.room.name) {
                    if_limit = false;
                }

                if (spawn.spawnCreep(maxRepairer(energyCap, if_limit), 'distanceRepairer_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'distanceRepairer', home_room: spawn.room,
                        target_room: spawn.memory.need_distanceRepairer
                    }
                }) == 0) {
                    continue;
                }
            }
            if (pop_merchants < spawn.memory.req_merchants /* && spawn.room.terminal != undefined*/) {
                if (spawn.spawnCreep(maxMerchant(energyCap), 'Merchant_' + spawn.room.name + '_' + Game.time, { memory: { role: 'merchant', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }

            if (pop_builders < spawn.memory.req_builders && upgraders_parts > 0 /* && farming_needs_satisfied*/) // spawning new builder
            {
                spawn.spawnCreep(maxBuilder(energyCap, spawn), 'Builder_' + spawn.room.name + '_' + Game.time, { memory: { role: 'builder', home_room: spawn.room } });
                if (spawn.spawnCreep(maxBuilder(energyCap / 2, spawn), 'Builder_' + spawn.room.name + '_' + Game.time, { memory: { role: 'builder', home_room: spawn.room } }) == 0) {
                    continue;

                }
                continue;
            }
            if (//pop_upgraders < spawn.memory.req_upgraders 
                upgraders_parts < spawn.memory.req_upgraders_parts
                && spawn.memory.farming_rooms != undefined &&
                (spawn.memory.farming_rooms.length > 0 && spawn.memory.farming_rooms[0].carry_power > spawn.memory.farming_rooms[0].sources_num * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) * 0.5)
            ) // spawning new upgrader
            {
                if (spawn.spawnCreep(maxUpgrader(energyCap, spawn, Math.ceil(spawn.memory.req_upgraders_parts) * 200), 'Upgrader_' + spawn.room.name + '_' + Game.time, { memory: { role: 'upgrader', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }
            if (pop_towerKeepers < spawn.memory.req_towerKeepers) {
                if (spawn.spawnCreep(maxDistanceCarrier(energyCap % 2000, spawn), 'TowerKeeper_' + spawn.room.name + '_' + Game.time, { memory: { role: 'towerKeeper', home_room: spawn.room } }) == 0) {
                    continue;
                }


            }
            if (spawn.memory.to_colonize != undefined && spawn.memory.to_colonize.claimer == undefined/* && spawn.memory.claiming_rooms.length > 0*/) {
                //if(pop_claimers==0){pop_claimers=1;}
                if (spawn.spawnCreep(maxClaimer(energyCap), 'C_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'claimer',
                        target_room: spawn.memory.to_colonize.name,
                        to_colonize: spawn.memory.to_colonize,
                        home_room: spawn.room
                    }
                }) == 0) {
                    continue;
                }

                continue;
            }
            if (spawn.memory.need_reserver != undefined) {
                //if(pop_reservers==0){pop_reservers=1;}
                if (spawn.spawnCreep(maxReserver(energyCap), 'R_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'reserver',
                        target_room: spawn.memory.need_reserver, path: undefined, home_room: spawn.room
                    }
                }) == 0) {
                    continue;
                }
            }
            if (spawn.memory.need_DistanceCarrier != undefined && pop_distanceCarriers < 30
                && (spawn.memory.need_DistanceCarrier != spawn.memory.need_soldier || global.heap.soldiers[spawn.memory.need_source_farmer] > 0) && spawn.memory.need_DistanceCarrier != spawn.memory.need_melee_soldier) {

                if (spawn.spawnCreep(maxDistanceCarrier(energyCap, spawn, false), 'distnaceCarrier_' + spawn.room.name + '_' + Game.time, {
                    memory: {
                        role: 'distanceCarrier', home_room: spawn.room,
                        target_room: spawn.memory.need_DistanceCarrier, path: undefined,
                        source_id: spawn.memory.need_ddistance_carrier_source_id,
                        source_distance: spawn.memory.need_distance_carrier_source_distance
                    }
                }) == 0) {
                    spawn.memory.distance_carriers_counter++;
                    continue;
                }
                if (spawn.memory.need_DistanceCarrier == spawn.room.name) {
                    continue;
                }

            }

            if (pop_miners < spawn.memory.req_miners && spawn.memory.farming_rooms != undefined && spawn.memory.farming_rooms.length > 0 && spawn.memory.farming_rooms[0].carry_power >= spawn.memory.farming_rooms[0].harvesting_power) {

            
                if (spawn.spawnCreep(maxFarmer(energyCap, spawn), 'Miner_' + spawn.room.name + '_' + Game.time, { memory: { role: 'miner', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }
            if (pop_doctors < spawn.memory.req_doctors) {
                var doctor_body = [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
                if (spawn.spawnCreep(doctor_body, 'Doctor_' + spawn.room.name + '_' + Game.time, { memory: { role: 'doctor', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }
            if (pop_rampart_repairers < spawn.memory.req_rampart_repairers) {

                if (spawn.spawnCreep(maxRampartRepairer(energyCap, spawn.memory.req_rampart_repairers), 'RR_' + spawn.room.name + '_' + Game.time, { memory: { role: 'rampartRepairer', home_room: spawn.room } }) == 0) {
                    continue;
                }
            }

            if (/* false && */ Game.shard.name == 'shard3' && spawn.room.name == 'W19N13' && spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] > 100000) {
                if (spawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], 'IsCar' + Game.time) == 0) {
                    continue;
                }
            }






            var spawn_end_cpu = Game.cpu.getUsed()
            if (spawn.memory.mean_cpu_sum == undefined) {
                spawn.memory.mean_cpu_sum = spawn_end_cpu - spawn_start_cpu
                //spawn.memory.mean_cpu=spawn_end_cpu-spawn_start_cpu
            }
            else {
                spawn.memory.mean_cpu_sum += spawn_end_cpu - spawn_start_cpu
            }
            //spawn.room.visual.text("farmingNeedsSatisfied: "+farming_needs_satisfied,44,2, { color: '#fc03b6' })
            spawn.room.visual.text("used Cpu: " + Math.round(((spawn_end_cpu - spawn_start_cpu)) * 100) / 100, 44, 4, { color: '#fc03b6' })

            if (Game.time % step == 0) {
                spawn.memory.mean_cpu = spawn.memory.mean_cpu_sum / step
                spawn.memory.mean_cpu_sum = 0
            }


        }
    });

    for (spawnName in Game.spawns) {
        if (Game.spawns[spawnName].spawning != null &&
            Game.spawns[spawnName].spawning.remainingTime == Game.spawns[spawnName].spawning.needTime - 1
        ) {
            console.log("Spawn: ", spawnName, " is spawning creep")
            if (Game.spawns[spawnName].room.memory.energy_on_creeps == undefined) {
                Game.spawns[spawnName].room.memory.energy_on_creeps = 0;
            }
            if (Game.spawns[spawnName].room.memory.energy_on_creeps != undefined) {
                creep = Game.creeps[Game.spawns[spawnName].spawning.name];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: MOVE }).length * BODYPART_COST[MOVE];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: WORK }).length * BODYPART_COST[WORK];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: CARRY }).length * BODYPART_COST[CARRY];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: ATTACK }).length * BODYPART_COST[ATTACK];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: RANGED_ATTACK }).length * BODYPART_COST[RANGED_ATTACK];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: HEAL }).length * BODYPART_COST[HEAL];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: CLAIM }).length * BODYPART_COST[CLAIM];
                Game.spawns[spawnName].room.memory.energy_on_creeps += _.filter(creep.body, { type: TOUGH }).length * BODYPART_COST[TOUGH];
            }
        }
    }

    bucket.push(Game.cpu.bucket)
    if (bucket.length > 500) {
        bucket.shift()
    }
    CPU.push(Game.cpu.getUsed())
    if (CPU.length > 500) {
        CPU.shift()
    }
    console.log("Used CPU: ", Game.cpu.getUsed())

}