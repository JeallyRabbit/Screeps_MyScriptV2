//var roleUpgrader = require('role.upgrader');


Creep.prototype.roleSponge = function roleSponge(creep, spawn) {


    if(creep.hits==creep.hitsMax)
    {
        creep.moveToRoom(creep.memory.target_room)
    }

    if(creep.hits<=creep.hitsMax/2)
    {
        var flee=new RoomPosition(25,25,creep.memory.target_room)
        creep.fleeFrom({flee},{range:26})
        
    }

    creep.heal(creep)
};

