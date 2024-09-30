//var roleUpgrader = require('role.upgrader');


Creep.prototype.roleSponge = function roleSponge(creep, spawn) {

    creep.heal(creep)

    creep.say("@")
    if(creep.hits==creep.hitsMax && creep.room.name!=creep.memory.target_room)
    {
        creep.moveToRoom(creep.memory.target_room)
    }

    if(creep.hits<=creep.hitsMax/2 && creep.room.name==creep.memory.target_room)
    {
        //var flee=new RoomPosition(25,25,creep.memory.target_room)
        //creep.fleeFrom({flee},{range:26})
        creep.say("back")
        creep.moveTo(spawn)
        
    }
    if(creep.hits<=creep.hitsMax/2 && creep.room.name!=creep.memory.target_room)
    {
        if(creep.pos.x==49){creep.move(LEFT)}
        if(creep.pos.x==0){creep.move(RIGHT)}
        if(creep.pos.y==49){creep.move(TOP)}
        if(creep.pos.y==0){creep.move(BOTTOM)}
    }

    if(creep.hits>creep.hitsMax/2 && creep.room.name==creep.memory.target_room)
        {
            if(creep.pos.x==49){creep.move(LEFT)}
            if(creep.pos.x==0){creep.move(RIGHT)}
            if(creep.pos.y==49){creep.move(TOP)}
            if(creep.pos.y==0){creep.move(BOTTOM)}
        }

    if(Game.rooms[creep.room.name].hostiles!=undefined && Game.rooms[creep.room.name].hostiles.length>0)
    {
        creep.fleeFrom(Game.rooms[creep.room.name].hostiles,{range: 8})
    }

    //creep.move(TOP_LEFT)
    
};

