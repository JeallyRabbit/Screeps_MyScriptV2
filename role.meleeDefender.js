

Creep.prototype.roleMeleeDefender = function roleMeleeDefender(creep, spawn) {

    
    if (this.room.name != spawn.room.name) {
        this.suicide()
    }
    //creep.move(LEFT);return

    //var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    var hostiles = this.room.find(FIND_HOSTILE_CREEPS,{
        filter: function (cr)
        {
            return !Memory.allies.includes(cr.owner.username);
        }
    });
    var closest_hostile = creep.pos.findClosestByRange(hostiles)
    let storedCostMatrix = PathFinder.CostMatrix.deserialize(Game.rooms[creep.room.name].memory.meleeCostMatrix);
    if (closest_hostile != null) {
        creep.say('🗡️')
        if(creep.pos.inRangeTo(closest_hostile,7))
        {
            if (creep.attack(closest_hostile) == ERR_NOT_IN_RANGE) {
            var path = creep.pos.findPathTo(closest_hostile.pos, {
                range: 1, maxRooms: 1, avoidCreeps: true,
                costCallback: function (roomName, costMatrix) {
                    console.log("bbbbbbbb")
    
                    return storedCostMatrix
                }
            })
            //console.log("path: ",path)
            creep.moveByPath(path)
        }
        }
        else
        {
            creep.moveTo(closest_hostile,{range:6})
        }
    }

};

