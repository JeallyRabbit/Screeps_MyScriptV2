var RoomPositionFunctions = require('roomPositionFunctions');
const { move_avoid_hostile } = require("./move_avoid_hostile");
//var routeCreep = require('routeCreep');

var roleFarmer = {
    run: function (creep, spawn) {
        //creep.suicide();
        //return;
        creep.say('@');
        //console.log(creep.name);
        //creep.say(creep.room.controller.reservation.username);
       // var sources = creep.room.find(FIND_SOURCES);
        var target_room = creep.memory.target_room;
        //console.log(target_room);
        //var x_source=25,y_source=25;
        if (creep.memory.target_room == creep.room.name) {
            
            //console.log("full");
            /*
            if( creep.memory.target_room==creep.memory.home_room.name && spawn.room.controller.level <=2 && creep.store.getFreeCapacity()==0 )
            {
                console.log('droping');
                creep.drop(RESOURCE_ENERGY);
                //return;
            }
            */

            var construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: function (structure) {
                    return (structure.pos.inRangeTo(creep.pos, 3) && structure.structureType == STRUCTURE_CONTAINER)
                        || structure.structureType == STRUCTURE_ROAD;
                }
            });

            /*
            for (let i = 0; i < construction_sites.length; i++) {
                construction_sites[i].remove();
            }
            */




            if (((construction_sites != undefined && construction_sites.length > 0) /*||
                (repair_sites != undefined && repair_sites.length > 5)*/) && creep.memory.building == false && creep.store.getFreeCapacity() == 0) {
                creep.memory.building = true;
            }
            else if ((construction_sites != undefined && construction_sites.length == 0) || creep.store[RESOURCE_ENERGY] == 0 || creep.memory.building == undefined) {
                creep.memory.building = false;
            }

        }


        if (creep.room.name == creep.memory.target_room && creep.memory.building == true /*&& (repair_sites.length > 0 || construction_sites.length > 0)*/)
         {
            //creep.say("REP");
            //console.log('REP');
            //roleRepairer.run(creep);
            //var closest_repair = creep.pos.findClosestByRange(repair_sites);
            /*
            if (repair_sites.length) {//repair close sites
                if (creep.repair(closest_repair) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(closest_repair);
                    creep.memory.is_working = false;
                    move_avoid_hostile(creep, closest_repair.pos, 1, false);
                }
                else if (creep.repair(closest_repair) == OK) { creep.memory.is_working = true; }
            }
            else {//build close sites*/
                if (creep.memory.building == true) {
                    creep.say('Building');
                    var closest_construction = creep.pos.findClosestByRange(construction_sites);
                    if (creep.build(closest_construction) == ERR_NOT_IN_RANGE) {
                        // /creep.moveTo(closest_construction);
                        creep.memory.is_working = false;
                        move_avoid_hostile(creep, closest_construction.pos, 1, false);
                    }
                    else if (creep.build(closest_construction) == OK) {
                        creep.memory.is_working = true;
                    }
                }

          //  }

        }
        else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {// if have some free space and at destination room - go harvest
            //console.log(creep.name);
            creep.say("!");
            var position = creep.pos;
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

            //var sources = creep.room.find(FIND_SOURCES);

            var min_source_farmers = 10;
            if (creep.memory.source_id == undefined /*|| (creep.ticksToLive % 2 == 0)*/
                /*&& creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)) == false */) {
                //console.log("sources: ",sources.length);
                creep.say("#");
                //console.log(creep.name);
                
                var sources = creep.room.find(FIND_SOURCES, {
                    filter: function (source) {
                        return source.pos.getOpenPositions().length > 0;
                    }
                });
                //console.log(sources.length);
                var min_hp = 100;
                var sources_hp = [];
                sources_hp[0] = 0;//sources[0];
                for (let i = 0; i < sources.length; i++) { sources_hp[i] = 0; }

                for (let i = 0; i < sources.length; i++) {
                    var farmers = creep.room.find(FIND_MY_CREEPS, {
                        filter: function (farmer) {
                            return farmer.pos.isNearTo(sources[i]) && farmer.memory.role == 'farmer';
                        }
                    });
                    for (let j = 0; j < farmers.length; j++) {
                        sources_hp[i] += _.filter(farmers[j].body, { type: WORK }).length * 2;
                        //console.log('source_hp: ',sources_hp[i]);
                    }
                    if (sources_hp[i] < min_hp /* + _.filter(creep.body, { type: WORK }).length * 2*/) {
                        creep.memory.source_id = sources[i].id;
                        min_hp = sources_hp[i];
                    }
                }
            }
            else if (Game.getObjectById(creep.memory.source_id).pos.getOpenPositions().length < 1 &&
                creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)) == false) {// if sources became unavailable ( due to creeps around it) and creep is not near this source 
                creep.say(creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)));
                //console.log('Farmer .isnearto: ', creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)));
                creep.memory.source_id = undefined;
                //creep.say("U");
            }
            else {
                //creep.say(creep.harvest(sources[creep.memory.source_id]));
                //console.log(creep.name, ' harvesting');
                if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.source_id), { noPathFinding: false, reusePath: 9 });
                    move_avoid_hostile(creep, Game.getObjectById(creep.memory.source_id).pos, 1, false);
                    creep.memory.is_working = false;
                }
                else if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == OK) {
                    creep.memory.is_working = true;
                }
            }

        }
        else if (creep.room.name != creep.memory.target_room && creep.store[RESOURCE_ENERGY] == 0) {// not in target room and have free space - go to target room
            const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name

            move_avoid_hostile(creep, destination);

        }
        else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity() == 0 /*&& creep.room.name==home_room*/)//if not in home room and no free space, put energy to most empty container
        {// in target room and no free space - put energy to container or build one if there is no container close

            
            var containers = creep.pos.findInRange(FIND_STRUCTURES,4, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        && /*structure.pos.inRangeTo(creep.pos,3)*/
                        structure.store[RESOURCE_ENERGY] < 2000;
                }
            });


            if (containers.length > 0) {// store in to container
                var closestContainer = creep.pos.findClosestByRange(containers);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                if (creep.transfer(closestContainer, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {
                    //creep.moveTo(closestContainer);
                    move_avoid_hostile(creep, closestContainer.pos, 1, true);
                }

            }
            else if (construction_sites == undefined || construction_sites.length < 1) {// build container next to source

                creep.say("BU");
                var positions = new RoomPosition(Game.getObjectById(creep.memory.source_id).pos.x, Game.getObjectById(creep.memory.source_id).pos.y, creep.room.name).getOpenPositions2();

                if (positions != undefined && positions.length > 0) {
                    positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                }

            }


        }

        if (creep.room.name == creep.memory.target_room && Game.getObjectById(creep.memory.source_id) != null) {
            if (Game.time % 1000==1 && (creep.memory.source_path!=undefined && creep.memory.source_path.incomplete==true) /*|| creep.memory.source_path==undefined */) {

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
                if(ret!=undefined && Game.time%250==0){
                    //creep.say(creep.moveByPath(ret.path));
                    creep.memory.source_path = ret;
                    for (let i = 0; i < ret.path.length; i++) {
                        if ((ret.path[i].x != spawn.pos.x || ret.path[i].y != spawn.pos.y) && ret.path[i].roomName == creep.memory.target_room) {
                            //console.log(destination, " ", ret.path[i]);
                            console.log(creep.room.createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD), " ", ret.path[i]);
                        }
                        else if ((ret.path[i].x != spawn.pos.x || ret.path[i].y != spawn.pos.y) && ret.path[i].roomName == spawn.room.name) {
                            //console.log(destination, " ", ret.path[i]);
                            console.log(spawn.room.createConstructionSite(ret.path[i].x, ret.path[i].y, STRUCTURE_ROAD), " ", ret.path[i]);
                        }

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