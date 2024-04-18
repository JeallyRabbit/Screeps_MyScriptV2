var roleBuilder = require('role.builder');
const { move_avoid_hostile } = require("./move_avoid_hostile");
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

Creep.prototype.roleDistanceRepairer = function roleDistanceRepairer(creep, spawn) {

    //creep.suicide();
    //creep.say("R");
    //var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
    if (creep.room.name == creep.memory.target_room) {

        //creep.move(TOP);
        //return;
        var targets = creep.room.find(FIND_STRUCTURES, {
            filter: function (object) {
                return object.hits < object.hitsMax && ((object.structureType == STRUCTURE_RAMPART && object.hits < 1000000)
                    || (object.structureType != STRUCTURE_RAMPART && object.hits < 300000))
            }
        });

        //var targets=creep.room.find(FIND_CONSTRUCTION_SITES);


        if (creep.memory.containers != undefined) {
            if (creep.memory.containers.length == undefined || creep.memory.containers.length == 0) { creep.memory.containers = undefined }

            for (container_id in creep.memory.containers) {
                if (Game.getObjectById(container_id) == null) {
                    creep.memory.containers = undefined
                    break;
                }
            }
        }
        if (creep.memory.containers == undefined) {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE;
                }
            });
            creep.memory.containers = [];
            if (containers != undefined && containers.length > 0) {
                for (container of containers) {
                    creep.memory.containers.push(container.id)
                }

            }
        }



        if (targets.length < 3 && creep.name.startsWith('Builder') == false) {
            //creep.move(TOP);
            creep.roleBuilder(creep, spawn);
        }
        else {
            targets.sort((a, b) => a.hits - b.hits);
            //console.log("require repair: ", targets.length);
            creep.memory.repairing = true;

            if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.repairing = false;
                //creep.say('🔄 harvest');

            }
            //console.log("wolne miejsce: ",creep.store.getFreeCapacity());
            if (creep.memory.repairing == false && creep.store.getFreeCapacity() == 0) { // go repair
                creep.memory.repairing = true;
                //creep.say('🚧 Repairing');
            }

            if (creep.memory.repairing) {
                //creep.say("QWERT");

                /*
                var source = creep.pos.findClosestByRange(containers);
                if (Game.time % 5 == 0 && creep.store.getFreeCapacity() > 0 && creep.pos.isNearTo(source)) {
                    creep.withdraw(source, RESOURCE_ENERGY, withdraw_amount);
                }
                */
                //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if (targets.length) {
                    var closest_target = creep.pos.findClosestByRange(targets);
                    if (creep.repair(closest_target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], { visualizePathStyle: { stroke: 'red' }, reusePath: 17 });
                        //move_avoid_hostile(creep, closest_target.pos, 2, false);
                    }

                }
            }
            else if (creep.store[RESOURCE_ENERGY] == 0 && creep.memory.ontainers != undefined && creep.memory.containers.length > 0) {// go to deposits
                var containers = [];
                for (container_id of creep.memory.containers) {
                    if (Game.getObjectById(container_id) != null && Game.getObjectById(container_id).store[RESOURCE_ENERGY] > 0) {
                        containers.push(Game.getObjectById(container_id))
                    }

                }
                var source = creep.pos.findClosestByRange(containers);
                //console.log("withdraw_amount: ",withdraw_amount);
                if (withdraw_amount > 0) {
                    //console.log("energy");
                    if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        //creep.say("Going to Cintainer");
                        creep.moveTo(source, { reusePath: 17 });
                        //move_avoid_hostile(creep, source.pos,1);
                    }
                }
                //console.log("qwert");
            }
            else if (creep.store[RESOURCE_ENERGY] == 0) {
                const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: resource => resource.resourceType == RESOURCE_ENERGY
                })
                const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                if (droppedEnergy.length > 0) {
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 17 });
                        //move_avoid_hostile(creep, closestDroppedEnergy.pos)
                    }
                }
            }
        }
    }
    else {
        if (creep.memory.target_room != undefined) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { reusePath: 17 });
        }


        //move_avoid_hostile(creep, new RoomPosition(25, 25, creep.memory.target_room), 5, if_avoid);
    }




};

