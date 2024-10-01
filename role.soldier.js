const { move_avoid_hostile } = require("./move_avoid_hostile");
const { goOutOfRange } = require("./goOutOfRange");

Creep.prototype.roleSoldier = function roleSoldier(creep, spawn) {

    //creep.rangedMassAttack()
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


        if (creep.room.memory.soldiers != undefined && creep.room.memory.soldiers.length > 0) {
            for (sol of creep.room.memory.soldiers) {
                if (Game.getObjectById(sol) == null) {
                    creep.room.memory.soldiers = undefined
                    break;
                }
            }
        }

        if (creep.room.memory.soldiers == undefined) {
            var soldiers = creep.room.find(FIND_MY_CREEPS, {
                filter:
                    function (cre) {
                        return cre.role = 'soldier'
                    }
            })
            if (soldiers.length > 0) {
                creep.room.memory.soldiers = [];
                for (a of soldiers) {
                    creep.room.memory.soldiers.push(a.id)
                }
            }
        }

        if (creep.room.memory.soldiers != undefined && creep.room.memory.soldiers.length > 0 && creep.hits == creep.hitsMax) {
            var in_range_soldiers = [];
            for (a of creep.room.memory.soldiers) {
                if (Game.getObjectById(a) != null && Game.getObjectById(a).pos.inRangeTo(creep.pos, 3)) {
                    if (Game.getObjectById(a).pos.isNearTo(creep.pos) && Game.getObjectById(a).hits < Game.getObjectById(a).hitsMax) {
                        creep.heal(Game.getObjectById(a))
                    }
                    else {
                        creep.rangedHeal(Game.getObjectById(a))
                    }
                    break;
                }
            }
        }



        var target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
            filter:
                function (cr) {
                    return !Memory.allies.includes(cr.owner.username) &&
                    (cr.getActiveBodyparts(ATTACK) > 0 || cr.getActiveBodyparts(RANGED_ATTACK) > 0 || cr.getActiveBodyparts(HEAL) > 0)
                }
        });
        if(target_creep==null)
        {
            target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter:
                    function (cr) {
                        return !Memory.allies.includes(cr.owner.username)
                    }
            });
        }
        var target_structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function (structure) {
                //return structure.my==false && 
                return structure.room.name != spawn.room.name
                    && structure.structureType != STRUCTURE_CONTROLLER
                    //&& structure.structureType!=STRUCTURE_WALL
                    && structure.structureType != STRUCTURE_CONTAINER
                    && structure.structureType != STRUCTURE_ROAD
                    && structure.my == false
            }
        });
        //console.log("structure: ",target_structure);
        //if(!target) {
        //  target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
        //}
        if (target_creep) {
            //creep.say(target_creep.pos.x);
            //creep.move(BOTTOM_RIGHT)



            if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {
                //creep.say("2")
                creep.moveTo(target_creep.pos, { maxRooms: 1, avoidSk: true,avoidCreeps: true });
            }
            //creep.rangedMassAttack()
            //creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true });
            //}

            if (creep.memory.is_melee == false) {
                if (creep.pos.inRangeTo(target_creep, 2) && (_.filter(target_creep.body, function (part) {
                    return part.type === RANGED_ATTACK && part.hits > 0;
                }).length > 0 || _.filter(target_creep.body, function (part) {
                    return part.type === ATTACK && part.hits > 0;
                }).length > 0)) {
                    creep.fleeFrom({ target_creep }, 3, { maxRooms: 1 })
                    creep.say("flee")
                }
                else if (creep.pos.isNearTo(target_creep.pos)) {
                    creep.rangedMassAttack()
                }
            }

            if (creep.hits < creep.hitsMax / 2) {
                creep.fleeFrom({ target_creep }, 6)
            }


        }
        else if (target_structure) {
            creep.say("3")
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
                creep.moveTo(target_structure);
                creep.rangedMassAttack()
                /* if (creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target_structure);
                    //console.log("structure to far");
                } */
            }

            if (creep.hits < creep.hitsMax) {
                creep.heal(creep);
            }
        }
        if(Game.rooms[creep.memory.target_room]!=undefined && Game.rooms[creep.memory.target_room].memory.damagedCreeps.length>0)
        {
            var damaged=[];
            for(cr of Game.rooms[creep.memory.target_room].memory.damagedCreeps)
            {
                damaged.push(Game.getObjectById(cr))
            }
            var toHeal=creep.pos.findClosestByRange(damaged)
            if(toHeal!=null)
            {
                //creep.say("healing my creep")
                if(creep.heal(toHeal)==ERR_NOT_IN_RANGE)
                {
                    //creep.say("ranged heal")
                    if(target_creep==null)
                    {
                        creep.moveTo(toHeal)
                    }
                    
                    creep.rangedHeal(toHeal)
                }
            }
        }
        else {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { reusePath: 11, maxRooms: 1, range: 22 });
        }
    }
    else {
        //move_avoid_hostile(creep,new RoomPosition(25,25,creep.memory.target_room),25,false,8000);
        //creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room));
        /*
        var reusePath = 100;

        if (creep.memory.destination == undefined) {
            creep.say("destination unknown")
            var destination = [];
            for (var i = 1; i < 50; i++) {
                for (var j = 1; j < 50; j++) {
                    destination.push(new RoomPosition(i, j, creep.memory.target_room))
                }
            }
            creep.memory.destination = destination;
        }

        if (creep.memory.destination != undefined) {
            creep.move_avoid_hostile(creep, creep.memory.destination, reusePath, true)
        }
            */

        creep.moveToRoom(creep.memory.target_room, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true })


    }


    if (creep.hits < creep.hitsMax) {
        ////creep.say('heal');
        //creep.move(_.sample([TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT]))
        creep.heal(creep);
    }




};