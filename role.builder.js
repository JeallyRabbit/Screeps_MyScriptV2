//var roleUpgrader = require('role.upgrader');


Creep.prototype.roleBuilder = function roleBuilder(creep, spawn) {

    //creep.say("BB");
    //creep.suicide();



    var targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter:
            function (structure) {
                return structure.my == true || true;
            }
    });
    if (targets.length == 0) // if no constructuin sites suicide
    {
        if (creep.room.name == spawn.room.name) {
            spawn.memory.req_builders = 0;
            spawn.memory.building = undefined;
            spawn.memory.upgrading = true;
        }

        if (creep.memory.role != 'distanceRepairer' && creep.memory.role != 'colonizer') {
            creep.memory.role = 'rampartRepairer';
            creep.memory.target_room = creep.memory.home_room.name;
        }

        if (creep.room.name == creep.memory.home_room.name && creep.memory.role != 'rampartRepairer') {
            //roleUpgrader.run(creep, spawn);
        }

    }

    if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.memory.is_working = false;
    }
    if (!creep.memory.building && creep.store[RESOURCE_ENERGY] > 0) {
        creep.memory.building = true;
    }

    var deposits = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY] > 50;
        }
    });
    deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_STORAGE
                && structure.store[RESOURCE_ENERGY] > 50;
        }
    }));
    if (spawn.store[RESOURCE_ENERGY] >= 300 && deposits.length == 0 && creep.memory.target_room == creep.memory.home_room.name) {
        deposits = deposits.concat(spawn);
    }

    var closest_target = creep.pos.findClosestByRange(targets);
    for (let i = 0; i < targets.length; i++) {
        if (targets[i].structureType == STRUCTURE_SPAWN) {
            closest_target = targets[i];
            //creep.say("S");
            break;
        }
    }
    //creep.say("A");
    if (creep.memory.building) { // if building go to construction site and build
        //creep.say(creep.build(closest_target));
        if (targets.length) {
            if (creep.build(closest_target) == ERR_NOT_IN_RANGE) {
                //creep.say("NB");
                creep.moveTo(targets[0], { range: 2 });
                //move_avoid_hostile(creep, closest_target.pos, 3, false);
            }
            else if (creep.build(closest_target) == OK) { creep.memory.is_working = true; }
            //move_avoid_hostile(creep, closest_target.pos, 3, false);
            //creep.moveTo(targets[0],{range:3});
        }
    }
    else if (!creep.memory.building && creep.pos.findClosestByRange(deposits) != null)// not building and there are deposits
    {
        //var deposit=getMaxEnergyDeposit(creep);
        var deposit = creep.pos.findClosestByRange(deposits);
        var withdraw_amount = 0;
        withdraw_amount = Math.min(creep.store.getFreeCapacity(), deposit.store[RESOURCE_ENERGY]);
        if (withdraw_amount > 0) {
            if (creep.withdraw(deposit, RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {
                creep.moveTo(deposit);
                //move_avoid_hostile(creep, deposit.pos, 1, false);
            }
        }
    }
    else {// else collect dropped energy
        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: resource => resource.resourceType == RESOURCE_ENERGY && resource.amount > 10
        });
        var closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
        if (closestDroppedEnergy != undefined) {
            if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                // Move to it
                creep.moveTo(closestDroppedEnergy);
                //move_avoid_hostile(creep, closestDroppedEnergy.pos, 1, false);
            }
        }
    }


};

