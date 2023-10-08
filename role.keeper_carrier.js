const keeper_carrier = {
    /** @param {Creep} creep **/
    run: function (creep) {
        creep.say("&&");
        var pos = creep.pos;
        if(creep.store[RESOURCE_ENERGY]==0 && creep.room.name==creep.memory.target_room
            && creep.store[RESOURCE_ENERGY]>0)
        {
            
            //console.log(" 1");
            
            if (pos.x > 48) {
            creep.move(LEFT);
            }
            else if (pos.x < 2) {
                creep.move(RIGHT);
            }
            if (pos.y > 48) {
                creep.move(TOP);
            }
            else if (pos.y < 2) {
                creep.move(BOTTOM);
            }
            
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
            //console.log("  3xczxc");
           // const exitDir = Game.map.findExit(creep.room, creep.memory.target_room);
            const destination = new RoomPosition(25, 25, creep.memory.target_room);
            creep.moveTo(destination);
        }
        else if (creep.room.name == creep.memory.target_room
             && creep.store.getFreeCapacity() > 0) {
            var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
            })

            closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy);
            if(closestDroppedEnergy)
            {
               var keepers = closestDroppedEnergy.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
                if (keepers == undefined || keepers.length < 1) {
                    // if closest dropped energy is safe
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy);
                }

            } 
            }
            
            else {// find another safe energy
                //console.log(4.5);
                
                for (let i = 0; i < droppedEnergy.length; i++) {
                    closestDroppedEnergy = droppedEnergy[i];
                    var keepers = closestDroppedEnergy.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
                    if (keepers == undefined || keepers.length < 1) {
                        break;
                    }
                }
                if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy);
                }
                
            }


        }
        else if (creep.room.name != creep.memory.home_room.name
            && creep.store.getFreeCapacity()==0) {// not in home_room and no free space - go home_room
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
                //console.log(3);
                //console.log(creep.name);
                //console.log(creep.store.getFreeCapacity());
            if (!creep.memory.path) {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
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
                        && structure.pos.x != 36 && structure.pos.y != 25
                }
            }));
            //console.log("5");
            if (containers.length > 0) {
                //console.log(6.1);
                var closest_container = creep.pos.findClosestByRange(containers);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {// if creep have energy go to container and store
                    creep.moveTo(closest_container, {reusePath: 10 });
                }
            }
        }
        else{
            //console.log(creep.memory.home_room.name)
            //creep.move(BOTTOM);
        }
    }
};

module.exports = keeper_carrier;