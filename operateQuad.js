const { groupBy, range } = require("lodash");
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");

const ERR_NOT_IN_FULL_RANGE = -20

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
        if (struct.structureType === STRUCTURE_ROAD) {
            // Favor roads over plain tiles
            //costs.set(struct.pos.x, struct.pos.y, 1);
        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART ||
                !struct.my)) {
            // Can't walk through non-walkable buildings
            result.set(struct.pos.x, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y - 1, 255);
            result.set(struct.pos.x, struct.pos.y - 1, 255);
        }
        else if ((struct.structureType == STRUCTURE_RAMPART || struct.structureType == STRUCTURE_WALL) && !struct.my) {
            result.set(struct.pos.x, struct.pos.y, struct.hits / struct.hitsMax);
        }
    });

    Game.rooms[roomName].find(FIND_CREEPS).forEach(function (creep) {
        if (!quad.members.includes(creep.id)) {

            result.set(creep.pos.x, creep.pos.y, 255);
            result.set(creep.pos.x - 1, creep.pos.y, 255);
            result.set(creep.pos.x - 1, creep.pos.y - 1, 255);
            result.set(creep.pos.x, creep.pos.y - 1, 255);
        }
    });

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

    if (topLeft.pos.isNearTo(targetPos)) { return }
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
        if (move_result > 0 && move_result%11!=0) {
            quad.path = undefined
        }
        else if (move_result == 0) {
            movePath.shift()
        }
    }
    else {
        console.log("Path is undefined")
    }



}

function quadRetreat(quad, position) {
    console.log("retreating1")
    moveQuad(quad, position, 1, 20, true)
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

function quadRangedMassAttack(quad) {
    var result = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

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
    if (minHeal == null) {
        quadEqualHeal(quad)
    }
    else {
        quadHeal(quad, Game.getObjectById(minHeal))
    }
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
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        {
            if (cr.pos.isNearTo(target.pos.x, target.pos.y) == true) { return true; }
        }
    }
    return false;
}



Spawn.prototype.operateQuad = function operateQuad(quad) {

    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (quad.completed == true && (topLeft == null || topRight == null || bottomLeft == null || bottomRight == null)) {
        console.log("clearing quad data")

        if (topLeft != null) {
            topLeft.suicide(); quad.topLeftId = undefined
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

    //checking if quad is dead
    var dead_counter = 0;
    for (m of quad.members) {
        if (Game.getObjectById(m) == null) { dead_counter++; }
    }
    if (dead_counter == 4) {
        console.log("quad is dead")
        quad.members = [];
        quad.packed = false;
        quad.completed = false;
        quad.topLeftId = undefined;
        quad.topRightId = undefined;
        quad.bottomLeftId = undefined;
        quad.bottomRightId = undefined;
    }

    if (quad.packed != true) {
        if (quad.members.length >= 4) {
            quad.completed = true
        }
        if (topLeft != null /* && creep.id == topLeft.id */) {
            topLeft.say("TL")
            topLeft.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (topRight != null /* && creep.id == topRight.id */) {
            topRight.say("BL")
            topRight.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }
        if (bottomLeft != null /* && creep.id == bottomLeft.id */) {
            bottomLeft.say("TR")
            bottomLeft.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (bottomRight != null /* && creep.id == bottomRight.id */) {
            bottomRight.say("BR")
            bottomRight.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }
        //}


        if (isQuadPacked(quad.members) == true) {
            quad.packed = true;
        }
    }
    if (!quad.packed || !quad.completed) {
        return;
    }

    if (!isQuadPacked(quad.members)) {

        if (quad.completed && topLeft.pos.x > 1 && topLeft.pos.x < 48 && topLeft.pos.y > 1 && topLeft.pos.y < 48 && topLeft != null) {
            topLeft.say("Grouping")
            if (topRight != null) {
                topRight.moveTo(new RoomPosition(topLeft.pos.x + 1, topLeft.pos.y, topLeft.pos.roomName))
                topRight.say("TR")
            }
            if (bottomLeft != null) {
                bottomLeft.moveTo(new RoomPosition(topLeft.pos.x, topLeft.pos.y + 1, topLeft.pos.roomName))
                bottomLeft.say("bl")
            }
            if (bottomRight != null) {
                bottomRight.moveTo(new RoomPosition(topLeft.pos.x + 1, topLeft.pos.y + 1, topLeft.pos.roomName))
                bottomRight.say("br")
            }

            quad.path = false
            return;
        }
        else {
            console.log("grouping 2")
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

            var floodCM = topLeft.room.floodFill(seeds);
            let distanceCM = topLeft.room.diagonalDistanceTransform(roomCM, false);
            var min_distance = Infinity
            grouping_pos = new RoomPosition(25, 25, topLeft.room.name)
            for (let i = 2; i < 48; i++) {
                for (let j = 2; j < 48; j++) {
                    if (distanceCM.get(i, j) >= 2 && floodCM.get(i, j) < min_distance) {
                        min_distance = floodCM.get(i, j);
                        grouping_pos.x = i;
                        grouping_pos.y = j;
                    }
                }
            }
            console.log("grouping position: ", grouping_pos)
            topLeft.moveTo(grouping_pos)
        }
    }



    /*
    for (q of quad.members) {
        if (quad.members.length >= 4) {
            quad.completed = true
        }
        creep = Game.getObjectById(q)
        if (creep == null) { continue }
        if (topLeft != null && creep.id == topLeft.id) {
            creep.say("TL")
            //creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (topRight != null && creep.id == topRight.id) {
            creep.say("BL")
            //creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }
        if (bottomLeft != null && creep.id == bottomLeft.id) {
            creep.say("TR")
            //creep.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName))
        }
        if (bottomRight != null && creep.id == bottomRight.id) {
            creep.say("BR")
            //creep.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
        }
    }
        */
    //END OF DEBUGGING
    ////


    var currentRoon = topLeft.room.name
    if (currentRoon == quad.target_room) {


        var hostileCreeps = []
        for (h of Game.rooms[currentRoon].memory.hostiles) {
            if (Game.getObjectById(h) != null) {
                hostileCreeps.push(Game.getObjectById(h))
            }
        }
        var hostilesFound = false
        if (hostileCreeps.length > 0) { hostilesFound = true }

        var hostileStructures = Game.rooms[currentRoon].memory.hostileStructures;

        var towers = []
        var extensions = []
        var spawns = []

        for (str in hostileStructures) {
            aux = Game.getObjectById(str)
            if (aux == null) { continue; }
            if (aux.structureType == STRUCTURE_TOWER) {
                towers.push(aux)
            }
            else if (aux.structureType == STRUCTURE_EXTENSION) {
                extensions.push(aux)
            }
            else if (aux.structureType == STRUCTURE_SPAWN) {
                spawns.push(aux)
            }
        }

        var target = null;
        if (hostileStructures.length > 0) {
            target = topLeft.pos.findClosestByPath(towers)
            if (target == null) {
                target = topLeft.pos.findClosestByPath(towers)
            }
            if (target == null) {
                target = topLeft.pos.findClosestByPath(towers)
            }

        }

        //Debugging
        if (target != null) {
            topLeft.say(target.structureType)
        }
        //End of debugging


        if (target == null) {
            target = topLeft.pos.findClosestByRange(hostileCreeps);
        }

        if (target != null) {
            //topLeft.say(target)
        }

        if (target != null) {
            topLeft.say(quadRangedAttack(quad, target))
            if (quadRangedAttack(quad, target) == ERR_NOT_IN_RANGE) {
                moveQuad(quad, target.pos)
            }
            else if (quadNearTo(quad, target)) {
                quadRangedMassAttack(quad)
            }
        }
        var target_creep = undefined;
        var allies_present = false;


        console.log(quad.id, " hits: ", quadHits(quad), " / ", quadHitsMax(quad))
        if (quadHits(quad) < quadHitsMax(quad)) {
            topLeft.say("retreat")
            quadRetreat(quad, target.pos)
        }
    }
    else{
        moveQuad(quad,new RoomPosition(25,25,quad.target_room))
    }


    quadSelfHeal(quad)
    //moving to flag
    //moveQuad(quad, Game.flags["quad"])

    //running from flag
    if (Game.flags["quadFlee"] != undefined) {
        topLeft.say("flee")
        quadRetreat(quad, Game.flags["quadFlee"].pos)
    }


}