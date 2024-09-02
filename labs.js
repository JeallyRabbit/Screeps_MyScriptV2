const { forEach } = require("lodash");

Spawn.prototype.lab = function lab(spawn) {

    /** @param {Game} game **/
    //tick: function (spawn) {

    if (spawn.memory.labs_id != undefined) {
        for (id of spawn.memory.labs_id) {
            if (Game.getObjectById(id) == null) {
                spawn.memory.labs_id = undefined;
                break;
            }
        }
    } 
    if (spawn.memory.labs_id == undefined) {
        var labs_find = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LAB }
        });
        if (labs_find != undefined && labs_find.length > 0) {
            spawn.memory.labs_id = [];
            for (let lab in labs_find) {
                spawn.memory.labs_id.push(lab.id);
            }

        }
    }

    /*
    labs = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_LAB }
    });
    */
    if (spawn.memory.labs_id != undefined && spawn.memory.labs_id.length > 0) {

        var labs = [];
        for (id of spawn.memory.labs_id) {
            if (Game.getObjectById(id) != null) {
                labs.push(Game.getObjectById(id));
            }
        }

        _.forEach(labs, function (lab) {
            var creeps = lab.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter: function (creep) {
                    return creep.memory.need_boosting == true;
                }
            });
            if (creeps != undefined && creeps.length > 0) {
                lab.boostCreep(creeps[0], creeps[0].memory.parts_to_boost);
            }
            else {
                var other_labs = lab.room.find(FIND_STRUCTURES, {
                    filter: function (structure) {
                        return structure.structureType == STRUCTURE_LAB
                            && structure.pos != lab.pos;
                    }
                });
                for (let i = 1; i < other_labs.length; i++) {
                    if (lab.runReaction(other_labs[i], other_labs[i - 1]) == 0) {
                        return;
                    }
                }
            }
        })
    }



    //}
};

//module.exports = lab