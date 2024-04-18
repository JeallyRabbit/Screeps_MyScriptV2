
//var routeCreep = require('routeCreep');
Creep.prototype.roleFarmer = function roleFarmer(creep, spawn) {


    if (creep.memory.target_room == creep.room.name) {



        //Repairing containers 
        /*
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
        */



    }
    /*
    if (creep.room.name == creep.memory.target_room && creep.memory.repairing == true) {
        creep.repair(repair_sites[0]);
    }
    
    else */ if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        // if have some free space and at destination room - go harvest

        if (creep.memory.closest_container != undefined && creep.store.getFreeCapacity(RESOURCE_ENERGY)<creep.memory.harvesting_power) {

            creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY);
        }
        if (creep.memory.source_id == undefined) {
            //console.log("sources: ",sources.length);
            //creep.say("#");
            //console.log(creep.name);
            //creep.move(LEFT);
            var sources = creep.room.find(FIND_SOURCES, {
                filter: function (source) {
                    return source.pos.getOpenPositions().length > 0;
                }
            });
            if (sources.length == 0) {
                creep.say("no src");
                sources = creep.pos.findInRange(FIND_SOURCES, 2);
            }
            //console.log(sources.length);
            var min_hp = 100;
            var sources_hp = [];
            sources_hp[0] = 0;//sources[0];
            for (let i = 0; i < sources.length; i++) { sources_hp[i] = 0; }

            for (let i = 0; i < sources.length; i++) {
                var farmers = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (farmer) {
                        return farmer.pos.isNearTo(sources[i]) && farmer.memory.role == 'farmer' && farmer.name != creep.name;
                    }
                });
                for (let j = 0; j < farmers.length; j++) {
                    sources_hp[i] += _.filter(farmers[j].body, { type: WORK }).length * 2;
                    //console.log('source_hp: ',sources_hp[i]);
                }
                if (sources_hp[i] < min_hp && sources_hp[i] < 10/* + _.filter(creep.body, { type: WORK }).length * 2*/) {
                    creep.memory.source_id = sources[i].id;
                    min_hp = sources_hp[i];
                }
            }
        }
        else if (Game.getObjectById(creep.memory.source_id).pos.getOpenPositions().length < 1 &&
            creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)) == false) {
            // if sources became unavailable ( due to creeps around it) and creep is not near this source 
            creep.memory.source_id = undefined;
            //creep.say("U");
        }
        else {
            if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.source_id), { reusePath: 17 });
                //move_avoid_hostile(creep, Game.getObjectById(creep.memory.source_id).pos, 1, false);
                creep.memory.is_working = false;
            }
            else if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == OK) {
                creep.memory.is_working = true;
            }
        }

    }
    else if (creep.room.name != creep.memory.target_room /*&& creep.store[RESOURCE_ENERGY] == 0*/) {// not in target room and have free space - go to target room
        const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name
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
    else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)//if not in home room and no free space, put energy to most empty container
    {// in target room and no free space - put energy to container or build one if there is no container close

        creep.say(3);
        if (creep.memory.closest_container != undefined && Game.getObjectById(creep.memory.closest_container) == null) {
            creep.say("reset");
            creep.memory.closest_container = undefined;
        }
        if (creep.memory.closest_container == undefined) {
            /*
            var containers = creep.pos.findInRange(FIND_STRUCTURES, 4, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        structure.store[RESOURCE_ENERGY] < 2000;
                }
            });
            */
            if (Game.getObjectById(creep.memory.source_id) != null) {
                var closest_container = Game.getObjectById(creep.memory.source_id).pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER;
                    }
                });
                if (closest_container.length > 0) {
                    closest_container = creep.pos.findClosestByRange(closest_container);
                    creep.memory.closest_container = closest_container.id;
                }
            }


        }



        if (creep.memory.closest_container != undefined) {// store in to container

            creep.say("tra");
            //transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
            if (creep.transfer(Game.getObjectById(creep.memory.closest_container), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.closest_container), { reusePath: 13 });
                //move_avoid_hostile(creep, closestContainer.pos, 1, true);
            }

        }
        else if (construction_sites == undefined || construction_sites.length < 1) {// build container next to source

            creep.say("BU");
            if (Game.getObjectById(creep.memory.source_id) != null) {
                var positions = new RoomPosition(Game.getObjectById(creep.memory.source_id).pos.x, Game.getObjectById(creep.memory.source_id).pos.y, creep.room.name).getOpenPositions2();

                if (positions != undefined && positions.length > 0) {
                    //creep.say('constructing');
                    //console.log('constructing container at: ',positions[0])
                    positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }
        else {
            //creep.say("kupa");
            creep.drop(RESOURCE_ENERGY);
        }
    }


};