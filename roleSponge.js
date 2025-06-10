//var roleUpgrader = require('role.upgrader');


Creep.prototype.roleSponge = function roleSponge(creep, spawn) {

    if(creep.memory.creep_cost==undefined)
    {
        var creep_cost=0;
        creep_cost+=_.filter(creep.body, { type: TOUGH }).length*BODYPART_COST["tough"];
        creep_cost+=_.filter(creep.body, { type: MOVE }).length*BODYPART_COST["move"];
        creep_cost+=_.filter(creep.body, { type: RANGED_ATTACK }).length*BODYPART_COST["ranged_attack"];
        creep_cost+=_.filter(creep.body, { type: HEAL }).length*BODYPART_COST["heal"];
        creep.memory.creep_cost=creep_cost
    }

    creep.heal(creep)
    for(a of Game.rooms[creep.room.name].memory.hostiles)
    {
        if(creep.attack(a)==OK){break;}
    }
    creep.say("@")

    if(creep.hits==creep.hitsMax)
    {
        creep.memory.healing=false;
    }

    if(creep.hits<=creep.hitsMax/2)
    {
        creep.memory.healing=true;
    }


    if(creep.memory.healing==false && creep.room.name!=creep.memory.target_room)
    {
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room),{reusePath: 11, avoidCreeps: true})
    }

    if(creep.memory.healing==false && creep.hits==creep.hitsMax && creep.room.name==creep.memory.target_room)
    {
        creep.say("get close")
        
        creep.moveTo(creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES),{maxRooms: 1})
    }

    if(creep.memory.healing==true && creep.room.name==creep.memory.target_room)
    {
        creep.moveTo(spawn)
    }


    //Counting how much energy was/is drained by creep
    if(creep.room.name==creep.memory.target_room)
    {
        let eventLog=creep.room.getEventLog();
        let attackEvents=_.filter(eventLog, function(e) {
            return e.event === EVENT_ATTACK && e.data.targetId === creep.id;
          });
          
        if(creep.memory.drained_energy==undefined)
        {
            creep.memory.drained_energy=attackEvents.length*TOWER_ENERGY_COST
        }
        else{
            creep.memory.drained_energy+=attackEvents.length*TOWER_ENERGY_COST
        }
    }
    //////////////////
    /*
    if(creep.hits==creep.hitsMax && creep.room.name!=creep.memory.target_room)
    {
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room),{reusePath: 11, avoidCreeps: true})
    }

    if(creep.hits<=creep.hitsMax/2 && creep.room.name==creep.memory.target_room)
    {
        //var flee=new RoomPosition(25,25,creep.memory.target_room)
        //creep.fleeFrom({flee},{range:26})
        creep.say("back")
        creep.moveTo(spawn)
        
    }
    if(creep.hits==creep.hitsMax && creep.room.name==creep.memory.target_room)
        {
            //var flee=new RoomPosition(25,25,creep.memory.target_room)
            //creep.fleeFrom({flee},{range:26})
            creep.say("close")
            creep.moveTo(creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES))
            //creep.moveTo(spawn)
            
        }
            */

    if(creep.hits<creep.hitsMax && creep.room.name!=creep.memory.target_room)
    {
        if(creep.pos.x==49){creep.move(LEFT)}
        if(creep.pos.x==0){creep.move(RIGHT)}
        if(creep.pos.y==49){creep.move(TOP)}
        if(creep.pos.y==0){creep.move(BOTTOM)}
    }

    /*
    if(creep.hits>creep.hitsMax/2 && creep.room.name==creep.memory.target_room)
        {
            if(creep.pos.x==49){creep.move(LEFT)}
            if(creep.pos.x==0){creep.move(RIGHT)}
            if(creep.pos.y==49){creep.move(TOP)}
            if(creep.pos.y==0){creep.move(BOTTOM)}
        }
    */
    if(Game.rooms[creep.room.name].memory.hostiles!=undefined && Game.rooms[creep.room.name].memory.hostiles.length>0)
    {
        var a=Game.rooms[creep.room.name].memory.hostiles
        creep.fleeFrom(a)
        //creep.say("flee")
    }

    //creep.move(TOP_LEFT)
    
};

