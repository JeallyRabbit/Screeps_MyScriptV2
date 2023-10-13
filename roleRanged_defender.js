
var roleRanged_defender = {
    run: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
        //console.log("creep.room.name: ", creep.room.name);
        //console.log("creep.memory.target: ", creep.memory.target);
	    if(creep.room.name == creep.memory.target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
            }
            if(target) {
                //creep.say("Fighting");
                result = creep.rangedAttack(target);
                //console.log("result: ",result);
                if(result == OK){
                    
                }else if(result == ERR_NOT_IN_RANGE){
                    creep.moveTo(target)
                } 
            } else {
                creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
            }
        } else {
            var route = Game.map.findRoute(creep.room, creep.memory.target)
            if(route.length > 0) {
                creep.moveTo(creep.pos.findClosestByRange(route[0].exit))
            }
        }
	}
};
module.exports = roleRanged_defender;