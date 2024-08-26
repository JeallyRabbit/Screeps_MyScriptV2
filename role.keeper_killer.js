const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");
const { boosting_driver } = require('boosting_driver');

Creep.prototype.roleKeeperKiller = function roleKeeperKiller(creep, spawn) {
    //creep.say("!");
    //creep.move(BOTTOM_LEFT);
    //return;

    //creep.say(HEAL_POWER)

    if (creep.room.name == creep.memory.target_room) {

        if (Game.rooms[creep.memory.target_room] != undefined && Game.rooms[creep.memory.target_room].memory.lairs == undefined) {
            var lairs = Game.rooms[creep.memory.target_room].find(FIND_STRUCTURES, {
                filter:
                    function (str) {
                        return str.structureType == STRUCTURE_KEEPER_LAIR
                    }
            })
            if (lairs.length > 0) {
                creep.memory.lairs = [];
                Game.rooms[creep.memory.target_room].memory.lairs=[];
                for (a of lairs) {
                    Game.rooms[creep.memory.target_room].memory.lairs.push(a.id)
                }
            }
        }

        // there are keepers to attack
        var keepers = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter:
                function (enemy) {
                    return enemy.owner.username == 'Source Keeper';
                }
        })
        if (keepers.length > 0) {

            Game.rooms[creep.room.name].memory.keepers=[]
            for(a of keepers)
            {
                Game.rooms[creep.room.name].memory.keepers.push(a.id)
            }
            var closest_enemy = creep.pos.findClosestByRange(keepers)
            if (closest_enemy != null) {
                if (creep.attack(closest_enemy) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closest_enemy, { reusePath: 11, maxRooms: 1 })
                }
            }
            if(creep.pos.inRangeTo(closest_enemy,4))
            {
                creep.heal(creep)
            }
        }
        else {
            // no keepers to attack - move to lair with minimum ticksToSpawn
            var min_keeper_lair = undefined;
            var min_time = Infinity;
            for (lair_id of Game.rooms[creep.memory.target_room].memory.lairs) {
                var lair = Game.getObjectById(lair_id)
                if (lair != null) {
                    if (lair.ticksToSpawn < min_time) {
                        min_time = lair.ticksToSpawn;
                        min_keeper_lair = lair_id
                    }
                }
                else {
                    Game.rooms[creep.memory.target_room].memory.lairs = undefined; break;
                }
            }
            if (min_keeper_lair != undefined) {
                creep.moveTo(Game.getObjectById(min_keeper_lair), { reusePath: 11, maxRooms: 1 })
            }
        }


    }
    else {
        creep.moveToRoom(creep.memory.target_room);
    }

    if (creep.hits < creep.hitsMax) {
        creep.heal(creep);
    }



};
