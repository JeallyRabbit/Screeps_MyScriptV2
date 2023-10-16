
var roleSoldier = {
    run: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
        //console.log("creep.room.name: ", creep.room.name);
        //console.log("creep.memory.target: ", creep.memory.target);
	    if(creep.room.name == creep.memory.target) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
            //if(!target) {
              //  target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
            //}
            if(target) {
                //creep.say("Fighting");
                result = creep.rangedAttack(target);
                //console.log("result: ",result);
                if(result == OK){
                    
                }else if(result == ERR_NOT_IN_RANGE){
                    creep.moveTo(target)
                } 

                if(creep.pos.isNearTo(target))
                {
                    if(creep.pos.x-target.pos.x>0)
                    {
                        creep.move(RIGHT);

                    }
                    else if(creep.pos.x-target.pos.x<0)
                    {
                        creep.move(LEFT);
                    }
                    if(creep.pos.y-target.pos.y>0)
                    {
                        creep.move(BOTTOM)
                    }
                    else if(creep.pos.y-target.pos.y<0)
                    {
                        creep.move(TOP);
                    }
                }
            } 
            else if(creep.hits<creep.hitsMax){
                //creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
                creep.heal(creep);
            }
            else{
                creep.moveTo(25,25,{range: 10});
            }
        } 
        else {
            var route = Game.map.findRoute(creep.room, creep.memory.target)
            if(route.length > 0) {
                creep.moveTo(creep.pos.findClosestByRange(route[0].exit))
            }
        }
	}
};
module.exports = roleSoldier;