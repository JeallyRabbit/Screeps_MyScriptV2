const {boosting_driver}=require('boosting_driver');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["GH", "XGH2O", "GH2O"];//boost types that creep accepts
        }
       //boosting-driver(creep,spawn,creep.memory.boosting_list,WORK);
        /*
        var lab = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_LAB
                    && ((structure.pos.x != spawn.pos.x + 3 && structure.pos.y != spawn.pos.y)
                        || (structure.pos.x != spawn.pos.x + 3 && structure.pos.t != spawn.pos.y - 1));
            }
        });
        //console.log(lab);
        creep.memory.parts_to_boost = _.filter(creep.body, part => _.isUndefined(part.boost) && part.type == WORK);
        //console.log("PARTS");
        if (creep.memory.parts_to_boost != undefined && lab != undefined) {
            creep.memory.need_boosting = true;
            for (let i = 0; i < creep.memory.parts_to_boost.length; i++) {
                //console.log(typeof creep.memory.parts_to_boost[i].boost);
            }
        }
        else {
            creep.memory.need_boosting = false;
        }

        if (lab != undefined && lab.length > 0) {
            //creep.say(console.log(lab[0].pos));
            //creep.memory.need_boosting=false;
        }
        var storage = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {//["GH","XGH2O","GH2O"]
                return structure.structureType == STRUCTURE_STORAGE
                    && (structure.store["GH"] > 30 || structure.store["GH2O"] > 30 || structure.store["XGH2O"] > 30);
            }
        });


        if (creep.memory.need_boosting == true && creep.memory.parts_to_boost != undefined && creep.memory.parts_to_boost.length > 0
            && lab != undefined && lab.length > 0 && creep.store[RESOURCE_ENERGY] == 0 && storage != undefined && storage.length > 0)
             {
                //creep.say("Q");
            if (creep.store["GH"] == 0 && creep.store["GH2O"] == 0 && creep.store["XGH2O"] == 0) {//creep don't have upgrading resource
                var upgrade_lvl = undefined;
                var upgrade_resource = undefined;
                if (storage[0].store["GH"] > 30) { upgrade_lvl = 1; upgrade_resource="GH";}
                if (storage[0].store["GH2O"] > 30) { upgrade_lvl = 2; upgrade_resource="GH2O";}
                if (storage[0].store["XGH2O"] > 30) { upgrade_lvl = 3; upgrade_resource="XGH2O";}

                var withdraw_amount = Math.min(creep.store.getFreeCapacity(), storage[0].store[upgrade_resource]);
                var upgrades_num=Math.floor(withdraw_amount/30);
                withdraw_amount=Math.min(upgrades_num,parts_to_boost.length)*30;
                if (withdraw_amount > 0) {
                    if (creep.withdraw(storage[0], upgrade_resource, withdraw_amount) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(storage[0]);
                    }
                }
            }
            else{
                //creep.say("B");
                creep.moveTo(lab[0]);
            }
        }
        else if(creep.memory.need_boosting == true && creep.memory.parts_to_boost != undefined && creep.memory.parts_to_boost.length > 0
            && lab != undefined && lab.length > 0 && creep.store[RESOURCE_ENERGY] == 0)
        {
            creep.moveTo(lab[0]);
            if(lab[0].cooldown<4)
            {
                for(const resource in creep.store)
                {
                    creep.transfer(lab[0],resource);
                    
                }
                creep.memory.need_boosting=false;
            }
        }*/
       // else 
       if(boosting_driver(creep,spawn,creep.memory.boosting_list,WORK)==-1){
            //creep.say(creep.store[RESOURCE_ENERGY], "energy");
            if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) { // if upgrading and no energy go harvest
                creep.memory.upgrading = false;
                //creep.say('🔄 harvest');
            }
            if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) { // if have energy and RCL
                creep.memory.upgrading = true;
                //creep.say('🚧 upgrade');
            }
            var deposits = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] > 5000;
                }
            });
            deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            }));

            deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_LINK
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            }));

            if (creep.memory.upgrading) // if upgrading go upgrade
            {
                //creep.say(creep.pos.getRangeTo(creep.room.controller));
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
                creep.moveTo(creep.room.controller, { range: 1 });
            }
            else if (!creep.memory.upgrading && creep.pos.findClosestByRange(deposits) != null)// if no energy and there are deposits
            {// go to deposits
                //creep.say("depo");

                var deposit = creep.pos.findClosestByRange(deposits);
                var withdraw_amount = 0;
                if (deposit != undefined) {
                    withdraw_amount = Math.min(creep.store.getFreeCapacity(), deposit.store[RESOURCE_ENERGY]);
                    if (withdraw_amount > 0) {
                        if (creep.withdraw(deposit, RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(deposit);
                        }
                    }
                }

            }
            else { // collect dropped energy
                const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: resource => resource.resourceType == RESOURCE_ENERGY
                })
                const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                if (droppedEnergy.length > 0) {
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        creep.moveTo(closestDroppedEnergy);
                    }
                }
            }
        }
    }
};

module.exports = roleUpgrader;