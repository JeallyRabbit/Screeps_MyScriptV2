var roleHarvester = require('role.harvester');
var roleCarrier=require('role.carrier');
var roleHauler = require('role.hauler');
var roleBuilder = require('role.builder');
var roleUpgrader=require('role.upgrader');
var roleRepairer=require('role.repairer')
var roleSoldier=require('role.soldier');
var roleFarmer=require('role.farmer');
var roleBerserk=require('role.berserk');
var roleTransporter=require('role.transporter');
var towers=require('towers');
var links=require('links');
var roleTowerKeeper=require('role.TowerKeeper');
var roleClaimer=require('role.Claimer');
var roleDistanceBuilder=require('role.DistanceBuilder');
var roleReserver=require('role.reserver');
var roleDistanceCarrier=require('role.DistanceCarrier');
var roleKeeperKiller=require('role.keeper_killer');
var roleKeeperHealer=require('role.keeper_healer');
var roleKeeperCarrier=require('role.keeper_carrier');
var _ = require('lodash');

const profiler = require('screeps-profiler');
const setRequiredPopulation=require('setRequiredPopulation');



const maxHarvester= require('maxHarvester');
const maxRepairer=require('maxRepairer');
const maxBuilder=require('maxBuilder');
const maxHauler=require('maxHauler');
const maxUpgrader=require('maxUpgrader');
const maxCarrier=require('maxCarrier');
const maxTransporter=require('maxTransporter');
const maxFarmer = require('maxFarmer');
const minSource=require('minSource');
const maxClaimer=require('maxClaimer');
const maxDistanceBuilder=require('maxDistanceBuilder');

var RoomPositionFunctions=require('roomPositionFunctions');
const maxSoldier = require('./maxSoldier');
const maxReserver = require('./maxReserver');
const setBaseLayout = require('./setBaseLayout');




profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function()
    {
        
    
    for(var i in Memory.creeps) {  //clearing data about dead creeps
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    //var mySpawns=Game.spawns;
    if(Game.time%40==0)
    {
        setRequiredPopulation(Game.spawns);
        /*if(Game.cpu.bucket==10000)
        {
            Game.cpu.generatePixel();
        }*/
        
    }

    for(let spawnName in Game.spawns)
    {
        const myRooms = Object.keys(Game.rooms).filter(roomName => {
            const room = Game.rooms[roomName];
            return room.controller && room.controller.my;
        });
        //console.log(Game.spawns[spawnName].name)
        var spawn=Game.spawns[spawnName];
        //console.log("spawns_num: ",Game.spawns.length);
        if(spawn==undefined){continue;}
        if(Game.spawns[spawnName].memory.roles_counter==undefined)
        {
            Game.spawns[spawnName].memory.roles_counter=0;
        }
    
        var roles_num=15;// 0 1 2 3 4 5 6 7 8 9 10 11 12 13 
        //var Game.spawns[spawnName].memory.roles_counter=0;
        
        if(Game.time%100==0)
        {
            setBaseLayout(spawn);
        }
        if(Game.time%1==0)
        {
            spawn.memory.progress_old=spawn.memory.progress;
            spawn.memory.progress=spawn.room.controller.progress;
            if(spawn.memory.progress_old!=0)
            {
                spawn.memory.progress_sum+=(spawn.memory.progress-spawn.memory.progress_old);
            }
            spawn.memory.progress_counter+=1;

            var hostile_creeps=spawn.room.find(FIND_HOSTILE_CREEPS);
            console.log("hostile_Creeps: ",hostile_creeps);
            if(hostile_creeps.length==0)
            {
                //spawn.memory.req_soldiers=0;
            }
            else{
                //spawn.memory.req_soldiers=3;
            }
        }

    //const room=Game.rooms[myRooms[0]];
    const sources=spawn.room.find(FIND_SOURCES);
    //console.log(sources_hp.length);
    var sources_hp=[];// harvesting power assigned to every source in my room (working only for first room)
    for(let i=0;i<sources.length;i++)
    {  
        sources_hp[i]=0;
    }
    
    var pop_harvesters=0;
    var pop_carriers=0;
    var pop_builders=0;
    var pop_upgraders=0;
    var pop_repairers=0;
    var pop_haulers=0;
    var pop_soldiers=0;
    var pop_farmers=0;
    var pop_berserkers=0;
    var pop_transporters=0;
    var pop_towerKeepers=0;
    var pop_claimers=0;
    var pop_distanceBuilders=0;
    var pop_reservers=0;
    var pop_distanceCarriers=0;
    var pop_keeperKillers=0;
    var pop_keeperHealers=0;
    var pop_keeperCarriers=0;
    var smallest_carrier=100;
    if(Game.spawns[spawnName].memory.roles_counter>roles_num){Game.spawns[spawnName].memory.roles_counter=0;}

    towers.tick(spawn);
    links.tick(spawn);
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.home_room.name== spawn.room.name)
        {
            if(creep.memory.role == 'harvester') 
            {
                const workParts = _.filter(creep.body, { type: WORK }).length;
                creep.memory.harvesting_power=workParts*2;
                sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                //creep.say(workParts);
                roleHarvester.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_harvesters++;
                }
            }
            else if(creep.memory.role=='carrier')
            {
                //creep.suicide();
                roleCarrier.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_carriers++;
                }
                if(creep.body.length<smallest_carrier)
                {
                    smallest_carrier=creep.body.length;
                }
                /*
                const bodyParts = creep.body.length;
                if(maxCarrier(spawn.room.energyAvailable,spawn).length>bodyParts && pop_carriers<spawn.memory.req_carriers+3)
                {//can spawn better creep
                    if(spawn.spawnCreep(maxCarrier(spawn.room.energyAvailable,spawn),'Carrier'+Game.time, {memory: {role: 'carrier', home_room: spawn.room}})==0)
                    {
                        console.log('Spawning Carrier');
                        //Game.spawns[spawnName].memory.roles_counter++;
                    }
                }*/
            }  
            else if(creep.memory.role=='upgrader')
            {
                roleUpgrader.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_upgraders++;
                }
            }
            else if(creep.memory.role=='hauler')
            {
                roleHauler.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_haulers++;
                }
                
            }
            else if(creep.memory.role=='builder')
            {
                roleBuilder.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_builders++;
                }
            }
            else if(creep.memory.role=='repairer')
            {
                pop_repairers++;
                roleRepairer.run(creep,spawn);
            }
            else if(creep.memory.role=='soldier')
            {
                roleSoldier.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_soldiers++;
                }
                
            }
            else if(creep.memory.role=='farmer')
            {
                
                const workParts = _.filter(creep.body, { type: WORK }).length;
                creep.memory.harvesting_power=workParts*2;
                //sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                roleFarmer.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_farmers++;
                }
                
                
            }
            else if(creep.memory.role=='berserk')
            {
                //creep.suicide();
                roleBerserk.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_berserkers++;
                }
            }
            else if(creep.memory.role=='transporter')
            {
                roleTransporter.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_transporters++;
                }
            }
            else if(creep.memory.role=='towerKeeper')
            {
                roleTowerKeeper.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_towerKeepers++;
                }
            }
            else if(creep.memory.role=='claimer')
            {
                //console.log("CLAIMING");
                roleClaimer.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_claimers++;
                }
            }
            else if(creep.memory.role=='distanceBuilder')
            {
                roleDistanceBuilder.run(creep);
                if(creep.ticksToLive>100)
                {
                    pop_distanceBuilders++;
                }
            }
            else if(creep.memory.role=='reserver')
            {
                roleReserver.run(creep);
                if(creep.ticksToLive>100)
                {
                    pop_reservers++;
                }
            }
            else if(creep.memory.role=='distanceCarrier')
            {
                roleDistanceCarrier.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_distanceCarriers++;
                }
            }
            else if(creep.memory.role=='soldier')
            {
                roleSoldier.run(creep);
                if(creep.ticksToLive>100)
                {
                   pop_soldiers++; 
                }
            }
            else if(creep.memory.role=='keeperKiller')
            {
                //creep.suicide();
                roleKeeperKiller.run(creep);
                if(creep.ticksToLive>100)
                {
                    pop_keeperKillers++;
                }
            }
            else if(creep.memory.role=='keeperHealer')
            {
                roleKeeperHealer.run(creep);
                if(creep.ticksToLive>100)
                {
                    pop_keeperHealers++;
                }
            }
            else if(creep.memory.role=='keeperCarrier')
            {
                //creep.suicide();
                roleKeeperCarrier.run(creep,spawn);
                if(creep.ticksToLive>100)
                {
                    pop_keeperCarriers++;
                }
            }
        }

        
        
    }

    console.log("-----------------------", Game.spawns[spawnName] ,"---------------------------------");
    console.log("Harvesters:", pop_harvesters,"/",spawn.memory.req_harvesters," | ",
    "Carriers: ", pop_carriers,"/",spawn.memory.req_carriers," | ",
    "Upgraders: ", pop_upgraders,"/",spawn.memory.req_upgraders, " | ",
    "Builders: ", pop_builders,"/",spawn.memory.req_builders," | ",
    "Repairers: ", pop_repairers, "/",spawn.memory.req_repairers);

    console.log("haulers: ", pop_haulers,"/",spawn.memory.req_haulers," | ",
    "Soldiers: ",pop_soldiers,"/",spawn.memory.req_soldiers," | ",
    "Farmers: ", pop_farmers,"/",spawn.memory.req_farmers," | ",
    'Berskerkers: ', pop_berserkers,"/",spawn.memory.req_berserk," | ",
    "Transporters: ",pop_transporters,"/",spawn.memory.req_transporters);

    console.log("TowerKeepers: ",pop_towerKeepers,"/",spawn.memory.req_towerKeepers, " | ",
    "Claimers: ",pop_claimers,"/",spawn.memory.req_claimers," | ",
    "DistanceBuilders: ",pop_distanceBuilders,"/",spawn.memory.req_distanceBuilders," | ",
    "Reservers: ", pop_reservers,"/",spawn.memory.req_reservers);

    console.log("DistanceCarriers: ",pop_distanceCarriers,"/",spawn.memory.req_DistanceCarriers, " | ",
    "Keeper Killers: ", pop_keeperKillers,"/",spawn.memory.req_keeperKillers," | ",
    "Keeper Healers: ", pop_keeperHealers,"/",spawn.memory.req_keeperHealers);
    console.log("roles_counter: ", Game.spawns[spawnName].memory.roles_counter," | farmers_counter: ",spawn.memory.farmers_counter,
    " | distance_carriers_counter: ",spawn.memory.distance_carriers_counter);
    if(spawn.memory.progress!=0 && spawn.memory.progress_old!=0 &&
        spawn.memory.progress_sum!=0  && spawn.memory.progress_counter>4 &&
        spawn.memory.progress!=spawn.memory.progress_old)
    {
        console.log("Progress/tick: ", (spawn.memory.progress_sum/spawn.memory.progress_counter));
        //console.log("Spawn points: ",spawn.memory.progress);
    }
    
    
    
    
    var energyCap=spawn.room.energyAvailable;
    console.log("energyCap: ", energyCap);
    

    if(pop_harvesters<Game.spawns[spawnName].memory.req_harvesters /* && spawn.memory.roles_counter==0*/) // spawning new harvester
    {
        
        var assigned_source=-1;
        var assigned_source=minSource(sources_hp);
        if(assigned_source>=0)
        {
            if(spawn.spawnCreep(maxHarvester(energyCap),'Harvester'+Game.time, {memory: {role: 'harvester',
            target_source: assigned_source, home_room: spawn.room}})==0)
            {
                const workParts = _.filter(creep.body, { type: WORK }).length;
                //creep.say(workParts);
                creep.memory.harvesting_power=workParts*2;
                sources_hp[assigned_source]+=energyCap/150;//harvesting power approximately
                console.log('Spawning Harvester');
                Game.spawns[spawnName].memory.roles_counter++;
            }
        }
    }
    else if(pop_carriers<Game.spawns[spawnName].memory.req_carriers/*  && spawn.memory.roles_counter==1 */ && pop_carriers<pop_harvesters) // spawning new Carrier
    {
        if(spawn.spawnCreep(maxCarrier(energyCap,spawn),'Carrier'+Game.time, {memory: {role: 'carrier', home_room: spawn.room}})==0)
        {
            console.log('Spawning Carrier');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    if(pop_soldiers<Game.spawns[spawnName].memory.req_soldiers )
    {
        if(spawn.spawnCreep(maxSoldier(energyCap),'Soldier'+Game.time,{memory: {role: 'soldier', target: spawn.room.name,home_room: spawn.room}})==0)
        {
            console.log("Spawning Soldier");
            Game.spawns[spawnName].memory.roles_counter++;
            
        }
    }
    if(pop_berserkers<Game.spawns[spawnName].memory.req_berserk && Game.spawns[spawnName].memory.roles_counter==8 && pop_harvesters>0)
    {
        if(spawn.spawnCreep([TOUGH,TOUGH,MOVE,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE],'Berserker'+Game.time,{memory: {role: 'berserk',home_room: spawn.room, target_room: 'W2N8'}})==0)
        {//costs 520 energy
            console.log("Spawning Berserker");
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_farmers<spawn.memory.req_farmers && Game.spawns[spawnName].memory.roles_counter==2 && pop_harvesters>0)//spawning new farmer
    {
        //console.log("ASD");
        //if(pop_farmers==0){pop_farmers=1;}
        if(spawn.spawnCreep(maxFarmer(energyCap,spawn),'Farmer'+Game.time,{memory: {role: 'farmer', home_room: spawn.room,
         target_room: spawn.memory.farming_rooms[spawn.memory.farmers_counter%spawn.memory.farming_rooms.length], path: undefined}})==0)
        {
            console.log("Spawning Farmer");
            Game.spawns[spawnName].memory.roles_counter++;
            spawn.memory.farmers_counter++;
        }
    }
    else if(pop_builders<Game.spawns[spawnName].memory.req_builders && Game.spawns[spawnName].memory.roles_counter==3 && pop_carriers>0) // spawning new builder
    {
        //console.log(spawn.spawnCreep(maxBuilder(energyCap,spawn),'Builder'+Game.time, {memory: {role: 'builder',home_room: spawn.room}}));
        if(spawn.spawnCreep(maxBuilder(energyCap,spawn),'Builder'+Game.time, {memory: {role: 'builder',home_room: spawn.room}})==0)
        {
            console.log('Spawning Builder');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_haulers<Game.spawns[spawnName].memory.req_haulers && Game.spawns[spawnName].memory.roles_counter==4
        && pop_harvesters>=1)//spawning new hauler
    {
        if(spawn.spawnCreep(maxHauler(energyCap,spawn),'hauler'+Game.time,{memory: {role: 'hauler',home_room: spawn.room, cID_min: -1, cID_max:-1}})==0)
        {
            console.log("Spawning hauler");
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_upgraders<spawn.memory.req_upgraders && pop_carriers>=spawn.memory.req_carriers ) // spawning new upgrader
    {
        if(spawn.spawnCreep(maxUpgrader(energyCap,spawn),'Upgrader'+Game.time, {memory: {role: 'upgrader',home_room: spawn.room}})==0)
        {
            console.log('Spawning Upgrader');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_repairers<Game.spawns[spawnName].memory.req_repairers && Game.spawns[spawnName].memory.roles_counter==6 && pop_upgraders>0)//spawning new repairer
    {
        if(spawn.spawnCreep(maxRepairer(energyCap),'Repairer'+Game.time, {memory: {role: 'repairer',home_room: spawn.room}})==0)
        {
            console.log('Spawning Repairer');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_transporters<Game.spawns[spawnName].memory.req_transporters && Game.spawns[spawnName].memory.roles_counter==9 && pop_carriers>0)
    {
        storages_num = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_STORAGE }
        });
        if(storages_num.length>0)
        {
            if(spawn.spawnCreep(maxTransporter(energyCap,spawn),'Transporter'+Game.time,{memory: {role: 'transporter',home_room: spawn.room}})==0)
            {
                console.log('Spawning Transporter')
                Game.spawns[spawnName].memory.roles_counter++;
            }
        }
        
    }
    else if(pop_towerKeepers<Game.spawns[spawnName].memory.req_towerKeepers && Game.spawns[spawnName].memory.roles_counter==10 && pop_carriers>=spawn.memory.req_carriers)
    {
        if(spawn.spawnCreep(maxTransporter(energyCap,spawn),'TowerKeeper'+Game.time,{memory: {role: 'towerKeeper',home_room: spawn.room}})==0)
        {
            console.log('Spawning TowerKeeper')
            Game.spawns[spawnName].memory.roles_counter++;
        }
        
        
    }
    else if(pop_claimers<Game.spawns[spawnName].memory.req_claimers && spawn.memory.claiming_rooms.length>0 && spawn.memory.roles_counter==11)
    {
        //if(pop_claimers==0){pop_claimers=1;}
        if(spawn.spawnCreep(maxClaimer(energyCap),'C'+Game.time,{memory: {role: 'claimer', 
        target_room: spawn.memory.claiming_rooms[pop_claimers%spawn.memory.claiming_rooms.length], path: undefined,home_room: spawn.room}})==0)
        {
            console.log('Spawning Claimer');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_distanceBuilders<Game.spawns[spawnName].memory.req_distanceBuilders && spawn.memory.roles_counter==12 && pop_distanceCarriers<pop_farmers)
    {
        if(spawn.spawnCreep(maxDistanceBuilder(energyCap),'DistanceBuilder'+Game.time,{memory: {role: 'distanceBuilder',
        target_room: spawn.memory.claiming_rooms[pop_distanceBuilders%spawn.memory.claiming_rooms.length],
        home_room: spawn.room, path: undefined,home_room: spawn.room}})==0)
        {
            console.log('Spawning DistanceBuilder');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_reservers<Game.spawns[spawnName].memory.req_reservers && spawn.memory.farming_rooms.length>0 && spawn.memory.roles_counter==13 && pop_farmers>=1)
    {
        //if(pop_reservers==0){pop_reservers=1;}
        if(spawn.spawnCreep(maxReserver(energyCap),'R'+Game.time,{memory: {role: 'reserver',
        target_room: spawn.memory.farming_rooms[spawn.memory.reservers_counter%spawn.memory.farming_rooms.length], path: undefined,home_room: spawn.room}})==0)
        {
            console.log('Spawning Reserver');
            Game.spawns[spawnName].memory.roles_counter++;
            spawn.memory.reservers_counter++;
        }
    }
    else if(pop_distanceCarriers<spawn.memory.req_DistanceCarriers && Game.spawns[spawnName].memory.roles_counter==14 && pop_farmers>0
    && pop_harvesters>0)//spawning new DistanceCarrier
    {
        //console.log("ASD");
        //if(pop_distanceCarriers==0){pop_distanceCarriers=1;}
        //return 0;
        if(spawn.spawnCreep(maxHauler(energyCap,spawn),'distnaceCarrier'+Game.time,{memory: {role: 'distanceCarrier', home_room: spawn.room,
         target_room: spawn.memory.farming_rooms[spawn.memory.distance_carriers_counter%spawn.memory.farming_rooms.length], path: undefined}})==0)
        {
            console.log("Spawning DistanceCarrier");
            Game.spawns[spawnName].memory.roles_counter++;
            spawn.memory.distance_carriers_counter++;
        }
        
    }
    else if(pop_keeperKillers<spawn.memory.req_keeperKillers )
    {
        const killer_body=[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK];
        if(spawn.spawnCreep(killer_body,'KeeperKiller'+Game.time,{memory: {role: 'keeperKiller', target: spawn.memory.keepers_rooms[0],home_room: spawn.room}})==0)
        {
            console.log("Spawning KeeperKiller");
            Game.spawns[spawnName].memory.roles_counter++;
            
        }
    }
    else if(pop_keeperHealers<spawn.memory.req_keeperHealers)
    {
        const healer_body=[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL];
        if(spawn.spawnCreep(healer_body,'KeeperHealer'+Game.time,{memory: {role: 'keeperHealer', target: spawn.memory.keepers_rooms[0],home_room: spawn.room}})==0)
        {
            console.log("Spawning KeeperHealer");
            Game.spawns[spawnName].memory.roles_counter++;
            
        }
    }
    else if(pop_keeperCarriers<spawn.memory.req_keeperCarriers)
    {
        if(spawn.spawnCreep(maxHauler(energyCap,spawn),'KeeperCarrier'+Game.time,{memory: {role: 'keeperCarrier', target_room: spawn.memory.keepers_rooms[0],home_room: spawn.room}})==0)
        {
            console.log("Spawning KeeperCarrier");
            Game.spawns[spawnName].memory.roles_counter++;
            
        }
    }
    Game.spawns[spawnName].memory.roles_counter++;

    //better carriers spawning
    if(pop_carriers<=spawn.memory.req_carriers+2 && pop_carriers>=spawn.memory.req_carriers)
    {
        if(maxCarrier(spawn.room.energyAvailable,spawn).length>smallest_carrier)
        {//can spawn better creep
            if(spawn.spawnCreep(maxCarrier(spawn.room.energyAvailable,spawn),'Carrier'+Game.time, {memory: {role: 'carrier', home_room: spawn.room}})==0)
            {
                console.log('Spawning Carrier');
                //Game.spawns[spawnName].memory.roles_counter++;
            }
        }
    }


    }
    });
}