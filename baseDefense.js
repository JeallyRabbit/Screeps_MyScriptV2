const STATE_UNDER_ATTACK = 'STATE_UNDER_ATTACK'

Spawn.prototype.baseDefense = function baseDefense(spawn) {
    //console.log("Base test: ", this.room.name)
    if (spawn == undefined) {
        //console.log("asdasd")
        //return;
    }
    var hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    //console.log(this.room.name," ",hostiles.length)
    this.memory.weakest_any = undefined;
    this.memory.weakest_healer = undefined;
    this.memory.weakest_attacker = undefined;
    this.memory.weakest_ranged = undefined;
    if (hostiles != undefined && hostiles.length > 0) {
        this.memory.weakest_any = hostiles[0].id;

        var hostile_not_invader=this.room.find(FIND_HOSTILE_CREEPS,{filter: 
            function(hostile)
            {
                return hostile.owner.username!='Invader'
            }
        })
        if(hostile_not_invader.length>0 && this.room.controller.level<=4)
        {
            this.room.controller.activateSafeMode();
        }
        /*
        if (this.memory.state.includes(STATE_UNDER_ATTACK) == false
    && hostile_not_invader.length==hostiles.length) {
            this.memory.state.push(STATE_UNDER_ATTACK)
        }*/
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

        findWeakesthealer.call(this, heal_invaders);
        findWeakestMele.call(this, mele_invaders);
        findWeakestRanged.call(this, ranged_invaders)
        findTotalAttackPower.call(this, hostiles)

        setCostMatrix.call(this, hostiles)




        if (Game.shard.name != 'shard3' && this.memory.weakest_any != undefined && Game.getObjectById(this.memory.weakest_any).owner.username != 'Invader' && this.room.controller.level < 6) {
            if(spawn.pos.findInRange(FIND_HOSTILE_CREEPS,7,{
                filter: function (h)
                {
                    return h.controller.owner.username!='Invader'
                }
            }).length>0)
            {
                this.room.controller.activateSafeMode()
            }
            
        }


    }
    else {
        this.memory.state = this.memory.state.filter(function (e) { return e !== STATE_UNDER_ATTACK })
        this.memory.weakest_any = undefined;
    }
}

function setCostMatrix(hostiles) {

    if (!(this.memory.state.includes(STATE_UNDER_ATTACK))) {
        this.memory.repairer_cost_matrix = undefined;
        return;
    }

    let meleeCosts = new PathFinder.CostMatrix
    let repairerCosts=new PathFinder.CostMatrix

    this.room.find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            meleeCosts.set(struct.pos.x, struct.pos.y, 1);
            repairerCosts.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            meleeCosts.set(struct.pos.x, struct.pos.y, 0xff);
            repairerCosts.set(struct.pos.x, struct.pos.y, 0xff);
        }
    });


    for (hostile of hostiles) {
        var if_include_attack = false;
        for (part of hostile.body) {
            if (part.type == ATTACK) { if_include_attack = true; break; }
        }
        if (if_include_attack) {
            for (var i = hostile.pos.x - 1; i <= hostile.pos.x + 1; i++) {
                for (var j = hostile.pos.y - 1; j <= hostile.pos.y + 1; j++) {
                    if (j >= 0 && j <= 49 && i >= 0 && i <= 49) {

                        meleeCosts.set(i, j, 0xff)
                        repairerCosts.set(i, j, 0xff)
                    }
                }
            }
        }
        var if_include_ranged_attack = false;
        for (part of hostile.body) {
            if (part.type == RANGED_ATTACK) { if_include_ranged_attack = true; break; }
        }
        if (if_include_ranged_attack) {
            for (var i = hostile.pos.x - 3; i <= hostile.pos.x + 3; i++) {
                for (var j = hostile.pos.y - 3; j <= hostile.pos.y + 3; j++) {
                    if (j >= 0 && j <= 49 && i >= 0 && i <= 49) {
                        meleeCosts.set(i, j, 0xff)
                        repairerCosts.set(i, j, 0xff)
                    }
                }
            }
        }
    }

    // allowing melee to move on ramparts
    // and disallowing repairers to step on them
    ramparts = this.room.find(FIND_STRUCTURES, {
        filter:
            function (str) {
                return str.structureType === STRUCTURE_RAMPART
            }
    })
    for (ramp of ramparts) {
        meleeCosts.set(ramp.pos.x, ramp.pos.y, 1)
        repairerCosts.set(ramp.pos.x, ramp.pos.y, 0xff)
        if (ramp.pos.x >= this.pos.x) {// rampart is on right side of spawn -> add blocking edge on the right side
            if (this.memory.room_plan[ramp.pos.x + 1][ramp.pos.y] == 0) {
                meleeCosts.set(ramp.pos.x + 1, ramp.pos.y, 0xff)
                repairerCosts.set(ramp.pos.x + 1, ramp.pos.y, 0xff)
            }
        }
        else if (ramp.pos.x < this.pos.x) { // ramparts on the left side
            if (this.memory.room_plan[ramp.pos.x - 1][ramp.pos.y] == 0) {
                meleeCosts.set(ramp.pos.x - 1, ramp.pos.y, 0xff)
                repairerCosts.set(ramp.pos.x - 1, ramp.pos.y, 0xff)
            }
        }

        if (ramp.pos.y >= this.pos.y) {// rampart is on right side of spawn -> add blocking edge on the right side
            if (this.memory.room_plan[ramp.pos.x][ramp.pos.y + 1] == 0) {
                meleeCosts.set(ramp.pos.x, ramp.pos.y + 1, 0xff)
                repairerCosts.set(ramp.pos.x, ramp.pos.y + 1, 0xff)
            }
        }
        else if (ramp.pos.y < this.pos.y) {
            if (this.memory.room_plan[ramp.pos.x][ramp.pos.y - 1] == 0) {
                meleeCosts.set(ramp.pos.x, ramp.pos.y - 1, 0xff)
                repairerCosts.set(ramp.pos.x, ramp.pos.y - 1, 0xff)
            }
        }

    }



    /*
    //allowing to move on ramparts
    this.room.find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType === STRUCTURE_RAMPART) {
            // Favor roads over plain tiles
            meleeCosts.set(struct.pos.x, struct.pos.y, 1);
        }
    });*/



    var if_visualize = true

    if (if_visualize) {
        console.log("printing CM")
        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                if (meleeCosts.get(i, j) >= 255) {
                    this.room.visual.rect(i - 0.5, j - 0.5, 1, 1, {
                        fill: '#e60f00',
                        opacity: 0.2,
                    })
                }
                else {
                    this.room.visual.rect(i - 0.5, j - 0.5, 1, 1, {
                        fill: '#00e855',
                        opacity: 0.2,
                    })
                }
            }
        }
    }

    //this.memory.repairer_cost_matrix=meleeCosts.serialize()
    Game.rooms[this.room.name].memory.meleeCostMatrix = meleeCosts.serialize()
    Game.rooms[this.room.name].memory.repairerCostMatrix = repairerCosts.serialize()
    //this.memory.repairer_cost_matrix = meleeCosts;
}

function findTotalAttackPower(hostiles) {
    var total_attack_power = 0

    for (hostile of hostiles) {
        var hostile_attack_power = 0;
        for (body_part of hostile.body) {
            if (body_part.type == RANGED_ATTACK) {
                if (body_part.boost == undefined) {
                    hostile_attack_power += RANGED_ATTACK_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_KEANIUM_OXIDE) {
                    hostile_attack_power += RANGED_ATTACK_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_KEANIUM_ALKALIDE) {
                    hostile_attack_power += RANGED_ATTACK_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_KEANIUM_ALKALIDE) {
                    hostile_attack_power += RANGED_ATTACK_POWER * 4;
                }
            }
            else if (body_part.type == ATTACK) {
                if (body_part.boost == undefined) {
                    hostile_attack_power += ATTACK_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_UTRIUM_HYDRIDE) {
                    hostile_attack_power += ATTACK_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_UTRIUM_ACID) {
                    hostile_attack_power += ATTACK_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_UTRIUM_ACID) {
                    hostile_attack_power += ATTACK_POWER * 4;
                }
            }
            else if (body_part.type == WORK) {
                if (body_part.boost == undefined) {
                    hostile_attack_power += DISMANTLE_POWER;
                    continue;
                }
                else if (body_part.boost == RESOURCE_ZYNTHIUM_HYDRIDE) {
                    hostile_attack_power += DISMANTLE_POWER * 2;
                }
                else if (body_part.boost == RESOURCE_ZYNTHIUM_ACID) {
                    hostile_attack_power += DISMANTLE_POWER * 3;
                }
                else if (body_part.boost == RESOURCE_CATALYZED_ZYNTHIUM_ACID) {
                    hostile_attack_power += DISMANTLE_POWER * 4;
                }
            }

        }
        total_attack_power += hostile_attack_power;
    }
    this.room.visual.text("Total attack power: " + total_attack_power, 20, 1, { color: '#fc03b6' })
    if (total_attack_power > 0) {
        this.memory.total_attack_power = total_attack_power
    }
    else {
        this.memory.total_attack_power = undefined
    }
}
function findWeakestRanged(ranged_invaders) {
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
}
