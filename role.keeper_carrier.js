const { toArray } = require("lodash");
var RoomPositionFunctions = require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");

const keeper_carrier = {
    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        creep.say("&&");
        var position = creep.pos;
        if (creep.store[RESOURCE_ENERGY] == 0 && creep.room.name == creep.memory.target_room
            /*&& creep.store[RESOURCE_ENERGY]>0*/)
            {

            //console.log(" 1");

            if (position.x > 48) {
                creep.move(LEFT);
            }
            else if (position.x < 2) {
                creep.move(RIGHT);
            }
            if (position.y > 48) {
                creep.move(TOP);
            }
            else if (position.y < 2) {
                creep.move(BOTTOM);
            }

        }

        
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
            && creep.store.getFreeCapacity() > 0) 
            {// in target room and is collecting
            
                if(creep.pos.findInRange(FIND_HOSTILE_CREEPS,4).length>0)
                {
                    goOutOfRange(creep,4);
                    delete creep.memory.path;
                }
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
                    && resource.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length < 1
                    && resource.amount>100
            })
            
            closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
            //creep.say(closestDroppedEnergy.pos.x+" "+closestDroppedEnergy.pos.y);
            if (closestDroppedEnergy != undefined && (droppedEnergy != undefined || droppedEnergy.length >= 1))
             {//there is safe energy
                creep.say('E');
                if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    move_avoid_hostile(creep,closestDroppedEnergy);
                }
                else{
                    creep.memory.path=undefined;
                }

            }
            else {// go to tombstones
                creep.say("T");
                var tombstones = creep.room.find(FIND_TOMBSTONES, {
                    filter: structure => structure.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length < 1
                });
                if (tombstones != undefined && tombstones.length >= 1) {
                    var min_decay = tombstones[0].ticksToDecay;
                    var nearest_tombstone = tombstones[0];
                    for (let i = 1; i < tombstones.length; i++) {
                        if (tombstones[i].ticksToDecay < min_decay) {
                            nearest_tombstone = tombstones[i];
                            min_decay = tombstones[i].ticksToDecay;
                        }
                        //console.log("nearest tombstone: ",nearest_tombstone.pos);
                    }
                    move_avoid_hostile(creep,nearest_tombstone.pos,4);

                }
            }
            var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (hostile) {
                    return hostile.pos.inRangeTo(creep,3) == true;
                }
            });
            if (hostileCreeps != undefined && hostileCreeps.length > 0) {
                //creep.say("RUN");
                goOutOfRange(creep,4);
            }

        }
        else if (creep.room.name != creep.memory.home_room.name
            && creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() * 0.9) 
        {// not in home_room and no free space - go home_room
            creep.say("GH");
            //creep.say(creep.moveTo(25,25,creep.memory.home_room.name));
            //console.log("home: ", home);
            move_avoid_hostile(creep, new RoomPosition(25,25,creep.memory.home_room.name),1);
        }
        else if (creep.room.name == creep.memory.home_room.name) {
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER &&
                        structure.store[RESOURCE_ENERGY] < 2000;
                    /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                }
            });

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }));

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));

            containers = containers.concat(creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_LINK
                        && structure.pos.x != spawn.pos.x + 3 && structure.pos.y != spawn.pos.y - 3
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }));

            containers=containers.concat(creep.room.find(FIND_STRUCTURES,{
                filter: function (structure){
                    return structure.structureType==STRUCTURE_LINK
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
                }
            }))

            if (containers.length > 0) {
                //console.log(6.1);
                var closest_container = creep.pos.findClosestByRange(containers);
                console.log(closest_container.pos);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                    creep.moveTo(closest_container);
                }
            }

            if (position.x > 48) {
                creep.move(LEFT);
            }
            else if (position.x < 2) {
                creep.move(RIGHT);
            }
            if (position.y > 48) {
                creep.move(TOP);
            }
            else if (position.y < 2) {
                creep.move(BOTTOM);
            }

        }
    }
};

module.exports = keeper_carrier;



