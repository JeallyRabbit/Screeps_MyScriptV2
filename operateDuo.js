Spawn.prototype.operateDuo = function operateDuo(duo) {

    var leader = Game.getObjectById(duo.leaderId)
    var follower = Game.getObjectById(duo.followerId)

    console.log("leader pos: ", leader.pos)
    console.log("follower pos: ",follower.pos)
    //for follower
    if (follower.memory.leader != undefined) {

        if (leader == null) {
            return
        }
        if (!follower.pos.isNearTo(leader) || leader.memory.moving) {
            follower.say("mv")
            follower.moveTo(Game.getObjectById(follower.memory.leader), { avoidCreeps: false });
        }


        var followerHp = follower.hits / follower.hitsMax

        var leaderHp = leader.hits / leader.hitsMax

        if (leaderHp <= followerHp && leader.hits < leader.hitsMax) {
            follower.say("Hl")
            follower.heal(leader)
        }
        else {
            follower.say("Hf")
            follower.heal(follower)
        }

    }

    // for leader
    leader.memory.target_room = 'W6N4'
    leader.memory.task = 'destroy_invader_core'

    leader.heal(leader)
    if (leader.memory.follower != undefined && Game.getObjectById(leader.memory.follower) != null) {
        leader.memory.moving = false;
        var follower = Game.getObjectById(leader.memory.follower)
        if (!leader.pos.inRangeTo(follower.pos, 1)) {// leader is to far from follower
            leader.say("to far")
            
            if (leader.pos.roomName == follower.pos.roomName) {
                leader.moveTo(follower, { range: 1 })
                return
            }
            //
            //return;
        }


        if (leader.memory.target_room != undefined && leader.room.name != leader.memory.target_room) {
            leader.memory.moving = true
            leader.moveTo(new RoomPosition(25, 25, leader.memory.target_room), { reusePath: 10, range: 20, avodCreeps: true })
        }

        // healing
        var followerHp = follower.hits / follower.hitsMax

        var leaderHp = leader.hits / leader.hitsMax

        if (leaderHp <= followerHp && leader.hits < leader.hitsMax) {
            leader.say("Hl")
            leader.heal(leader)
        }
        else {
            leader.say("Hf")
            leader.heal(follower)
        }


        if (leader.room.name == leader.memory.target_room) {
            if (leader.memory.task = 'destroy_invader_core') {
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
                        leader.memory.moving = true;
                        leader.moveTo(core)
                        leader.rangedMassAttack()
                    }
                    /*
                    if (leader.hits > leader.hitsMax * 0.75) {
                        leader.moveTo(core)
                        leader.rangedMassAttack()
                    }*/

                    if (leader.hits < leader.hitsMax * 0.9) {
                        leader.say("flee")
                        leader.fleeFrom({ core }, 20)
                    }
                }
            }
        }
    }

    if(Game.flags['duo']!=undefined)
    {
        leader.moveTo(Game.flags['duo'])
    }

}