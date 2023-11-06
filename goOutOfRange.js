function goOutOfRange(creep, n, avoid_position = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)) {
    //var hostileCreeps = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //var avoid_position = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    var run_aways = creep.pos.getNOpenPositions(n);
    var to_run = [];//positions to which creep can run
    for (let i = 0; i < run_aways.length; i++) {
        //console.log("run away[i]: ",run_aways[i]);
        if (run_aways[i] != undefined && run_aways[i] != null) {
            if (run_aways[i].inRangeTo(avoid_position, n - 1) == false &&
                creep.room.lookForAt(LOOK_CREEPS, run_aways[i].x, run_aways[i].y).length < 1) {
                to_run.push(run_aways[i]);
            }
            else {
                //asd 
            }
        }

    }
    //creep.say(creep.moveTo(avoid_position,));
    var ret = PathFinder.search(creep.pos, to_run, {
        //flee: true,
        range: 0,
        plainCost: 2,
        swampCost: 10,

        roomCallback: function () {

            let room = creep.memory.home_room.name;
            // In this example `room` will always exist, but since 
            // PathFinder supports searches which span multiple rooms 
            // you should be careful!
            if (!room) return;
            let costs = new PathFinder.CostMatrix;

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

            // Avoid creeps in the room
            creep.room.find(FIND_CREEPS).forEach(function (creep) {
                costs.set(creep.pos.x, creep.pos.y, 255);
            });

            return costs;
        }
    });
    if (ret.incomplete != true) {
        //creep.say(creep.moveByPath(ret.path));
        creep.move(creep.pos.getDirectionTo(ret.path[0]));
        //creep.move(creep.pos.getDirectionTo(ret.path[0]));
    }
}
exports.goOutOfRange = goOutOfRange;
