


Spawn.prototype.operateDuo = function operateDuo(duo) {

    var leader = Game.getObjectById(duo.leaderId)
    var follower = Game.getObjectById(duo.followerId)
    duo.moving = false;

    console.log("leader pos: ", leader.pos)
    console.log("follower pos: ",follower.pos)
    //console.log("tower damage: ",TOWER_POWER_ATTACK)



    // for leader
    //leader.memory.target_room = 'W6N4'
    if(duo.target_room!=undefined)
    {
        leader.memory.target_room=duo.target_room
    }
    leader.memory.task = 'destroy_invader_core'

    duo.hp=(leader.hits+follower.hits)/(leader.hitsMax+follower.hitsMax)
    console.log("duo.hp: ",duo.hp)
    if(duo.hp<0.9)
    {
        duo.fleeing=true
    }
    if(duo.hp==1)
    {
        duo.fleeing=false
    }
    leader.heal(leader)
    if (leader.memory.follower != undefined && Game.getObjectById(leader.memory.follower) != null) {
        duo.moving = false;
        var follower = Game.getObjectById(leader.memory.follower)
        if (!leader.pos.inRangeTo(follower.pos, 1)) {// leader is to far from follower
            leader.say("to far")
            
            if (leader.pos.roomName == follower.pos.roomName ) {
                duo.moving=true
                leader.moveTo(follower, { range: 1 })
                return;
            }
            //
            //return;
        }


        if (leader.memory.target_room != undefined && leader.room.name != leader.memory.target_room) {
            duo.moving = true
            leader.moveTo(new RoomPosition(25, 25, leader.memory.target_room), { reusePath: 10, range: 20, avodCreeps: true })
        }

        // healing
        var followerHp = follower.hits / follower.hitsMax

        var leaderHp = leader.hits / leader.hitsMax

        if (leaderHp <= followerHp /* && leader.hits < leader.hitsMax */) {
            leader.say("Hl")
            leader.heal(leader)
        }
        else {
            leader.say("Hf")
            if(leader.heal(follower)==ERR_NOT_IN_RANGE)
            {
                leader.rangedHeal(follower)
            }
        }


        if (leader.room.name == leader.memory.target_room || true) {
            if (leader.memory.task = 'destroy_invader_core' || true) {

                //leader.rangedMassAttack()
                if(leader.memory.invaderCore!=undefined && Game.getObjectById(leader.memory.invaderCore)==null)
                {
                    leader.memory.invaderCore=undefined
                }
                if (leader.memory.invaderCore == undefined) {
                    var core = leader.room.find(FIND_STRUCTURES, {
                        filter:
                            function (str) {
                                return str.structureType == STRUCTURE_INVADER_CORE
                            }
                    })
                    if (core.length > 0) {
                        leader.memory.invaderCore = core[0].id
                    }
                    else {
                        leader.memory.invaderCore = null;
                    }
                }

                if (leader.memory.invaderCore != undefined && leader.memory.invaderCore != null) {
                    var core = Game.getObjectById(leader.memory.invaderCore)
                    if (leader.rangedAttack(core) == ERR_NOT_IN_RANGE) {
                        duo.moving = true;
                        leader.moveTo(core)
                        leader.rangedMassAttack()
                    }
                    /*
                    if (leader.hits > leader.hitsMax * 0.75) {
                        leader.moveTo(core)
                        leader.rangedMassAttack()
                    }*/
                    console.log("leader hp: ",leader.hits /leader.hitsMax)
                    if (duo.fleeing==true) {
                        leader.say("flee")
                        duo.moving=true
                        leader.fleeFrom({ core }, 20)
                    }
                }
                else{
                    var hostile_creeps=leader.room.find(FIND_HOSTILE_CREEPS,{filter:
                        function(en)
                        {
                            return en.owner.username!='Aplhonzo'
                        }
                    })
                    if(hostile_creeps.length>0)
                    {
                        closest_hostile=leader.pos.findClosestByRange(hostile_creeps)
                        if(closest_hostile!=null)
                        {
                            if (leader.rangedAttack(closest_hostile) == ERR_NOT_IN_RANGE) {
                                leader.moveTo(closest_hostile, { maxRooms: 1, avoidSk: true });
                            }

                            leader.say(closest_hostile)
                            console.log("closest hostile to duo: ",closest_hostile.pos)
                            if (leader.memory.is_melee == false) {
                                leader.rangedAttack(closest_hostile)
                                if (leader.pos.inRangeTo(closest_hostile, 2) && (_.filter(closest_hostile.body, function (part) {
                                    return part.type === RANGED_ATTACK && part.hits > 0;
                                }).length > 0 || _.filter(closest_hostile.body, function (part) {
                                    return part.type === ATTACK && part.hits > 0;
                                }).length > 0)) {
                                    duo.moving=true
                                    leader.fleeFrom({ closest_hostile }, 3, { maxRooms: 1 })
                                    // goOutOfRange(creep, 3);
                                }
                                if (leader.pos.isNearTo(closest_hostile.pos)) {
                                    leader.rangedMassAttack()
                                }
                            }
                        }
                    }
                    leader.say("other")
                    var hostile_constructions=leader.room.find(FIND_HOSTILE_STRUCTURES,{
                        filter: function(str)
                        {
                            return str.structureType!=STRUCTURE_KEEPER_LAIR
                        }
                    })
                    if(hostile_constructions.length>0)
                    {
                        leader.moveTo(hostile_constructions[0])
                        duo.moving=true;

                        leader.rangedMassAttack()
                    }
                }
            }
        }
    }


    //for follower
    if (follower.memory.leader != undefined) {

        if (leader == null) {
            return
        }
        if (!follower.pos.isNearTo(leader) || duo.moving) {
            follower.say( duo.moving)
            follower.moveTo(leader, { avoidCreeps: false,swampCost:1 });
        }


        var followerHp = follower.hits / follower.hitsMax

        var leaderHp = leader.hits / leader.hitsMax

        if (leaderHp <= followerHp /* && leader.hits < leader.hitsMax*/ ) {
            //follower.say("Hl")
            if(follower.heal(leader)==ERR_NOT_IN_RANGE)
            {
                follower.rangedHeal(leader)
            }
        }
        else {
            //follower.say("Hf")
            follower.heal(follower)
        }

    }
    
    follower.moveTo(leader, { avoidCreeps: false,swampCost:1 });

    if(Game.flags['duo']!=undefined)
    {
        leader.moveTo(Game.flags['duo'])
    }

}