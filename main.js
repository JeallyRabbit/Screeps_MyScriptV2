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
var roleTowerKeeper=require('role.TowerKeeper');
var roleClaimer=require('role.Claimer');
var roleDistanceBuilder=require('role.DistanceBuilder');
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




profiler.enable();
module.exports.loop = function () {
    profiler.wrap(function()
    {
        towers.tick();
    
    for(var i in Memory.creeps) {  //clearing data about dead creeps
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    //var mySpawns=Game.spawns;
    if(Game.time%100==0)
    {
        setRequiredPopulation(Game.spawns);
    }
    
    for(let spawnName in Game.spawns)
    {
        const myRooms = Object.keys(Game.rooms).filter(roomName => {
            const room = Game.rooms[roomName];
            return room.controller && room.controller.my;
        });
        //console.log(Game.spawns[spawnName])
        var spawn=Game.spawns[spawnName];
        //console.log("spawns_num: ",Game.spawns.length);
        if(spawn==undefined){continue;}
        if(Game.spawns[spawnName].memory.roles_counter==undefined)
        {
            Game.spawns[spawnName].memory.roles_counter=0;
        }
    
        var roles_num=13;// 0 1 2 3 4 5 6 7 8 9 10 11
        //var Game.spawns[spawnName].memory.roles_counter=0;


    const room=Game.rooms[myRooms[0]];
    const sources=room.find(FIND_SOURCES);
    //console.log(sources_hp.length);
    var sources_hp=[];// harvesting power assigned to every source in my room (working only for first room)
    for(let i=0;i<sources.length;i++)
    {  
        sources_hp[i]=0;
    }
    
    //var Game.spawns[spawnName].memory.farming_rooms=[];
    //var farming_rooms=[];
    //var claiming_rooms=[]
    var pop_harvesters=0;
    var pop_carriers=0;
    var pop_builders=0;
    var pop_upgraders=0;
    var pop_repairers=0;
    var pop_haulers=0;
    var pop_soldiers=2;
    var pop_farmers=0;
    var pop_berserkers=0;
    var pop_transporters=0;
    var pop_towerKeepers=0;
    var pop_claimers=0;
    var pop_distanceBuilders=0;
    if(Game.spawns[spawnName].memory.roles_counter>roles_num){Game.spawns[spawnName].memory.roles_counter=0;}

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.home_room.name== spawn.room.name)
        {
            if(creep.memory.role == 'harvester') {
                const workParts = _.filter(creep.body, { type: WORK }).length;
                creep.memory.harvesting_power=workParts*2;
                sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                //creep.say(workParts);
                roleHarvester.run(creep,spawn);
                pop_harvesters++;
                //creep.say("");
            }
            else if(creep.memory.role=='carrier')
            {
                roleCarrier.run(creep,spawn);
                pop_carriers++;
            }
            else if(creep.memory.role=='upgrader')
            {
                pop_upgraders++;
                roleUpgrader.run(creep,spawn);
            }
            else if(creep.memory.role=='hauler')
            {
                pop_haulers++;
                roleHauler.run(creep,spawn);
            }
            else if(creep.memory.role=='builder')
            {
                pop_builders++;
                roleBuilder.run(creep,spawn);
            }
            else if(creep.memory.role=='repairer')
            {
                pop_repairers++;
                roleRepairer.run(creep,spawn);
            }
            else if(creep.memory.role=='soldier')
            {
                pop_soldiers++;
                roleSoldier.run(creep,spawn);
                
            }
            else if(creep.memory.role=='farmer')
            {
                //creep.suicide();
                //console.log(creep.memory.target_room);
                const workParts = _.filter(creep.body, { type: WORK }).length;
                creep.memory.harvesting_power=workParts*2;
                sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
                roleFarmer.run(creep,spawn);
                pop_farmers++;
            }
            else if(creep.memory.role=='berserk')
            {
                roleBerserk.run(creep,spawn);
                pop_berserkers++;
            }
            else if(creep.memory.role=='transporter')
            {
                roleTransporter.run(creep,spawn);
                pop_transporters++;
            }
            else if(creep.memory.role=='towerKeeper')
            {
                roleTowerKeeper.run(creep,spawn);
                pop_towerKeepers++;
            }
            else if(creep.memory.role=='claimer')
            {
                //console.log("CLAIMING");
                roleClaimer.run(creep,spawn);
                pop_claimers++;
            }
            else if(creep.memory.role=='distanceBuilder')
            {
                roleDistanceBuilder.run(creep);
                pop_distanceBuilders++;
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

    console.log("TowerKeepers: ",pop_towerKeepers, " | ",
    "Claimers: ",pop_claimers,"/",spawn.memory.req_claimers," | ",
    "DistanceBuilders: ",pop_distanceBuilders,"/",spawn.memory.req_distanceBuilders);
    console.log("roles_counter: ", Game.spawns[spawnName].memory.roles_counter);
    
    //console.log("sources_hp: ",sources_hp);

    var energyCap=spawn.energy;
    var num_extensions=0;
    const numCreeps = _.filter(Game.creeps, (creep) => creep.my).length;
    if(numCreeps>0)
    {
        num_extensions = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return s.structureType === STRUCTURE_EXTENSION && s.hits>0;
        }
    });
    }
    var available_energy=spawn.energy;
    for(let i=0;i<num_extensions.length;i++)
    {
        available_energy+=num_extensions[i].energy;
    }
    energyCap=available_energy;
    console.log("energyCap: ", energyCap);
    if(pop_harvesters<Game.spawns[spawnName].memory.req_harvesters && Game.spawns[spawnName].memory.roles_counter==0) // spawning new harvester
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
    else if(pop_carriers<Game.spawns[spawnName].memory.req_carriers && Game.spawns[spawnName].memory.roles_counter==1 && pop_harvesters>0) // spawning new Carrier
    {
        if(spawn.spawnCreep(maxCarrier(energyCap),'Carrier'+Game.time, {memory: {role: 'carrier', home_room: spawn.room}})==0)
        {
            console.log('Spawning Carrier');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_farmers<Game.spawns[spawnName].memory.req_farmers && Game.spawns[spawnName].memory.roles_counter==2 && pop_harvesters>0)//spawning new farmer
    {
        //console.log("ASD");
        
        if(spawn.spawnCreep(maxFarmer(energyCap),'Farmer'+Game.time,{memory: {role: 'farmer', home_room: spawn.room,
         target_room: spawn.memory.farming_rooms[(pop_farmers)%(spawn.memory.farming_rooms.length)], path: undefined}})==0)
        {
            console.log("Spawning Farmer");
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_builders<Game.spawns[spawnName].memory.req_builders && Game.spawns[spawnName].memory.roles_counter==3 && pop_carriers>0) // spawning new builder
    {
        if(spawn.spawnCreep(maxBuilder(energyCap),'Builder'+Game.time, {memory: {role: 'builder',home_room: spawn.room}})==0)
        {
            console.log('Spawning Builder');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_haulers<Game.spawns[spawnName].memory.req_haulers && Game.spawns[spawnName].memory.roles_counter==4 && pop_builders>0)//spawning new hauler
    {
        if(spawn.spawnCreep(maxHauler(energyCap),'hauler'+Game.time,{memory: {role: 'hauler',home_room: spawn.room}})==0)
        {
            console.log("Spawning hauler");
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_upgraders<Game.spawns[spawnName].memory.req_upgraders && Game.spawns[spawnName].memory.roles_counter==5 && pop_haulers>0) // spawning new upgrader
    {
        if(spawn.spawnCreep(maxUpgrader(energyCap),'Upgrader'+Game.time, {memory: {role: 'upgrader',home_room: spawn.room}})==0)
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
    else if(pop_soldiers<Game.spawns[spawnName].memory.req_soldiers && Game.spawns[spawnName].memory.roles_counter==7 && pop_repairers>0)
    {
        if(spawn.spawnCreep(maxSoldier(energyCap),'Soldier'+Game.time,{memory: {role: 'soldier', target: Game.spawns.Spawn1.room.name,home_room: spawn.room}})==0)
        {
            console.log("Spawning Soldier");
            Game.spawns[spawnName].memory.roles_counter++;
            
        }
    }
    else if(pop_berserkers<Game.spawns[spawnName].memory.req_berserk && Game.spawns[spawnName].memory.roles_counter==8 && pop_harvesters)
    {
        if(spawn.spawnCreep([RANGED_ATTACK,RANGED_ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE],'Berserker'+Game.time,{memory: {role: 'berserk',home_room: spawn.room, target_room: 'E38N53'}})==0)
        {//costs 400 energy
            console.log("Spawning Berserker");
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_transporters<Game.spawns[spawnName].memory.req_transporters && Game.spawns[spawnName].memory.roles_counter==9 && pop_carriers>0)
    {
        if(spawn.spawnCreep(maxTransporter(energyCap),'Transporter'+Game.time,{memory: {role: 'transporter',home_room: spawn.room}})==0)
        {
            console.log('Spawning Transporter')
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_towerKeepers<Game.spawns[spawnName].memory.req_towerKeepers && Game.spawns[spawnName].memory.roles_counter==10 && pop_harvesters>0)
    {
        if(spawn.spawnCreep(maxTransporter(energyCap),'TowerKeeper'+Game.time,{memory: {role: 'towerKeeper',home_room: spawn.room}})==0)
        {
            console.log('Spawning TowerKeeper')
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_claimers<Game.spawns[spawnName].memory.req_claimers && spawn.memory.claiming_rooms.length>0)
    {
        if(spawn.spawnCreep(maxClaimer(energyCap),'C'+Game.time,{memory: {role: 'claimer', target_room: spawn.memory.claiming_rooms[(pop_claimers)%(spawn.memory.claiming_rooms.length)], path: undefined,home_room: spawn.room}})==0)
        {
            console.log('Spawning Claimer');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    else if(pop_distanceBuilders<Game.spawns[spawnName].memory.req_distanceBuilders)
    {
        if(spawn.spawnCreep(maxDistanceBuilder(energyCap),'DistanceBuilder'+Game.time,{memory: {role: 'distanceBuilder', target_room: spawn.memory.claiming_rooms[(pop_distanceBuilders)%(spawn.memory.claiming_rooms.length)],
        home_room: spawn.room, path: undefined,home_room: spawn.room}})==0)
        {
            console.log('Spawning Claimer');
            Game.spawns[spawnName].memory.roles_counter++;
        }
    }
    Game.spawns[spawnName].memory.roles_counter++;
    }
    });
}