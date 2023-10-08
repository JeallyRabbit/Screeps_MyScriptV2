const keeper_Healer = {
    /** @param {Creep} creep **/
    run: function (creep) {

        var pos = creep.pos;
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

        //creep.say("!");
        // Check if the creep has a target room
        if (!creep.memory.target) {
            return 0;
        }
        // Check if the creep is in the target room
        if (creep.room.name !== creep.memory.target) {
            // If not, move to the target room
            const exitDir = Game.map.findExit(creep.room, creep.memory.target);
            //const exit = creep.pos.findClosestByPath(exitDir);
            const destination = new RoomPosition(25, 25, creep.memory.target);
            creep.moveTo(destination);
        }
        else {// If in the target room
            if(creep.hits<creep.hitsMax*0.8)
            {
                creep.heal(creep);
            }
            const healers = creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'keeperHealer';
                }
            });
            const killers = creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'keeperKiller';
                }
            });

            if (healers.length < 2 && killers.length < 1) {
                return 0;
            }

            if (healers.length >= 0 && killers.length >= 1) {// if there are killers go to them and support

                var friendlyDamagedCreeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (creep) {
                        return creep.hits < creep.hitsMax && 
                        (creep.memory.role=='keeperKiller' || creep.memory.role=='keeperHealer') ;
                    }
                });
                var friendlyHealthyKillers = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (killer) {
                        return killer.memory.role == 'keeperKiller';
                    }
                });
                // console.log("damaged: ",friendlyHealthyKillers.length);

                if (friendlyDamagedCreeps.length > 0) {//find most damaged one and heal up
                    //creep.say("AAA");
                    var health_percentage = 100;
                    var damaged_id = 0;
                    for (let i = 0; i < friendlyDamagedCreeps.length; i++) {
                        if (friendlyDamagedCreeps[i].hits / friendlyDamagedCreeps[i].hitsMax < health_percentage)
                            damaged_id = i;
                        health_percentage = friendlyDamagedCreeps[i].hits / friendlyDamagedCreeps[i].hitsMax;
                    }
                    //console.log("damaged: ",friendlyDamagedCreeps);
                    if (creep.heal(friendlyDamagedCreeps[damaged_id]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(friendlyDamagedCreeps[damaged_id]);
                    }
                }
                else if (friendlyHealthyKillers != undefined) {
                    //creep.say("PQPQPQPPQ");
                    //console.log(friendlyHealthyKillers[0]);
                    creep.moveTo(friendlyHealthyKillers[0]);
                }

            }
            else {// in target room but not enough creeps to proceed attack


                var myCreeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (myCreeps) {
                        return myCreeps.memory.role == 'keeperHealer' ||
                            myCreeps.memory.role == 'keeperKiller';
                    }
                });
                if (myCreeps != undefined && myCreeps.length > 1) {
                    creep.moveTo(myCreeps[0]);
                }




                var pos = creep.pos;
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

        }
    },
};

module.exports = keeper_Healer;