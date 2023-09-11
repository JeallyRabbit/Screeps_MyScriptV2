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
var towers=require('towers');
var roleTowerKeeper=require('role.TowerKeeper');
var _ = require('lodash');


const maxHarvester= require('maxHarvester');
const maxRepairer=require('maxRepairer');
const maxBuilder=require('maxBuilder');
const maxHauler=require('maxHauler');
const maxUpgrader=require('maxUpgrader');
const maxCarrier=require('maxCarrier');
const maxTransporter=require('maxTransporter');
const maxFarmer = require('maxFarmer');
const minSource=require('minSource');
var RoomPositionFunctions=require('roomPositionFunctions');

const req_harvesters=2;// role num 0
const req_carriers=2;//role num 1
const req_farmers=15;//role num 2
const req_builders=3;// role num 3
const req_haulers=3;// role num 4
const req_upgraders=3;// role num 5
const req_repairers=1;// role num 6
const req_soldiers=4;//role num 7
const req_berserk=0;//role num 8
const req_transporters=1;//role numm 9
const req_towerKeepers=1;//role num 10
const roles_num=10;// 0 1 2 3 4 5 6 7 8 9// skipping berserks
var roles_counter=0;

const myRooms = Object.keys(Game.rooms).filter(roomName => {
    const room = Game.rooms[roomName];
    return room.controller && room.controller.my;
});


module.exports.loop = function () {
    
    towers.tick();
    
    for(var i in Memory.creeps) {  //clearing data about dead creeps
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
    const room=Game.rooms[myRooms[0]];
    const sources=room.find(FIND_SOURCES);
    //console.log(sources_hp.length);
    var sources_hp=[];// harvesting power assigned to every source in my room (working only for first room)
    for(let i=0;i<sources.length;i++)
    {  
        sources_hp[i]=0;
    }
    
    var farming_rooms=[];
    /*
    if(Game.time%1==0)
    {
        const roomName = Game.rooms[myRooms[0]].name; // Replace with the name of the room you want to get coordinates for
        //console.log(roomName);
        const letterMatch = roomName.match(/[A-Z]+/g); // Match one or more uppercase letters
        const numberMatch = roomName.match(/\d+/g); // Match one or more digits

        var x,y;
        var letters;
        if (letterMatch && numberMatch) {
            // Extract the letters and numbers from the matches
            letters = letterMatch.join(""); // Combine multiple letter matches if present
            const numbers = numberMatch.map(Number); // Convert digit strings to numbers
            x=numbers[0]-1;
            y=numbers[1]-1;
            //console.log(`Letters: ${letters}, Numbers: ${numbers}`);
        }
        /*
        for(let i =0;i<3;i++)
        {
            for(let j=0;j<3;j++)
            {
                //console.log(letters[0]+(x+i)+letters[1]+(y+j));
                farming_rooms.push(letters[0]+(x+i)+letters[1]+(y+j));
            }
        }
        
        farming_rooms.push('E37N53');
        farming_rooms.push('E37N54');
        
        const room=Game.rooms['W4N8'];
        console.log("room: ",room);
        if(room && room.controller)
        {
            const owner = room.controller.owner;
            if (owner) {
                console.log(`The owner of room ${roomName} is ${owner.username}`);
            } else {
                console.log(`Room ${roomName} is not owned by any player.`);
            }
        }
        
    }
    */
    farming_rooms.push('E37N53');
    farming_rooms.push('E37N54');
    //console.log(farming_rooms);

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
    if(roles_counter>roles_num){roles_counter=0;}

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            // here add counting harvesting power of a creep
            // and add that hp to source that harvester is assigned to
            //creep.suicide();
            const workParts = _.filter(creep.body, { type: WORK }).length;
            creep.memory.harvesting_power=workParts*2;
            sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
            //creep.say(workParts);
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
            //console.log(creep.memory.target_room);
            const workParts = _.filter(creep.body, { type: WORK }).length;
            creep.memory.harvesting_power=workParts*2;
            sources_hp[creep.memory.target_source]+=creep.memory.harvesting_power;
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
        else if(creep.memory.role=='towerKeeper')
        {
            roleTowerKeeper.run(creep);
            pop_towerKeepers++;
        }
        
    }
    console.log("-----------------------------------------------------------------------");
    console.log("Harvesters:", pop_harvesters, " | ","Carriers: ", pop_carriers,
    " | ","Upgraders: ", pop_upgraders, " | ","Builders: ", pop_builders,
    " | ","Repairers: ", pop_repairers);

    console.log("haulers: ", pop_haulers," | ","Soldiers: ",pop_soldiers,
    " | ","Farmers: ", pop_farmers," | ",'Berskerkers: ', pop_berserkers,
    " | ","Transporters: ",pop_transporters);

    console.log("TowerKeepers: ",pop_towerKeepers);
    console.log("roles_counter: ", roles_counter);
    
    //console.log("sources_hp: ",sources_hp);

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
        var assigned_source=-1;
        var assigned_source=minSource(sources_hp);
        if(assigned_source>=0)
        {
            if(Game.spawns['Spawn1'].spawnCreep(maxHarvester(energyCap),'Harvester'+Game.time, {memory: {role: 'harvester', target_source: assigned_source}})==0)
            {
                const workParts = _.filter(creep.body, { type: WORK }).length;
                //creep.say(workParts);
                creep.memory.harvesting_power=workParts*2;
                sources_hp[assigned_source]+=energyCap/150;//harvesting power approximately
                console.log('Spawning Harvester');
                roles_counter++;
            }
        }
        
    }
    else if(pop_carriers<req_carriers && roles_counter==1 && pop_harvesters>0) // spawning new Carrier
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxCarrier(energyCap),'Carrier'+Game.time, {memory: {role: 'carrier'}})==0)
        {
            console.log('Spawning Carrier');
            roles_counter++;
        }
    }
    else if(pop_farmers<req_farmers && roles_counter==2 && pop_harvesters>0)//spawning new farmer
    {
        //console.log("ASD");
        
        if(Game.spawns['Spawn1'].spawnCreep(maxFarmer(energyCap),'Farmer'+Game.time,{memory: {role: 'farmer', home_room: Game.spawns['Spawn1'].room, target_room: farming_rooms[(pop_farmers)%(farming_rooms.length)]}})==0)
        {
            console.log("Spawning Farmer");
            roles_counter++;
        }
    }
    else if(pop_builders<req_builders && roles_counter==3 && pop_carriers>0) // spawning new builder
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxBuilder(energyCap),'Builder'+Game.time, {memory: {role: 'builder'}})==0)
        {
            console.log('Spawning Builder');
            roles_counter++;
        }
    }
    else if(pop_haulers<req_haulers && roles_counter==4 && pop_builders>0)//spawning new hauler
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxHauler(energyCap),'hauler'+Game.time,{memory: {role: 'hauler'}})==0)
        {
            console.log("Spawning hauler");
            roles_counter++;
        }
    }
    else if(pop_upgraders<req_upgraders && roles_counter==5 && pop_haulers>0) // spawning new upgrader
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxUpgrader(energyCap),'Upgrader'+Game.time, {memory: {role: 'upgrader'}})==0)
        {
            console.log('Spawning Upgrader');
            roles_counter++;
        }
    }
    else if(pop_repairers<req_repairers && roles_counter==6 && pop_upgraders>0)//spawning new repairer
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxRepairer(energyCap),'Repairer'+Game.time, {memory: {role: 'repairer'}})==0)
        {
            console.log('Spawning Repairer');
            roles_counter++;
        }
    }
    else if(pop_soldiers<req_soldiers && roles_counter==7 && pop_repairers>0)
    {
        if(Game.spawns['Spawn1'].spawnCreep([ATTACK,ATTACK,TOUGH,MOVE,MOVE],'Soldier'+Game.time,{memory: {role: 'soldier', target: Game.spawns.Spawn1.room.name}})==0)
        {
            console.log("Spawning Soldier");
            roles_counter++;
            
        }
    }
    else if(pop_berserkers<req_berserk && roles_counter==8 && pop_harvesters)
    {
        if(Game.spawns['Spawn1'].spawnCreep([RANGED_ATTACK,RANGED_ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE],'Berserker'+Game.time,{memory: {role: 'berserk'}})==0)
        {//costs 400 energy
            console.log("Spawning Berserker");
            roles_counter++;
        }
    }
    else if(pop_transporters<req_transporters && roles_counter==9 && pop_carriers>0)
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxTransporter(energyCap),'Transporter'+Game.time,{memory: {role: 'transporter'}})==0)
        {
            console.log('Spawning Transporter')
            roles_counter++;
        }
    }
    else if(pop_towerKeepers<req_towerKeepers && roles_counter==10 && pop_harvesters>0)
    {
        if(Game.spawns['Spawn1'].spawnCreep(maxTransporter(energyCap),'TowerKeeper'+Game.time,{memory: {role: 'towerKeeper'}})==0)
        {
            console.log('Spawning TowerKeeper')
            roles_counter++;
        }
    }
    roles_counter++;
}