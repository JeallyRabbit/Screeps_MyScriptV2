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

function transformCosts(costs, roomName, swampCost = 5, plainCost = 1) {
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
    return result
}

function moveQuad(quad, targetPos) {
    var topLeft = Game.getObjectById(quad.topLeftId);
    if(topLeft==null){return -1;}
    const existingCostMatrix=new PathFinder.CostMatrix;
    const roomName=topLeft.room.name
    console.log("topLeft.pos: ",topLeft.pos)
    const costMatrix = transformCosts(existingCostMatrix, roomName)
    for(var i=0;i<50;i++)
    {
        {
            for(var j=0;j<50;j++)
            {
                topLeft.room.visual.text(costMatrix.get(i,j), i, j, { color: '#ffffff' })
            }
        }
        
    }
    const path = PathFinder.search(
        topLeft.pos,
        targetPos,
        {range: 1 },
        {
            plainCost: 1,
            swampCost: 5,
            roomCallback: () => costMatrix,
        },
    )
    console.log("path: ",path.path)
    for(p of path.path)
    {

        console.log(p)
    }
    const direction=topLeft.pos.getDirectionTo(path.path[0])
    console.log("direction: ",direction)
    for (q of quad.members) {
        cr=Game.getObjectById(q)
        if(cr==null){continue}
        
        cr.move(direction)
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
    var dead_counter=0;
    for(m of quad.members)
    {
        if(Game.getObjectById(m)==null){dead_counter++;}
    }
    if(dead_counter==4)
    {
        quad.members=[];
        quad.packed=false;
        quad.completed=false;
        quad.topLeftId=undefined;
        quad.topRightId=undefined;
        quad.bottomLeftId=undefined;
        quad.bottomRightId=undefined;
    }

    if (quad.packed != true) {
        for (q of quad.members) {
            if (quad.members.length >= 4) {
                quad.completed = true
            }
            creep = Game.getObjectById(q)
            if (creep == null) { continue }
            if (topLeft != null && creep.id == topLeft.id) {
                creep.say("TL")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName))
            }
            if (topRight != null && creep.id == topRight.id) {
                creep.say("BL")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName))
            }
            if (bottomLeft != null && creep.id == bottomLeft.id) {
                creep.say("TR")
                creep.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName))
            }
            if (bottomRight != null && creep.id == bottomRight.id) {
                creep.say("BR")
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

    moveQuad(quad,Game.flags["quad"])
    /*
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

    var target_creep = undefined;
    //target_creep=creep.room.findClosestByRange(enemy_creeps)

    var allies_present = false;
    if (Game.rooms[swarm.target_room] != undefined && Game.rooms[swarm.target_room].memory.allies.length > 0) {
        allies_present = true
    }

    var enemy_creeps=[];
    var enemy_creeps_found=false

    for (id of swarm.members) {

        creep = Game.getObjectById(id)

        if (creep != null) {

            if(enemy_creeps_found==false)
            {
                enemy_creeps_found=true
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
                if (creep.room.name == swarm.target_room || true) {

                 


                    var target_structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: function (structure) {
                            //return structure.my==false && 
                            //return structure.room.name != spawn.room.name && 
                            return structure.structureType != STRUCTURE_CONTROLLER
                                //&& structure.structureType!=STRUCTURE_WALL
                                && structure.structureType != STRUCTURE_CONTAINER
                                && structure.structureType != STRUCTURE_ROAD
                                && structure.my !=true
                        }
                    });
                    //creep.say(target_structure.my)
                    
                    //creep.say(target_creep)
                    if (target_creep!=null) {

                        //creep.say(target_creep.pos.x+' '+target_creep.pos.y)
                        if (creep.rangedAttack(target_creep) == ERR_NOT_IN_RANGE) {
                            
                            if (!allies_present) {
                                //creep.say("Ra")
                                creep.rangedMassAttack()
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
                                    creep.rangedMassAttack()
                                }
                            }
                            else {
                                creep.moveTo(target_creep, { maxRooms: 1, avoidSk: true, avoidCreeps: false, ignoreDestructibleStructures: true });
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
                        //creep.say("STR")
                        //console.log(creep.room.name, " ", "fighting structures");
                        //console.log("target_structure: ",target_structure);
                        //console.log("QWEQWEQWE")
                        if (target_creep) {
                            //focus on creeps
                            creep.say("B")
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
                            //creep.say("A")
                            var ranged_attack_result=creep.rangedAttack(target_structure)
                            //if (ranged_attack_result == ERR_NOT_IN_RANGE) {
                                if (allies_present) {
                                    
                                    creep.rangedAttack(target_structure)
                                }
                                else if(target_structure.structureType!=STRUCTURE_WALL){
                                    creep.rangedMassAttack()
                                }
                                else
                                {
                                    creep.rangedAttack(target_structure)
                                }
                            //}
                            
                            creep.moveTo(target_structure, { maxRooms: 1, ignoreDestructibleStructures: true, avoidCreeps: true })

                        }
                        if (creep.memory.is_melee == true) {
                            if (creep.attack(target_structure) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target_structure, { avoidCreeps: false, ignoreDestructibleStructures: true, avoidCreeps: true });
                                //console.log("structure to far");
                            }
                        }
                        else {
                            creep.moveTo(target_structure, { avoidCreeps: false, ignoreDestructibleStructures: true });

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
                        var toHeal = creep.pos.findClosestByRange(damaged)
                        if (toHeal != null && toHeal.memory.role!='sponge') {
                            if (creep.heal(toHeal) == ERR_NOT_IN_RANGE) {
                                if (target_creep == null) {
                                    creep.moveTo(toHeal, { maxRooms: 1 })
                                }

                                if (!target_creep) {
                                    creep.rangedHeal(toHeal)
                                }

                            }
                        }
                    }
                    //else {
                        // group on flag
                        for (m of swarm.members) {
                            if (Game.getObjectById(m) != null) {

                                for (flagName in Game.flags) {

                                    var flag = Game.flags[flagName]
                                    if (flag == undefined) { continue; }

                                    if (flag.room != undefined && flag.room.name == creep.room.name
                                        && flagName.startsWith('swarm')
                                    ) {
                                        creep.moveTo(flag, { reusePath: 11, avoidCreeps: false, maxRooms: 1, ignoreDestructibleStructures: true });
                                        //creep.say("flag")
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                        //creep.moveTo(Game.getObjectById(swa), { reusePath: 11, maxRooms: 1, range: 22 });
                    //}
                }
                //else 
                if (creep.room.name != swarm.target_room && Game.rooms[creep.room.name].memory.hostiles.length == 0) {
                    //creep.move(BOTTOM)
                    //return;
                    creep.moveTo(new RoomPosition(25, 25, swarm.target_room), { reusePath: 21, avoidHostile: true, avoidCreeps: false, avoidSk: true })
                    creep.rangedMassAttack()
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

                //group
                var mean_x = Math.floor(sum_x / counted)
                var mean_y = Math.floor(sum_y / counted)
                var mean_pos = new RoomPosition(mean_x, mean_y, creep.room.name)

                var is_any_to_far = false
                for (other of swarm.members) {
                    if (Game.getObjectById(other).pos.getRangeTo(mean_pos) > swarm.members.length / 1.5
                        && Game.getObjectById(other).pos.x > 1 && Game.getObjectById(other).pos.x < 48 && Game.getObjectById(other).pos.y > 1 && Game.getObjectById(other).pos.y < 48
                        && sum_y != 0 && sum_x != 0
                        && Game.getObjectById(other).room.name == creep.room.name) {
                        is_any_to_far = true
                        break;
                    }
                }
                if (is_any_to_far && creep.room.name != creep.memory.home_room.name) {
                    creep.moveTo(mean_pos, { avoidCreeps: false, swampCost: 1 })
                }
            }
            else {
                //rand <1;6>
                creep.fleeFrom([this], 8, { maxRooms: 1 })
            }
        }
    }
        */
}