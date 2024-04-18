const { toArray } = require("lodash");
var RoomPositionFunctions = require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");

Creep.prototype.keeper_carrier = function keeper_carrier(creep, spawn) {

    //creep.suicide();

    //creep.say("!");
    // Check if the creep has a target room
    if (!creep.memory.target_room) {
        //console.log(" 2");
        return 0;
    }
    // Check if the creep is in the target room
    if (creep.room.name !== creep.memory.target_room
        && creep.store[RESOURCE_ENERGY] == 0) {
        // If not, move to the target room
        const destination = new RoomPosition(25, 25, creep.memory.target_room);
        creep.moveTo(destination);
    }
    else if (creep.room.name == creep.memory.target_room
        && creep.store.getFreeCapacity() > 0) {// in target room and is collecting

        creep.memory.is_working = true;

        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0) {
            goOutOfRange(creep, 4);
            delete creep.memory.my_path;
        }

        if (creep.memory.closestDroppedEnergy != undefined && creep.memory.closestDroppedEnergy.length > 0) {
            for (let i = 0; i < creep.memory.closestDroppedEnergy.length; i++) {
                if (Game.getObjectById(creep.memory.closestDroppedEnergy) == undefined) {
                    creep.say("del energy");
                    creep.memory.closestDroppedEnergy = undefined;
                    break;
                }
            }
        }
        else if (creep.memory.closestDroppedEnergy == undefined) {
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length < 1
                    && resource.amount > 50
            });
            closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
            if (closestDroppedEnergy != null) {
                creep.memory.closestDroppedEnergy = closestDroppedEnergy.id;
            }
        }
        //closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
        //creep.say(closestDroppedEnergy.pos.x+" "+closestDroppedEnergy.pos.y);
        if (creep.memory.closestDroppedEnergy != undefined && creep.memory.closestDroppedEnergy != null && Game.getObjectById(creep.memory.closestDroppedEnergy) != null) {//there is safe energy
            //creep.say('E');
            if (creep.pickup(Game.getObjectById(creep.memory.closestDroppedEnergy)) == ERR_NOT_IN_RANGE) {
                // Move to it
                //move_avoid_hostile(creep, Game.getObjectById(creep.memory.closestDroppedEnergy).pos,0,false);
                creep.moveTo(Game.getObjectById(creep.memory.closestDroppedEnergy), { avodidSk: true });
                if (creep.memory.my_path == undefined) {
                    creep.memory.closestDroppedEnergy = undefined;
                }
            }
            else {
                creep.memory.my_path = undefined;
            }

        }
        else {// go to farmers

            var farmer = creep.room.find(FIND_MY_CREEPS, {
                filter: function (farmer) {
                    return farmer.memory.role == 'keeperFarmer';
                }
            });
            if (farmer != undefined && farmer.length > 0) {
                creep.moveTo(farmer[0], { range: 3, avoidSk: true });
                //move_avoid_hostile(creep, farmer[0].pos, 3);
            }
            else {
                var fighter = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (fighter) {
                        return fighter.memory.role == 'keeperKiller' || fighter.memory.role == 'keeperHealer';
                    }
                });
                if (fighter != undefined && fighter.length > 0) {
                    creep.moveTo(fighter[0], { range: 5, avoidSk: true });
                    //move_avoid_hostile(creep, fighter[0].pos, 5, false);
                }
            }
        }
        var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: function (hostile) {
                return hostile.pos.inRangeTo(creep, 3) == true;
            }
        });
        if (hostileCreeps != undefined && hostileCreeps.length > 0) {
            //creep.say("RUN");
            goOutOfRange(creep, 4);
        }

    }
    else if (creep.room.name != creep.memory.home_room.name
        && creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() * 0.9) {// not in home_room and no free space - go home_room
        //creep.say("GH");
        //creep.say(creep.moveTo(25,25,creep.memory.home_room.name));
        //console.log("home: ", home);
        creep.moveTo(new RoomPosition(25, 25, creep.memory.home_room.name), { range: 10 });
        //move_avoid_hostile(creep, new RoomPosition(25, 25, creep.memory.home_room.name), 1);
    }
    else if (creep.room.name == creep.memory.home_room.name) {
        /*
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY] < 2000;
            }
        });
        */
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        });

        containers = containers.concat(creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_LINK
                    && structure.pos.x != spawn.pos.x + 3 && structure.pos.y != spawn.pos.y - 3
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }));

        if (containers.length > 0) {
            //console.log(6.1);
            var closest_container = creep.pos.findClosestByRange(containers);
            //console.log(closest_container.pos);
            var transfer_amount = 1;
            transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
            if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                creep.moveTo(closest_container);
            }
        }


    }

};




