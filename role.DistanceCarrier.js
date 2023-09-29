//var RoomPositionFunctions = require('roomPositionFunctions');

var roleDistanceCarrier = {

    /** @param {Creep} creep **/
    run: function (creep) {
        //creep.say(creep.memory.home_room);

        if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) 
        {// in target room and have free space - collect dropped energy or energy from containers
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                        && structure.store[RESOURCE_ENERGY] > 0;
                    /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                }
            });

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE
                        && structure.store[RESOURCE_ENERGY] > 0;
                }
            }));
            if(containers.length==0){
                if(creep.pos.y==49){creep.move(TOP);}
                else if(creep.pos.y==0){creep.move(BOTTOM);}
                else if(creep.pos.x==49){creep.move(LEFT);}
                else if(creep.pos.x==0){creep.move(RIGHT);}
                //else (return 0;)
                //creep.moveTo(25,25,creep.memory.target_room)
                
            }
            else
            {
                var cID_max = -1;
            var biggest_energy = 0;
            for (let i = 0; i < containers.length; i++) 
            {
                if (containers[i].store[RESOURCE_ENERGY] > biggest_energy) 
                {
                    cID_max = i;
                    biggest_energy = containers[i].store[RESOURCE_ENERGY];
                }
            }

            var withdraw_amount = 1;
            if (cID_max >= 0) {
                withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[cID_max].store[RESOURCE_ENERGY]);
                if (creep.withdraw(containers[cID_max], RESOURCE_ENERGY, withdraw_amount) == ERR_NOT_IN_RANGE) 
                {// if creep have free space go colelct energy from containers
                    creep.moveTo(containers[cID_max]);
                }
            }
            }
            

        }
        else if (creep.room.name != creep.memory.home_room.name && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) 
        {// not in home_room and no free space - go home_room
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name


            if (!creep.memory.path) 
            {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
                //creep.say("Calc");
            }

            if (creep.memory.path) 
            {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) 
                {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) 
                    {
                        // Successfully moved along the path
                    } 
                    else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                } 
                else 
                {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            } 
            else 
            {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }
        }
        else if (creep.room.name == creep.memory.home_room.name && creep.store[RESOURCE_ENERGY] > 0) 
        {// in home room and have energy - store it in container or storage
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER &&
                    structure.store[RESOURCE_ENERGY]<2000;
                    /*&& structure.store[RESOURCE_ENERGY]>creep.store.getCapacity(RESOURCE_ENERGY)/2;*/
                }
            });

            containers = containers.concat(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));
            if(containers.length>0)
            {
                var closest_container = creep.pos.findClosestByRange(containers);
                var transfer_amount = 1;
                transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closest_container.store[RESOURCE_ENERGY]);
                if (creep.transfer(closest_container, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) 
                {// if creep have energy go to container and store
                        creep.moveTo(closest_container, { noPathFinding: false, reusePath: 10 });
                }
            }
            
        }
        else if (creep.room.name != creep.memory.target_room && creep.store[RESOURCE_ENERGY] == 0) 
        {// not in target room and no energy - go target room
            
            //if(creep.memory.target_room==undefined){creep.suicide();}
            const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name


            if (!creep.memory.path) 
            {
                // Calculate and cache the path if it doesn't exist in memory
                //console.log("DistanceCarrier calculating path");
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
                //creep.say("Calc");
            }

            if (creep.memory.path) 
            {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) 
                {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) 
                    {
                        // Successfully moved along the path
                    } 
                    else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                } 
                else 
                {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            } 
            else 
            {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }
        }
    }
};
module.exports = roleDistanceCarrier;