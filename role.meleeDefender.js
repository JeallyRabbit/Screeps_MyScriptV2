

Creep.prototype.roleMeleeDefender = function roleMeleeDefender(creep, spawn) {

    creep.say('🗡️')
    if (this.room.name != spawn.room.name) {
        this.suicide()
    }
    //creep.move(LEFT);return

    var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    var closest_hostile = creep.pos.findClosestByRange(hostiles)
    let storedCostMatrix = PathFinder.CostMatrix.deserialize(Game.rooms[creep.room.name].memory.meleeCostMatrix);
    if (closest_hostile != null) {
        
        if(creep.pos.inRangeTo(closest_hostile,7))
        {
            if (creep.attack(closest_hostile) == ERR_NOT_IN_RANGE) {
            var path = creep.pos.findPathTo(closest_hostile.pos, {
                range: 1, maxRooms: 1,
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
        
            
        /*
        //console.log(closest_hostile.id)
        if (creep.attack(closest_hostile) == ERR_NOT_IN_RANGE) {
            creep.say("c")
            console.log("closest hostile: ",closest_hostile.id)
            
            console.log("moveTo result: ",creep.moveTo(closest_hostile.pos, {
                range: 1, maxRooms: 1,
                visualizePathStyle: {stroke: '#ffffff'}
                ,
                costCallback: function (roomName, costMatrix) {
                    console.log("aaaaa")
                    return storedCostMatrix
                }
            }))
        }
            */


    }

};

