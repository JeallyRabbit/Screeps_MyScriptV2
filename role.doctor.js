
const { minBy } = require("lodash");
const { have_mineral_in_it } = require("./have_mineral_in_it");

Creep.prototype.roleDoctor = function roleDoctor(creep) {


    //room.memory.input_lab_1_pos
    //define input lab1
    //defineInputLabs();

    //defineOutputLabs();

    defineLabs(creep);

    // if labs energy<
    if (defineLabs(creep) == OK) {
        creep.say("labs definied ")

        if (labsNeedEnergy(creep) == true) {

            creep.say(creep.store.getUsedCapacity())
            //clearing creep.store out of resources
            if (creep.store.getUsedCapacity() == creep.store[RESOURCE_ENERGY] && creep.store[RESOURCE_ENERGY] > 0) {//creep.have only energy or is empty
                var minEnergyLab = findMinEnergyLab(creep)
                //creep.say(minEnergyLab)
                if (creep.transfer(Game.getObjectById(minEnergyLab), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(minEnergyLab), { reusePath: 10 })
                }
            }
            else if (creep.store.getUsedCapacity() > creep.store[RESOURCE_ENERGY] && creep.store.getUsedCapacity() > 0) { // mixed or only res
                for (res in creep.store) {
                    if (res == RESOURCE_ENERGY) { continue }
                    if (res.startsWith("X")) // lvl 3 res go to storage
                    {
                        var transfer_result = creep.transfer(creep.room.storage, res)
                        if (transfer_result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, { reusePath: 10 })
                        }

                    }
                    else { // others go to terminal
                        var transfer_result = creep.transfer(creep.room.terminal, res)
                        if (transfer_result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.terminal, { reusePath: 10 })
                        }
                    }
                }
            }
            else if (creep.store[RESOURCE_ENERGY] == 0) {
                if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage, { reusePath: 10 })
                }
            }
        }
        else {

            // if input labs are empty find reaction for them to run - save that into room.memory
            var areInputsEmptyOrMatchReaction = areInputsEmpty(creep)
            if (areInputsEmptyOrMatchReaction == true) {

                creep.say("fill in")
                if (creep.room.memory.reaction == undefined) {
                    creep.room.memory.reaction = creep.room.terminal.reactions()
                }

                if (creep.room.memory.reaction != undefined) {
                    //reaction[0] to input 1
                    // reaction[1] to input 2
                    creep.say("a")
                    var reaction = creep.room.memory.reaction
                    creep.say(reaction[0], " ", reaction[1])
                    var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)
                    var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)
                    // no resource in input 1
                    var a = (creep.room.terminal.store[reaction[0]] - (creep.room.terminal.store[reaction[0]] % 5))
                    if (input1.store[reaction[0]] == 0) {
                        if (creep.store[reaction[0]] == 0) {
                            if (creep.withdraw(creep.room.terminal, reaction[0], Math.min(creep.store.getCapacity(),
                                (creep.room.terminal.store[reaction[0]] - (creep.room.terminal.store[reaction[0]] % 5))))) {
                                creep.moveTo(creep.room.terminal, { reusePath: 11 })
                            }
                        }
                        else {
                            if (creep.transfer(input1, reaction[0]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(input1, { reusePath: 10 })
                            }
                        }
                    }
                    else if (input2.store[reaction[1]] == 0) {
                        if (creep.store[reaction[1]] == 0) {
                            if (creep.withdraw(creep.room.terminal, reaction[1], Math.min(creep.store.getCapacity(),
                                (creep.room.terminal.store[reaction[1]] - (creep.room.terminal.store[reaction[1]] % 5))))) {
                                creep.moveTo(creep.room.terminal, { reusePath: 11 })
                            }
                        }
                        else {
                            if (creep.transfer(input2, reaction[1]) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(input2, { reusePath: 10 })
                            }
                        }
                    }

                }









            }
            else {
                // if any output lab have mineral in it - clear that
                creep.say("clear out")
                if (creep.store.getFreeCapacity() == 0) {
                    creep.say("clear1")
                    for (res in creep.store) {
                        if (creep.transfer(creep.room.storage, res) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, { reusePath: 10 })
                        }
                    }
                }
                else {
                    //creep.say("clear2")
                    //var lab = Game.getObjectById(areInputsEmpty_bool)
                    var labs = [];
                    for (id of creep.room.memory.output_labs_id) {
                        labs.push(Game.getObjectById(id))
                    }
                    //creep.say(labs.length)
                    //console.log('lab: ')
                    for (let lab of labs) {
                        //console.log(lab.id)
                        //console.log("res")
                        for (res in lab.store) {
                            //console.log(res)
                            if (res == RESOURCE_ENERGY) { continue }
                            else {
                                if (creep.withdraw(lab, res) == ERR_NOT_IN_RANGE) {
                                    creep.moveTo(lab, { reusePath: 10 })
                                    return;

                                }
                            }
                        }
                    }

                }


            }


            // else i
        }
    }


};

function areInputsEmpty(creep) {
    var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)

    for (res in input1.store) {
        console.log(res)
        if (res == RESOURCE_ENERGY || res == creep.room.memory.reaction[0]) { continue }
        else if (input1.store[res] > 0) { return creep.room.memory.input1_lab_id }
    }

    var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)

    for (res in input2.store || res == creep.room.memory.reaction[1]) {
        if (res == RESOURCE_ENERGY) { continue }
        else if (input2.store[res] > 0) { return creep.room.memory.input2_lab_id }
    }
    return true

}


function findMinEnergyLab(creep) {
    var min_lab_id = creep.room.memory.input1_lab_id;
    var min_lab_energy = Game.getObjectById(min_lab_id).store[RESOURCE_ENERGY]
    //creep.say(creep.room.memory.input1_lab_id)
    if (Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY] < min_lab_energy) {
        //creep.say("1")
        min_lab_energy = Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY]
        min_lab_id = creep.room.memory.input2_lab_id
    }

    for (lab_id of creep.room.memory.output_labs_id) {
        if (Game.getObjectById(lab_id).store[RESOURCE_ENERGY] < min_lab_energy) {
            //creep.say("2")
            min_lab_energy = Game.getObjectById(lab_id).store[RESOURCE_ENERGY]
            min_lab_id = lab_id
        }
    }
    return min_lab_id
}

function labsNeedEnergy(creep) {
    if (Game.getObjectById(creep.room.memory.input1_lab_id) != null &&
        Game.getObjectById(creep.room.memory.input1_lab_id).store[RESOURCE_ENERGY] < Game.getObjectById(creep.room.memory.input1_lab_id).store.getCapacity(RESOURCE_ENERGY) * 0.5) {
        return true
    }

    if (Game.getObjectById(creep.room.memory.input2_lab_id) != null &&
        Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY] < Game.getObjectById(creep.room.memory.input2_lab_id).store.getCapacity(RESOURCE_ENERGY) * 0.5) {
        return true
    }

    for (lab_id of creep.room.memory.output_labs_id) {
        if (Game.getObjectById(lab_id) != null &&
            Game.getObjectById(lab_id).store[RESOURCE_ENERGY] < Game.getObjectById(lab_id).store.getCapacity(RESOURCE_ENERGY) * 0.5) {
            return true
        }
    }
    return false

}

function defineLabs(creep) {
    if (creep.room.memory.input1_lab_id != undefined && Game.getObjectById(creep.room.memory.input1_lab_id) == null) {
        creep.room.memory.input1_lab_id = undefined;
    }

    if (creep.room.memory.input1_lab_id == undefined) {
        var lab = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LAB && str.pos.x == creep.room.memory.input_lab_1_pos.x && str.pos.y == creep.room.memory.input_lab_1_pos.y
                    && str.pos.roomName == creep.room.memory.input_lab_1_pos.roomName;
            }
        });
        if (lab.length > 0) {
            creep.room.memory.input1_lab_id = lab[0].id;
        }
    }

    //define input lab 2
    if (creep.room.memory.input2_lab_id != undefined && Game.getObjectById(creep.room.memory.input2_lab_id) == null) {
        creep.room.memory.input2_lab_id = undefined;
    }

    if (creep.room.memory.input2_lab_id == undefined) {
        var lab = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LAB && str.pos.x == creep.room.memory.input_lab_2_pos.x && str.pos.y == creep.room.memory.input_lab_2_pos.y
                    && str.pos.roomName == creep.room.memory.input_lab_2_pos.roomName;
            }
        });
        if (lab.length > 0) {
            creep.room.memory.input2_lab_id = lab[0].id;
        }
    }

    if (creep.room.memory.output_labs_id != undefined && creep.room.memory.output_labs_id.length > 0) {
        for (lab_id of creep.room.memory.output_labs_id) {
            if (Game.getObjectById(lab_id) == null) { creep.room.memory.output_labs_id = undefined; break; }
        }
    }

    if (creep.room.memory.output_labs_id == undefined) {
        var lab = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LAB;
            }
        });
        if (lab.length > 0) {
            creep.room.memory.output_labs_id = [];
            creep.room.memory.output_labs_id = [];
            for (a of lab) {
                if (!(a.pos.x == creep.room.memory.input_lab_1_pos.x && a.pos.y == creep.room.memory.input_lab_1_pos.y) &&
                    !(a.pos.x == creep.room.memory.input_lab_2_pos.x && a.pos.y == creep.room.memory.input_lab_2_pos.y)) {
                    //creep.room.memory.output_labs_id.push(a.id);
                    creep.room.memory.output_labs_id.push(a.id);
                }

            }
        }

    }

    if (creep.room.memory.output_labs_id != undefined && creep.room.memory.output_labs_id.length > 0
        && creep.room.memory.input1_lab_id != undefined && creep.room.memory.input2_lab_id != undefined
    ) {
        return OK
    }
    else {
        return null
    }
}

