//var RoomPositionFunctions = require('roomPositionFunctions');
const {boosting_driver}=require('boosting_driver');
const { move_avoid_hostile } = require("./move_avoid_hostile");
var roleDistanceCarrier = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say(creep.memory.home_room);
        //creep.move(RIGHT);
        //return;
        //creep.drop(RESOURCE_ENERGY);

        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["KH","KH2O","XKH2O"];//boost types that creep accepts
        }
        if(boosting_driver(creep,spawn,creep.memory.boosting_list,CARRY)==-1 )
        {
            if (creep.store[RESOURCE_ENERGY] == 0) {
                creep.memory.closest_home_container = undefined;
            }
            if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                // in target room and have free space - collect dropped energy or energy from containers
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && structure.store[RESOURCE_ENERGY] > 0;
                        /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                    }
                });
    
    
                
                    if(creep.pos.y>=49){
                        creep.move(TOP);
                    }
                    else if(creep.pos.y<=1){
                        creep.move(BOTTOM);
                    }
                    else if(creep.pos.x>=49){
                        creep.move(LEFT);
                    }
                    else if(creep.pos.x<=1){
                        creep.move(RIGHT);
                    }
    
                    
                    if(creep.memory.energy_to_collect==undefined)
                    {
                        const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: resource => resource.amount > 30
                    });
                        if(droppedEnergy!=undefined && droppedEnergy.length>0)
                        {
                            creep.memory.energy_to_collect=creep.pos.findClosestByPath(droppedEnergy).id;
                            creep.memory.energy_pos=creep.pos.findClosestByPath(droppedEnergy).pos;
                        }
                        
                    }
                    if(creep.memory.energy_to_collect!=undefined)
                    {
                        if(Game.getObjectById(creep.memory.energy_to_collect)!=null)
                        {
                            if (creep.pickup(Game.getObjectById(creep.memory.energy_to_collect)) == ERR_NOT_IN_RANGE) {
                                move_avoid_hostile(creep,Game.getObjectById(creep.memory.energy_to_collect).pos,1,false);
                                //creep.say("E");
                            }
                        }
                        else {
                            delete creep.memory.energy_to_collect;
                        }
                        return;
                    }
                //else (return 0;)
                //creep.moveTo(25,25,creep.memory.target_room)
    
                //else
                //{
                //creep.memory.cID_max = undefined;
                if (creep.memory.cID_max == undefined) {
                    var biggest_energy = 0;
                    for (let i = 0; i < containers.length; i++) {
                        if (containers[i].store[RESOURCE_ENERGY] > biggest_energy) {
                            creep.memory.cID_max = containers[i].id;
                            biggest_energy = containers[i].store[RESOURCE_ENERGY];
                        }
                    }
                }
                else if (Game.getObjectById(creep.memory.cID_max) != undefined) {
                    if (Game.getObjectById(creep.memory.cID_max).store[RESOURCE_ENERGY] == 0) {
                        creep.memory.cID_max = undefined;
                    }
                }
    
                if (creep.memory.cID_max != undefined) {
                    //console.log("creep.memory.cID_max: ",creep.memory.cID_max);
                    //console.log(creep.pos);
                    if (Game.getObjectById(creep.memory.cID_max) == undefined) {
                        return 0;
                    }
                    var withdraw_amount = 1;
                    if (creep.memory.cID_max !=undefined) {
                        //creep.say("A");
                        withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, Game.getObjectById(creep.memory.cID_max).store[RESOURCE_ENERGY]);
                        if (creep.withdraw(Game.getObjectById(creep.memory.cID_max), RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have free space go colelct energy from containers
                            //creep.moveTo(Game.getObjectById(creep.memory.cID_max).pos);
                            move_avoid_hostile(creep, Game.getObjectById(creep.memory.cID_max).pos, 1,true);
                        }
                        else if (creep.withdraw(Game.getObjectById(creep.memory.cID_max), RESOURCE_ENERGY, withdraw_amount) == OK) {
                            creep.memory.cID_max = undefined;
                            delete creep.memory.my_path;
                        }
                    }
                }
    
                // }
    
    
            }
            else if (creep.room.name != creep.memory.home_room.name && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {// not in home_room and no free space - go home_room
                const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
    
                //creep.say("go home");
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
                //var closest_home_container=creep.pos.findClosestByPath(home_containers);
               // move_avoid_hostile(creep, destination,1,false);
                
                creep.moveTo(destination,{reusePath: 15});
                
    
            }
            else if (creep.room.name == creep.memory.home_room.name && creep.store[RESOURCE_ENERGY] > 0) {// in home room and have energy - store it in container or storage
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER &&
                            structure.store[RESOURCE_ENERGY] < 1800;
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
    
                if (containers.length > 0 && containers!=undefined) {
                    //console.log("containers: ", containers.length);
                    var closest_container = creep.pos.findClosestByPath(containers);
                    var transfer_amount = 1;
                    if(closest_container!=null)
                    {
                        transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                        if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                            move_avoid_hostile(creep, closest_container.pos, 1,false);
                            //creep.say("con");
                            //creep.moveTo(closest_container, { noPathFinding: false, reusePath: 5 });
                        }
                        else {
                            delete creep.memory.my_path;
                        }
    
                    }
                    
                }
            }
            else if (creep.room.name != creep.memory.target_room && creep.store[RESOURCE_ENERGY] == 0) {
                // not in target room and no energy - go target room
    
                //if(creep.memory.target_room==undefined){creep.suicide();}
                //var extensions_in_home = spawn.room.find()
                //creep.say("target");
                const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name
                //creep.moveTo(destination);
                move_avoid_hostile(creep, destination,20,false,4000);
    
            }

        }
        
    }
};
module.exports = roleDistanceCarrier;