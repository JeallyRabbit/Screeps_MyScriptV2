const { can_run_lvl_3_reaction } = require("./can_run_reactions");
const { can_run_lvl_2_reaction } = require("./can_run_reactions");
const { can_run_lvl_1_reaction } = require("./can_run_reactions");
const { can_run_lvl_0_reaction } = require("./can_run_reactions");
const { have_mineral_in_it } = require("./have_mineral_in_it");

Creep.prototype.roleDoctor = function roleDoctor(creep, spawn) {


    var labs = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB;
        }
    });


    var storage = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_STORAGE;
        }
    });
    //creep.transfer(storage[0],"GHO2");
    var terminal = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_TERMINAL;
        }
    });
    var input1pos = new RoomPosition(spawn.pos.x + 3, spawn.pos.y, creep.room.name);
    var input2pos = new RoomPosition(spawn.pos.x + 3, spawn.pos.y - 1, creep.room.name);
    //console.log("input1pos: ",input1pos);
    //console.log("input2pos: ",input2pos);
    var output_lab = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB
                && ((structure.pos.x != input1pos.x && structure.pos.y != input1pos.y)
                    || (structure.pos.x != input2pos.x && structure.pos.y != input2pos.y))
            //&& have_mineral_in_it(structure)!=false;
            //&& have_mineral_in_it(structure)==true;
        }
    });
    //console.log(output_lab.length);
    if (output_lab.length != 0) {
        //console.log("output.lab[0]: ",output_lab[0].store.getCapacity());
        output_lab = output_lab.sort((a, b) => (b.store[have_mineral_in_it(b)]) - (a.store[have_mineral_in_it(a)]));
        output_lab = output_lab[0];
        //console.log("output_lab: ", output_lab.store[have_mineral_in_it(output_lab)]);
    }


    var creeps_to_boost = creep.room.find(FIND_MY_CREEPS, {
        filter: function (creep_to_boost) {
            return creep_to_boost.memory.need_boosting == true
                && creep_to_boost.memory.booster != undefined;
            //&& creep_to_boost.pos.isNearTo(output_lab.pos);
        }
    });
    //console.log("output_laAb: ",output_lab);
    //console.log("output_lab.pos: ",output_lab.pos);
    //console.log(have_mineral_in_it(output_lab));
    if (creeps_to_boost != undefined && creeps_to_boost.length > 0) {
        creep.memory.boosting = true;
        creep.say("A");
        if (have_mineral_in_it(output_lab) != false) {
            creep.memory.filling_booster = false;
        }
        else if (have_mineral_in_it(output_lab) == false) {
            creep.memory.filling_booster = true;
        }
    }
    else {
        creep.memory.boosting = false;
        creep.memory.filling_booster = false;
    }


    var upgrading_lab0 = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB
                && (structure.pos.x == spawn.pos.x + 3 && structure.pos.y == spawn.pos.y);
        }
    });
    //console.log("upgrading_lab0: ", upgrading_lab0.pos);
    if (upgrading_lab0 == undefined) {
        var upgrading_lab0 = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_LAB;
            }
        });
    }

    if (upgrading_lab0 != undefined && upgrading_lab0 != null) {
        var upgrading_lab1 = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_LAB
                    && structure.pos != upgrading_lab0.pos;
            }
        });
        if (upgrading_lab1 == undefined) {
            upgrading_lab1 = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_LAB
                        && (structure.pos.x == spawn.pos.x + 3 && structure.pos.y == spawn.pos.y - 1);
                }
            });

        }
    }

    if (creep.memory.to_transport == undefined ||
        (have_mineral_in_it(upgrading_lab0) != false && have_mineral_in_it(upgrading_lab1) != false)) {
        //
        if (can_run_lvl_0_reaction(storage[0]) != "NOTHING") {
            creep.memory.to_transport = can_run_lvl_0_reaction(storage[0]);
        }
        else if (can_run_lvl_1_reaction(storage[0]) != "NOTHING") {
            creep.memory.to_transport = can_run_lvl_1_reaction(storage[0]);
        }
        else if (can_run_lvl_2_reaction(storage[0]) != "NOTHING") {
            creep.memory.to_transport = can_run_lvl_2_reaction(storage[0]);
        }
        else if (can_run_lvl_3_reaction(storage[0]) != "NOTHING") {
            //creep.say("V");
            creep.memory.to_transport = can_run_lvl_3_reaction(storage[0]);
        }

        if (can_run_lvl_0_reaction(storage[0]) == "NOTHING"
            && can_run_lvl_1_reaction(storage[0]) == "NOTHING"
            && can_run_lvl_2_reaction(storage[0]) == "NOTHING"
            && can_run_lvl_3_reaction(storage[0]) == "NOTHING") {
            //creep.say("A");
            creep.memory.to_transport = false;
        }
    }
    else {
        //creep.memory.to_transport = undefined;
    }

    //console.log(upgrading_lab0," ", upgrading_lab1);
    if (upgrading_lab0 != undefined && upgrading_lab1 != undefined) {

        if (have_mineral_in_it(upgrading_lab0) != false && upgrading_lab0.store[creep.memory.to_transport[0]] == 0) {
            creep.memory.clear0 = true;
        }
        else /*if(creep.store.getFreeCapacity()==creep.store.getCapacity())*/ {
            //creep.say(false);
            creep.memory.clear0 = false;
        }
        if (have_mineral_in_it(upgrading_lab1) != false && upgrading_lab1.store[creep.memory.to_transport[1]] == 0) {
            creep.memory.clear1 = true;
        }
        else if (creep.store.getFreeCapacity() == creep.store.getCapacity()) {
            creep.memory.clear1 = false;
        }
    }

    if (creep.memory.boosting == true) {
        if (creep.memory.filling_booster == true) {
            creep.say("b");
            var withdraw_amount = Math.min(creep.store.getFreeCapacity(), storage[0].store[creeps_to_boost[0].memory.booster]);
            var upgrades_num = Math.floor(withdraw_amount / 30);
            withdraw_amount = Math.min(upgrades_num, creeps_to_boost[0].memory.parts_to_boost.length) * 30;
            if (creep.store.getFreeCapacity() < creep.store.getCapacity() &&
                creep.store[creeps_to_boost[0].memory.booster] < withdraw_amount) {//creep have in store resource that is not required for boosting
                creep.moveTo(storage[0], { range: 1 });
                for (const resource in creep.store) {
                    creep.transfer(storage[0], resource);
                }
            }
            else if (creep.store.getFreeCapacity() == creep.store.getCapacity())//creep is empty
            {
                var withdraw_amount = Math.min(creep.store.getFreeCapacity(), storage[0].store[creeps_to_boost[0].memory.booster]);
                var upgrades_num = Math.floor(withdraw_amount / 30);
                withdraw_amount = Math.min(upgrades_num, creeps_to_boost[0].memory.parts_to_boost.length) * 30;
                if (withdraw_amount > 0) {
                    if (creep.withdraw(storage[0], creeps_to_boost[0].memory.booster, withdraw_amount) == ERR_NOT_IN_RANGE) {
                        creep.say(creep.moveTo(storage[0]));
                    }
                }
            }
            else if (creep.store[creeps_to_boost[0].memory.booster] > 0) {
                creep.say("c");
                if (creep.transfer(output_lab, creeps_to_boost[0].memory.booster) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(output_lab);
                }
                //creep.say(creep.transfer(output_lab, creeps_to_boost[0].memory.booster));
                creep.moveTo(output_lab);
                return;

                //return ;
            }
        }
        else {//go empty the output lab
            if (creep.store.getFreeCapacity() == creep.store.getCapacity()) {// is empty
                // creep.say("!");
                creep.moveTo(output_lab, { range: 1 });
                for (const resource in output_lab.store) {
                    if (resource != RESOURCE_ENERGY) {
                        creep.withdraw(output_lab, resource);
                    }
                }
            }
            else {
                creep.moveTo(storage[0], { range: 1 });
                for (const resource in creep.store) {
                    creep.transfer(storage[0], resource);
                }
            }

        }
    }
    else if (have_mineral_in_it(output_lab) != false) {
        if (have_mineral_in_it(creep) == false && creep.store[RESOURCE_ENERGY] == 0) {// is empty
            creep.moveTo(output_lab, { range: 1 });
            for (const resource in output_lab.store) {
                if (resource != RESOURCE_ENERGY) {
                    creep.withdraw(output_lab, resource);
                }
            }
        }
        else {
            creep.moveTo(storage[0], { range: 1 });
            for (const resource in creep.store) {
                creep.transfer(storage[0], resource);
            }
        }
    }
    else {
        //running reactions in labs
        if (creep.memory.to_transport != undefined) {

            if (creep.store[creep.memory.to_transport[0]] == 0 && creep.store[creep.memory.to_transport[1]] == 0
                && creep.store.getFreeCapacity() < creep.store.getCapacity()) {
                for (const resource in creep.store) {
                    if (creep.transfer(storage[0], resource) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage[0]);
                        break;
                    }
                }
            }

            if (upgrading_lab0 != undefined && upgrading_lab1 != undefined) {
                //creep.say("labing");
                if (creep.memory.clear0 == true) {//clear lab0

                    if (creep.store.getFreeCapacity() == creep.store.getFreeCapacity()) {// if is empty
                        creep.moveTo(upgrading_lab0, { range: 1 });
                        for (const resource in upgrading_lab0.store) {
                            if (resource != RESOURCE_ENERGY) {
                                creep.withdraw(upgrading_lab0, resource);
                            }
                        }
                    }
                    else {
                        creep.moveTo(storage[0], { range: 1 });
                        for (const resource in creep.store) {
                            creep.transfer(storage[0], resource);
                        }
                    }
                }
                else if (creep.memory.clear1 == true) {//clear lab1

                    if (creep.store.getFreeCapacity() == creep.store.getCapacity()) {// if is empty
                        creep.say('col');
                        creep.moveTo(upgrading_lab1, { range: 1 });
                        for (const resource in upgrading_lab1.store) {
                            if (resource != RESOURCE_ENERGY) {
                                creep.withdraw(upgrading_lab1, resource);
                            }
                        }
                    }
                    else {
                        creep.say("dum");
                        creep.moveTo(storage[0], { range: 1 });
                        for (const resource in creep.store) {
                            creep.transfer(storage[0], resource);
                        }
                    }
                }
                else {
                    if (upgrading_lab0.store[creep.memory.to_transport[0]] == 0) {
                        console.log(upgrading_lab0.pos);
                        console.log(upgrading_lab1.pos);
                        if (creep.store[creep.memory.to_transport[0]] == 0) {
                            withdraw_amount = Math.min(creep.store.getFreeCapacity(), storage[0].store[creep.memory.to_transport[0]]);
                            if (creep.withdraw(storage[0], creep.memory.to_transport[0], withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                                creep.moveTo(storage[0]);
                            }
                        }
                        else {
                            var transfered_amount = 1;
                            transfered_amount = Math.min(creep.store[creep.memory.to_transport[0]], upgrading_lab0.store.getFreeCapacity());
                            if (creep.transfer(upgrading_lab0, creep.memory.to_transport[0], transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy

                                creep.moveTo(upgrading_lab0);
                            }
                        }
                    }
                    else if (upgrading_lab1.store[creep.memory.to_transport[1]] == 0) {
                        creep.say("O");
                        if (creep.store[creep.memory.to_transport[1]] == 0) {
                            withdraw_amount = Math.min(creep.store.getFreeCapacity(), storage[0].store[creep.memory.to_transport[1]]);
                            if (creep.withdraw(storage[0], creep.memory.to_transport[1], withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                                creep.moveTo(storage[0]);
                            }
                        }
                        else {
                            //creep.say("7");
                            var transfered_amount = 1;
                            transfered_amount = Math.min(creep.store[creep.memory.to_transport[1]], upgrading_lab1.store.getFreeCapacity());
                            if (creep.transfer(upgrading_lab1, creep.memory.to_transport[1], transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy

                                creep.moveTo(upgrading_lab1);
                            }
                        }
                    }
                }

            }
        }
    }

};

