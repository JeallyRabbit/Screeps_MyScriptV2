const {boosting_driver}=require('boosting_driver');
const { move_avoid_hostile } = require('./move_avoid_hostile');
var roleBuilder = require('role.builder');
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["GH", "XGH2O" , "GH2O"];//boost types that creep accepts
        }
       // else 
       if(boosting_driver(creep,spawn,creep.memory.boosting_list,WORK)==-1){
            //creep.say(creep.store[RESOURCE_ENERGY], "energy");
            if(spawn.memory.building==true)
            {
                //roleBuilder.run(creep,spawn);
                //return;
            }
            if(creep.memory.upgrading==undefined)
            {
                creep.memory.upgrading=false;
            }
            if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) { // if upgrading and no energy go harvest
                creep.memory.upgrading = false;
                //creep.say('🔄 harvest');
            }
            if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) { // if have energy and RCL
                creep.memory.upgrading = true;
                //creep.say('🚧 upgrade');
            }
            if((creep.memory.deposit!=undefined && Game.getObjectById(creep.memory.deposit).store[RESOURCE_ENERGY]<creep.store.getCapacity()) || Game.time%76==0)
            {
                creep.memory.deposit=undefined;
            }
            if(creep.memory.deposit==undefined && Game.time%20==0 )
            {
                var deposits = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE &&
                        structure.store[RESOURCE_ENERGY] > 5000;
                }
                });
                deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity();
                    }
                }));

                deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_LINK
                            && structure.store[RESOURCE_ENERGY] > 0;
                    }
                }));
                var deposit=creep.pos.findClosestByRange(deposits);
                if(deposit!=null)
                {
                    creep.memory.deposit=deposit.id;
                }
            }
            

            if (creep.memory.upgrading) // if upgrading go upgrade
            {
                //creep.say(creep.pos.getRangeTo(creep.room.controller));
                //console.log(creep.name," ",creep.upgradeController(creep.room.controller));
                if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {

                    creep.moveTo(creep.room.controller);
                    //move_avoid_hostile(creep,creep.room.controller.pos,1,true);
                }
                creep.moveTo(creep.room.controller, { range: 1 });
            }
            else if (!creep.memory.upgrading && Game.getObjectById(creep.memory.deposit) != null)// if no energy and there are deposits
            {// go to deposits
                //creep.say("depo");

                //var deposit = creep.pos.findClosestByRange(deposits);
                var withdraw_amount = 0;
                if (creep.memory.deposit != undefined) {
                    withdraw_amount = Math.min(creep.store.getFreeCapacity(), Game.getObjectById(creep.memory.deposit).store[RESOURCE_ENERGY]);
                    if (withdraw_amount > 0) {
                        if (creep.withdraw(Game.getObjectById(creep.memory.deposit), RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(Game.getObjectById(creep.memory.deposit));
                            //move_avoid_hostile(creep,Game.getObjectById(creep.memory.deposit).pos,1);
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
                        //move_avoid_hostile(creep,closestDroppedEnergy.pos);
                    }
                }
            }
        }
    }
};

module.exports = roleUpgrader;