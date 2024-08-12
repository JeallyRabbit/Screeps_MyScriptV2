const STATE_UNDER_ATTACK = 'STATE_UNDER_ATTACK'

Spawn.prototype.baseDefense = function baseDefense(spawn) {
    //console.log("Base test: ", this.room.name)
    var hostiles = this.room.find(FIND_HOSTILE_CREEPS);

    this.memory.weakest_any=undefined;
    this.memory.weakest_healer = undefined;
    this.memory.weakest_attacker=undefined;
    this.memory.weakest_ranged=undefined;
    if (hostiles != undefined && hostiles.length > 0) {
        this.memory.weakest_any=hostiles[0].id;
        if (this.memory.state.includes(STATE_UNDER_ATTACK) == false) {
            this.memory.state.push(STATE_UNDER_ATTACK)
        }
        //console.log("hostile creeps: ", hostiles.length)
        //console.log(hostiles[0].body[0].type)
        let ranged_invaders = _.filter(hostiles, function (enemy) {
            return _.filter(enemy.body, { type: RANGED_ATTACK }).length > 0
        })
        let mele_invaders = _.filter(hostiles, function (enemy) {
            return _.filter(enemy.body, { type: ATTACK }).length > 0
        })
        let heal_invaders = _.filter(hostiles, function (enemy) {
            return _.filter(enemy.body, { type: HEAL }).length > 0
        })
        //_.filter(creep.body, { type: WORK }).length;
        //console.log("ranged invaders: ", ranged_invaders.length)
        //console.log("mele invaders: ", mele_invaders.length)
        //console.log("heal invaders: ", heal_invaders.length)

        findWeakesthealer.call(this, heal_invaders);
        findWeakestMele.call(this,mele_invaders);
        findWeakestRanged.call(this,ranged_invaders)

        

    }
    else {
        this.memory.state = this.memory.state.filter(function (e) { return e !== STATE_UNDER_ATTACK })
        this.memory.weakest_any=undefined;
    }
}
function findWeakestRanged(ranged_invaders)
{
    var total_enemy_ranged_power = 0;
    var weakest_ranged = undefined;
    var weakest_ranged_power = Infinity;
    for (enemy of ranged_invaders) {
        var enemy_ranged_power = 0;
        for (body_part of enemy.body) {
            if (body_part.type == RANGED_ATTACK) {
                if (body_part.boost == undefined) {
                    total_enemy_ranged_power += RANGED_ATTACK_POWER;
                    enemy_ranged_power += RANGED_ATTACK_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_KEANIUM_OXIDE) {
                    total_enemy_ranged_power += RANGED_ATTACK_POWER * 2;
                    enemy_ranged_power += RANGED_ATTACK_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_KEANIUM_ALKALIDE) {
                    total_enemy_ranged_power += RANGED_ATTACK_POWER * 3;
                    enemy_ranged_power += RANGED_ATTACK_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_KEANIUM_ALKALIDE) {
                    total_enemy_ranged_power += RANGED_ATTACK_POWER * 4;
                    enemy_ranged_power += RANGED_ATTACK_POWER * 4;
                }
            }
        }
        if (enemy_ranged_power < weakest_ranged_power) {
            weakest_ranged = enemy.id;
            weakest_ranged_power = enemy_ranged_power;
        }
    }
    if (weakest_ranged != undefined) {
        this.memory.weakest_ranged = weakest_ranged;
        
    }
    //console.log("weakest ranged: ",this.memory.weakest_ranged)

}
function findWeakestMele(mele_invaders) {
    var total_enemy_attack_power = 0;
    var weakest_attacker = undefined;
    var weakest_attacker_power = Infinity;
    for (enemy of mele_invaders) {
        var enemy_attack_power = 0;
        for (body_part of enemy.body) {
            if (body_part.type == ATTACK) {
                if (body_part.boost == undefined) {
                    total_enemy_attack_power += ATTACK_POWER;
                    enemy_attack_power += ATTACK_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_UTRIUM_HYDRIDE) {
                    total_enemy_attack_power += ATTACK_POWER * 2;
                    enemy_attack_power += ATTACK_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_UTRIUM_ACID) {
                    total_enemy_attack_power += ATTACK_POWER * 3;
                    enemy_attack_power += ATTACK_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_UTRIUM_ACID) {
                    total_enemy_attack_power += ATTACK_POWER * 4;
                    enemy_attack_power += ATTACK_POWER * 4;
                }
            }
        }
        if (enemy_attack_power < weakest_attacker_power) {
            weakest_attacker = enemy.id;
            weakest_attacker_power = enemy_attack_power;
        }
    }
    if (weakest_attacker != undefined) {
        this.memory.weakest_attacker = weakest_attacker;
    }
    //console.log("weakest nmele: ",this.memory.weakest_attacker)
}

function findWeakesthealer(/*this: StructureSpawn*/ heal_invaders) {
    var total_enemy_heal_power = 0;
    var weakest_healer = undefined;
    var weakest_healer_power = Infinity;
    for (enemy of heal_invaders) {
        var enemy_heal_power = 0;
        for (body_part of enemy.body) {
            if (body_part.type == HEAL) {
                if (body_part.boost == undefined) {
                    total_enemy_heal_power += HEAL_POWER;
                    enemy_heal_power += HEAL_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_LEMERGIUM_OXIDE) {
                    total_enemy_heal_power += HEAL_POWER * 2;
                    enemy_heal_power += HEAL_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_LEMERGIUM_ALKALIDE) {
                    total_enemy_heal_power += HEAL_POWER * 3;
                    enemy_heal_power += HEAL_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE) {
                    total_enemy_heal_power += HEAL_POWER * 4;
                    enemy_heal_power += HEAL_POWER * 4;
                }
            }
        }
        if (enemy_heal_power < weakest_healer_power) {
            weakest_healer = enemy.id;
            weakest_healer_power = enemy_heal_power;
        }
    }
    if (weakest_healer != undefined) {
        this.memory.weakest_healer = weakest_healer;
    }
    //console.log("total heal power: ", total_enemy_heal_power);
    //console.log("weakest healer: ", weakest_healer);
}
