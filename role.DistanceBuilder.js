var roleBuilder = require('role.builder');
var RoomPositionFunctions=require('roomPositionFunctions');
var routeCreep=require('routeCreep');

var roleFarmer = {
    run: function(creep) {
        
        //creep.say(creep.memory.home_room.name==creep.room.name);
        var home_room=creep.memory.home_room.name;
        var target_room=creep.memory.target_room;
        //console.log("target_room :",target_room);
        //var x_source=25,y_source=25;
        if(creep.room.name!=home_room && creep.store[RESOURCE_ENERGY]==0)
        {// if no energy and not at home - go back
            const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
            //creep.say("1");
            //creep.say(home_room);
            if (!creep.memory.path) 
            {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: true });
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
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: true });
                creep.memory.path = JSON.stringify(path);
            }
        }
        else if(creep.store[RESOURCE_ENERGY]>0 && creep.room.name==target_room)
        {// if have energy and at destination - go build
           // creep.say("2");
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        else if(creep.store[RESOURCE_ENERGY]>0 && creep.room.name!=target_room)
        {// if have energy and not at destination - go target_room
            //creep.say("3");
            //console.log("target_room: ",target_room);
            const destination = new RoomPosition(25, 25, target_room); // Replace with your destination coordinates and room name
            
            if (!creep.memory.path) 
            {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: true });
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
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: true });
                creep.memory.path = JSON.stringify(path);
            }
        }
        else if(creep.store[RESOURCE_ENERGY]==0 && creep.room.name==home_room)
        {// if no energy and at home
            //creep.say("4");
            var deposits = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                    && structure.store[RESOURCE_ENERGY]>50;
                }
            });
            deposits=deposits.concat(creep.room.find(FIND_STRUCTURES,{
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_STORAGE;
                }
            }));
            if(!creep.memory.building && creep.pos.findClosestByRange(deposits)!=null)// not building and there are deposits
            {
                //var deposit=getMaxEnergyDeposit(creep);
                var deposit=creep.pos.findClosestByRange(deposits);
                var withdraw_amount=0;
                withdraw_amount=Math.min(creep.store.getFreeCapacity(), deposit.store[RESOURCE_ENERGY]);
                if(withdraw_amount>0)
                {
                    if(creep.withdraw(deposit,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(deposit);
                    }
                }
            }
    	    else 
            {// else collect dropped energy
	            const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
                })
                const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                if(droppedEnergy.length>0)
                {
                    if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) 
                    {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy, { visualizePathStyle: { stroke: '#ffaa00' } });
                    }
                }
	        }
        }

	}
};
module.exports = roleFarmer;