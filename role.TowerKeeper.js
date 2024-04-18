//const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");

Creep.prototype.roleTowerKeeper = function roleTowerKeeper(creep, spawn) {

    //var deposit = getClosestEnergyDeposit(creep);


    if (spawn.memory.towers_id == undefined || (spawn.memory.towers_id != undefined && spawn.memory.towers_id.length == 0)) {
        return;

    }


    if (spawn.room.storage != undefined) {
        var deposit = spawn.room.storage;
    }
    else {
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                    && structure.store[RESOURCE_ENERGY] > 50;
            }
        });
        var deposit = creep.pos.findClosestByRange(containers);
    }


    //creep.say(creep.store.getFreeCapacity());
    //creep.say(deposit);


    /*
    var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER && structure.store[RESOURCE_ENERGY] < 900;
        }
    });
    if (deposit == undefined || (towers == undefined || towers.length < 1)) {
        //creep.moveTo(spawn.pos.x-2,spawn.pos.y+1);
    }
    var tower_min = 1000;
    var minID = 0;
    for (let i = 0; i < towers.length; i++) {
        if (towers[i].store[RESOURCE_ENERGY] < tower_min) {
            minID = i;
        }
    }
    */
    var min_energy = TOWER_CAPACITY;
    var tower = undefined;
    var min_id = undefined;
    for (tower_id of spawn.memory.towers_id) {

        tower = Game.getObjectById(tower_id)
        if (tower != null && tower.store[RESOURCE_ENERGY] < min_energy) {
            min_energy = tower.store[RESOURCE_ENERGY]
            min_id = tower_id
            console.log(tower_id)
        }
    }
    var min_tower = Game.getObjectById(min_id)
    //if (min_id != undefined && tower!=undefined) {
    if (creep.store.getFreeCapacity() > 0 && deposit != null) {
        if (creep.withdraw(deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
            creep.moveTo(deposit, { reusePath: 17 });
        }
    }
    else if (min_id != undefined && min_tower != undefined && min_tower != null) {
        if (creep.transfer(min_tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
            creep.moveTo(min_tower, { reusePath: 17 });
        }
    }
    //}



};