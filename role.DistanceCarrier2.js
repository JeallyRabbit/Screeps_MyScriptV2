//var RoomPositionFunctions = require('roomPositionFunctions');
const { boosting_driver } = require('boosting_driver');
//const { move_avoid_hostile } = require("./move_avoid_hostile");
//var roleHauler = require('role.hauler');

/*
function addEnergyIncome(creep,spawn,amount)
{
    //creep.memory.target_room 
    
    for(rm of spawn.memory.farming_rooms)
    {
        if(rm.name==creep.memory.target_room)
        {
            if(rm.income==undefined)
            {
                rm.income=amount
            }
            else{
                rm.income+=amount
            }
            break;
        }
    }
}
    */




Creep.prototype.roleDistanceCarrier2 = function roleDistanceCarrier2(creep, spawn) {


    if (creep.memory.boosting_list == undefined) {
        creep.memory.boosting_list = ["KH", "KH2O", "XKH2O"];//boost types that creep accepts
    }
    if (boosting_driver(creep, spawn, creep.memory.boosting_list, CARRY) == -1) {

        if (creep.memory.target_room_containers != undefined && creep.memory.target_room_containers.length > 0) {
            for (let i = 0; i < creep.memory.target_room_containers.length; i++) {
                if (Game.getObjectById(creep.memory.target_room_containers[i]) == null) {
                    creep.memory.target_room_containers = undefined;
                    break;
                }
            }
        }

        if (creep.store.getFreeCapacity() == 0) {
            creep.memory.collecting = false;
        }
        else if (creep.store.getUsedCapacity() == 0 || creep.memory.collecting == undefined) {
            creep.memory.collecting = true;
            creep.memory.closest_home_container = undefined;
        }



        // define containers from which creep should withdraw resources
        if (creep.memory.target_room_containers == undefined ||
            (creep.memory.target_room_containers != undefined && creep.memory.target_room_containers.length == 0)) {

            if (creep.memory.target_room == creep.memory.home_room.name) {
                //if creep.target_room is creep.home_room
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && ((structure.pos.x != spawn.pos.x - 2 || structure.pos.y != spawn.pos.y - 2) &&
                                (structure.pos.x != spawn.pos.x + 2 || structure.pos.y != spawn.pos.y - 2))
                            && (structure.pos.inRangeTo(spawn.room.controller.pos, 4) == false);
                    }
                });
                creep.memory.target_room_containers = [];
                for (let i = 0; i < containers.length; i++) {
                    creep.memory.target_room_containers.push(containers[i].id);
                }

            }
            else {
                //get containers of target_room
                if (Game.rooms[creep.memory.target_room] != undefined) {
                    var containers = Game.rooms[creep.memory.target_room].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
                    creep.memory.target_room_containers = [];
                    for (let i = 0; i < containers.length; i++) {
                        creep.memory.target_room_containers.push(containers[i].id);
                    }
                }

            }

        }


        if (creep.memory.collecting) {// if creep have free space
            /*
                if(creep.memory.target_room==spawn.room.name)
                {
                    creep.say("empty")
                }
                    */

            if ((Game.rooms[creep.memory.target_room] == undefined || creep.pos.inRangeTo(spawn,4) )&& spawn.memory.need_soldier != creep.memory.target_room) {
                const destination = new RoomPosition(25, 25, creep.memory.target_room);
                creep.moveTo(destination, { reusePath: 25,avoidCreeps: true  });
            }
            if (creep.memory.target_room_containers != undefined && creep.memory.target_room_containers.length > 0) {// find max_container and take resources from it or go sleep

                //finding max_container
                if (creep.memory.max_container == undefined) {
                    var biggest_resource = 0;
                    for (let i = 0; i < creep.memory.target_room_containers.length; i++) {
                        var container = Game.getObjectById(creep.memory.target_room_containers[i]);
                        if (container.store.getUsedCapacity() > biggest_resource) {
                            creep.memory.max_container = container.id;
                            biggest_resource = container.store.getUsedCapacity();
                        }
                    }
                }
                else if (Game.getObjectById(creep.memory.max_container) != null) {
                    if (Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() == 0) {
                        creep.memory.max_container = undefined;
                    }
                }
                else {
                    creep.memory.max_container = undefined;
                }


                if (creep.memory.max_container != undefined && Game.getObjectById(creep.memory.max_container) != null) {
                    // take all resources from container
                    for (let resource in Game.getObjectById(creep.memory.max_container).store) {
                        if (creep.withdraw(Game.getObjectById(creep.memory.max_container), resource) == ERR_NOT_IN_RANGE
                    || creep.pos.inRangeTo(spawn,4)) {
                            creep.moveTo(Game.getObjectById(creep.memory.max_container).pos, { reusePath: 21,avoidCreeps: true });
                            break;
                        }
                    }

                    if (Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < (creep.store.getCapacity() - creep.store.getUsedCapacity()) * 0.8 && Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < 2000) {
                        if (creep.store[RESOURCE_ENERGY] == 0) {
                            var avoid = [];
                            if (creep.pos.inRangeTo(spawn, 3)) {
                                avoid.push(spawn)
                            }
                            if (creep.room.storage != undefined && creep.pos.inRangeTo(creep.room.storage, 3)) {
                                avoid.push(creep.room.storage)
                            }
                            if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) != null &&
                                creep.pos.inRangeTo(Game.getObjectById(creep.memory.home_container), 3)) {
                                avoid.push(Game.getObjectById(creep.memory.home_container));
                            }
                            //creep.say(spawn.pos)
                            if (avoid.length == 0) {
                                creep.sleep(((creep.store.getCapacity() - creep.store.getUsedCapacity()) - Game.getObjectById(creep.memory.max_container).store.getUsedCapacity()) / 20);

                            }
                            else{
                               // creep.fleeFrom({spawn})
                            }

                        }
                    }
                }


            }
            else {// no containers - look for dropped resources, if no resource go sleep

                //creep.say("s")
                if (creep.memory.reource_to_collect == undefined && creep.memory.target_room != undefined && Game.rooms[creep.memory.target_room] != undefined) {

                    const dropped_resource = Game.rooms[creep.memory.target_room].find(FIND_DROPPED_RESOURCES, {
                        filter: function (resource){
                            return resource.amount >= creep.store.getCapacity() - creep.store.getUsedCapacity()
                            && resource.pos.isNearTo(spawn.pos.x,spawn.pos.y)==false
                        }
                    });
                    //creep.say("dr: "+dropped_resource.length)
                    if (dropped_resource != undefined && dropped_resource != null && dropped_resource.length > 0) {
                        // var closest_resource = creep.pos.findClosestByPath(dropped_resource);
                        var max_res_amount = 0;
                        var max_res_id = undefined;
                        for (let a of dropped_resource) {
                            //creep.say(a.amount)
                            if (a.amount > max_res_amount) {
                                max_res_amount = a.amount;
                                max_res_id = a.id;
                            }
                        }
                        if (max_res_id != null) {
                            creep.memory.reource_to_collect = max_res_id;
                        }
                        else {
                            //creep.sleep(20);
                        }

                    }
                    if (creep.store[RESOURCE_ENERGY] == 0) {
                        var avoid = [];
                        if (creep.pos.inRangeTo(spawn, 3)) {
                            avoid.push(spawn)
                        }
                        if (creep.room.storage != undefined && creep.pos.inRangeTo(creep.room.storage, 3)) {
                            avoid.push(creep.room.storage)
                        }
                        if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) != null &&
                            creep.pos.inRangeTo(Game.getObjectById(creep.memory.home_container), 3)) {
                            avoid.push(Game.getObjectById(creep.memory.home_container));
                        }

                        //creep.say(spawn.pos)
                        if (avoid.length == 0) {
                            creep.sleep(20);
                        }
                        else{
                            //creep.fleeFrom({spawn})
                        }
                    }

                }


                if (creep.memory.reource_to_collect != undefined) {
                    if (Game.getObjectById(creep.memory.reource_to_collect) != null) {
                        creep.memory.max_container = undefined;
                        if (creep.pickup(Game.getObjectById(creep.memory.reource_to_collect)) == ERR_NOT_IN_RANGE
                    || creep.pos.inRangeTo(spawn,4)) {
                            //creep.say("res")
                            creep.moveTo(Game.getObjectById(creep.memory.reource_to_collect), { reusePath: 21,avoidCreeps: true  });
                            //creep.say("E");
                        }
                    }
                    else {
                        delete creep.memory.reource_to_collect;
                    }
                    return;
                }

            }

            var avoid = [];
            if (creep.pos.inRangeTo(spawn, 3)) {
                avoid.push(spawn)
            }
            if (creep.room.storage != undefined && creep.pos.inRangeTo(creep.room.storage, 3)) {
                avoid.push(creep.room.storage)
            }
            if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) != null &&
                creep.pos.inRangeTo(Game.getObjectById(creep.memory.home_container), 3)) {
                avoid.push(Game.getObjectById(creep.memory.home_container));
            }
            //var a=Game.getObjectById(creep.memory.max_container)!=null
            //if()
            //var if_sleep=(ame.getObjectById(creep.memory.max_container)!=null && Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < (creep.store.getCapacity() - creep.store.getUsedCapacity()) * 0.8 && Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < 2000)
            //creep.say(spawn.pos)
            if (avoid.length > 0 && (Game.getObjectById(creep.memory.max_container)!=null && Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < (creep.store.getCapacity() - creep.store.getUsedCapacity()) * 0.8 && Game.getObjectById(creep.memory.max_container).store.getUsedCapacity() < 2000)==true) {
                //creep.say(if_sleep)
                creep.fleeFrom(avoid, 3);
            }

        }
        else {//creep is full - go home_room_container
            if (spawn.room.storage != undefined /* && creep.memory.target_room!=creep.memory.home_room.name*/) {
                // if home_room have storage
                creep.memory.home_container = spawn.room.storage.id;
            }
            else {
                //if(creep.memory.target_room!=creep.memory.home_room.name)
                //{
                if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) == null
                    || (creep.memory.home_container != undefined &&
                        Game.getObjectById(creep.memory.home_container).store.getCapacity() - Game.getObjectById(creep.memory.home_container).store.getUsedCapacity() == 0)) {
                    creep.memory.home_container = undefined
                }

                //find containers that are fillers containers or controller container
                var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.store != undefined && structure.store.getCapacity() - structure.store.getUsedCapacity() > 0
                            && structure.structureType != STRUCTURE_TERMINAL &&
                            ((structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawn.pos.x + 2 && structure.pos.y == spawn.pos.y - 2)
                                || (structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawn.pos.x - 2 && structure.pos.y == spawn.pos.y - 2)
                                || structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(spawn.room.controller, 4));
                    }
                });
                if (container != null) {
                    creep.memory.home_container = container.id;
                }
                else {
                    //target room do not have containers - store in spawn
                    creep.memory.home_container = spawn.id;
                }
                //}
            }
            if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) != null) {
                if (Game.getObjectById(creep.memory.home_container).structureType == STRUCTURE_STORAGE) {
                    for (let res in creep.store) {
                        var amount =creep.store[RESOURCE_ENERGY]
                        var transfer_result = creep.transfer(Game.getObjectById(creep.memory.home_container), res);
                        if (transfer_result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(Game.getObjectById(creep.memory.home_container), { reusePath: 21, avoidSk: true,avoidCreeps: true });
                            break;
                        }
                        else if (transfer_result == OK) {

                            //addEnergyIncome(creep,spawn,amount)

                            creep.memory.max_container = undefined;
                        }
                    }
                }
                else {
                    for (let res in creep.store) {
                        var amount =creep.store[RESOURCE_ENERGY]
                        var transfer_result = creep.transfer(Game.getObjectById(creep.memory.home_container), res);
                        if (transfer_result == ERR_NOT_IN_RANGE || creep.pos.inRangeTo(spawn,4)) {
                            
                            creep.moveTo(Game.getObjectById(creep.memory.home_container), { reusePath: 21, avoidSk: true,avoidCreeps: true  });
                            
                            break;
                        }
                        else if (transfer_result == ERR_FULL) {
                            creep.drop(res);

                            //addEnergyIncome(creep,spawn,amount)

                            creep.memory.max_container = undefined;
                        }
                        else if (transfer_result == OK) {

                            //addEnergyIncome(creep,spawn,amount)

                            creep.memory.max_container = undefined;
                        }
                        if(creep.pos.inRangeTo(Game.getObjectById(creep.memory.home_container),3)
                        && !creep.pos.isNearTo(Game.getObjectById(creep.memory.home_container)))
                            {
                                creep.say("123")
                                var empty_carriers=creep.pos.findInRange(FIND_MY_CREEPS,1,{filter:
                                    function (cr)
                                    {
                                        return cr.store.getFreeCapacity(RESOURCE_ENERGY)>0
                                    }
                                })
                                if(empty_carriers.length>0)
                                {
                                    
                                    creep.transfer(empty_carriers[0],RESOURCE_ENERGY)
                                }
                            }

                    }
                }


            }
        }


        //////////////////////////////////////////////////////////////////////




    }

};