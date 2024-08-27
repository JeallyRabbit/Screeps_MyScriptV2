const { __esModule } = require("./mincut");


Creep.prototype.roleKeeperRepairer = function roleKeeperRepairer(creep, spawn) {

    creep.say("🛠")

    if (creep.room.name == creep.memory.target_room) {

        // getting containers


        if (creep.memory.containers == undefined) {
            var cont = creep.room.find(FIND_STRUCTURES, {
                filter:
                    function (str) {
                        return str.structureType == STRUCTURE_CONTAINER
                    }
            })
            if (cont.length > 0) {
                creep.memory.containers = [];
                for (a of cont) {
                    creep.memory.containers.push(a.id)
                }
            }
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {

            //building
            /*
            if (creep.memory.construction_sites != undefined)
            {
                for(a of creep.memory.construction_sites)
                {
                    if(Game.getObjectById(a)==null)
                        {
                            creep.memory.construction_sites=undefined;
                        }   
                }
            }
                */
            if (creep.memory.construction_sites == undefined && Game.time % 9 == 0) {
                var construction_sites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                    filter:
                        function (str) {
                            return str.structureType == STRUCTURE_CONTAINER || str.structureType == STRUCTURE_ROAD
                        }
                })
                if (construction_sites.length > 0) {
                    creep.memory.construction_sites = []
                    for (constr of construction_sites) {
                        creep.memory.construction_sites.push(constr.id)
                    }
                }
            }

            if (creep.memory.construction_sites != undefined) {
                var construction_sites = [];
                for (a of creep.memory.construction_sites) {
                    if (Game.getObjectById(a) != null) {
                        construction_sites.push(Game.getObjectById(a))
                    }
                }
                var target_construction = creep.pos.findClosestByRange(construction_sites)
                if (target_construction != null) {
                    if (creep.build(target_construction) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target_construction, { maxRooms: 1, reusePath: 21 })
                    }
                }
                else {
                    creep.memory.construction_sites = undefined
                }
            }
            else {

                //repairing
                // let it go repair containers and with findInRange everything that finds in his range while on the route


                if (creep.memory.containers != undefined && creep.memory.containers.length > 0) {

                    if (creep.memory.most_damaged_container != undefined && Game.getObjectById(creep.memory.most_damaged_container) != null
                        && Game.getObjectById(creep.memory.most_damaged_container).hits == Game.getObjectById(creep.memory.most_damaged_container).hitsMax) {
                        creep.memory.most_damaged_container = undefined
                    }

                    if (creep.memory.most_damaged_container != undefined && Game.getObjectById(creep.memory.most_damaged_container) == null) {
                        creep.memory.most_damaged_container = undefined
                    }

                    if (creep.memory.most_damaged_container == undefined) {
                        var most_damaged_container = undefined;
                        var min_hits = Infinity
                        for (a of creep.memory.containers) {
                            if (Game.getObjectById(a) != null) {
                                if (Game.getObjectById(a).hits < min_hits) {
                                    most_damaged_container = a
                                    min_hits = Game.getObjectById(a).hits
                                }
                            }
                        }
                        if(most_damaged_container!=undefined)
                        {
                            creep.memory.most_damaged_container=most_damaged_container;
                        }
                    }


                    if (creep.repair(Game.getObjectById(creep.memory.most_damaged_container)) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(Game.getObjectById(creep.memory.most_damaged_container), { reusePath: 21, maxRooms: 1 })

                        var close_damaged_structures = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                            filter: function (str) {
                                return str.structureType == STRUCTURE_ROAD && str.hits < str.hitsMax
                            }
                        })
                        if (close_damaged_structures.length > 0) {
                            creep.repair(close_damaged_structures[0])
                        }
                    }
                }

            }
        }
        else {
            // collecting energy
            //creep.move(TOP)
            if (creep.memory.containers != undefined) {
                var containers = []
                for (a of creep.memory.containers) {
                    if (Game.getObjectById(a) != null && Game.getObjectById(a).store[RESOURCE_ENERGY] > 0) {
                        containers.push(Game.getObjectById(a))
                    }
                }
                var target_container = creep.pos.findClosestByRange(containers)



                if (target_container != null) {
                    if (creep.withdraw(target_container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.say("energy")
                        creep.moveTo(target_container, { reusePath: 21, maxRooms: 1, range: 1, avoidCreeps: true })
                    }
                }
            }
        }

        var hostiles = [];
        if (Game.rooms[creep.room.name].memory.hostiles != undefined && Game.rooms[creep.room.name].memory.hostiles.length > 0) {
            for (a of Game.rooms[creep.room.name].memory.hostiles) {
                if (Game.getObjectById(a) != null) {
                    hostiles.push(Game.getObjectById(a))
                }

            }

        }
        creep.fleeFrom(hostiles, 7)

    }
    else {
        creep.moveTo(new RoomPosition(25, 25, creep.memory.target_room), { range: 21, reusePath: 21 })
    }


};
