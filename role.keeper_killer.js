const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");
const { boosting_driver } = require('boosting_driver');

const keeper_killerRole = {
    /** @param {Creep} creep **/
    run: function (creep,spawn) {
        //creep.say("!");
        //creep.move(BOTTOM_LEFT);
        //return;

        //creep.memory.healers=undefined;

        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["KO", "KHO2", "XKHO2"];//boost types that creep accepts
        }

        if (boosting_driver(creep, spawn, creep.memory.boosting_list,RANGED_ATTACK) == -1) {
            //creep.memory.target = 'E36S4';
            // Check if the creep has a target room
            if (!creep.memory.target) {
                return 0;
            }
            // Check if the creep is in the target room
            if (creep.room.name != creep.memory.target) {
                // If not, move to the target room
                const exitDir = Game.map.findExit(creep.room, creep.memory.target);
                //const exit = creep.pos.findClosestByPath(exitDir);
                const destination = new RoomPosition(25, 25, creep.memory.target);
                creep.moveTo(destination);
            }
            else {// If in the target room
                //creep.say("!");
                creep.memory.is_working=true;
                
                var pos = creep.pos;
                if (pos.x > 48) {
                    creep.move(LEFT);
                    return;
                }
                else if (pos.x < 2) {
                    creep.move(RIGHT);
                    return;
                }
                if (pos.y > 48) {
                    creep.move(TOP);
                    return;
                }
                else if (pos.y < 2) {
                    creep.move(BOTTOM);
                    return;
                }
                /*
                const healers = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (healer) {
                        return healer.memory.role == 'keeperHealer'
                            && healer.hits > healer.hitsMax * 0.5
                            && healer.pos.inRangeTo(creep.pos, 2) == true;
                    }
                });*/
                //creep.memory.healers=undefined;
                if(creep.memory.healers!=undefined && creep.memory.healers.length>0)
                {
                    for(let i=0;i<creep.memory.healers.length;i++)
                    {
                        if(Game.getObjectById(creep.memory.healers[i].id)==undefined )
                        {
                            creep.memory.healers=undefined;
                            break;
                        }
                    }  
                }
                else if(creep.memory.healers==undefined || (creep.memory.healers!=undefined && creep.memory.healers.length==0))
                {
                    creep.memory.healers=creep.room.find(FIND_MY_CREEPS, {
                        filter: function (healer) {
                            return healer.memory.role == 'keeperHealer'
                                && healer.hits > healer.hitsMax * 0.5
                                && healer.pos.inRangeTo(creep.pos, 2) == true;
                        }
                    });
                }
                
                if (creep.memory.healers!=undefined && creep.memory.healers.length >= 1) {//if enough friendly creeps to proceed attack
                    //creep.say("AATTAAACK");
                    creep.memory.grouping = false;
                    var hostileCreeps = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS /*, {
                filter: (enemyCreep) => enemyCreep.owner.username !== 'Jeally_Rabbit',
                }*/);


                    if (hostileCreeps == undefined) {// there are no keepers - go to lair with smallest 
                        //creep.say(6);

                        if(creep.memory.min_lair!=undefined && creep.memory.lairs!=undefined && creep.memory.lairs.length>0)
                        {
                            for(let i=0;i<creep.memory.lairs.length;i++)
                            {
                                if(Game.getObjectById(creep.memory.lairs[i].id)==undefined)
                                {
                                    //creep.memory.lairs=undefined;
                                    creep.memory.min_lair=undefined;
                                    creep.say("del lair");
                                    break;
                                }
                            }

                            if(Game.getObjectById(creep.memory.min_lair.spawning!=true))
                            {
                                creep.memory.min_lair=undefined;
                            }
                        }
                        else if(creep.memory.min_lair==undefined)
                        {
                            var lairs=creep.room.find(FIND_STRUCTURES, {
                                filter: function (structure) {
                                    return structure.structureType == STRUCTURE_KEEPER_LAIR;
                                }
                            });
                            creep.memory.min_lair = lairs[0];
                            for (let i = 1; i < lairs.length; i++) {
                                if (lairs[i].ticksToSpawn < creep.memory.min_lair.ticksToSpawn) {
                                    creep.memory.min_lair = lairs[i];
                                }
                            }
                        }
                        /*
                        const lairs = creep.room.find(FIND_STRUCTURES, {
                            filter: function (structure) {
                                return structure.structureType == STRUCTURE_KEEPER_LAIR;
                            }
                        });
                        */

                        ////creep.say(lairs.length);
                        
                        move_avoid_hostile(creep,creep.memory.min_lair.pos,4);
                        //creep.moveTo(Game.getObjectById(min_lair.id), { range: 4 });
                    }
                    else {// if is too close to enemy (range 2 and less - it have to bee atdistance of 3 squaers of enemy )
                        ////creep.say(4.5);
                        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                        if (creep.pos.inRangeTo(target, 2)) {
                            console.log("killer RUN");
                            //var closestHostile = creep.pos.findClosestByRange(hostileCreeps);
                            goOutOfRange(creep, 3);
                        }
                        else if (!creep.pos.inRangeTo(target, 3) && creep.hits < creep.hitsMax) {
                            ////creep.say(4.6);
                            return 0;
                        }

                        else if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                            creep.memory.min_lair=undefined;

                            creep.moveTo(target, { range: 3 });
                            //creep.say("A");
                        }
                        // //creep.say("🏹");
                    }
                }
                else {// in target room but not enough creeps to proceed attack - 
                    //var pos = creep.pos;
                    //creep.move(BOTTOM);
                    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                        filter: function (enemy) {
                            return enemy.pos.inRangeTo(creep, 4);
                        }
                    });
                    if (target != undefined && target != null) {
                        creep.rangedAttack(target);
                        creep.memory.min_lair=undefined;
                        goOutOfRange(creep, 5);
                    }
                    else {//group with closest healer or killer if there is no healer
                        creep.memory.grouping = true;
                        var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
                        var to_avoid = [];
                        for (let i = 0; i < keepers.length; i++) {
                            to_avoid = to_avoid.concat(keepers[i].pos.getN_NearbyPositions(3));
                        }

                        var myCreeps = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                            filter: function (myCreep) {
                                return (myCreep.memory.role == 'keeperHealer')
                                    // ||) myCreep.memory.role == 'keeperKiller')
                                    && myCreep.name != creep.name;
                            }
                        });
                        //console.log("myCreeps: ",myCreeps);
                        if (myCreeps != undefined) {
                            //creep.say("group H");
                            move_avoid_hostile(creep, myCreeps.pos, 1);
                        }
                        else {
                            var myCreeps = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                                filter: function (myCreep) {
                                    return myCreep.memory.role == 'keeperKiller'
                                        && myCreep.name != creep.name;
                                }
                            });
                            if (myCreeps != undefined) {
                                //creep.say("group K");
                                move_avoid_hostile(creep, myCreeps.pos, 2);
                            }

                        }
                    }




                }

            }
        }

    }
};

module.exports = keeper_killerRole;