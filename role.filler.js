

var roleFiller = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say("F");
        if (creep.memory.working_pos == undefined) {
            var at_first_pos = creep.room.lookAt(spawn.pos.x + 1, spawn.pos.y - 1);
            if (at_first_pos.length == 0 ||
                (at_first_pos.length > 0 && at_first_pos[0].type != 'creep')
                || (creep.pos.x == spawn.pos.x + 1 && creep.pos.y == spawn.pos.y - 1)) {
                creep.memory.working_pos = new RoomPosition(spawn.pos.x + 1, spawn.pos.y - 1, spawn.room.name);

            }
            else {
                //creep.say(2);
                var at_second_pos = creep.room.lookAt(spawn.pos.x + 1, spawn.pos.y - 3);
                if (at_second_pos.length == 0 ||
                    (at_second_pos.length > 0 && at_second_pos[0].type != 'creep')
                    || (creep.pos.x == spawn.pos.x + 1 && creep.pos.y == spawn.pos.y - 3)) {
                    creep.memory.working_pos = new RoomPosition(spawn.pos.x + 1, spawn.pos.y - 3, spawn.room.name);

                }
                else {
                    //creep.say(3);
                    var at_third_pos = creep.room.lookAt(spawn.pos.x - 1, spawn.pos.y - 1);
                    if (at_third_pos.length == 0 ||
                        (at_third_pos.length > 0 && at_third_pos[0].type != 'creep')
                        || (creep.pos.x == spawn.pos.x - 1 && creep.pos.y == spawn.pos.y - 1)) {
                        creep.memory.working_pos = new RoomPosition(spawn.pos.x - 1, spawn.pos.y - 1, spawn.room.name);

                    }
                    else {
                        var at_fourth_pos = creep.room.lookAt(spawn.pos.x - 1, spawn.pos.y - 3);
                        if (at_fourth_pos.length == 0 ||
                            (at_fourth_pos.length > 0 && at_fourth_pos[0].type != 'creep')
                            || (creep.pos.x == spawn.pos.x - 1 && creep.pos.y == spawn.pos.y - 3)) {
                            creep.memory.working_pos = new RoomPosition(spawn.pos.x - 1, spawn.pos.y - 3, spawn.room.name);

                        }
                    }
                }
            }

        }
        if (creep.memory.working_pos != undefined) {

            //creep.say("moving");
            
            creep.moveTo(creep.memory.working_pos.x, creep.memory.working_pos.y);
        }
        if ((creep.memory.working_pos != undefined) && creep.memory.working_pos.x == creep.pos.x && creep.memory.working_pos.y == creep.pos.y) {
            //creep.say('at pos');
            creep.memory.is_working=true;
            if (creep.memory.my_container != undefined && Game.getObjectById(creep.memory.my_container) == null) {
                creep.memory.my_container == undefined;
            }

            if (creep.memory.my_container == undefined) {
                var container = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_CONTAINER;
                    }
                });
                if (container.length > 0) {
                    creep.memory.my_container = container[0].id;
                }
            }

            if (creep.memory.my_container != undefined) {
                if (creep.memory.to_fill == undefined) {
                    var to_fill = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: function (structure) {
                            return structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN;
                        }
                    });
                    if (to_fill.length > 0) {
                        creep.memory.to_fill=[];
                        for (let i = 0; i < to_fill.length; i++) {
                            creep.memory.to_fill.push(to_fill[i].id);
                        }

                    }
                }
                if (creep.memory.to_fill != undefined) {
                    if (creep.store[RESOURCE_ENERGY] == 0) {
                        creep.withdraw(Game.getObjectById(creep.memory.my_container), RESOURCE_ENERGY);
                    }
                    else {
                        for (let i = 0; i < creep.memory.to_fill.length; i++) {
                            creep.transfer(Game.getObjectById(creep.memory.to_fill[i]), RESOURCE_ENERGY);
                        }
                    }
                }

            }
        }
    }
};
module.exports = roleFiller;