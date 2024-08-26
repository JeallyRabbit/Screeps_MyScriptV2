

Creep.prototype.roleKeeperCarrier = function roleKeeperCarrier(creep, spawn) {

    /// creep.memory.tareget_room
    // creep.memory.target_source
    //creep.suicide()
    //creep.say("🚚")
    if (creep.memory.home_container != undefined && Game.getObjectById(creep.memory.home_container) == null) {
        creep.memory.home_container = undefined
        //delete creep.memory.home_container
    }
    if (creep.memory.home_container == undefined) {
        creep.memory.home_container = spawn.room.storage.id
    }

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        creep.memory.collecting = true

    }
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.collecting = false
    }


    //creep.say("!");
    // Check if the creep has a target room
    if (!creep.memory.target_room) {
        //console.log(" 2");
        return 0;
    }

    if (creep.memory.collecting == false) {
        //creep.say("bac")
        var transfer_result=creep.transfer(spawn.room.storage, RESOURCE_ENERGY) 
        if (transfer_result== ERR_NOT_IN_RANGE) {
            //creep.say("bac")
            if ((Game.getObjectById(creep.memory.lair) != null && creep.pos.inRangeTo(Game.getObjectById(creep.memory.lair).pos, 7))
                || creep.memory.target_container == undefined) {
                creep.say("whatever")
                creep.moveTo(Game.getObjectById(creep.memory.home_container).pos, { reusePath: 21, avoidCreeps: true })
            }
            else {
                creep.say("careful")
                creep.moveTo(Game.getObjectById(creep.memory.home_container).pos, { reusePath: 15, avoidSk: true,avoidCreeps: true })
            }

        }
        else if(transfer_result==OK){
            if(creep.memory.succesfull_transfers==undefined)
            {
                creep.memory.succesfull_transfers=1;
            }
            else{
                creep.memory.succesfull_transfers++;
            }
        }

    }
    else { // creep is collecting
        if (creep.room.name == creep.memory.target_room) {
            if (creep.memory.target_container != undefined && Game.getObjectById(creep.memory.target_container) == null) {
                creep.memory.target_container = undefined
            }

            if (creep.memory.target_container == undefined) {
                //console.log("renewing target_container")
                var container = Game.getObjectById(creep.memory.target_source).pos.findClosestByRange(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.structureType == STRUCTURE_CONTAINER
                        }
                })
                //console.log("target_source: ", Game.getObjectById(creep.memory.target_source).pos)
                //console.log(container.pos)
                if (container != null && container.pos.inRangeTo(Game.getObjectById(creep.memory.target_source), 4)) {
                    creep.memory.target_container = container.id
                }
            }

            if (creep.memory.target_container != undefined) {
                if (creep.memory.lair != undefined && Game.getObjectById(creep.memory.lair) == null) {
                    //console.log("resetting lair")
                    creep.memory.lair = undefined;
                }

                if (creep.memory.lair == undefined && Game.getObjectById(creep.memory.target_source) != null) {
                    var temp_lair = Game.getObjectById(creep.memory.target_source).pos.findClosestByRange(FIND_STRUCTURES, {
                        filter:
                            function (str) {
                                return str.structureType == STRUCTURE_KEEPER_LAIR
                            }
                    })

                    if (temp_lair != null && temp_lair.pos.inRangeTo(Game.getObjectById(creep.memory.target_source), 7)) {
                        //console.log("saving lair")
                        creep.memory.lair = temp_lair.id;
                    }
                }
                var lair = Game.getObjectById(creep.memory.lair)
                //creep.say(lair)
                if (lair != null) {
                    //creep.say("!null")
                    if (lair.ticksToSpawn > 10 && lair.ticksToSpawn < 285 &&
                        Game.getObjectById(creep.memory.target_container).store[RESOURCE_ENERGY] >= CARRY_CAPACITY
                    ) {
                        //creep.say("1")
                        if (creep.withdraw(Game.getObjectById(creep.memory.target_container), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                            var if_avoid_sk = true
                            if (creep.pos.inRangeTo(Game.getObjectById(creep.memory.target_container), 8)) {
                                if_avoid_sk = false
                            }
                            creep.moveTo(Game.getObjectById(creep.memory.target_container), { reusePath: 21, maxRooms: 1, avoidSk: if_avoid_sk,avoidCreeps: true })
                            //creep.say('2')
                        }
                    }
                    else {
                        if (creep.pos.inRangeTo(lair, 7)) {
                            creep.fleeFrom({ lair }, 7, 1)
                        }
                        else {
                            creep.moveTo(lair, { reusePath: 21, range: 8,avoidCreeps: true})
                        }
                    }
                }


            }
            else { // collect cropped energy
                if (creep.memory.dropped_energy != undefined && Game.getObjectById(creep.memory.dropped_energy) == null) {
                    creep.memory.dropped_energy = undefined;
                }

                if (creep.memory.dropped_energy == undefined) {
                    var dropped_energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                        filter: function (res) {
                            return res.resourceType == RESOURCE_ENERGY
                        }

                    })
                    if (dropped_energy != null) {
                        creep.memory.dropped_energy = dropped_energy.id;
                    }
                }

                if (creep.memory.dropped_energy != undefined) {
                    var energy = Game.getObjectById(creep.memory.dropped_energy)
                    if (creep.pickup(energy) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(energy, { reusePath: 17, maxRooms: 1,avoidCreeps: true})
                    }
                }
            }

            var hostiles = [];
            if (Game.rooms[creep.room.name].memory.keepers != undefined && Game.rooms[creep.room.name].memory.keepers.length > 0) {
                for (a of Game.rooms[creep.room.name].memory.keepers) {
                    if(Game.getObjectById(a)!=null)
                    {
                        hostiles.push(Game.getObjectById(a))
                    }
                    
                }

            }
            creep.fleeFrom(hostiles, 6)

        }
        else {
            creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { reusePath: 21,avoidCreeps: true })
        }
    }


};




