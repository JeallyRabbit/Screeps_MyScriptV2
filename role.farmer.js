
//var routeCreep = require('routeCreep');
Creep.prototype.roleFarmer = function roleFarmer(creep, spawn) {




    /*
    if (creep.memory.target_room == creep.room.name) {



        //Repairing containers 

        if (Game.time % 1 == 0) {
            var repair_sites = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                filter: function (structure) {
                    return structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_CONTAINER;
                }
            });
        }
        else {
            var repair_sites = [];
        }



        if (repair_sites != undefined && repair_sites.length > 0 && creep.memory.building == false && creep.store[RESOURCE_ENERGY] > 0) {
            creep.memory.repairing = true;
        }
        else if (repair_sites.length == 0 || creep.memory.repairing == undefined || creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.repairing = false;
        }
    }

    if (creep.room.name == creep.memory.target_room && creep.memory.repairing == true) {
        creep.repair(repair_sites[0]);
    }
    */
    //creep.suicide();

    //else 
    if (creep.room.name == creep.memory.target_room /* && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0*/) {
        // if have some free space and at destination room - go harvest

        if (creep.memory.closest_container != undefined && Game.getObjectById(creep.memory.closest_container) == null) {
            //creep.say("reset");
            creep.memory.closest_container = undefined;
        }
        if (creep.memory.closest_container == undefined) {


            if (spawn.memory.sources_links_id != undefined && spawn.memory.sources_links_id.length > 0 && creep.memory.target_room==spawn.room.name) {
                var closest_container = [];
                for (let id of spawn.memory.sources_links_id) {
                    if (Game.getObjectById(id) != null) {
                        closest_container.push(Game.getObjectById(id))
                    }
                }
            }
            else {
                if (Game.getObjectById(creep.memory.source_id) != null) {
                    var closest_container = Game.getObjectById(creep.memory.source_id).pos.findInRange(FIND_STRUCTURES,3, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
                }
            }
            if (closest_container!=undefined && closest_container.length > 0) {
                closest_container =  Game.getObjectById(creep.memory.source_id).pos.findClosestByRange(closest_container);
                if (closest_container != null) {
                    creep.memory.closest_container = closest_container.id;
                }

            }
        }


        if (Game.getObjectById(creep.memory.closest_container) != null &&
            Game.getObjectById(creep.memory.closest_container).hits < Game.getObjectById(creep.memory.closest_container).hitsMax) {
            //creep.say("repair")
            creep.repair(Game.getObjectById(creep.memory.closest_container))
        }
        else if (creep.memory.closest_container != undefined && creep.store.getFreeCapacity(RESOURCE_ENERGY) < creep.memory.harvesting_power) {

            if(creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY)==ERR_NOT_IN_RANGE)
            {
                creep.moveTo(Game.getObjectById(creep.memory.closest_container))
            };

        }
        if (Game.getObjectById(creep.memory.source_id)!=null && Game.getObjectById(creep.memory.source_id).energy > 0) {
            if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source_id), { reusePath: 17, range:1 });
                //creep.say(Game.getObjectById(creep.memory.source_id).pos.y)
                //move_avoid_hostile(creep, Game.getObjectById(creep.memory.source_id).pos, 1, false);
                creep.memory.is_working = false;
            }
            else if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == OK) { 
                creep.memory.is_working = true;
            }
        }
        else {
            //  creep.say("Zzz")
        }

    }
    else if (creep.room.name != creep.memory.target_room /*&& creep.store[RESOURCE_ENERGY] == 0*/) {// not in target room and have free space - go to target room
        const destination = new RoomPosition(25, 25, creep.memory.target_room); 
        if (creep.memory.source_id != undefined && Game.getObjectById(creep.memory.source_id) != null) {
            creep.moveTo(Game.getObjectById(creep.memory.source_id), { reusePath: 17 });
        }
        else {
            creep.moveTo(destination, { reusePath: 17 });
            var if_avoid = false;
            if (creep.pos.y >= 48 || creep.pos.x >= 48 || creep.pos.y <= 1 || creep.pos.x <= 1) {
                if_avoid = true;
            }
        }

        //move_avoid_hostile(creep, destination, 1, if_avoid,5000);

    }
    /*
    else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)//if not in home room and no free space, put energy to most empty container
    {// in target room and no free space - put energy to container or build one if there is no container close

        //creep.say(3);
        



        if (creep.memory.closest_container != undefined) {// store in to container

            //creep.say("tra");
            //transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
            if (creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closest_container), { reusePath: 13 });
                //move_avoid_hostile(creep, closestContainer.pos, 1, true);
            }

        }
        else {
            //creep.say("kupa");
            creep.drop(RESOURCE_ENERGY);
        }
    }
    */


};