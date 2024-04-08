var RoomPositionFunctions = require('roomPositionFunctions');
const { move_avoid_hostile } = require("./move_avoid_hostile");
//var routeCreep = require('routeCreep');

var roleFarmer = {
    run: function (creep, spawn) {
        //creep.suicide();
        //return;
        //creep.say('@');
        //console.log(creep.name);
        //creep.say(creep.room.controller.reservation.username);
        // var sources = creep.room.find(FIND_SOURCES);
        //var target_room = creep.memory.target_room;
        //console.log(target_room);
        //var x_source=25,y_source=25;
        if (creep.memory.target_room == creep.room.name) {
            
            
            

            var construction_sites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
                filter: function (structure) {
                    return (structure.pos.inRangeTo(creep.pos, 3) && (structure.structureType == STRUCTURE_CONTAINER
                        || structure.structureType == STRUCTURE_ROAD));
                }
            });

            if (((construction_sites != undefined && construction_sites.length > 0) /*||
                (repair_sites != undefined && repair_sites.length > 5)*/) && creep.memory.building == false && creep.store.getFreeCapacity() == 0) {
                creep.memory.building = true;
            }
            else if ((construction_sites != undefined && construction_sites.length == 0) || creep.store[RESOURCE_ENERGY] == 0 || creep.memory.building == undefined) {
                creep.memory.building = false;
            }

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
        else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            // if have some free space and at destination room - go harvest
            
            if (creep.memory.closest_container != undefined) {

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
                creep.moveTo(Game.getObjectById(creep.memory.source_id),{reusePath: 17});
            }
            else {
                creep.moveTo(destination,{reusePath: 17});
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
                    var closest_container = Game.getObjectById(creep.memory.source_id).pos.findInRange(FIND_STRUCTURES, 3, {
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
                    creep.moveTo(Game.getObjectById(creep.memory.closest_container),{reusePath:13});
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

        if (creep.room.name == creep.memory.target_room && creep.memory.target_room != creep.memory.home_room.name 
            && Game.getObjectById(creep.memory.source_id) != null && false) {
            if (Game.time % 1004 == 0 || (Game.time % 57 == 0 && (creep.memory.source_path != undefined && creep.memory.source_path.incomplete == true)
            || creep.memory.source_path==undefined) /*|| creep.memory.source_path==undefined */) {

                var ret = PathFinder.search(Game.getObjectById(creep.memory.source_id).pos, spawn.pos, {
                    //maxCost: 300,
                    range: 2,
                    plainCost: 2,
                    swampCost: 2,
                    maxOps: 8000,

                    roomCallback: function (roomName) {

                        let room = Game.rooms[roomName];
                        // In this example `room` will always exist, but since 
                        // PathFinder supports searches which span multiple rooms 
                        // you should be careful!
                        if (!room) return;
                        let costs = new PathFinder.CostMatrix;

                        if (room.name == creep.room.name) {
                            creep.room.find(FIND_STRUCTURES).forEach(function (struct) {
                                if (struct.structureType === STRUCTURE_ROAD) {
                                    // Favor roads over plain tiles
                                    costs.set(struct.pos.x, struct.pos.y, 1);
                                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                    (struct.structureType !== STRUCTURE_RAMPART ||
                                        !struct.my)) {
                                    // Can't walk through non-walkable buildings
                                    costs.set(struct.pos.x, struct.pos.y, 255);
                                }
                            });

                            // avoid construction sites
                            creep.room.find(FIND_CONSTRUCTION_SITES, {
                                filter: function (construction) {
                                    return construction.structureType != STRUCTURE_ROAD
                                }
                            }).forEach(function (struct) {
                                costs.set(struct.pos.x, struct.pos.y, 255);
                            });

                            // favor roads under construction
                            creep.room.find(FIND_CONSTRUCTION_SITES, {
                                filter: function (construction) {
                                    return construction.structureType == STRUCTURE_ROAD
                                }
                            }).forEach(function (struct) {
                                costs.set(struct.pos.x, struct.pos.y, 1);
                            });
                        }
                        else if (roomName.name == spawn.room.name) {
                            spawn.room.find(FIND_STRUCTURES).forEach(function (struct) {
                                if (struct.structureType === STRUCTURE_ROAD) {
                                    // Favor roads over plain tiles
                                    costs.set(struct.pos.x, struct.pos.y, 1);
                                } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                    (struct.structureType !== STRUCTURE_RAMPART ||
                                        !struct.my)) {
                                    // Can't walk through non-walkable buildings
                                    costs.set(struct.pos.x, struct.pos.y, 255);
                                }
                            });

                            // avoid construction sites
                            spawn.room.find(FIND_CONSTRUCTION_SITES, {
                                filter: function (construction) {
                                    return construction.structureType != STRUCTURE_ROAD
                                }
                            }).forEach(function (struct) {
                                costs.set(struct.pos.x, struct.pos.y, 255);
                            });

                            // favor roads under construction
                            spawn.room.find(FIND_CONSTRUCTION_SITES, {
                                filter: function (construction) {
                                    return construction.structureType == STRUCTURE_ROAD
                                }
                            }).forEach(function (struct) {
                                costs.set(struct.pos.x, struct.pos.y, 1);
                            });


                            costs.set(spawn.pos.x, spawn.pos.y, 255);
                        }

                        ///////////////////////////////////////////
                        /*
                        room=spawn.room.name;
                        
                        
                        */

                        return costs;
                    }
                });

                //if (ret.incomplete != true || true) 
                if (ret != undefined && Game.time % 1004==0 && ret.incomplete!=true) {
                    //creep.say(creep.moveByPath(ret.path));
                    creep.memory.source_path = ret;
                    for (let i = 0; i < ret.path.length; i++) {
                        if(Game.rooms[ret.path[i].roomName]!=undefined)
                        {
                           Game.rooms[ret.path[i].roomName].createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD); 
                        }
                        

                        /*
                        if ((ret.path[i].x != spawn.pos.x || ret.path[i].y != spawn.pos.y) && ret.path[i].roomName == creep.memory.target_room) {
                            //console.log(destination, " ", ret.path[i]);
                            console.log(creep.room.createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD), " ", ret.path[i]);
                        }
                        else if ((ret.path[i].x != spawn.pos.x || ret.path[i].y != spawn.pos.y) && ret.path[i].roomName == spawn.room.name) {
                            //console.log(destination, " ", ret.path[i]);
                            console.log(spawn.room.createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD), " ", ret.path[i]);
                        }
                        */

                    }
                    console.log("FOUND ROUTE for farmer/distanceCarrier");
                    //creep.move(creep.pos.getDirectionTo(creep.memory.my_path[0]));
                    //creep.move(creep.pos.getDirectionTo(ret.path[0]));
                }
                else {
                    console.log("no path to spawn");
                }
            }
        }
    }
};
module.exports = roleFarmer;