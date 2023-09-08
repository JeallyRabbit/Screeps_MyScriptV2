var roleHarvester = require('role.harvester');
var roleCarrier=require('role.carrier');
var rolehauler = require('role.hauler');
var roleBuilder = require('role.builder');
var roleUpgrader=require('role.upgrader');
var roleRepairer=require('role.repairer')
var roleSoldier=require('role.soldier');
var roleFarmer=require('role.farmer');
var roleBerserk=require('role.berserk');
var roleTransporter=require('role.transporter');
var _ = require('lodash');


const maxHarvester= require('maxHarvester');
const maxRepairer=require('maxRepairer');
const maxBuilder=require('maxBuilder');
const maxHauler=require('maxHauler');
const maxUpgrader=require('maxUpgrader');
const maxCarrier=require('maxCarrier');
const maxTransporter=require('maxTransporter');

const req_harvesters=4;// role num 0
const req_carriers=4;//role num 1
const req_builders=4;// role num 2
const req_haulers=2;// role num 3
const req_upgraders=3;// role num 4
const req_repairers=1;// role num 5
const req_soldiers=2;//role num 6
const req_farmers=0;//role num 7
const req_berserk=0;//role num 8
const req_transporters=1;//role numm 9
const roles_num=9;// 0 1 2 3 4 5 6 7 8 9// skipping berserks
var roles_counter=0;
module.exports.loop = function () {
    
    
    
    for(var i in Memory.creeps) {  //clearing data about dead creeps
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
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
    if(roles_counter>roles_num){roles_counter=0;}

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
            pop_harvesters++;
            //creep.say("");
        }
        else if(creep.memory.role=='carrier')
        {
            roleCarrier.run(creep);
            pop_carriers++;
        }
        else if(creep.memory.role=='upgrader')
        {
            pop_upgraders++;
            roleUpgrader.run(creep);
        }
        else if(creep.memory.role=='hauler')
        {
            pop_haulers++;
            rolehauler.run(creep);
        }
        else if(creep.memory.role=='builder')
        {
            pop_builders++;
            roleBuilder.run(creep);
        }
        else if(creep.memory.role=='repairer')
        {
            pop_repairers++;
            roleRepairer.run(creep);
        }
        else if(creep.memory.role=='hauler')
        {
            pop_haulers++;
            rolehauler.run(creep);
        }
        else if(creep.memory.role=='soldier')
        {
            pop_soldiers++;
            roleSoldier.run(creep);
            
        }
        else if(creep.memory.role=='farmer')
        {
            roleFarmer.run(creep);
            pop_farmers++;
        }
        else if(creep.memory.role=='berserk')
        {
            roleBerserk.run(creep);
            pop_berserkers++;
        }
        else if(creep.memory.role=='transporter')
        {
            roleTransporter.run(creep);
            pop_transporters++;
        }
        
    }
    console.log("-----------------------------------------------------------------------");
    console.log("Harvesters:", pop_harvesters);
    console.log("Carriers: ", pop_carriers);
    console.log("Upgraders: ", pop_upgraders);
    console.log("Builders: ", pop_builders);
    console.log("Repairers: ", pop_repairers);
    console.log("haulers: ", pop_haulers);
    console.log("Soldiers: ",pop_soldiers);
    console.log("Farmers: ", pop_farmers);
    console.log('Berskerkers: ', pop_berserkers);
    console.log("roles_counter: ", roles_counter);
    

    var energyCap=Game.spawns['Spawn1'].energy;
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
    var available_energy=Game.spawns['Spawn1'].energy;
    for(let i=0;i<num_extensions.length;i++)
    {
        available_energy+=num_extensions[i].energy;
    }
    energyCap=available_energy;
    if(pop_harvesters<req_harvesters && roles_counter==0) // spawning new harvester
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxHarvester(energyCap),'Harvester'+Game.time, {memory: {role: 'harvester', myID: Game.time}})==0)
        {
            console.log('Spawning Harvester');
            roles_counter++;
        }
    }
    else if(pop_carriers<req_carriers && roles_counter==1) // spawning new Carrier
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxCarrier(energyCap),'Carrier'+Game.time, {memory: {role: 'carrier'}})==0)
        {
            console.log('Spawning Carrier');
            roles_counter++;
        }
    }
    else if(pop_builders<req_builders && roles_counter==2) // spawning new builder
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxBuilder(energyCap),'Builder'+Game.time, {memory: {role: 'builder'}})==0)
        {
            console.log('Spawning Builder');
            roles_counter++;
        }
    }
    else if(pop_haulers<req_haulers && roles_counter==3)
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxHauler(energyCap),'hauler'+Game.time,{memory: {role: 'hauler'}})==0)
        {
            console.log("Spawning hauler");
            roles_counter++;
        }
    }
    else if(pop_upgraders<req_upgraders && roles_counter==4) // spawning new upgrader
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxUpgrader(energyCap),'Upgrader'+Game.time, {memory: {role: 'upgrader'}})==0)
        {
            console.log('Spawning Upgrader');
            roles_counter++;
        }
    }
    else if(pop_repairers<req_repairers && roles_counter==5)
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxRepairer(energyCap),'Repairer'+Game.time, {memory: {role: 'repairer'}})==0)
        {
            console.log('Spawning Repairer');
            roles_counter++;
        }
    }
    else if(pop_soldiers<req_soldiers && roles_counter==6)
    {
        if(Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,MOVE,MOVE],'Soldier'+Game.time,{memory: {role: 'soldier', target: Game.spawns.Spawn1.room.name}})==0)
        {
            console.log("Spawning Soldier");
            roles_counter++;
            
        }
    }
    else if(pop_farmers<req_farmers && roles_counter==7)
    {
        //console.log("ASD");
        if(Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE,MOVE],'Farmer'+Game.time,{memory: {role: 'farmer', base_room: Game.spawns['Spawn1'].room}})==0)
        {
            console.log("Spawning Farmer");
            roles_counter++;
        }
    }
    else if(pop_berserkers<req_berserk && roles_counter==8)
    {
        if(Game.spawns['Spawn1'].spawnCreep([RANGED_ATTACK,RANGED_ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE],'Berserker'+Game.time,{memory: {role: 'berserk'}})==0)
        {//costs 400 energy
            console.log("Spawning Berserker");
            roles_counter++;
        }
    }
    else if(pop_transporters<req_transporters && roles_counter==9)
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxTransporter(energyCap),'Transporter'+Game.time,{memory: {role: 'transporter'}})==0)
        {
            console.log('Spawning Transporter')
            roles_counter++;
        }
        
    }
    roles_counter++;
}