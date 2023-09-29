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
        {// in target room and no free space - put energy to container or build one if there is no container close

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
                var positions=new RoomPosition(sources[creep.memory.source_id].pos.x,sources[creep.memory.source_id].pos.y,creep.room.name).getOpenPositions2();

                //var positions=RoomPositionFunctions.getOpenPositions();
                //console.log("Positions: ",positions);

                if(positions.length>0)
                {
                    positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
        }
    }
};
module.exports = roleFarmer;