//var RoomPositionFunctions = require('roomPositionFunctions');

const { move_avoid_hostile } = require("./move_avoid_hostile");
var roleDistanceCarrier = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say(creep.memory.home_room);
        //creep.move(RIGHT);
        //return;
        //creep.drop(RESOURCE_ENERGY);
        if (creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.closest_home_container = undefined;
        }
        if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {// in target room and have free space - collect dropped energy or energy from containers
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        && structure.store[RESOURCE_ENERGY] > 0;
                    /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                }
            });

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            }));


            /*
                if(creep.pos.y>49){
                    creep.move(TOP);
                }
                else if(creep.pos.y<1){
                    creep.move(BOTTOM);
                }
                else if(creep.pos.x>49){
                    creep.move(LEFT);
                }
                else if(creep.pos.x<1){
                    creep.move(RIGHT);
                }*/
            //else (return 0;)
            //creep.moveTo(25,25,creep.memory.target_room)

            //else
            //{
            //creep.memory.cID_max = undefined;
            if (creep.memory.cID_max == undefined) {
                var biggest_energy = 0;
                for (let i = 0; i < containers.length; i++) {
                    if (containers[i].store[RESOURCE_ENERGY] > biggest_energy) {
                        creep.memory.cID_max = i;
                        biggest_energy = containers[i].store[RESOURCE_ENERGY];
                    }
                }
            }
            else if (containers[creep.memory.cID_max] != undefined) {
                if (containers[creep.memory.cID_max].store[RESOURCE_ENERGY] == 0) {
                    creep.memory.cID_max = undefined;
                }
            }

            if (creep.memory.cID_max != undefined) {
                //console.log("creep.memory.cID_max: ",creep.memory.cID_max);
                //console.log(creep.pos);
                if (containers[creep.memory.cID_max] == undefined) {
                    return 0;
                }
                var withdraw_amount = 1;
                if (creep.memory.cID_max >= 0) {
                    withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[creep.memory.cID_max].store[RESOURCE_ENERGY]);
                    if (creep.withdraw(containers[creep.memory.cID_max], RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have free space go colelct energy from containers
                        //creep.moveTo(containers[creep.memory.cID_max]);
                        move_avoid_hostile(creep, containers[creep.memory.cID_max].pos, 1);
                    }
                    else if (creep.withdraw(containers[creep.memory.cID_max], RESOURCE_ENERGY, withdraw_amount) == OK) {
                        creep.memory.cID_max = undefined;
                        delete creep.memory.my_path;
                    }
                }
            }

            // }


        }
        else if (creep.room.name != creep.memory.home_room.name && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {// not in home_room and no free space - go home_room
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name


            var home_containers = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER &&
                        structure.store[RESOURCE_ENERGY] < 2000;
                    /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                }
            });

            home_containers = home_containers.concat(spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_EXTENSION
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }));

            home_containers = home_containers.concat(spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));

            home_containers = home_containers.concat(spawn.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_LINK
                        && (structure.pos.x != spawn.pos.x + 3 || structure.pos.y != spawn.pos.y - 3)
                        && structure.store[RESOURCE_ENERGY] < 800
                }
            }));

            move_avoid_hostile(creep, home_containers, 1);
            if (creep.memory.my_path != undefined) {
                if (creep.memory.my_path.incomplete == false && creep.memory.carry_distance != undefined) {
                    if (creep.memory.my_path.path.length < creep.memory.carry_distance) {
                        creep.memory.carry_distance = creep.memory.my_path.path.length;
                    }
                }
                else if (creep.memory.my_path.incomplete == false && creep.memory.carry_distance == undefined) {
                    creep.memory.carry_distance = creep.memory.my_path.path.length;
                }
            }
            if(creep.memory.carry_distance!=undefined)
            {
                creep.memory.carrying_power=creep.store.getCapacity()/(creep.memory.carry_distance*2);
            }

        }
        else if (creep.room.name == creep.memory.home_room.name && creep.store[RESOURCE_ENERGY] > 0) {// in home room and have energy - store it in container or storage
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
                        && (structure.pos.x != spawn.pos.x + 3 || structure.pos.y != spawn.pos.y - 3)
                        && structure.store[RESOURCE_ENERGY] < 800
                }
            }));

            if (containers.length > 0) {
                //console.log("containers: ", containers.length);
                var closest_container = creep.pos.findClosestByRange(containers);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                    move_avoid_hostile(creep, closest_container.pos, 1);
                    //creep.moveTo(closest_container, { noPathFinding: false, reusePath: 5 });
                }
                else {
                    delete creep.memory.my_path;
                }

            }
        }
        else if (creep.room.name != creep.memory.target_room && creep.store[RESOURCE_ENERGY] == 0) {// not in target room and no energy - go target room

            //if(creep.memory.target_room==undefined){creep.suicide();}
            var extensions_in_home = spawn.room.find()
            //creep.say("target");
            const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name
            //creep.moveTo(destination);
            move_avoid_hostile(creep, destination, 20);

        }
    }
};
module.exports = roleDistanceCarrier;