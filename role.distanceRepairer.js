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
        // FINDING ALL STRUCTURES
        if (creep.memory.all_structures_id != undefined && creep.memory.all_structures_id.length > 0) {
            for (let id of creep.memory.all_structures_id) {
                if (Game.getObjectById(id) == null) {
                    creep.memory.all_structures_id = undefined;
                    break;
                }
            }
        }
        if (creep.memory.all_structures_id == undefined) {
            var all_structures_id = creep.room.find(FIND_STRUCTURES, {
                filter: function (object) {
                    return object.structureType != STRUCTURE_RAMPART && object.ticksToDecay != undefined;
                }
            });

            if (all_structures_id != undefined && all_structures_id.length > 0) {
                creep.memory.all_structures_id = []
                for (let str of all_structures_id) {
                    creep.memory.all_structures_id.push(str.id)
                }
            }
        }


        //FINDING DAMAGED STRUCTURES
        if (creep.memory.all_structures_id != undefined && creep.memory.all_structures_id.length > 0) {
            if (creep.memory.damaged_structures_id != undefined) {
                for (let str_id of creep.memory.damaged_structures_id) {
                    if (Game.getObjectById(str_id) == null) {
                        creep.memory.damaged_structures_id = undefined;
                        break;
                    }
                }
            }
            if (creep.memory.damaged_structures_id == undefined && Game.time % 13 == 0) {
                creep.memory.damaged_structures_id = [];
                for (let str of creep.memory.all_structures_id) {
                    if (Game.getObjectById(str).hits < Game.getObjectById(str).hitsMax * 0.7) {
                        creep.memory.damaged_structures_id.push(str)
                    }
                }
            }
        }


        //FINDING CONTAINERS
        if (creep.memory.containers != undefined) {
            if (creep.memory.containers.length == undefined || creep.memory.containers.length == 0) { creep.memory.containers = undefined }

            for (container_id in creep.memory.containers) {
                if (Game.getObjectById(container_id) == null) {
                    creep.memory.containers = undefined
                    break;
                }
            }
        }
        if (creep.memory.containers == undefined && creep.store[RESOURCE_ENERGY] == 0) {
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





        if (creep.memory.damaged_structures_id != undefined && creep.memory.damaged_structures_id.length < 3 && creep.name.startsWith('Builder') == false) {
            //creep.move(LEFT)
            creep.memory.damaged_structures_id = undefined
            creep.roleBuilder(creep, spawn);
        }
        else if (creep.memory.damaged_structures_id != undefined && creep.memory.damaged_structures_id.length >= 3) {


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

                if (creep.memory.damaged_structures_id != undefined && creep.memory.damaged_structures_id.length >0) {

                    //var closest_target = creep.pos.findClosestByRange(targets);

                    if(creep.memory.target_structure_id!=undefined && Game.getObjectById(creep.memory.target_structure_id)==null)
                    {
                        creep.memory.target_structure_id=undefined
                    }

                    if(creep.memory.target_structure_id==undefined)
                    {
                        creep.memory.target_structure_id=creep.memory.damaged_structures_id[0];//take first structure
                    }


                    if (creep.memory.target_structure_id != undefined) {
                        var target_structure_id = Game.getObjectById(creep.memory.target_structure_id)
                        if (target_structure_id != null && target_structure_id.hits < target_structure_id.hitsMax) {
                            //creep.say("rep")
                            if (creep.repair(target_structure_id) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure_id, { visualizePathStyle: { stroke: 'red' }, reusePath: 17 });
                                //move_avoid_hostile(creep, closest_target.pos, 2, false);
                            }
                        }
                        else {
                            creep.say("renew")
                            creep.memory.target_structure_id = undefined;
                            creep.memory.damaged_structures_id=undefined;
                        }
                    }
                    //creep.say(closest_target.pos.x+" "+closest_target.pos.y)


                }
            }
            else if (creep.store[RESOURCE_ENERGY] == 0 && creep.memory.containers != undefined && creep.memory.containers.length > 0) {// go to deposits
                var containers = [];
                //creep.say("ener")
                for (container_id of creep.memory.containers) {
                    if (Game.getObjectById(container_id) != null && Game.getObjectById(container_id).store[RESOURCE_ENERGY] > 0) {
                        containers.push(Game.getObjectById(container_id))
                    }

                }
                var source = creep.pos.findClosestByRange(containers);
                if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    //creep.say("Going to Cintainer");
                    creep.moveTo(source, { reusePath: 17 });
                    //move_avoid_hostile(creep, source.pos,1);
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
        else {
            creep.memory.damaged_structures_id = undefined
        }

    }
    else {
        if (creep.memory.target_room != undefined) {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { reusePath: 17 });
        }


        //move_avoid_hostile(creep, new RoomPosition(25, 25, creep.memory.target_room), 5, if_avoid);
    }




};

