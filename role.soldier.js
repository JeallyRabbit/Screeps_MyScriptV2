const { move_avoid_hostile } = require("./move_avoid_hostile");

var roleSoldier = {
    run: function(creep) {
        
        if(creep.hits<creep.hitsMax)
        {
            creep.heal(creep);
        }
        /*
        var pos = creep.pos;
            if (pos.x > 48) {
                creep.move(LEFT);
                return;
            }
            else if (pos.x < 2) {
                creep.move(RIGHT);
                return;
            }
            if (pos.y > 48) {
                creep.move(TOP);
                return;
            }
            else if (pos.y < 2) {
                creep.move(BOTTOM);
                return;
            }
            */

        creep.say("!");
        //console.log("creep.room.name: ", creep.room.name);
        //console.log("creep.memory.target: ", creep.memory.target);
	    if(creep.room.name == creep.memory.target) {

            var pos = creep.pos;
            if (pos.x > 48) {
                creep.move(LEFT);
                return;
            }
            else if (pos.x < 2) {
                creep.move(RIGHT);
                return;
            }
            if (pos.y > 48) {
                creep.move(TOP);
                return;
            }
            else if (pos.y < 2) {
                creep.move(BOTTOM);
                return;
            }

            var target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            var target_structure=creep.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: function (structure)
                {
                    return structure.owner!="Jeally_Rabbit"
                    && structure.structureType!=STRUCTURE_CONTROLLER
                    && structure.structureType!=STRUCTURE_WALL
                    && structure.structureType!=STRUCTURE_CONTAINER
                    && structure.structureType!=STRUCTURE_ROAD;
                }
                })
            //if(!target) {
              //  target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
            //}
            if(target_creep) {
                //creep.say("Fighting");
                
                //console.log("result: ",result);
                if(creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target_creep);
                }
                else if(creep.rangedAttack(target_creep)==ERR_NO_BODYPART)
                {
                    if(creep.attack(target_creep)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target_creep);
                    }
                }
                if(creep.hits<creep.hitsMax)
                {
                    creep.heal(creep);
                }

                if(creep.pos.inRangeTo(target_creep,2))
                {
                    if(creep.pos.x-target_creep.pos.x>0)
                    {
                        creep.move(RIGHT);

                    }
                    else if(creep.pos.x-target_creep.pos.x<0)
                    {
                        creep.move(LEFT);
                    }
                    if(creep.pos.y-target_creep.pos.y>0)
                    {
                        creep.move(BOTTOM)
                    }
                    else if(creep.pos.y-target_creep.pos.y<0)
                    {
                        creep.move(TOP);
                    }
                }
            } 
            else if(creep.hits<creep.hitsMax){
                //creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
                creep.heal(creep);
            }
            else if(target_structure){
                //creep.say("STR");
                //console.log("target_structure: ",target_structure);
                if(creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target_structure);
                }
                else if(creep.rangedAttack(target_structure)==ERR_NO_BODYPART)
                {
                    if(creep.attack(target_structure)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target_structure);
                    }
                }
                if(creep.hits<creep.hitsMax)
                {
                    creep.heal(creep);
                }
            }
            else{
                creep.moveTo(25,25,{range: 10});
            }
        } 
        else {
            move_avoid_hostile(creep,new RoomPosition(25,25,creep.memory.target),15,true,4000);
            /*
            var route = Game.map.findRoute(creep.room, creep.memory.target)
            if(route.length > 0) {
                creep.moveTo(creep.pos.findClosestByRange(route[0].exit))
            }*/
        }
	}
};
module.exports = roleSoldier;