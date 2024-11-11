
const { minBy } = require("lodash");
const { have_mineral_in_it } = require("./have_mineral_in_it");


const FILL_LABS_ENERGY = 'fill_labs_energy'
const CLEAR_OUTPUTS = 'clear_outputs'
const CLEAR_INPUT = 'clear_input'
const FILL_INPUT = 'fill_input'
const CLEAR_CREEP = 'clear_creep'

Creep.prototype.roleDoctor = function roleDoctor(creep) {


    //room.memory.input_lab_1_pos
    //define input lab1
    //defineInputLabs();

    //defineOutputLabs();
    if (creep.ticksToLive < 50) {
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

    //defineLabs(creep);

    // if labs energy<
    if (defineLabs(creep) == OK) {

        if (creep.memory.task == undefined) {
            creep.say("finding task")
            creep.memory.to_fill_energy = undefined
            creep.memory.to_clear_output = undefined
            creep.memory.reaction = undefined
            creep.room.memory.reaction = undefined


            if (creep.store.getUsedCapacity() > 0 || creep.ticksToLive < 50) {
                creep.memory.task = CLEAR_CREEP
            }
            else if (ifLabsNeedEnergy(creep) != false) // case 0 on issue #207
            {
                creep.memory.task = FILL_LABS_ENERGY
                creep.memory.to_fill_energy = findMinEnergyLab(creep)
            }
            else if (isSomethingInOutputs(creep) != false)  // case 1 on issue #207
            {
                creep.memory.task = CLEAR_OUTPUTS
                creep.memory.to_clear_output = isSomethingInOutputs(creep)
            }
            else if (areInputsEmpty(creep) != true /* && areInputsEqual(creep)==false */) {
                // (isOnlyOneInputNotEmpty(creep) == 1 || (inputMatchReaction(creep)!=true)) {
                creep.say("clr in")
                creep.memory.task = CLEAR_INPUT
                creep.memory.to_clear_input = areInputsEmpty(creep)
            }
            else if (isOnlyOneInputNotEmpty(creep) == 0) {
                if (creep.room.terminal != undefined) {
                    creep.memory.task = FILL_INPUT
                    creep.memory.reaction = creep.room.terminal.reactions()
                    creep.room.memory.reaction = creep.room.terminal.reactions()
                    //console.log("reactions to run in: ",creep.room.name," :",creep.room.terminal.reactions())
                }

            }
        }

        creep.say(creep.memory.task)
        //creep.say(inputMatchReaction(creep)!=true)

        if (creep.memory.task == CLEAR_CREEP) {
            if (creep.store.getUsedCapacity() == 0) {
                creep.memory.task = undefined
                return
            }
            else {
                for (res in creep.store) {
                    if (creep.transfer(creep.room.storage, res) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, { reusePath: 10 })
                        break;
                    }
                }
            }
        }

        if (creep.memory.task == FILL_LABS_ENERGY) {
            var to_fill = Game.getObjectById(creep.memory.to_fill_energy)
            if (to_fill == null || (to_fill != null && to_fill.store[RESOURCE_ENERGY] >= LAB_ENERGY_CAPACITY)) { creep.memory.task = undefined; return }
            else {
                if (creep.store[RESOURCE_ENERGY] == 0) {
                    if (creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, { reusePath: 10 })
                    }
                }
                else {
                    if (creep.transfer(to_fill, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(to_fill, { reusePath: 10 })
                    }
                }
            }
        }

        if (creep.memory.task == CLEAR_OUTPUTS) {
            var lab = Game.getObjectById(creep.memory.to_clear_output)
            if (lab != null) {
                var is_empty = true;
                for (res in lab.store) {
                    if (res == RESOURCE_ENERGY) { continue }
                    if (lab.store[res] > 0) { is_empty = false; break }
                }
                if ((isSomethingInOutputs(creep) == false) || (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)) {
                    (isSomethingInOutputs(creep) == false) || (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
                    creep.memory.task = undefined
                    return
                }
                else {

                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        creep.memory.to_clear_output = isSomethingInOutputs(creep)
                        for (res in lab.store) {
                            if (res == RESOURCE_ENERGY) { continue }

                            if (creep.withdraw(lab, res) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(lab, { reusePath: 10 })
                                break;
                            }
                        }
                    }
                    else {
                        for (res in creep.store) {
                            if (creep.transfer(creep.room.storage, res) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(creep.room.storage, { reusePath: 10 })
                                break;
                            }
                        }
                    }
                }
            }
            else {
                creep.memory.task = undefined
                return
            }

        }

        if (creep.memory.task == CLEAR_INPUT) {
            creep.memory.to_clear_input = areInputsEmpty(creep)
            var lab = Game.getObjectById(creep.memory.to_clear_input)
            if (areInputsEmpty(creep) == true) {
                creep.memory.task = undefined

                return
                creep.say("no task")
            }
            else {
                //creep.say("11")

                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                    creep.say("cl")
                    for (res in creep.store) {
                        if (res == RESOURCE_ENERGY) { continue }
                        if (creep.transfer(creep.room.storage, res) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, { reusePath: 10 })
                        }
                    }
                }
                else {
                    for (res in lab.store) {
                        if (res == RESOURCE_ENERGY) { continue }
                        if (creep.withdraw(lab, res) == ERR_NOT_IN_RANGE) {
                            //creep.say("13")
                            creep.moveTo(lab, { reusePath: 10 })
                        }
                    }
                }
                /*
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) ==0 ) {
                    //creep.say("12")
                    for (res in lab.store) {
                        if (res == RESOURCE_ENERGY) { continue }
                        if (creep.withdraw(lab, res) == ERR_NOT_IN_RANGE) {
                            //creep.say("13")
                            creep.moveTo(lab, { reusePath: 10 })
                        }
                    }
                }
                else {
                    creep.say("cl")
                    for (res in creep.store) {
                        if (res == RESOURCE_ENERGY) { continue }
                        if (creep.transfer(creep.room.storage, res) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.storage, { reusePath: 10 })
                        }
                    }
                }
                    */
            }
        }

        if (creep.memory.task == FILL_INPUT) {

            var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)
            var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)

            if (creep.room.memory.reaction == undefined || (input1.store[creep.room.memory.reaction[0]] > 0 && input2.store[creep.room.memory.reaction[1]] > 0)) {
                creep.memory.task = undefined
                //creep.say(creep.memory.reaction)
                return
            }
            if (creep.memory.reaction == undefined && creep.room.memory.reaction == undefined) {
                creep.memory.task = undefined
                //creep.say("clfill2")
                return
            }
            /*
            if(input1.store[creep.room.memory.reaction[0]]>0 && input2.store[creep.room.memory.reaction[1]]>0)
            {
                creep.memory.task=undefined
            }
                */
            if (creep.store[creep.room.memory.reaction[0]] == 0) {
                creep.say("with1")
                var terminal_amount = creep.room.terminal.store[creep.room.memory.reaction[0]] - (creep.room.terminal.store[creep.room.memory.reaction[0]] % 5)
                var creep_amount = ((creep.store.getCapacity() / 2) - ((creep.store.getCapacity() / 2) % 5))
                var final_aount = (Math.min(terminal_amount, creep_amount))
                if (creep.withdraw(creep.room.terminal, creep.room.memory.reaction[0], final_aount) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, { reusePath: 10 })
                }
            }
            else if (creep.store[creep.room.memory.reaction[1]] == 0) {
                creep.say("with2")
                var terminal_amount = creep.room.terminal.store[creep.room.memory.reaction[1]] - (creep.room.terminal.store[creep.room.memory.reaction[1]] % 5)
                var creep_amount = ((creep.store.getCapacity() / 2) - ((creep.store.getCapacity() / 2) % 5))
                var final_aount = (Math.min(terminal_amount, creep_amount))
                if (creep.withdraw(creep.room.terminal, creep.room.memory.reaction[1], final_aount) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, { reusePath: 10 })
                }
            }

            if (creep.store[creep.room.memory.reaction[0]] > 0) {
                if (creep.transfer(input1, creep.room.memory.reaction[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(input1, { reusePath: 10 })
                }
            }
            else if (creep.store[creep.room.memory.reaction[1]] > 0) {
                if (creep.transfer(input2, creep.room.memory.reaction[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(input2, { reusePath: 10 })
                }
            }




        }




    }


};

function inputMatchReaction(creep) {// returns id of not matching input lab or true

    //lab1= Game.getObjectById(creep.room.memory.input1_lab_id)
    for (res in Game.getObjectById(creep.room.memory.input1_lab_id).store) {
        if (res == RESOURCE_ENERGY) { continue }
        if (Game.getObjectById(creep.room.memory.input1_lab_id).store[res] > 0 && res != creep.room.memory.reaction[0]) {
            return creep.room.memory.input1_lab_id
        }
    }
    /*
    if(Game.getObjectById(creep.room.memory.input1_lab_id).store[creep.room.memory.reaction[0]]>0)
    {
        return creep.room.memory.input1_lab_id
    }
        */

    for (res in Game.getObjectById(creep.room.memory.input2_lab_id).store) {
        if (res == RESOURCE_ENERGY) { continue }
        if (Game.getObjectById(creep.room.memory.input2_lab_id).store[res] > 0 && res != creep.room.memory.reaction[1]) {
            return creep.room.memory.input2_lab_id
        }
    }
    /*
if(Game.getObjectById(creep.room.memory.input2_lab_id).store[creep.room.memory.reaction[1]]>0)
{
    return creep.room.memory.input2_lab_id
}*/
    return true
}

function isOnlyOneInputNotEmpty(creep) { // if there is only one is not empty, returns its id, if both not empty return 2, if both empty returns 0
    var input1NotEmpty = 0
    var input2NotEmpty = 0

    var lab1 = Game.getObjectById(creep.room.memory.input1_lab_id)
    var lab2 = Game.getObjectById(creep.room.memory.input2_lab_id)

    if (lab1.store.getUsedCapacity() > 0 && lab1.store.getUsedCapacity() != lab1.store[RESOURCE_ENERGY]) {
        input1NotEmpty = 1;
    }

    if (lab2.store.getUsedCapacity() > 0 && lab2.store.getUsedCapacity() != lab2.store[RESOURCE_ENERGY]) {
        input2NotEmpty = 1;
    }

    if (input1NotEmpty + input2NotEmpty == 1) {
        if (input1NotEmpty == 1) { return creep.room.memory.input1_lab_id }
        else { return creep.room.memory.input2_lab_id }
    }



    return input1NotEmpty + input2NotEmpty
}


function isSomethingInOutputs(creep) {

    var max_amount = 0;
    var max_id = undefined

    for (lab_id of creep.room.memory.output_labs_id) {
        var lab = Game.getObjectById(lab_id)

        for (res in lab.store) {
            if (lab.store[res] > max_amount && res != RESOURCE_ENERGY) {
                max_amount = lab.store[res]
                max_id = lab_id
            }
        }
        //if (lab.store[RESOURCE_ENERGY] != lab.store.getUsedCapacity() && lab.store.getUsedCapacity() > 0) { return lab_id }
    }
    if (max_id != undefined) {
        creep.memory.max_amount = max_amount
        return max_id
    }
    else { return false }
}

function ifLabsNeedEnergy(creep) {
    if (Game.getObjectById(creep.room.memory.input1_lab_id).store[RESOURCE_ENERGY] < Game.getObjectById(creep.room.memory.input1_lab_id).store.getCapacity(RESOURCE_ENERGY)) {
        return creep.room.memory.input1_lab_id
    }
    if (Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY] < Game.getObjectById(creep.room.memory.input2_lab_id).store.getCapacity(RESOURCE_ENERGY)) {
        return creep.room.memory.input2_lab_id
    }
    for (lab_id of creep.room.memory.output_labs_id) {
        var lab = Game.getObjectById(lab_id)
        if (lab.store[RESOURCE_ENERGY] < lab.store.getCapacity(RESOURCE_ENERGY)) { return lab_id }
    }
    return false
}

function areInputsEqual(creep) {
    var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)
    var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)
    var total_in_1 = 0;
    var total_in_2 = 0;
    for (res in input1.store) {
        if (res == RESOURCE_ENERGY) { continue; }
        else {
            total_in_1 += input1.store[res]
        }
    }

    for (res in input2.store) {
        if (res == RESOURCE_ENERGY) { continue; }
        else {
            total_in_2 += input2.store[res]
        }
    }

    if (total_in_1 == total_in_2 && total_in_1!=0) { return true }
    else { return true; }

}

function areInputsEmpty(creep) {
    var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)

    for (res in input1.store) {
        if (res == RESOURCE_ENERGY) { continue }
        else if (input1.store[res] > 0) { return creep.room.memory.input1_lab_id }
    }

    var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)

    for (res in input2.store) {
        if (res == RESOURCE_ENERGY) { continue }
        else if (input2.store[res] > 0) { return creep.room.memory.input2_lab_id }
    }
    return true

}


function findMinEnergyLab(creep) {
    var min_lab_id = creep.room.memory.input1_lab_id;
    var min_lab_energy = Game.getObjectById(min_lab_id).store[RESOURCE_ENERGY]
    if (Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY] < min_lab_energy) {
        min_lab_energy = Game.getObjectById(creep.room.memory.input2_lab_id).store[RESOURCE_ENERGY]
        min_lab_id = creep.room.memory.input2_lab_id
    }

    for (lab_id of creep.room.memory.output_labs_id) {
        if (Game.getObjectById(lab_id).store[RESOURCE_ENERGY] < min_lab_energy) {
            min_lab_energy = Game.getObjectById(lab_id).store[RESOURCE_ENERGY]
            min_lab_id = lab_id
        }
    }
    return min_lab_id
}



function defineLabs(creep) {
    if (creep.room.memory.input1_lab_id != undefined && Game.getObjectById(creep.room.memory.input1_lab_id) == null || Game.time & 3000 == 0) {
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
    if (creep.room.memory.input2_lab_id != undefined && Game.getObjectById(creep.room.memory.input2_lab_id) == null || Game.time & 3000 == 0) {
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

    if (creep.room.memory.output_labs_id == undefined || (creep.room.memory.output_labs_id != undefined && creep.room.memory.output_labs_id.length == 0)
        || Game.time % 3000 == 0) {
        creep.room.memory.output_labs_id = undefined;
        var lab = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_LAB;
            }
        });
        if (lab.length > 0) {
            creep.room.memory.output_labs_id = [];
            var input_1_pos = new RoomPosition(creep.room.memory.input_lab_1_pos.x, creep.room.memory.input_lab_1_pos.y, creep.room.memory.input_lab_1_pos.roomName)
            var input_2_pos = new RoomPosition(creep.room.memory.input_lab_2_pos.x, creep.room.memory.input_lab_2_pos.y, creep.room.memory.input_lab_2_pos.roomName)
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
