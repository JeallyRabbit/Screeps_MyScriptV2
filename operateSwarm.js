
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
                target_creep = creep.pos.findClosestByRange(enemy_creeps)
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



                    var target_structure = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
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
                    //console.log("structure: ",target_structure);
                    //if(!target) {
                    //  target_creep = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
                    //}
                    if (target_creep) {
                        //creep.say(target_creep.pos.x);

                        //creep.say("cr")


                        if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {
                            //creep.say("to far")
                            if (!allies_present) {
                                creep.rangedMassAttack()
                            }
                            creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: true });
                        }


                        //
                        //}

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
                                if(!allies_present)
                                {
                                    creep.rangedMassAttack()
                                }
                            }
                            else{
                                creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: true});
                            }
                        }

                        if ((_.filter(creep.body, function (part) {
                            return part.type === RANGED_ATTACK && part.hits > 0;
                        }).length == 0 &&  _.filter(creep.body, function (part) {
                            return part.type === ATTACK && part.hits == 0;
                        }).length > 0) && Game.rooms[creep.room.name].memory.hostiles != undefined) {
                            creep.fleeFrom(Game.rooms[creep.room.name].memory.hostiles, 6)
                        }


                    }
                    else if (target_structure) {
                        //console.log(creep.room.name, " ", "fighting structures");
                        ////creep.say("STR");
                        //console.log("target_structure: ",target_structure);
                        creep.rangedMassAttack()
                        if (creep.memory.is_melee == true) {
                            if (creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure, { avoidCreeps: true });
                                //console.log("structure to far");
                            }
                        }
                        else {
                            creep.moveTo(target_structure, { avoidCreeps: true });
                            //creep.rangedMassAttack()
                            /* if (creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure);
                                //console.log("structure to far");
                            } */
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
                                    creep.moveTo(toHeal,{maxRooms: 1})
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
                                if (Game.flags['swarm'] != undefined && !target_creep && !target_structure) {
                                    creep.moveTo(Game.flags['swarm'], { reusePath: 11, avoidCreeps: true, maxRooms: 1 })
                                }
                                else {
                                    creep.moveTo(Game.getObjectById(m), { reusePath: 11, avoidCreeps: true, maxRooms: 1, range: swarm.members.length / 2 })
                                }

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

                var sum_x=0;
                var sum_y=0
                var counted=0;
                console.log(creep.id)
                for (other of swarm.members) {
                    if(Game.getObjectById(other) != null)
                    {
                        if(Game.getObjectById(other).room.name==creep.room.name)
                        {
                            console.log("adding other: ",other)
                            counted++;
                            sum_x+=Game.getObjectById(other).pos.x
                            sum_y+=Game.getObjectById(other).pos.y
                        }
                        
                    }
                    
                    /*
                    if (other != id && Game.getObjectById(other) != null) {
                        if (creep.pos.getRangeTo(Game.getObjectById(other)) > swarm.req_population
                            && creep.pos.roomName == Game.getObjectById(other).pos.roomName) {
                            creep.moveTo(Game.getObjectById(other), { avoidCreeps: true,swampCost:2})
                            creep.say("grouping")
                            break;
                        }
                    }
                        */
                }
                
                var mean_x=Math.floor(sum_x/counted)
                var mean_y=Math.floor(sum_y/counted)
                creep.say(mean_x+" "+mean_y)
                var mean_pos=new RoomPosition(mean_x,mean_y,creep.room.name)
                if(creep.pos.getRangeTo(mean_pos)>swarm.members.length+2 && sum_y!=0 && sum_x!=0)
                {
                    creep.say(creep.pos.getRangeTo(mean_pos))
                    creep.moveTo(mean_pos,{avoidCreeps: false})
                }
            }
            else {
                //rand <1;6>
                creep.fleeFrom([this], 8)
            }
        }
    }
}