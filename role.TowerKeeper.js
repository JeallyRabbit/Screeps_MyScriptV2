const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

var roleTowerKeeper = {

    /** @param {Creep} creep **/
    run: function (creep) {
        var deposit = getClosestEnergyDeposit(creep);
        //creep.say(creep.store.getFreeCapacity());
        //creep.say(deposit);
        var towers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_TOWER && structure.store[RESOURCE_ENERGY] < 900;
            }
        });
        var tower_min = 1000;
        var minID = 0;
        for (let i = 0; i < towers.length; i++) {
            if (towers[i].store[RESOURCE_ENERGY] < tower_min) {
                minID = i;
            }
        }
        if (creep.store.getFreeCapacity() > 0 && deposit != -1) {
            //creep.say("A");
            withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, deposit.store[RESOURCE_ENERGY]);
            if (creep.withdraw(deposit, RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                creep.moveTo(deposit);
            }
        }
        else if (towers.length > 0) {
            //creep.say("tower");
            if (creep.transfer(towers[minID], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                creep.moveTo(towers[minID]);
            }
        }

    }
};
module.exports = roleTowerKeeper;