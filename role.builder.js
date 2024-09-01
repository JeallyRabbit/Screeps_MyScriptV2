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
            return (structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TERMINAL)
                && structure.store[RESOURCE_ENERGY] > 50;
        }
    }));
    deposits = deposits.concat(creep.room.find(FIND_RUINS, {
        filter: (structure) => {
            return structure.store[RESOURCE_ENERGY] > 50;
        }
    }));

    //creep.say(deposits.length)
    if (spawn.store[RESOURCE_ENERGY] >= 300 && deposits.length == 0 && creep.memory.target_room == creep.memory.home_room.name) {
        deposits = deposits.concat(spawn);
    }

    var closest_target = creep.pos.findClosestByRange(targets);
    var found_important_lvl1 = false;
    for (let i = 0; i < targets.length; i++) {
        if (targets[i].structureType == STRUCTURE_SPAWN || targets[i].structureType == STRUCTURE_STORAGE || targets[i].structureType == STRUCTURE_CONTAINER) {
            closest_target = targets[i];
            found_important_lvl1 = true;
            //creep.say("S");
            break;
        }
    }
    var found_important_lvl2 = false;
    if (found_important_lvl1 == false) {
        for (let i = 0; i < targets.length; i++) {
            if (targets[i].structureType == STRUCTURE_EXTENSION) {
                closest_target = targets[i];
                found_important_lvl2 = true;
                //creep.say("S");
                break;
            }
        }
    }
    //creep.say(creep.pos.findClosestByRange(deposits).structureType);
    if (creep.memory.building) { // if building go to construction site and build
        //creep.say(creep.build(closest_target));

        if (targets.length) {
            var build_result=creep.build(closest_target)
            if (build_result == ERR_NOT_IN_RANGE) {
                //creep.say("NB");
                creep.moveTo(closest_target, { range: 2,maxRooms:1 });
                //move_avoid_hostile(creep, closest_target.pos, 3, false);
            }
            else if (build_result == OK) { 
                creep.memory.is_working = true;
                if(closest_target.structureType==STRUCTURE_RAMPART)
                {
                    creep.say("QWE")
                    spawn.memory.damagedStructures=undefined;
                }
            }
        }
    }
    else if (!creep.memory.building && creep.pos.findClosestByRange(deposits) != null)// not building and there are deposits
    {
        //var deposit=getMaxEnergyDeposit(creep);
        //creep.say(3)
        var deposit = creep.pos.findClosestByRange(deposits);
        if (creep.withdraw(deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(deposit,{reusepath: 21, maxRooms:1});
            //move_avoid_hostile(creep, deposit.pos, 1, false);
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
                creep.moveTo(closestDroppedEnergy,{maxRooms:1});
                //move_avoid_hostile(creep, closestDroppedEnergy.pos, 1, false);
            }
        }
    }


};

