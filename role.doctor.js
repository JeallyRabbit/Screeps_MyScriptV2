
const { minBy } = require("lodash");


const FILL_LABS_ENERGY = 'fill_labs_energy'
const CLEAR_OUTPUTS = 'clear_outputs'
const CLEAR_INPUT = 'clear_input'
const FILL_INPUT = 'fill_input'
const CLEAR_CREEP = 'clear_creep'
const BOOST_CREEP='boost_creep'

const localHeap = {}


Creep.prototype.roleDoctor = function roleDoctor(creep) {

    //room.memory.input_lab_1_pos
    //define input lab1
    //defineInputLabs();
    console.log("task at the beggining of a tick", global.heap.rooms[creep.memory.home_room.name].doctorTask)
    //console.log("there are ",global.heap.rooms[creep.memory.home_room.name].boostingRequests.length," in doctor drver")

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

        

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == undefined) {
            //creep.say("finding task")
            console.log("no task")
            creep.memory.to_fill_energy = undefined
            creep.memory.to_clear_output = undefined
            localHeap.reaction = undefined

           

            if (creep.store.getUsedCapacity() > 0 || creep.ticksToLive < 50) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = CLEAR_CREEP
            }
            else if(global.heap.rooms[creep.memory.home_room.name].boostingRequests.length>0)
            {   
                global.heap.rooms[creep.memory.home_room.name].doctorTask=BOOST_CREEP
            }
            else if (ifLabsNeedEnergy(creep) != false) // case 0 on issue #207
            {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = FILL_LABS_ENERGY
                creep.memory.to_fill_energy = findMinEnergyLab(creep)
            }
            else if (isSomethingInOutputs(creep) != false)  // case 1 on issue #207
            {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = CLEAR_OUTPUTS
                creep.memory.to_clear_output = isSomethingInOutputs(creep)
            }
            else if (areInputsEmpty(creep) != true /* && areInputsEqual(creep)==false */) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = CLEAR_INPUT
                creep.memory.to_clear_input = areInputsEmpty(creep)
            }
            else if (isOnlyOneInputNotEmpty(creep) == 0) {
                if (creep.room.terminal != undefined) {
                    global.heap.rooms[creep.memory.home_room.name].doctorTask = FILL_INPUT
                    localHeap.reaction = creep.room.terminal.reactions()
                    console.log("reactions to run in: ",creep.room.name," :",creep.room.terminal.reactions())
                }

            }
        }
        else if(global.heap.rooms[creep.memory.home_room.name].boostingRequests.length>0 && global.heap.rooms[creep.memory.home_room.name].doctorTask!=BOOST_CREEP)
        {
            console.log("reseting task - there are boost requests")
            global.heap.rooms[creep.memory.home_room.name].doctorTask=undefined
            return;
        }

        //creep.say(global.heap.rooms[creep.memory.home_room.name].doctorTask)
        //creep.say(inputMatchReaction(creep)!=true)

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == CLEAR_CREEP) {
            if (creep.store.getUsedCapacity() == 0) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined
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

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == FILL_LABS_ENERGY) {
            var to_fill = Game.getObjectById(creep.memory.to_fill_energy)
            if (to_fill == null || (to_fill != null && to_fill.store[RESOURCE_ENERGY] >= LAB_ENERGY_CAPACITY)) { global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined; return }
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

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == CLEAR_OUTPUTS) {
            var lab = Game.getObjectById(creep.memory.to_clear_output)
            if (lab != null) {
                var is_empty = true;
                for (res in lab.store) {
                    if (res == RESOURCE_ENERGY) { continue }
                    if (lab.store[res] > 0) { is_empty = false; break }
                }
                if ((isSomethingInOutputs(creep) == false) || (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)) {
                    (isSomethingInOutputs(creep) == false) || (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
                    global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined
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
                global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined
                return
            }

        }

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == CLEAR_INPUT) {
            creep.memory.to_clear_input = areInputsEmpty(creep)
            var lab = Game.getObjectById(creep.memory.to_clear_input)
            if (areInputsEmpty(creep) == true) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined

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
            }
        }

        if (global.heap.rooms[creep.memory.home_room.name].doctorTask == FILL_INPUT) {

            var input1 = Game.getObjectById(creep.room.memory.input1_lab_id)
            var input2 = Game.getObjectById(creep.room.memory.input2_lab_id)

            //console.log("reaction: ",localHeap.reaction[0], " ",localHeap.reaction[1])
            if (localHeap.reaction == undefined || (input1.store[localHeap.reaction[0]] > 0 && input2.store[localHeap.reaction[1]] > 0)) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined
                //creep.say(localHeap.reaction)
                return
            }
            if (localHeap.reaction == undefined && localHeap.reaction == undefined

            ) {
                global.heap.rooms[creep.memory.home_room.name].doctorTask = undefined
                creep.say("clfill2")
                return
            }
            /*
            if(input1.store[localHeap.reaction[0]]>0 && input2.store[localHeap.reaction[1]]>0)
            {
                global.heap.rooms[creep.memory.home_room.name].doctorTask=undefined
            }
                */
            if (creep.store[localHeap.reaction[0]] == 0) {
                creep.say("with1")
                var terminal_amount = creep.room.terminal.store[localHeap.reaction[0]] - (creep.room.terminal.store[localHeap.reaction[0]] % 5)
                var creep_amount = ((creep.store.getCapacity() / 2) - ((creep.store.getCapacity() / 2) % 5))
                var final_aount = (Math.min(terminal_amount, creep_amount))
                if (creep.withdraw(creep.room.terminal, localHeap.reaction[0], final_aount) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, { reusePath: 10 })
                }
            }
            else if (creep.store[localHeap.reaction[1]] == 0) {
                creep.say("with2")
                var terminal_amount = creep.room.terminal.store[localHeap.reaction[1]] - (creep.room.terminal.store[localHeap.reaction[1]] % 5)
                var creep_amount = ((creep.store.getCapacity() / 2) - ((creep.store.getCapacity() / 2) % 5))
                var final_aount = (Math.min(terminal_amount, creep_amount))
                if (creep.withdraw(creep.room.terminal, localHeap.reaction[1], final_aount) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.terminal, { reusePath: 10 })
                }
            }

            if (creep.store[localHeap.reaction[0]] > 0) {
                if (creep.transfer(input1, localHeap.reaction[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(input1, { reusePath: 10 })
                }
            }
            else if (creep.store[localHeap.reaction[1]] > 0) {
                if (creep.transfer(input2, localHeap.reaction[1]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(input2, { reusePath: 10 })
                }
            }
        }

        if(global.heap.rooms[creep.memory.home_room.name].doctorTask==BOOST_CREEP)
        {
            console.log("taking task boost creep")
            if(global.heap.rooms[creep.memory.home_room.name].boostingRequests.length==0)
            {
                console.log("No boosting requests")
                global.heap.rooms[creep.memory.home_room.name].doctorTask=undefined
                return;
            }
            var boostingRequest=global.heap.rooms[creep.memory.home_room.name].boostingRequests[0];
            console.log("boosting request: ")
            console.log("boosting request.bost: ",boostingRequest.boost)
            console.log("boostingRequest.bodypartsAmount: ",boostingRequest.bodypartsAmount)
            var boosting_lab=Game.getObjectById(creep.room.memory.boosting_lab_id)
            console.log( boosting_lab.store[boostingRequest.boost]," < ",boostingRequest.bodypartsAmount.length*LAB_BOOST_MINERAL)
            if(creep.store[boostingRequest.boost]==0 && boosting_lab.store[boostingRequest.boost]<boostingRequest.bodypartsAmount.length*LAB_BOOST_MINERAL)
            {
                if(creep.withdraw(creep.room.storage,boostingRequest.boost,boostingRequest.bodypartsAmount.length*LAB_BOOST_MINERAL)==ERR_NOT_IN_RANGE)
                {
                    //creep.say("with")
                    creep.moveTo(creep.room.storage)
                }
            }
            else{
                
                if(creep.transfer(boosting_lab,boostingRequest.boost)==ERR_NOT_IN_RANGE)
                {
                    creep.say("LB tra")
                    creep.moveTo(boosting_lab)
                }
            }
        }


    }


};

function inputMatchReaction(creep) {// returns id of not matching input lab or true

    //lab1= Game.getObjectById(creep.room.memory.input1_lab_id)
    for (res in Game.getObjectById(creep.room.memory.input1_lab_id).store) {
        if (res == RESOURCE_ENERGY) { continue }
        if (Game.getObjectById(creep.room.memory.input1_lab_id).store[res] > 0 && res != localHeap.reaction[0]) {
            return creep.room.memory.input1_lab_id
        }
    }
    /*
    if(Game.getObjectById(creep.room.memory.input1_lab_id).store[localHeap.reaction[0]]>0)
    {
        return creep.room.memory.input1_lab_id
    }
        */

    for (res in Game.getObjectById(creep.room.memory.input2_lab_id).store) {
        if (res == RESOURCE_ENERGY) { continue }
        if (Game.getObjectById(creep.room.memory.input2_lab_id).store[res] > 0 && res != localHeap.reaction[1]) {
            return creep.room.memory.input2_lab_id
        }
    }
    /*
if(Game.getObjectById(creep.room.memory.input2_lab_id).store[localHeap.reaction[1]]>0)
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

    if (creep.room.memory.input1_lab_id == undefined && creep.room.memory.input_lab_1_pos!=undefined) {
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

    if (creep.room.memory.input2_lab_id == undefined && creep.room.memory.input_lab_2_pos!=undefined) {
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
        if (lab.length > 0 && creep.room.memory.input_lab_1_pos!=undefined) {
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
        creep.room.memory.boosting_lab_id=creep.room.memory.output_labs_id[0]
        return OK
    }
    else {
        return null
    }
}
