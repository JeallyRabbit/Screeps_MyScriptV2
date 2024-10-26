
Spawn.prototype.operateSwarm = function operateSwarm(swarm) {


    if (swarm.members == undefined) {
        swarm.members = [];
    }
    if (swarm.members.length == swarm.req_population) {
        swarm.completed = true
    }

    if (swarm.members.length == 0) {
        swarm.completed = undefined
    }

    var enemy_creeps = [];
    if (Game.rooms[swarm.target_room] != undefined) {
        for (en of Game.rooms[swarm.target_room].memory.hostiles) {
            enemy_creeps.push(Game.getObjectById(en))
        }
    }

    var target_creep = undefined;
    //target_creep=creep.room.findClosestByRange(enemy_creeps)

    var allies_present = false;
    if (Game.rooms[swarm.target_room] != undefined && Game.rooms[swarm.target_room].memory.allies.length > 0) {
        allies_present = true
    }

    for (id of swarm.members) {
        creep = Game.getObjectById(id)
        if (creep != null) {

            if (_.filter(creep.body, { type: ATTACK }).length > 0) {
                creep.memory.is_melee = true;
            }
            else {
                creep.memory.is_melee = false;
            }
            if (target_creep == undefined) {
                target_creep = creep.pos.findClosestByPath(enemy_creeps)
            }
            //creep.say(target_creep)
            /*
            for (other of swarm.members) {
                if (other != id && Game.getObjectById(other) != null) {
                    if (creep.hits == creep.hitsMax && Game.getObjectById(other).hits < Game.getObjectById(other).hitsMax) {


                        if (creep.heal(Game.getObjectById(other)) == ERR_NOT_IN_RANGE) {
                            if (creep.rangedHeal(Game.getObjectById(other)) == OK) {
                                break;
                            }

                        }
                        else if (creep.heal(Game.getObjectById(other)) == OK) {
                            break;
                        }
                    }
                }
            }
                */





            if (swarm.completed) {

                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                if (creep.room.name == swarm.target_room) {

                    //creep.say("In target Room")

                    ///////////////////////////////
                    /*
                    var target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                        filter:
                            function (cr) {
                                return cr.owner.username != 'Alphonzo' &&
                                    (cr.getActiveBodyparts(ATTACK) > 0 || cr.getActiveBodyparts(RANGED_ATTACK) > 0 || cr.getActiveBodyparts(HEAL) > 0)
                            }
                    });
                    if (target_creep == null) {
                        target_creep = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                            filter:
                                function (cr) {
                                    return cr.owner.username != 'Alphonzo'
                                }
                        });
                    }
                        */
                    ///////////////////////////////////



                    var target_structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                        filter: function (structure) {
                            //return structure.my==false && 
                            //return structure.room.name != spawn.room.name && 
                            return structure.structureType != STRUCTURE_CONTROLLER
                                //&& structure.structureType!=STRUCTURE_WALL
                                && structure.structureType != STRUCTURE_CONTAINER
                                && structure.structureType != STRUCTURE_ROAD
                                && structure.my == false
                        }
                    });
                    if (target_creep) {

                        if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {
                            if (!allies_present) {
                                creep.rangedMassAttack()
                            }
                        }
                        if (creep.memory.is_melee == false) {
                            if (creep.pos.inRangeTo(target_creep, 2) && (_.filter(target_creep.body, function (part) {
                                return part.type === RANGED_ATTACK && part.hits > 0;
                            }).length > 0 || _.filter(target_creep.body, function (part) {
                                return part.type === ATTACK && part.hits > 0;
                            }).length > 0)) {

                                // kiting
                                creep.fleeFrom({ target_creep }, 3, { maxRooms: 1 })
                                // goOutOfRange(creep, 3);
                            }
                            else if (creep.pos.isNearTo(target_creep.pos) && !allies_present) {
                                if (!allies_present) {
                                    creep.rangedMassAttack()
                                }
                            }
                            else {
                                creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: true, ignoreDestructibleStructures: true });
                            }
                        }

                        if ((_.filter(creep.body, function (part) {
                            return part.type === RANGED_ATTACK && part.hits > 0;
                        }).length == 0 && _.filter(creep.body, function (part) {
                            return part.type === ATTACK && part.hits == 0;
                        }).length > 0) && Game.rooms[creep.room.name].memory.hostiles != undefined) {
                            creep.fleeFrom(Game.rooms[creep.room.name].memory.hostiles, 6, { maxRooms: 1 })
                        }

                        if (target_structure && creep.pos.isNearTo(target_structure)) {
                            if (allies_present) {
                                creep.rangedAttack(target_structure)
                            }
                            else {
                                creep.rangedMassAttack()
                            }
                        }


                    }
                    else if (target_structure) {
                        //console.log(creep.room.name, " ", "fighting structures");
                        //console.log("target_structure: ",target_structure);
                        //console.log("QWEQWEQWE")
                        if (target_creep) {
                            //creep.say("fc")
                            //focus on creeps
                            if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {

                                creep.moveTo(target_creep, { maxRooms: 1, ignoreDestructibleStructures: true })
                                if (creep.pos.isNearTo(target_structure)) {
                                    if (allies_present) {
                                        creep.rangedAttack(target_structure)
                                    }
                                    else {
                                        creep.rangedMassAttack()
                                    }
                                }

                            }

                        }
                        else {
                            //focus on structures
                            //creep.say("fs")
                            if (creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE) {
                                if (allies_present) {
                                    creep.rangedAttack(target_structure)
                                }
                                else {
                                    creep.rangedMassAttack()
                                }
                            }
                            creep.moveTo(target_structure, { maxRooms: 1, ignoreDestructibleStructures: true, avoidCreeps: true })

                        }
                        if (creep.memory.is_melee == true) {
                            if (creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure, { avoidCreeps: true, ignoreDestructibleStructures: true, avoidCreeps: true });
                                //console.log("structure to far");
                            }
                        }
                        else {
                            creep.moveTo(target_structure, { avoidCreeps: true, ignoreDestructibleStructures: true });

                        }

                        if (creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                    }
                    if (Game.rooms[swarm.target_room] != undefined && Game.rooms[swarm.target_room].memory.damagedCreeps.length > 0) {
                        var damaged = [];
                        for (cr of Game.rooms[swarm.target_room].memory.damagedCreeps) {
                            damaged.push(Game.getObjectById(cr))
                        }
                        //creep.say("A")
                        var toHeal = creep.pos.findClosestByRange(damaged)
                        if (toHeal != null) {
                            //creep.say("healing my creep")
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                //creep.say("ranged heal")
                                if (target_creep == null) {
                                    creep.moveTo(toHeal, { maxRooms: 1 })
                                }

                                if (!target_creep) {
                                    creep.rangedHeal(toHeal)
                                }

                            }
                        }
                    }
                    else {
                        // group
                        for (m of swarm.members) {
                            if (Game.getObjectById(m) != null) {

                                for (flagName in Game.flags) {

                                    var flag = Game.flags[flagName]
                                    if (flag == undefined) { continue; }

                                    if (flag.room != undefined && flag.room.name == creep.room.name
                                        && flagName.startsWith('swarm')
                                    ) {
                                        creep.moveTo(flag, { reusePath: 11, avoidCreeps: true, maxRooms: 1, ignoreDestructibleStructures: true });
                                        //creep.say("flag")
                                        break;
                                    }
                                }
                                /*
                                if (Game.flags['swarm'] != undefined && Game.flags['swarm'].room != undefined && Game.flags['swarm'].room.name == creep.room.name/* && !target_creep && !target_structure */
                            //) {
                                 /*   creep.moveTo(Game.flags['swarm'], { reusePath: 11, avoidCreeps: true, maxRooms: 1, ignoreDestructibleStructures: true })
                                }
                                else {
                                    creep.moveTo(Game.getObjectById(m), { reusePath: 11, avoidCreeps: true, maxRooms: 1, range: swarm.members.length / 2, ignoreDestructibleStructures: true })
                                }
                                */
                                break;
                            }
                        }
                        //creep.moveTo(Game.getObjectById(swa), { reusePath: 11, maxRooms: 1, range: 22 });
                    }
                }
                else {
                    //creep.move(BOTTOM)
                    //return;
                    creep.moveToRoom(swarm.target_room, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true })
                    //creep.rangedMassAttack()
                }

                var sum_x = 0;
                var sum_y = 0
                var counted = 0;
                //console.log(creep.id)
                for (other of swarm.members) {
                    if (Game.getObjectById(other) != null) {
                        if (Game.getObjectById(other).room.name == creep.room.name) {
                            //console.log("adding other: ", other)
                            counted++;
                            sum_x += Game.getObjectById(other).pos.x
                            sum_y += Game.getObjectById(other).pos.y
                        }

                    }

                }

                var mean_x = Math.floor(sum_x / counted)
                var mean_y = Math.floor(sum_y / counted)
                var mean_pos = new RoomPosition(mean_x, mean_y, creep.room.name)

                var is_any_to_far = false
                for (other of swarm.members) {
                    if (Game.getObjectById(other).pos.getRangeTo(mean_pos) > swarm.members.length / 2 
                        && Game.getObjectById(other).pos.x!=0 && Game.getObjectById(other).pos.x!=49 && Game.getObjectById(other).pos.y!=0 &&Game.getObjectById(other).pos.y!=49
                        && sum_y != 0 && sum_x != 0
                        && Game.getObjectById(other).room.name == creep.room.name) {
                        is_any_to_far = true
                        break;
                    }
                }
                if (is_any_to_far) {
                    creep.moveTo(mean_pos, { avoidCreeps: false })
                }
            }
            else {
                //rand <1;6>
                creep.fleeFrom([this], 8, { maxRooms: 1 })
            }
        }
    }
}