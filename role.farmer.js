var RoomPositionFunctions = require('roomPositionFunctions');
var routeCreep = require('routeCreep');
const roleRepairer = require('./role.repairer');

var roleFarmer = {
    run: function (creep, spawn) {

        //creep.say(creep.memory.home_room.name==creep.room.name);
        var target_room = creep.memory.target_room;
        //var x_source=25,y_source=25;
        var repair_sites=creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits<object.hitsMax && object.hits<30000 && object.hits!=object.hitsMax
            && object.structureType!=STRUCTURE_ROAD
        });

        var construction_sites=creep.room.find(FIND_CONSTRUCTION_SITES);
        if(creep.room.name==target_room && creep.store[RESOURCE_ENERGY]!=0 && (repair_sites.length>0 || construction_sites.length>0))
        {
            //creep.say("REP");
            roleRepairer.run(creep);
        }
        else if (creep.room.name == target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) 
        {// if have some free space and at destination room - go harvest
            //creep.say("!");
            var sources = creep.room.find(FIND_SOURCES);
            //creep.say(sources.length);
            if (creep.memory.source_id == undefined) {
                for (let i = 0; i < sources.length; i++) {
                    if (sources[i].energy > 0 && sources[i].pos.getOpenPositions().length > 0) {
                        //creep.say(i+100);
                        creep.memory.source_id = i;
                        //console.log("harvest: ",creep.harvest(sources[i]));

                    }
                }
            }
            else if (sources[creep.memory.source_id].pos.getOpenPositions().length < 1 && !creep.pos.isNearTo(sources[creep.memory.source_id])) {// if sources became unavailable ( due to creeps around it) and creep is not near this source 
                creep.memory.source_id = undefined;
                //creep.say("U");
            }
            else {
                //creep.say("H");
                if (creep.harvest(sources[creep.memory.source_id]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[creep.memory.source_id], { noPathFinding: false, reusePath: 9 });
                }
            }

        }
        else if (creep.room.name != target_room && creep.store[RESOURCE_ENERGY] == 0) 
        {// not in target room and have free space - go to target room
            const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name


            if (!creep.memory.path) {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
                //creep.say("Calc");
            }

            if (creep.memory.path) {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) {
                        // Successfully moved along the path
                    } else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                } else {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            } else {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }

            //routeCreep(creep,destination);
            //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {noPathFinding: true, reusePath: 5 });
        }
        else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity() == 0 /*&& creep.room.name==home_room*/)//if not in home room and no free space, put energy to most empty container
        {// in target room and no free space - go back

            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });
            if(containers.length>0)
            {// store in to container
                var closestContainer = creep.pos.findClosestByRange(containers);
                    var transfer_amount = 1;
                    transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                    if (creep.transfer(closestContainer, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestContainer);
                    }

            }
            else if(construction_sites<1)
            {// build container next to source
                var positions=new RoomPosition(creep.pos.x,creep.pos.y,creep.room.name).getOpenPositions();

                //var positions=RoomPositionFunctions.getOpenPositions();
                //console.log("Positions: ",positions);

                if(positions.length>0)
                {
                    positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
            /*
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name


            if (!creep.memory.path) {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
                //creep.say("Calc");
            }

            if (creep.memory.path) {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) {
                        // Successfully moved along the path
                    } else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                } else {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            } else {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }
            */
        }
        else {//in home room and full 
            /*
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => {
                    return i.structureType == STRUCTURE_CONTAINER
                        && i.store[RESOURCE_ENERGY] < 2000
                }
            });

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));

            var extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_EXTENSION
                        && structure.store[RESOURCE_ENERGY] < 50
                }
            });
            var extensions_full = 1;//1 when all are full
            if (extensions.length > 0) {
                extensions_full = 0;
            }

            if (containers.length > 0)// if is full and there are containers, go to container with minimum energy
            {
                var withdraw_amount = 1;
                withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[0].store[RESOURCE_ENERGY]);
                var closest_container = creep.pos.findClosestByRange(containers);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and store
                    creep.moveTo(closest_container, { noPathFinding: false, reusePath: 8 });
                }

            }
            else if (spawn.store.getFreeCapacity([RESOURCE_ENERGY]) > 0) { //containers full and spawn is not full
                if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(spawn, { noPathFinding: false, reusePath: 8 });
                }
            }
            else // go to extension
            {
                var closestExtension = creep.pos.findClosestByRange(extensions);
                if (closestExtension != null) {
                    var transfered_amount = 1;
                    transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], closestExtension.store[RESOURCE_ENERGY].getFreeCapacity);
                    if (creep.transfer(closestExtension, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                        creep.moveTo(closestExtension, { noPathFinding: false, reusePath: 8 });
                    }
                }
                else {// if no place to store energy became builder (if no construction sites, builders became upgraders)
                    //creep.say("bu");
                   // roleBuilder.run(creep);
                }
            }
            */
        }
    }
};
module.exports = roleFarmer;