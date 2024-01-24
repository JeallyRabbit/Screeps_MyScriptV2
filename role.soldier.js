const { move_avoid_hostile } = require("./move_avoid_hostile");

var roleSoldier = {
    run: function(creep,spawn) {
        
        //creep.memory.target='E7S5';
        //creep.suicide();
        if(creep.hits<creep.hitsMax)
        {
            creep.heal(creep);
        }
        //creep.move(BOTTOM_LEFT);
        //return;
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

        //creep.say("!");
        //console.log("creep.room.name: ", creep.room.name);
        //console.log("creep.memory.target_room: ", creep.memory.target_room);
	    if(creep.room.name == creep.memory.target_room) {
            //creep.say('at target');
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
            var target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            
            var target_structure=creep.pos.findClosestByRange(FIND_STRUCTURES,{
                filter: function (structure)
                {
                    //return structure.my==false && 
                    return structure.room.name!=spawn.room.name
                    && structure.structureType!=STRUCTURE_CONTROLLER
                    //&& structure.structureType!=STRUCTURE_WALL
                    && structure.structureType!=STRUCTURE_CONTAINER
                    && structure.structureType!=STRUCTURE_ROAD;
                }});
                //console.log("structure: ",target_structure);
            //if(!target) {
              //  target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
            //}
            if(target_creep) {
                creep.say("Fighting");
                //console.log("fighting creeps");
                //if(creep.attack(target_creep) == ERR_NOT_IN_RANGE){
                //    creep.moveTo(target_creep);
                //}
                //else if(creep.attack(target_creep)==ERR_NO_BODYPART)
                //{
                    if(creep.rangedAttack(target_creep)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target_creep);
                    }
                //}

                /*
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
                */
            } 
            else if(target_structure){
                console.log(creep.room.name," ","fighting structures");
                creep.say("STR");
                //console.log("target_structure: ",target_structure);
                if(creep.attack(target_structure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target_structure);
                    console.log("structure to far");
                }
                creep.say(creep.attack(target_structure));
                /*
                else if(creep.attack(target_structure)==ERR_NO_BODYPART)
                {
                    if(creep.rangedAttack(target_structure)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target_structure);
                    }
                }*/
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
            move_avoid_hostile(creep,new RoomPosition(25,25,creep.memory.target_room),25,false,4000);
            
        }

        
        if(creep.hits<creep.hitsMax){
            //creep.say('heal');
            //creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
            creep.heal(creep);
        }
	}
};
module.exports = roleSoldier;