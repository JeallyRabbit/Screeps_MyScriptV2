const { toArray } = require("lodash");
var RoomPositionFunctions=require('roomPositionFunctions');

const keeper_carrier = {
    /** @param {Creep} creep **/
    run: function (creep,spawn) {
        creep.say("&&");
        var position = creep.pos;
        if(creep.store[RESOURCE_ENERGY]==0 && creep.room.name==creep.memory.target_room
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
        var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
        var to_avoid=[];
        for(let i=0;i<keepers.length;i++)
        {
            to_avoid=to_avoid.concat(keepers[i].pos.getNearbyPositions2());
        }

        //creep.say("!");
        // Check if the creep has a target room
        if (!creep.memory.target_room) {
            //console.log(" 2");
            //return 0;
        }
        // Check if the creep is in the target room
        if (creep.room.name !== creep.memory.target_room
            && creep.store[RESOURCE_ENERGY]==0) {
            // If not, move to the target room
            const destination = new RoomPosition(25, 25, creep.memory.target_room);
            creep.moveTo(destination);
        }
        else if (creep.room.name == creep.memory.target_room
             && creep.store.getFreeCapacity() > 0.1*creep.store.getCapacity()) 
             {
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
            })
            creep.say('collecting');
            closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
            //creep.say(closestDroppedEnergy.pos.x+" "+closestDroppedEnergy.pos.y);
            if(closestDroppedEnergy && (droppedEnergy!=undefined || droppedEnergy.length>=1))
            {
                console.log("dropped energy pos: ",closestDroppedEnergy.pos);
               var keepers = closestDroppedEnergy.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
               
                if (keepers == undefined || keepers.length < 1) {
                    // if closest dropped energy is safe
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy,
                        {//avoid: to_avoid
                            costCallback: function(roomName,costMatrix)
                            {
                                if(roomName==creep.room.name)
                                {
                                    for(let i=0;i<to_avoid.length;i++)
                                    {
                                        costMatrix.set(to_avoid.x,to_avoid.y,255);
                                    }
                                }
                            }

                        });
                    }
                } 
                else if(droppedEnergy!=undefined && droppedEnergy.length>=1)
                {// find another safe energy
                    console.log(4.51);
                    //console.log(droppedEnergy[0].pos);
                    //var to_avoid=keepers[0].pos.getNearbyPositions2();
                //console.log("to_avoid: ",to_avoid);
                    for (let i = 0; i < droppedEnergy.length; i++) {
                        closestDroppedEnergy = droppedEnergy[i];
                        var keepers = closestDroppedEnergy.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
                        if (keepers != undefined || keepers.length < 1) {
                            creep.say("waiting");
                            return;
                        }
                    }
                    console.log("dropped energy2 pos: ",closestDroppedEnergy.pos);
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                        // Move to it
                        //console.log("MOVING");
                        creep.moveTo(closestDroppedEnergy,
                            {//avoid: to_avoid
                                costCallback: function(roomName,costMatrix)
                                {
                                    if(roomName==creep.room.name)
                                    {
                                        for(let i=0;i<to_avoid.length;i++)
                                        {
                                            costMatrix.set(to_avoid.x,to_avoid.y,255);
                                        }
                                    }
                                }

                            });
                    }
                }
            }
            
            else
            {// go to tombstones
                creep.say("TOMBSTONES");
                var tombstones=creep.room.find(FIND_TOMBSTONES);
                var min_decay=tombstones[0].ticksToDecay;
                var nearest_tombstone=tombstones[0];
                for(let i=1;i<tombstones.length;i++)
                {
                    if(tombstones[i].ticksToDecay<min_decay)
                    {
                        nearest_tombstone=tombstones[i];
                        min_decay=tombstones[i].ticksToDecay;
                    }
                    //console.log(nearest_tombstone.pos);
                }

                var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
                var to_avoid=[];
                for(let i=0;i<keepers.length;i++)
                {
                    to_avoid=to_avoid.concat(keepers[i].pos.getNearbyPositions2());
                }
                console.log(to_avoid);
                creep.moveTo(nearest_tombstone,
                    {//avoid: to_avoid
                        costCallback: function(roomName,costMatrix)
                        {
                            if(roomName==creep.room.name)
                            {
                                for(let i=0;i<to_avoid.length;i++)
                                {
                                    costMatrix.set(to_avoid.x,to_avoid.y,255);
                                }
                            }
                        }

                    });

            }
            



        }
        else if (creep.room.name != creep.memory.home_room.name
            && creep.store[RESOURCE_ENERGY]>=creep.store.getCapacity()*0.9) {// not in home_room and no free space - go home_room
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
                creep.say("go home");
                //console.log(creep.name);
                //console.log(creep.store.getFreeCapacity());
            if (!creep.memory.path) {
                // Calculate and cache the path if it doesn't exist in memory
                var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
                var to_avoid=[];
                for(let i=0;i<keepers.length;i++)
                {
                    to_avoid=to_avoid.concat(keepers[i].pos.getNearbyPositions2());
                }
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false ,avoid: to_avoid});
                creep.memory.path = JSON.stringify(path);
                //creep.move(BOTTOM);
                //creep.say("Calc");
            }

            if (creep.memory.path) {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) {
                        // Successfully moved along the path
                    }
                    else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                }
                else {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            }
            else {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }
        }
        else if (creep.room.name == creep.memory.home_room.name ) {
            // in home room and have energy - store it in container or storage
            //console.log(creep.pos);
            //creep.say(4);
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
                        && structure.pos.x != spawn.pos.x+3 && structure.pos.y != spawn.pos.y-3
                        && structure.store.getFreeCapacity(RESOURCE_ENERGY)>0;
                }
            }));
            
            if (containers.length > 0) {
                //console.log(6.1);
                var closest_container = creep.pos.findClosestByRange(containers);
                //console.log(closest_container.pos);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                    creep.say(creep.moveTo(closest_container));
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
        else{
            //console.log(creep.memory.home_room.name)
            //creep.move(BOTTOM);
        }
    }
};

module.exports = keeper_carrier;