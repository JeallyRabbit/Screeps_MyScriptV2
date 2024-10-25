const STATE_UNDER_ATTACK = 'STATE_UNDER_ATTACK'

Creep.prototype.roleRampartRepairer = function roleRampartRepairer(creep, spawn) {

    //creep.suicide();
    let storedCostMatrix = PathFinder.CostMatrix.deserialize(Game.rooms[creep.room.name].memory.repairerCostMatrix);

    if (creep.store[RESOURCE_ENERGY] == 0 || creep.memory.target_rampart == undefined /* || spawn.memory.state.includes(STATE_UNDER_ATTACK) */ ) {
        //creep.say("renew ramparts")
        creep.memory.target_rampart = undefined;
        var ramparts = creep.room.find(FIND_MY_STRUCTURES, {
            filter: function (str) {
                return str.structureType == STRUCTURE_RAMPART && str.hits < str.hitsMax;
            }
        });

        if (ramparts.length > 0) {
            var min_rampart_hits = ramparts[0].hits;
            var min_rampart_id = ramparts[0].id;

            for (let i = 1; i < ramparts.length; i++) {
                if (ramparts[i].hits + ((creep.store.getCapacity() / 4) * REPAIR_POWER) <= min_rampart_hits) {
                    min_rampart_hits = ramparts[i].hits;
                    min_rampart_id = ramparts[i].id;
                }
            }
            creep.memory.target_rampart = min_rampart_id;
        }

    }
    if (creep.memory.target_rampart != undefined && creep.store[RESOURCE_ENERGY] > 0) {
        var rampart = Game.getObjectById(creep.memory.target_rampart);
        //creep.say(rampart.pos.x+" "+rampart.pos.y)
        if (rampart == null) {

            creep.memory.target_rampart = undefined;
            return;
        }
        else if(creep.repair(rampart)==OK)
        {
            if(creep.room.memory.energy_on_ramparts==undefined)
            {
                creep.room.memory.energy_on_ramparts=_.filter(creep.body, { type: WORK }).length;
            }
            else{
                creep.room.memory.energy_on_ramparts+=_.filter(creep.body, { type: WORK }).length;
            }
        }
        if (creep.repair(rampart) == ERR_NOT_IN_RANGE) {
            creep.say("GO")
            /*
            if (false && spawn.memory.state.includes("STATE_UNDER_ATTACK") && creep.pos.inRangeTo(rampart.pos, 7)) {
                creep.say("1")
                var path = creep.pos.findPathTo(rampart.pos, {
                    range: 3, maxRooms: 1, ignoreCreeps: false,
                    costCallback: function (roomName, costMatrix) {
                        //console.log("PATHING")
                        //creep.say(storedCostMatrix.get(creep.pos.x, creep.pos.y))
                        return storedCostMatrix
                    }
                })
                creep.moveByPath(path)
            }
            else {
            */
            creep.say("2")
            if (spawn.memory.state.includes("STATE_UNDER_ATTACK")) {
                creep.say("3")
                var hostiles = [];
                for (a of spawn.room.memory.hostiles) {
                    hostiles.push(Game.getObjectById(a))
                }
                var closest_hostile = creep.pos.findClosestByRange(hostiles)
                let storedCostMatrix = PathFinder.CostMatrix.deserialize(Game.rooms[creep.room.name].memory.meleeCostMatrix);
                if (closest_hostile != null) {
                    creep.say("4")

                    if (creep.pos.inRangeTo(closest_hostile, 6)) {
                        creep.say("5")
                        if (creep.repair(rampart) == ERR_NOT_IN_RANGE) {
                            var path = creep.pos.findPathTo(rampart.pos, {
                                range: 3, maxRooms: 1, avoidCreeps: true, ignoreCreeps: false,
                                costCallback: function (roomName, costMatrix) {
                                    console.log("ramapart repairer in ", spawn.room.name, " is avoiding hostiles")

                                    return storedCostMatrix
                                }
                            })
                            //console.log("path: ",path)
                            creep.say(creep.moveByPath(path))
                            //creep.say("dang rampar")
                        }
                    }
                    else {
                        creep.say("safe ra")
                        creep.moveTo(rampart.pos, { range: 3, avoidCreeps: true })
                    }
                }
            }
            else {
                creep.say("ra")
                creep.moveTo(rampart, { reusePath: 11, maxRooms: 1 })
            }




            // }

        }
        //creep.say('🛠');
    }

    if (creep.store[RESOURCE_ENERGY] == 0) {
        if (spawn.room.storage != undefined) {
            if (creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn.room.storage)

            }
        }
    }
}
