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

    /*
    for (var i = 0; i < 50; i++) {
        {
            for (var j = 0; j < 50; j++) {
                Game.rooms[roomName].visual.text(result.get(i, j), i, j, { color: '#ffffff' })
            }
        }

    }
        */
        
        
        

    return result
}

function moveQuad(quad, targetPos, reusePath = 5, myFlee = false) {

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
    if (Game.time % reusePath == 0 || quad.path == undefined || (topLeft.pos.x==49 || topLeft.pos.y==49 || topLeft.pos.x==0 || topLeft.pos.y==0)) {
        /*
        const existingCostMatrix = new PathFinder.CostMatrix;
        const roomName = topLeft.room.name
        //console.log("topLeft.pos: ", topLeft.pos)
        const costMatrix = transformCosts(quad, existingCostMatrix, roomName)
        */


        const path = PathFinder.search(
            topLeft.pos,
            targetPos,
            //{ range: 1 },
            {
                range: 1,
                flee: myFlee,
                plainCost: 1,
                swampCost: 5,
                maxRooms: 32,
                //roomCallback: () => costMatrix,
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) { return; }

                    const existingCostMatrix = new PathFinder.CostMatrix;
                    const terrain = room.getTerrain()
                    const costMatrix = transformCosts(quad, existingCostMatrix, roomName)
                    //console.log("QWEQWEQWE")
                    return costMatrix
                }
            },
        )
        quad.path = path;
    }
    movePath = quad.path.path;
    if (movePath != undefined) {
        topLeft.say(movePath.length)
        //console.log("path: ",path.path)
        
        for (p of movePath) {
            // if (p.roomName == topLeft.room.name) {
            if (Game.rooms[p.roomName] != undefined) {
                Game.rooms[p.roomName].visual.circle(p.x, p.y, { fill: 'transparent', radius: 0.55, stroke: 'red' })
            }

            //}

            //console.log(p)
        }
            
        var direction = topLeft.pos.getDirectionTo(movePath[0])

        //console.log("direction: ", direction)
        topLeft.say(direction)
        topLeft.say(movePath.length)
        var move_result = 0;
        for (q of quad.members) {
            cr = Game.getObjectById(q)
            if (cr == null) { continue }

            //cr.say(cr.move(direction))

            move_result += cr.move(direction)
            //cr.say(cr.move(direction))
        }
        if (move_result > 0) {
            quad.path = undefined
        }
        else if (move_result == 0) {
            movePath.shift()
        }
    }


}

function quadRangedAttack(quad, target) {
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        cr.rangedAttack(target)
    }
}

function quadRangedMassAttack(quad) {
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        cr.rangedMassAttack();
    }
}

function quadEqualHeal(quad) {
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        cr.heal();
    }
}

Spawn.prototype.operateQuad = function operateQuad(quad) {

    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (quad.members == undefined) {
        quad.members = [];
    }

    //checking if quad is dead
    var dead_counter = 0;
    for (m of quad.members) {
        if (Game.getObjectById(m) == null) { dead_counter++; }
    }
    if (dead_counter == 4) {
        quad.members = [];
        quad.packed = false;
        quad.completed = false;
        quad.topLeftId = undefined;
        quad.topRightId = undefined;
        quad.bottomLeftId = undefined;
        quad.bottomRightId = undefined;
    }

    if (quad.packed != true) {
        for (q of quad.members) {
            if (quad.members.length >= 4) {
                quad.completed = true
            }
            creep = Game.getObjectById(q)
            if (creep == null) { continue }
            if (topLeft != null && creep.id == topLeft.id) {
                //creep.say("TL")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName))
            }
            if (topRight != null && creep.id == topRight.id) {
                //creep.say("BL")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
            }
            if (bottomLeft != null && creep.id == bottomLeft.id) {
                //creep.say("TR")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName))
            }
            if (bottomRight != null && creep.id == bottomRight.id) {
                //creep.say("BR")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
            }
        }

        console.log("quad packet: ", isQuadPacked(quad.members))

        if (isQuadPacked(quad.members) == true) {
            quad.packed = true;
        }
    }
    if (!quad.packed || !quad.completed) {
        return;
    }



    //DEBUGGING
    if (!isQuadPacked(quad.members)) {
        quad.packed = false;
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

    moveQuad(quad, Game.flags["quad"])

    var enemy_creeps = [];

    var target_creep = undefined;
    //target_creep=creep.room.findClosestByRange(enemy_creeps)

    var allies_present = false;
    /*
    if (Game.rooms[quad.target_room] != undefined && Game.rooms[quad.target_room].memory.allies.length > 0) {
        allies_present = true
    }
    */

    var enemy_creeps = [];
    var enemy_creeps_found = false




    for (id of quad.members) {

        creep = Game.getObjectById(id)

        if (creep != null) {

            if (enemy_creeps_found == false) {
                enemy_creeps_found = true
                if (Game.rooms[creep.room.name] != undefined) {
                    for (en of Game.rooms[creep.room.name].memory.hostiles) {
                        enemy_creeps.push(Game.getObjectById(en))
                    }

                }
            }

            if (_.filter(creep.body, { type: ATTACK }).length > 0) {
                creep.memory.is_melee = true;
            }
            else {
                creep.memory.is_melee = false;
            }
            if (target_creep == undefined) {
                target_creep = creep.pos.findClosestByPath(enemy_creeps)
            }

            for (other of quad.members) {
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






            if (quad.completed) {

                if (creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                if (creep.room.name == quad.target_room || true) {




                    var target_structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: function (structure) {
                            //return structure.my==false && 
                            //return structure.room.name != spawn.room.name && 
                            return structure.structureType != STRUCTURE_CONTROLLER
                                //&& structure.structureType!=STRUCTURE_WALL
                                && structure.structureType != STRUCTURE_CONTAINER
                                && structure.structureType != STRUCTURE_ROAD
                                && structure.my != true
                        }
                    });
                    //creep.say(target_structure.my)
                    //creep.say(target_creep)
                    if (target_creep != null) {

                        //creep.say(target_creep.pos.x+' '+target_creep.pos.y)
                        if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {

                            if (!allies_present) {
                                //creep.say("Ra")
                                //creep.rangedMassAttack()
                                quadRangedMassAttack(quad);
                            }
                        }
                        if (creep.memory.is_melee == false) {
                            if (creep.pos.inRangeTo(target_creep, 3) && (_.filter(target_creep.body, function (part) {
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
                                    //creep.say("near")
                                    //creep.rangedMassAttack()
                                    quadRangedMassAttack(quad)
                                }
                            }
                            else {
                                moveQuad(quad, target_creep.pos)
                                //creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: false, ignoreDestructibleStructures: true });
                            }
                        }

                        if ((_.filter(creep.body, function (part) {
                            return part.type === RANGED_ATTACK && part.hits > 0;
                        }).length == 0 && _.filter(creep.body, function (part) {
                            return part.type === ATTACK && part.hits == 0;
                        }).length > 0) && Game.rooms[creep.room.name].memory.hostiles != undefined) {
                            //creep.fleeFrom(Game.rooms[creep.room.name].memory.hostiles, 6, { maxRooms: 1 })
                        }

                        if (target_structure && creep.pos.isNearTo(target_structure)) {
                            if (allies_present) {
                                creep.rangedAttack(target_structure)
                            }
                            else {
                                //creep.rangedMassAttack()
                                quadRangedMassAttack(quad)
                            }
                        }


                    }
                    else if (target_structure) {
                        if (target_creep) {
                            //focus on creeps
                            if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {

                                //creep.moveTo(target_creep, { maxRooms: 1, ignoreDestructibleStructures: true })
                                moveQuad(quad, target_creep.pos)

                                if (creep.pos.isNearTo(target_structure)) {
                                    if (allies_present) {
                                        //creep.rangedAttack(target_structure)
                                        quadRangedAttack(quad, target_structure)
                                    }
                                    else {
                                        //creep.rangedMassAttack()
                                        quadRangedMassAttack()
                                    }
                                }

                            }

                        }
                        else {
                            //focus on structures
                            //if (ranged_attack_result == ERR_NOT_IN_RANGE) {
                            if (allies_present) {

                                //creep.rangedAttack(target_structure)
                                quadRangedAttack(quad, target_structure)
                            }
                            else if (target_structure.structureType != STRUCTURE_WALL) {
                                // rangedMassAttack() hits only owned structures so it not affects walls
                                quadRangedMassAttack(quad)
                            }
                            else {
                                //creep.rangedAttack(target_structure)
                                quadRangedAttack(quad, target_structure)
                            }
                            //}

                            //creep.moveTo(target_structure, { maxRooms: 1, ignoreDestructibleStructures: true, avoidCreeps: true })
                            moveQuad(quad, target_structure.pos)
                        }
                        if (creep.memory.is_melee == true) {
                            if (creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                                //creep.moveTo(target_structure, { avoidCreeps: false, ignoreDestructibleStructures: true, avoidCreeps: true });
                                moveQuad(quad, target_structure.pos)
                                //console.log("structure to far");
                            }
                        }
                        else {
                            //creep.moveTo(target_structure, { avoidCreeps: false, ignoreDestructibleStructures: true });
                            moveQuad(quad, target_structure.pos)
                        }

                        if (creep.hits < creep.hitsMax) {
                            creep.heal(creep);
                        }
                    }
                    if (Game.rooms[quad.target_room] != undefined && Game.rooms[quad.target_room].memory.damagedCreeps.length > 0) {
                        var damaged = [];
                        for (cr of Game.rooms[quad.target_room].memory.damagedCreeps) {
                            damaged.push(Game.getObjectById(cr))
                        }
                        var toHeal = creep.pos.findClosestByRange(damaged)
                        if (toHeal != null && toHeal.memory.role != 'sponge') {
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                if (target_creep == null) {
                                    //creep.moveTo(toHeal, { maxRooms: 1 })
                                    moveQuad(quad, toHeal.pos)
                                }

                                if (!target_creep) {
                                    creep.rangedHeal(toHeal)
                                }

                            }
                        }
                    }
                    //else {

                }
                //else 
                if (creep.room.name != quad.target_room && Game.rooms[creep.room.name].memory.hostiles.length == 0) {
                    //creep.move(BOTTOM)
                    //return;
                    //creep.moveTo(new RoomPosition(25, 25, quad.target_room), { reusePath: 21, avoidHostile: true, avoidCreeps: false, avoidSk: true })
                    moveQuad(quad, new RoomPosition(25, 25, quad.target_room))

                    //creep.rangedMassAttack()
                }
            }
            else {
                //rand <1;6>
                creep.fleeFrom([this], 8, { maxRooms: 1 })
            }

            break;
        }
    }

}