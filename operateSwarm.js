
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

    var target_creep=undefined;
    //target_creep=creep.room.findClosestByRange(enemy_creeps)


    for (id of swarm.members) {
        creep = Game.getObjectById(id)
        if (creep != null) {

            if(_.filter(creep.body, { type: ATTACK }).length>0)
            {
                creep.memory.is_melee=true;
            }
            else{
                creep.memory.is_melee=false;
            }
            if(target_creep==undefined)
            {
                target_creep=creep.pos.findClosestByRange(enemy_creeps)
            }
            //creep.say(target_creep)

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
                            return     structure.structureType != STRUCTURE_CONTROLLER
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
                            creep.rangedMassAttack()
                            creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: true });
                        }
                        else{
                            
                        }
                        creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: true});
                        //}

                        if (creep.memory.is_melee == false) {
                            if (creep.pos.inRangeTo(target_creep, 2) && (_.filter(target_creep.body, function (part) {
                                return part.type === RANGED_ATTACK && part.hits > 0;
                            }).length > 0 || _.filter(target_creep.body, function (part) {
                                return part.type === ATTACK && part.hits > 0;
                            }).length > 0)) {

                                
                                creep.fleeFrom({ target_creep }, 3, { maxRooms: 1 })
                                // goOutOfRange(creep, 3);
                            }
                            else if (creep.pos.isNearTo(target_creep.pos)) {
                                creep.rangedMassAttack()
                            }
                        }

                        if (creep.hits < creep.hitsMax / 2 && Game.rooms[creep.room.name].memory.hostiles!=undefined) {
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
                                creep.moveTo(target_structure,{avoidCreeps: true});
                                //console.log("structure to far");
                            }
                        }
                        else {
                            creep.moveTo(target_structure,{avoidCreeps: true});
                            creep.rangedMassAttack()
                            /* if (creep.rangedAttack(target_structure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure);
                                //console.log("structure to far");
                            } */
                        }

                        if (creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                    }
                    if (Game.rooms[creep.memory.target_room] != undefined && Game.rooms[creep.memory.target_room].memory.damagedCreeps.length > 0) {
                        var damaged = [];
                        for (cr of Game.rooms[creep.memory.target_room].memory.damagedCreeps) {
                            damaged.push(Game.getObjectById(cr))
                        }
                        var toHeal = creep.pos.findClosestByRange(damaged)
                        if (toHeal != null) {
                            //creep.say("healing my creep")
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                //creep.say("ranged heal")
                                if (target_creep == null) {
                                    creep.moveTo(toHeal)
                                }

                                creep.rangedHeal(toHeal)
                            }
                        }
                    }
                    else {
                        // group
                        var to_move=undefined;
                        for( m of swarm.members)
                        {
                            if(Game.getObjectById(m)!=null)
                            {
                                creep.moveTo(Game.getObjectById(m), { reusePath: 11, avoidCreeps: true,maxRooms: 1, range: swarm.members.length/2 })
                                break;
                            }
                        }
                        //creep.moveTo(Game.getObjectById(swa), { reusePath: 11, maxRooms: 1, range: 22 });
                    }
                }
                else {
                    creep.moveToRoom(swarm.target_room, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true })
                    //creep.rangedMassAttack()
                }

                for (other of swarm.members) {
                    if (other != id && Game.getObjectById(other) != null) {
                        if (creep.pos.getRangeTo(Game.getObjectById(other)) > swarm.members.length 
                            && creep.pos.roomName == Game.getObjectById(other).pos.roomName) {
                            creep.moveTo(Game.getObjectById(other), { avoidCreeps: true })
                            creep.say("grouping")
                            break;
                        }
                    }
                }
            }
            else {
                //rand <1;6>
                creep.fleeFrom([this], 8)
            }
        }
    }
}