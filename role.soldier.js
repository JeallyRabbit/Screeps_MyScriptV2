const { move_avoid_hostile } = require("./move_avoid_hostile");
const { goOutOfRange } = require("./goOutOfRange");

Creep.prototype.roleSoldier = function roleSoldier(creep, spawn) {

    //creep.suicide();
    ////creep.say("A");
    if (creep.memory.is_melee == undefined) {
        //creep.say("def");
        for (let part of creep.body) {

            if (part.type == ATTACK) {
                creep.memory.is_melee = true;
            }
        }
        if (creep.memory.is_melee == undefined) {
            creep.memory.is_melee = false;
        }
    }
    //creep.memory.target='E7S5';
    //creep.suicide();
    if (creep.hits < creep.hitsMax) {
        creep.heal(creep);
    }
    if (creep.room.name == creep.memory.target_room) {

        var target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        var target_structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (structure) {
                //return structure.my==false && 
                return structure.room.name != spawn.room.name
                    && structure.structureType != STRUCTURE_CONTROLLER
                    //&& structure.structureType!=STRUCTURE_WALL
                    && structure.structureType != STRUCTURE_CONTAINER
                    && structure.structureType != STRUCTURE_ROAD
                    && structure.my==false
            }
        });
        //console.log("structure: ",target_structure);
        //if(!target) {
        //  target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
        //}
        if (target_creep) {
            //creep.say("Fighting");
            if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target_creep,{maxRooms: 1,avoidSk:true});
            }
            //}

            if (creep.memory.is_melee == false) {
                if (creep.pos.inRangeTo(target_creep, 2)) {
                    creep.fleeFrom({target_creep},3)
                   // goOutOfRange(creep, 3);
                }
            }


        }
        else if (target_structure) {
            //console.log(creep.room.name, " ", "fighting structures");
            ////creep.say("STR");
            //console.log("target_structure: ",target_structure);
            if (creep.memory.is_melee == true) {
                if (creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_structure);
                    //console.log("structure to far");
                }
            }
            else {
                if (creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_structure);
                    //console.log("structure to far");
                }
            }

            ////creep.say(creep.rangedAttack(target_structure));
            /*
            else if(creep.attack(target_structure)==ERR_NO_BODYPART)
            {
                if(creep.rangedAttack(target_structure)==ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target_structure);
                }
            }*/
            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        }
        else {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room),{reusePath:11, maxRooms:1,range:22});
        }
    }
    else {
        //move_avoid_hostile(creep,new RoomPosition(25,25,creep.memory.target_room),25,false,8000);
        creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room));

    }


    if (creep.hits < creep.hitsMax) {
        ////creep.say('heal');
        //creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
        creep.heal(creep);
    }

    


};