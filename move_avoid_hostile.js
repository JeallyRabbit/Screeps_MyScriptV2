const { goOutOfRange } = require("./goOutOfRange");

function move_avoid_hostile(creep,destination,range=0) {

    //const destination = new RoomPosition(25, 25, creep.memory.home_room.name); // Replace with your destination coordinates and room name
    
    if(creep.pos.getRangeTo(destination)<=range)
    {

        return 0;
    }
    //creep.say("mov");
    //console.log(creep.name);
    //console.log(creep.store.getFreeCapacity());
    var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
    var to_avoid = [];
    for (let i = 0; i < keepers.length; i++) {
        to_avoid = to_avoid.concat(keepers[i].pos.getN_NearbyPositions(3));
    }
    if (!creep.memory.path) {
        // Calculate and cache the path if it doesn't exist in memory
        //PathFinder.use(true);
        const path = creep.pos.findPathTo(destination, {
            ignoreCreeps: false,
            plainCost: 2,
            swampCost:4,
            costCallback: function (roomName,costMatrix) {
                if (roomName == creep.room.name) {
                    //let costs = new PathFinder.CostMatrix;
                    for (let i = 0; i < to_avoid.length; i++) {
                        costMatrix.set(to_avoid[i].x, to_avoid[i].y, 255);
                    }
                }
                return costMatrix;
            }
        });
        creep.memory.path = JSON.stringify(path);
        //creep.move(BOTTOM);
        //creep.say("Calc");
    }

    if (creep.memory.path) {
        //creep.say("USE");
        if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3) != undefined
            && creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) {
            goOutOfRange(creep, 3);
            creep.say("NOT SAFE");
            delete creep.memory.path;
        }
        else {
            const path = JSON.parse(creep.memory.path);
            if (path.length > 0) {
                const moveResult = creep.moveByPath(path);
                if (moveResult === OK) {
                    //console.log(creep.name," moveResult: ", moveResult);
                    // Successfully moved along the path
                }
                else if (moveResult === ERR_NOT_FOUND) 
                {
                    creep.say("del1");
                    // Path is no longer valid, clear the cached path
                    delete creep.memory.path;
                }
            }
            else {
                // The path is empty, meaning the creep has reached its destination
                // Clear the cached path
                creep.say("del2");
                delete creep.memory.path;
            }
        }

    }
    else {
        // If the cached path doesn't exist, recalculate it and store it
        const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
        creep.memory.path = JSON.stringify(path);
    }
    return { keepers, to_avoid };
}
exports.move_avoid_hostile = move_avoid_hostile;
