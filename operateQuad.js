const { groupBy, range, inRange } = require("lodash");
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");


const ERR_NOT_IN_FULL_RANGE = -20
const DAMAGE_MATRIX_FACTOR = 10

function isQuadPacked(creeps) {
    if (creeps == undefined) { return false }
    if (creeps.length !== 4) return false
    for (let i = 0; i < creeps.length; i++) {
        for (let j = i + 1; j < creeps.length; j++) {
            var creep_a = Game.getObjectById(creeps[i])
            var creep_b = Game.getObjectById(creeps[j])
            if (creep_a != null && creep_b != null && !creep_a.pos.isNearTo(creep_b.pos)) return false
        }
    }
    return true
}

function transformCosts(quad, costs, roomName, swampCost = 5, plainCost = 1) {

    //console.log("transformCost")
    const terrain = Game.map.getRoomTerrain(roomName)
    const result = new PathFinder.CostMatrix()
    const formationVectors = [
        { x: 0, y: 0 }, // top-left
        { x: 1, y: 0 }, // top-right
        { x: 0, y: 1 }, // bottom-left
        { x: 1, y: 1 }, // bottom-right
    ]

    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            let cost = undefined

            for (let vector of formationVectors) {
                const newX = x + vector.x
                const newY = y + vector.y

                if (newX < 0 || newX > 49 || newY < 0 || newY > 49) {
                    continue
                }

                let newCost = costs.get(newX, newY)

                if (newCost === 0) {
                    const terrainMask = terrain.get(newX, newY)
                    if (terrainMask === TERRAIN_MASK_WALL) {
                        newCost = 255
                    } else if (terrainMask === TERRAIN_MASK_SWAMP) {
                        newCost = swampCost
                    } else {
                        newCost = plainCost
                    }
                }

                if (cost === undefined) {
                    cost = newCost
                } else {
                    cost = Math.max(cost, newCost)
                }
            }

            result.set(x, y, cost)
        }
    }

    Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD/* || !struct.my */)) {
            // Can't walk through non-walkable buildings
            result.set(struct.pos.x, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y - 1, 255);
            result.set(struct.pos.x, struct.pos.y - 1, 255);
        }
        /*
        else if ((struct.structureType == STRUCTURE_RAMPART || struct.structureType == STRUCTURE_WALL) && !struct.my) {
            result.set(struct.pos.x, struct.pos.y, struct.hits / struct.hitsMax);
        }*/

    });

    Game.rooms[roomName].find(FIND_CREEPS).forEach(function (creep) {
        if (!quad.members.includes(creep.id)) {

            result.set(creep.pos.x, creep.pos.y, 255);
            result.set(creep.pos.x - 1, creep.pos.y, 255);
            result.set(creep.pos.x - 1, creep.pos.y - 1, 255);
            result.set(creep.pos.x, creep.pos.y - 1, 255);
        }
    });

    //adding towers and ramparts costs and hostileCreepsCost
    if (roomName == quad.target_room) {
        var rampartsCM = undefined
        if (quad.rampartsCM != undefined) {
            rampartsCM = new PathFinder.CostMatrix
            rampartsCM = PathFinder.CostMatrix.deserialize(quad.rampartsCM)
        }
        var towersCM = undefined
        if (quad.towerDamageCM != undefined) {
            towersCM = new PathFinder.CostMatrix
            towersCM = PathFinder.CostMatrix.deserialize(quad.towerDamageCM)
        }
        var hostilesCM = undefined
        if (quad.hostilesCM != undefined) {
            hostilesCM = new PathFinder.CostMatrix
            hostilesCM = PathFinder.CostMatrix.deserialize(quad.hostilesCM)
        }

        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                var currentCost = result.get(i, j)
                var towerCost = 0;
                var rampartCost = 0;
                var hostileCost = 0
                if (towersCM != undefined) {
                    towerCost = towersCM.get(i, j)
                }

                if (rampartsCM != undefined) {
                    rampartCost = rampartsCM.get(i, j)
                }

                if (hostilesCM != undefined) {
                    hostileCost = hostilesCM.get(i, j)
                }

                if (rampartCost != 0) {
                    /*
                    console.log("current cost: ", currentCost)
                    console.log("towerCost: ", towerCost)
                    console.log("rampartsCost: ", rampartCost)
                    console.log("hostileCost: ", hostileCost)
                    */
                }
                var currentCost = result.get(i, j)
                result.set(i, j, Math.max(currentCost, Math.min(currentCost + towerCost + rampartCost + hostileCost, 255)))
                /*
                if (currentCost != 255) {
                    console.log("cost at: ", i, " ", j, Math.max(currentCost, Math.min(currentCost + towerCost + rampartCost + hostileCost, 255)))
                    console.log("current Cost: ", currentCost, " Math.max(): ", Math.max(currentCost, Math.min(currentCost + towerCost + rampartCost + hostileCost, 255)))
                }
                */

            }
        }
    }


    // debuggin - showing overall costmatrix
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            var tileCost = result.get(i, j)
            if (tileCost > 1 && i == 19) {
                //console.log(i, " ", j, " tileCost: ", tileCost)
            }
            if (Game.rooms[roomName] != undefined) {
                //if (i > 5 && i < 25 && j > 18 && j < 30 || true) {
                //Game.rooms[quad.target_room].visual.rect(i - 0.5, j - 0.5, 1, 1, { fill: 'red', opacity: (tileCost / 255) * 0.7 })
                //Game.rooms[roomName].visual.text(tileCost, i, j, { font: 0.5 })
                //}
                //
            }

        }
    }



    return result
}

function moveQuad(quad, targetPos, reusePath = 5, myRange = 1, myFlee = false) {

    //if all can move - fatique==0
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        if (cr.fatigue > 0) { return -11 }
    }

    var topLeft = Game.getObjectById(quad.topLeftId);
    if (topLeft == null) { return -1; }

    if (topLeft.pos.isNearTo(targetPos) && myFlee == false) { return }
    if (quad.lastTargetPos != targetPos) {
        quad.lastTargetPos = targetPos;
        quad.path = undefined
    }


    var movePath;
    if (Game.time % reusePath == 0 || quad.path == undefined || (topLeft.pos.x == 49 || topLeft.pos.y == 49 || topLeft.pos.x == 0 || topLeft.pos.y == 0)) {

        console.log("Calculating path for quad")
        console.log("topLeft.pos: ", topLeft.pos)
        console.log("target.pos: ", targetPos)
        const path = PathFinder.search(
            topLeft.pos,
            { pos: targetPos, range: myRange },
            //{ range: 1 },
            {
                flee: myFlee,
                plainCost: 1,
                swampCost: 5,
                maxRooms: 64,
                maxOps: 4000,
                //roomCallback: () => costMatrix,
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) { return; }
                    const existingCostMatrix = new PathFinder.CostMatrix;
                    const terrain = room.getTerrain()
                    const costMatrix = transformCosts(quad, existingCostMatrix, roomName)
                    return costMatrix
                }
            },
        )
        quad.path = path;
    }

    movePath = quad.path.path;
    if (movePath != undefined) {
        //topLeft.say(movePath.length)
        myStroke = 'red'
        if (myFlee) {
            myStroke = 'yellow'
        }
        for (p of movePath) {
            // if (p.roomName == topLeft.room.name) {
            if (Game.rooms[p.roomName] != undefined) {
                Game.rooms[p.roomName].visual.circle(p.x, p.y, { fill: 'transparent', radius: 0.55, stroke: myStroke })
            }

            //}
        }

        var direction = topLeft.pos.getDirectionTo(movePath[0])
        console.log("quad is moving from: ", topLeft.pos, " to ", movePath[0])

        if (movePath != undefined && movePath.length>0) {
            structuresAtPath = topLeft.room.lookForAt(LOOK_STRUCTURES, movePath[0].x, movePath[0].y)
            isBlocked = false;
            for (s of structuresAtPath) {
                if (s.my == false && (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL)) {
                    isBlocked = true;
                    quad.path = undefined
                    return -13;//path in reality is blocked by rampart/wall
                }
            }
        }

        //topLeft.say(direction)
        //topLeft.say(movePath.length)
        var move_result = 0;
        for (q of quad.members) {
            cr = Game.getObjectById(q)
            if (cr == null) { continue }

            //cr.say(cr.move(direction))

            move_result += cr.move(direction)
            //cr.say(cr.move(direction))
        }
        if (move_result > 0 && move_result % 11 != 0) {
            quad.path = undefined
        }
        else if (move_result == 0) {

            movePath.shift()
            return move_result
        }
    }
    else {
        console.log("Path is undefined")
    }



}

function quadRetreat(quad, position, range = 30) {
    console.log("retreating1")
    retreatResult = moveQuad(quad, position, 1, range, true)
    console.log("retreatResult: ", retreatResult)
}

function quadRangedAttack(quad, target) {
    var resultSum = 0;
    var result = 0;
    var notInRange = false
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        result = cr.rangedAttack(target)
        resultSum += result
        if (result == ERR_NOT_IN_RANGE) { notInRange = true; }
        else if (result == ERR_INVALID_TARGET) { return ERR_INVALID_TARGET }
    }
    if (resultSum == 0) { return OK }
    else if (resultSum > 0 && resultSum < 36 && resultSum % 9 == 0) { return ERR_NOT_IN_FULL_RANGE }
    else if (notInRange == true) { return ERR_NOT_IN_RANGE }
}

function quadRangedMassAttack(quad, target = undefined) {
    var result = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        /*
        if(target!=undefined && cr.pos.isNearTo(target))
        {
            result=cr.rangedMassAttack();
        }
        else{
            result = cr.rangedAttack(target);
        }
        */

        result = cr.rangedMassAttack();
    }
    if (result == 0) { return OK; }
}

function quadEqualHeal(quad) {
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        cr.heal();
    }
}

function quadHeal(quad, target) {
    var ranged_res = OK;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        var res = cr.heal(target)
        if (res == ERR_NOT_IN_RANGE) {
            ranged_res = cr.rangedHeal(target)
        }
        if (ranged_res == ERR_NOT_IN_RANGE) { }
    }
    return ranged_res;
}

function quadMinHeal(quad) {
    var minHealth = 1;
    var minHealthId = null
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        if (cr.hits / cr.hitsMax < minHealth) {
            minHealth = cr.hits / cr.hitsMax
            minHealthId = q;
        }
    }

    return minHealthId
}

function quadSelfHeal(quad) {
    var minHeal = quadMinHeal(quad)
    //console.log("quad equal healing")
    if (minHeal == null) {
        quadEqualHeal(quad)
    }
    else {
        //console.log("quad is healing ", minHeal)
        quadHeal(quad, Game.getObjectById(minHeal))
    }
}

function quadHealPower(quad) {
    var healPower = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        healPower += _.filter(cr.body, { type: HEAL }).length * HEAL_POWER;
    }
    return healPower
}

function quadHits(quad) {
    var hits = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        hits += cr.hits;
    }
    return hits
}

function quadHitsMax(quad) {
    var hitsMax = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        hitsMax += cr.hitsMax;
    }
    return hitsMax;
}



function quadNearTo(quad, target) {
    var nearCounter = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        {
            if (cr.pos.isNearTo(target.pos.x, target.pos.y) == true) { nearCounter++; }
        }
    }
    if (nearCounter >= 2) { return true }
    return false;
}


//calculates damage on quad target room
function calculateTowersDamage(quad, towers) {
    //console.log("calculating towers damage")
    if (towers.length < 1) { return -1; }

    if (quad.towerDamageCM == undefined || true) {
        const damageMatrix = new PathFinder.CostMatrix
        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                totalDamage = 0;
                for (t of towers) {
                    let distance = t.pos.getRangeTo(i, j)
                    let towerDamage = 0;
                    if (distance <= 5) { towerDamage = TOWER_POWER_ATTACK; }
                    else if (distance >= 20) { towerDamage = TOWER_POWER_ATTACK / 4; }
                    else {
                        const falloffPerUnit = (TOWER_POWER_ATTACK - TOWER_POWER_ATTACK / 4) / (20 - 5);
                        totalDamage = TOWER_POWER_ATTACK - falloffPerUnit * (distance - 5);
                        //towerDamage = ((TOWER_POWER_ATTACK - (TOWER_POWER_ATTACK / 4)) / (20 - 5)) * distance;
                    }
                    totalDamage += towerDamage;
                    //console.log("distance to tower: ", distance, " at: ", i, " ", j, " -> damage= ", totalDamage)
                }
                tileCost = (totalDamage / (TOWER_POWER_ATTACK * towers.length)) * DAMAGE_MATRIX_FACTOR

                damageMatrix.set(i, j, tileCost)

                //debugging - coloring room
                //Game.rooms[quad.target_room].visual.rect(i - 0.5, j - 0.5, 1, 1, { fill: 'red', opacity: tileCost })
                //console.log("tileCost at (", i, ":", j, ") => ", tileCost)
                //Game.rooms[quad.target_room].visual.text(totalDamage, i, j)
            }
        }
        quad.towerDamageCM = damageMatrix.serialize();
    }
    return 0;
}

function caluclateRampartsCosts(quad, structures) {
    if (structures.length < 1) { return -1; }
    if (quad.rampartsCM == undefined || true) {
        const rampartsMatrix = new PathFinder.CostMatrix
        for (s of structures) {
            str = Game.getObjectById(s)
            if (str == null) { continue }
            if (str.structureType == STRUCTURE_RAMPART || str.structureType == STRUCTURE_WALL) {
                var tileCost = (str.hits / str.hitsMax) * DAMAGE_MATRIX_FACTOR

                rampartsMatrix.set(str.pos.x, str.pos.y, tileCost)
                //Game.rooms[quad.target_room].visual.rect(str.pos.x - 0.5, str.pos.y - 0.5, 1, 1, { fill: 'blue', opacity: tileCost })
                //Game.rooms[quad.target_room].visual.text(tileCost,i,j)
            }
        }
        quad.rampartsCM = rampartsMatrix.serialize();

    }
}


//Calculates heal power of weakest creep in quad (the one with least HEAL parts) and heal power of all of them
function calculateHealPower(quad) {
    var minHealPower = 999999//heal power of weakest creep
    var totalHealPower = 0;//heal power of whole quad
    var minHp = Infinity;//Finds weakest hitsMax - creep with minimum hitsMax
    for (m of quad.members) {
        member = Game.getObjectById(m)
        if (member == null) { continue }
        if (_.filter(member.body, { type: HEAL }).length * HEAL_POWER < minHealPower) { minHealPower = _.filter(member.body, { type: HEAL }).length * HEAL_POWER }
        if (member.hitsMax < minHp) { minHp = member.hitsMax }
        totalHealPower += _.filter(member.body, { type: HEAL }).length * HEAL_POWER

    }
    quad.minHealPower = minHealPower;
    quad.totalHealPower = totalHealPower;
    quad.minHp = minHp;
}

function getRangedAttackPower(body) {
    var attackSum = 0;
    for (b of body) {
        if (b.type == RANGED_ATTACK) {
            if (b.boost == undefined) {
                attackSum += RANGED_ATTACK_POWER;
                continue;
            }
            else if (b.boost == RESOURCE_KEANIUM_OXIDE) {
                attackSum += RANGED_ATTACK_POWER * 2;
            }
            else if (b.boost == RESOURCE_KEANIUM_ALKALIDE) {
                attackSum += RANGED_ATTACK_POWER * 3;
            }
            else if (b.boost == RESOURCE_CATALYZED_KEANIUM_ALKALIDE) {
                attackSum += RANGED_ATTACK_POWER * 4;
            }
        }
    }
    return attackSum
}
function getAttackPower(body) {
    var attackSum = 0;
    for (b of body) {
        if (b.type == ATTACK) {
            if (b.boost == undefined) {
                attackSum += ATTACK_POWER;
                continue;
            }
            else if (b.boost == RESOURCE_UTRIUM_HYDRIDE) {
                attackSum += ATTACK_POWER * 2;
            }
            else if (b.boost == RESOURCE_UTRIUM_ACID) {
                attackSum += ATTACK_POWER * 3;
            }
            else if (b.boost == RESOURCE_CATALYZED_UTRIUM_ACID) {
                attackSum += ATTACK_POWER * 4;
            }
        }
    }
    return attackSum
}

function calculateHostileCreepsCost(quad, hostiles) {
    if (hostiles.length < 1) { return -1; }
    if (quad.hostilesCM == undefined || true) {
        const hostilesMatrix = new PathFinder.CostMatrix
        console.log("hostiles.length: ", hostiles.length)
        for (h of hostiles) {
            //TODO add counting boosted body parts
            var meleeAttack = getAttackPower(h.body)

            var rangedAttack = getRangedAttackPower(h.body)
            var maxAttack = 200 * ATTACK_POWER
            var maxRangedAttack = 200 * RANGED_ATTACK_POWER

            if (meleeAttack >= quad.minHp + quad.minHealPower)//quad member will het one shoted by enemy creep 
            {
                console.log("Melle will oneShot me")
                for (var i = h.pos.x - 2; i <= h.pos.x + 1; i++) {
                    for (var j = h.pos.y - 2; j <= h.pos.y + 1; j++) {
                        hostilesMatrix.set(i, j, 255)
                    }
                }

                /*
                for (var i = -1; i <= 1; i++) {
                    for (var j = -1; j <= 1; j++) {
                        hostilesMatrix.set(h.pos.x + i, h.pos.y + j, 255)
                    }
                }
                    */
            }
            else if (meleeAttack > 0) {

                var tileCost = (meleeAttack / maxAttack) * DAMAGE_MATRIX_FACTOR
                console.log("Melle will not oneShot me: ", tileCost)
                console.log("meleeAttack: ", meleeAttack)
                console.log("quad can take: ", quad.minHp + quad.minHealPower, " damage")

                // -2 in this loop because additional tile for quad
                for (var i = h.pos.x - 2; i <= h.pos.x + 1; i++) {
                    for (var j = h.pos.y - 2; j <= h.pos.y + 1; j++) {
                        var currentCost = hostilesMatrix.get(i, j)
                        hostilesMatrix.set(i, j, currentCost + tileCost)
                    }
                }
                /*
            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    hostilesMatrix.set(h.pos.x + i, h.pos.y + j, tileCost)
                }
            }
                */

            }

            const RANGED_ATTACK_RANGE = 3
            if (rangedAttack >= quad.minHp + quad.minHealPower)//quad member will het one shoted by enemy creep (RANGED_ATTACK)
            {
                console.log("Ranged will oneShot me: ", 255)
                console.log("rangedAttack: ", rangedAttack)
                console.log("quad.minHp + quad.minHealPower = ", quad.minHp, " + ", quad.minHealPower, quad.minHp + quad.minHealPower)
                for (var i = h.pos.x - RANGED_ATTACK_RANGE; i <= h.pos.x + RANGED_ATTACK_RANGE; i++) {
                    for (var j = h.pos.y - RANGED_ATTACK_RANGE; j <= h.pos.y + RANGED_ATTACK_RANGE; j++) {
                        hostilesMatrix.set(i, j, 255)
                    }
                }

            }
            else if (rangedAttack > 0) {
                var tileCost = (rangedAttack / maxRangedAttack) * DAMAGE_MATRIX_FACTOR
                console.log("Ranged will not oneShot me: ", tileCost)
                console.log("RangedAttackPower: ", rangedAttack, " quad can take: ", quad.minHp + quad.minHealPower)
                for (var i = h.pos.x - RANGED_ATTACK_RANGE; i <= h.pos.x + RANGED_ATTACK_RANGE; i++) {
                    for (var j = h.pos.y - RANGED_ATTACK_RANGE; j <= h.pos.y + RANGED_ATTACK_RANGE; j++) {
                        var currentCost = hostilesMatrix.get(i, j)
                        hostilesMatrix.set(i, j, Math.min(255, currentCost + tileCost))
                    }
                }
            }


        }
        quad.hostilesCM = hostilesMatrix.serialize()
    }
}

function findTargetStructure(quad, structures, room) {

    if (structures == undefined || structures.length < 1) {
        return -1;
    }
    //console.log("quad: ", quad.id, " is searching for targetStructure")
    if (room == undefined) { room = quad.target_room }
    var targetStructure = null
    var minHits = Infinity
    //var auxStructures=[];

    for (str of structures) {
        var isCovered = false;
        var s = Game.getObjectById(str)
        if (s == null) { continue }
        var type = s.structureType
        if (type != STRUCTURE_RAMPART && type != STRUCTURE_CONTROLLER) {
            structuresAt = Game.rooms[room].lookForAt(LOOK_STRUCTURES, s.pos)
            var rampHits = 0
            for (at of structuresAt) {
                if (at.structureType == STRUCTURE_RAMPART) {
                    rampHits = at.hits

                    //auxStructures.push({id:myHits})
                }
            }
            id = s.id
            myHits = rampHits + s.hits
            if (myHits < minHits) {
                minHits = myHits
                targetStructure = s
            }
        }

    }
    if (targetStructure == null) {
        return -1
    }
    return targetStructure
}

function findTargetCreepInRange(quad, hostiles) {// finds creep in range of RangedAttack which is not  protected by ramparts
    var target = null
    var distance = 3
    for (m of quad.members) {
        var member = Game.getObjectById(m)
        var closeNotCovered = []
        if (member == null) { continue }


        for (h of hostiles) {
            var isCovered = false
            var inRange = false;

            if (member.pos.getRangeTo(h) < distance) { inRange = true; }

            if (inRange) {
                var str = member.room.lookForAt(LOOK_STRUCTURES, h.pos.x, h.pos.y)
                for (s of str) {
                    if (s.structureType == STRUCTURE_RAMPART) {
                        isCovered = true
                        break;
                    }
                }
                if (isCovered == false) {
                    closeNotCovered.push(h)
                    //console.log("adding enemy creep in range: ",h," at ",h.pos," range: ",member.pos.getRangeTo(h))
                }
            }

        }

        if (closeNotCovered.length > 0) {
            //console.log("found: ",member.pos.findClosestByRange(closeNotCovered))
            return member.pos.findClosestByRange(closeNotCovered)
        }
    }
    return target;
}


Spawn.prototype.operateQuad = function operateQuad(quad) {

    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    console.log("quad.id: ", quad.id)

    if (quad.members != undefined && quad.members.length >= 4) {
        quad.completed = true
        while (quad.members.length > 4) { quad.members.pop() }
    }

    if (topLeft == null && topRight != null) {
        topLeft = topRight
        quad.topLeftId = quad.topRightId

        topRight = bottomRight
        quad.topRightId = quad.bottomRightId

        bottomRight = bottomLeft
        quad.bottomRightId = quad.bottomLeftId

        bottomLeft = undefined
        quad.bottomLeftId = undefined

    }


    /*
    if (quad.completed == true && (topLeft == null || topRight == null || bottomLeft == null || bottomRight == null)) {
        console.log("clearing quad data")


        if (topLeft != null) {
            //topLeft.suicide(); quad.topLeftId = undefined
        }
        if (topRight != null) { topRight.suicide(); quad.topRightId = undefined }
        if (bottomLeft != null) { bottomLeft.suicide(); quad.bottomLeftId = undefined }
        if (bottomRight != null) { bottomRight.suicide(); quad.bottomRightId = undefined }

        quad.topLeftId = undefined
        quad.topRightId = undefined
        quad.bottomLeftId = undefined
        quad.bottomRightId = undefined
        quad.members = [];
        quad.completed = false;
        quad.packed = false;

        return
    }

    if (quad.members == undefined) {
        quad.members = [];
    }

    if (topLeft == null) {
        console.log("quad: topLeft==null")
        return
    }
        */

    //checking if quad is dead
    var dead_counter = 0;
    if (quad.members != undefined && quad.members.length > 0) {
        for (m of quad.members) {
            if (Game.getObjectById(m) == null) { dead_counter++; }
        }
    }

    //console.log("DEAD COUNTER: ",dead_counter)
    if (dead_counter == 4 || topLeft == null) {
        //console.log("quad is dead")
        quad.members = [];
        quad.packed = false;
        quad.completed = false;
        quad.topLeftId = undefined;
        quad.topRightId = undefined;
        quad.bottomLeftId = undefined;
        quad.bottomRightId = undefined;
        quad.minEnergyOnCreep = -1;
        quad.towerDamageCM = undefined;
        quad.rampartsCM = undefined;
        return
    }

    quadSelfHeal(quad)

    if (!isQuadPacked(quad.members)) {

        console.log("grouping 1")
        if (topLeft.pos.x > 0 && topLeft.pos.x < 47 && topLeft.pos.y > 0 && topLeft.pos.y < 47) {
            console.log("grouping 2")
            if (quad.grouping_pos == undefined) {
                var seeds = [];
                seeds.push(topLeft.pos);
                let roomCM = new PathFinder.CostMatrix;
                //setting roomCM with terrain data
                const terrain = new Room.Terrain(topLeft.room.name);
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (terrain.get(i, j) == 1) {
                            roomCM.set(i, j, 255);
                        }
                    }
                }

                var myOtherCreeps = topLeft.room.find(FIND_MY_CREEPS, {
                    filter: function (cr) {
                        return !quad.members.includes(cr.id)
                    }
                })

                for (other of myOtherCreeps) {
                    roomCM.set(other.pos.x, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y - 1, 255)
                    roomCM.set(other.pos.x, other.pos.y - 1, 255)
                }

                /*
                var structures = topLeft.room.find(FIND_STRUCTURES, {
                    filter: function (str) {
                        return str.structureType != STRUCTURE_ROAD && str.structureType!=STRUCTURE_RAMPART && str.structureType!=STRUCTURE_WALL
                    }
                })

                for (s of structures) {
                    roomCM.set(s.pos.x, s.pos.y, 255)
                    roomCM.set(s.pos.x - 1, s.pos.y, 255)
                    roomCM.set(s.pos.x - 1, s.pos.y - 1, 255)
                    roomCM.set(s.pos.x, s.pos.y - 1, 255)
                }
                    */

                var floodCM = topLeft.room.floodFill(seeds);
                let distanceCM = topLeft.room.diagonalDistanceTransform(roomCM, false);
                var min_distance = Infinity
                grouping_pos = new RoomPosition(25, 25, topLeft.room.name)
                for (let i = 3; i < 47; i++) {
                    for (let j = 3; j < 47; j++) {
                        if (distanceCM.get(i, j) >= 3 && floodCM.get(i, j) < min_distance) {
                            min_distance = floodCM.get(i, j);
                            grouping_pos.x = i;
                            grouping_pos.y = j;
                        }
                    }
                }
                quad.grouping_pos = grouping_pos
            }
        }
        else {
            console.log("grouping3")
            topLeft.moveTo(new RoomPosition(25, 25, quad.target_room))
        }


        quad.path = false

        console.log("grouping position: ", quad.grouping_pos)
        if (topLeft != null && quad.grouping_pos != undefined) {
            topLeft.say(quad.grouping_pos.x + " " + quad.grouping_pos.y)
            topLeft.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (topRight != null && quad.grouping_pos != undefined) {
            topRight.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (bottomLeft != null && quad.grouping_pos != undefined) {
            bottomLeft.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }
        if (bottomRight != null && quad.grouping_pos != undefined) {
            bottomRight.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }

        return

    }
    else {
        quad.grouping_pos = undefined
        console.log("quad: ", quad.id, " is grouped")
    }



    /*
        */
    //END OF DEBUGGING
    ////


    var currentRoom = topLeft.room.name
    if (currentRoom == quad.target_room) {



        var hostileCreeps = [] // just not mine/allied creeps
        var hostileNotProtectedCreeps = [] // hostile creeps, not under rampart and in quad range
        for (h of Game.rooms[currentRoom].memory.hostiles) {
            var hos = Game.getObjectById(h)
            if (hos != null) {
                hostileCreeps.push(hos)
                if (hos.pos.inRangeTo(topLeft.pos.x, topLeft.pos.y, 3) || hos.pos.inRangeTo(topLeft.pos.x + 1, topLeft.pos.y, 3)
                    || hos.pos.inRangeTo(topLeft.pos.x, topLeft.pos.y + 1, 3) || hos.pos.inRangeTo(topLeft.pos.x + 1, topLeft.pos.y + 1, 3)) {
                    hostileNotProtectedCreeps.push(hos)
                    //console.log("hos in range: ", h)
                }
            }

        }
        var hostilesFound = false
        if (hostileCreeps.length > 0) { hostilesFound = true }

        var hostileStructures = Game.rooms[currentRoom].memory.hostileStructures;
        //console.log("hostileStructures.length: ", hostileStructures.length)
        var towers = []
        var extensions = []
        var spawns = []
        var ramparts = []

        for (str of hostileStructures) {
            aux = Game.getObjectById(str)
            if (aux == null) {
                //console.log("skipping: ", str);
                continue;
            }
            if (aux.structureType == STRUCTURE_TOWER) {
                towers.push(aux)
            }
            else if (aux.structureType == STRUCTURE_EXTENSION) {
                extensions.push(aux)
            }
            else if (aux.structureType == STRUCTURE_SPAWN) {
                spawns.push(aux)
            }
            else if (aux.structureType == STRUCTURE_RAMPART) {
                ramparts.push(aux)
            }
        }

        //var target = null;

        calculateHealPower(quad)
        calculateTowersDamage(quad, towers)
        caluclateRampartsCosts(quad, hostileStructures)
        calculateHostileCreepsCost(quad, hostileCreeps)



        if (quad.targetStructureId == undefined || Game.time % 7 == 0 || Game.getObjectById(quad.targetStructureId) == null) {
            var aux = findTargetStructure(quad, hostileStructures, currentRoom)
            if (aux != -1) {
                quad.targetStructureId = aux.id
            }
            else {
                quad.targetStructureId = undefined
            }
        }

        var target = undefined
        if (quad.targetStructureId != undefined) {
            target = Game.getObjectById(quad.targetStructureId)
        }


        var targetCreep = findTargetCreepInRange(quad, hostileCreeps)

        /*
         if(targetCreep!=null)
         {
             console.log("targeting creep")
         }
             */

        if (targetCreep != null) { target = targetCreep }

        if (target != null) {


            console.log("quad: ", quad.id, " is targeting: ", target, " at: ", target.pos)

            topLeft.say(quadRangedMassAttack(quad, target))
            //console.log("quad is attacking: ", target, " result ", quadRangedAttack(quad, target))
            if ((quadRangedAttack(quad, target) == ERR_NOT_IN_RANGE || quadNearTo(quad, target) == false) && quadHits(quad) >= quadHitsMax(quad) - quadHealPower(quad)) {
                moveQuad(quad, target.pos)
            }
            else if (quadNearTo(quad, target)) {
                quadRangedMassAttack(quad, target)
            }
        }
        var allies_present = false;


        console.log(quad.id, " hits: ", quadHits(quad), " / ", quadHitsMax(quad))
        if (quadHits(quad) < quadHitsMax(quad) && (quadHitsMax(quad) - quadHits(quad)) > quadHealPower(quad)) {
            topLeft.say("retreat")
            quadRetreat(quad, target.pos)
        }
    }
    else if (quadHits(quad) >= quadHitsMax(quad) - quadHealPower(quad)) {
        moveQuad(quad, new RoomPosition(25, 25, quad.target_room))
    }

    if (Game.rooms[currentRoom].memory.allies_present == undefined || Game.rooms[currentRoom].memory.allies_present.length < 0) {
        //quadRangedMassAttack(quad)
    }


    //moving to flag
    //moveQuad(quad, Game.flags["quad"])

    //running from flag
    if (Game.flags["quadFlee"] != undefined) {
        topLeft.say("flee")
        //quadRetreat(quad, Game.flags["quadFlee"].pos)
    }

    if (topLeft.room.name != topLeft.memory.home_room.name) {
        quadRangedMassAttack(quad)
    }


}