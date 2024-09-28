


//const { move_avoid_hostile } = require("./move_avoid_hostile");
var sleep = require('creep.sleep');
var roleDistanceCarrier = require('role.DistanceCarrier');



Creep.prototype.roleHauler2 = function roleHauler2(creep, spawn) {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)

    //creep.move(TOP);
    //creep.memory.cID_max=undefined;

    //creep.say("poq");
    if (spawn.room.controller.level <= 2 || (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] == 0)) {
        creep.memory.target_room = creep.room.name;
        creep.roleDistanceCarrier(creep, spawn);
        return;
    }

    defineStructures(creep, spawn);


    

    if (creep.store[RESOURCE_ENERGY] == 0) {
        //creep.memory.task=undefined // check if that is good idea
        creep.memory.task='COLLECTING'
    }
   


    //assigning tasks
    if (creep.memory.task == undefined) {

        creep.memory.container_to_fill = undefined;

        
        if (creep.memory.filler_containers != undefined && creep.memory.filler_containers.length > 0) {
            var min_energy = CONTAINER_CAPACITY
            for (cont of creep.memory.filler_containers) {
                if (Game.getObjectById(cont) != null && Game.getObjectById(cont).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    creep.memory.task = 'FILL_FILLERS_CONTAINERS'
                    if (Game.getObjectById(cont).store[RESOURCE_ENERGY] < min_energy) {
                        min_energy = Game.getObjectById(cont).store[RESOURCE_ENERGY]
                        creep.memory.container_to_fill = cont
                    }
                    //break;
                }
            }
        }

        if (creep.memory.extensions_full == 0 && creep.memory.task==undefined) {
            creep.memory.task = 'FILL_EXTENSIONS'
        }
        else if (creep.memory.task==undefined && creep.memory.upgraders_container != undefined && Game.getObjectById(creep.memory.upgraders_container) != null
            && Game.getObjectById(creep.memory.upgraders_container).store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity(RESOURCE_ENERGY) / 2) {
            creep.memory.task = 'FILL_UPGRADERS_CONTAINER'
            creep.memory.container_to_fill = creep.memory.upgraders_container
        }
        
        else if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.memory.task==undefined) {
            creep.memory.task = 'FILL_SPAWN'

        }
        else {
            creep.fleeFrom({ spawn }, 6)
        }
    }

    if (creep.memory.task=='COLLECTING') // if is empty go to container
    {// go to container
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY)==0)
        {
            creep.memory.task=undefined;
            return;
        }
        if (spawn.room.storage != undefined /* && creep.memory.cID_max==undefined */ /* && (creep.memory.cID_max!=undefined && Game.getObjectById(creep.memory.cID_max)==null)*/) {
            var containers = spawn.room.storage;
            creep.memory.cID_max = spawn.room.storage.id;
        }
        else {

            if (creep.memory.containers_id != undefined && creep.memory.containers_id.length > 0) {
                for (id of creep.memory.containers_id) {
                    if (Game.getObjectById(creep.memory.containers_id) == null) {
                        creep.memory.containers_id = undefined;
                        break;
                    }
                }
            }

            if (creep.memory.containers_id == undefined) {
                if (creep.memory.containers_renew == undefined) {
                    creep.memory.containers_renew = 1;
                }
                else {
                    creep.memory.containers_renew++;
                }
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER;
                    }
                });
                containers = containers.concat(creep.room.find(FIND_RUINS, {
                    filter: (structure) => {
                        return structure.store[RESOURCE_ENERGY] > 50;
                    }
                }));
                if (containers != undefined && containers.length > 0) {
                    creep.memory.containers_id = [];
                    for (cont of containers) {
                        creep.memory.containers_id.push(cont.id)
                    }
                }
            }

            if (creep.memory.containers_id != undefined && creep.memory.containers_id.length > 0) {
                var containers = [];
                for (id of creep.memory.containers_id) {
                    containers.push(Game.getObjectById(creep.memory.containers_id))
                }

                var max_energy = 0;
                if ((creep.memory.cID_max == -1 || creep.memory.cID_max == undefined) && containers != undefined) {
                    for (let i = 0; i < containers.length; i++) {
                        //console.log(containers[i].store.getCapacity(RESOURCE_ENERGY));
                        if (containers[i] == undefined) { continue; }
                        if (containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY) > max_energy) {
                            max_energy = containers[i].store[RESOURCE_ENERGY] / containers[i].store.getCapacity(RESOURCE_ENERGY);
                            //creep.memory.cID_max = i;
                            creep.memory.cID_max = containers[i].id;
                        }
                    }
                }

            }



        }




        //creep.say("A");
        if (creep.memory.cID_max != undefined && Game.getObjectById(creep.memory.cID_max) != null) {
            //creep.memory.cID_max=-1;
            //var withdraw_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, Game.getObjectById(creep.memory.cID_max).store[RESOURCE_ENERGY]);
            if (creep.withdraw(Game.getObjectById(creep.memory.cID_max), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have no energy go to container and withdraw energy
                creep.moveTo(Game.getObjectById(creep.memory.cID_max));
                //creep.say("M");
                //move_avoid_hostile(creep, Game.getObjectById(creep.memory.cID_max).pos, 1, false);
            }
            else if (Game.getObjectById(creep.memory.cID_max).store[RESOURCE_ENERGY] == 0) {
                creep.memory.cID_max = undefined;
            }
            else {
                creep.memory.cID_max = undefined;
            }
        }
        else {
            if (creep.store[RESOURCE_ENERGY] == 0) {
                var avoid = [];

                if (creep.pos.inRangeTo(spawn, 3)) {
                    avoid.push(spawn)
                }
                if (creep.room.storage != undefined && creep.pos.inRangeTo(creep.room.storage, 3)) {
                    avoid.push(creep.room.storage)
                }
                if (avoid.length > 0) {
                    creep.fleeFrom(avoid, 3);
                }
                else {
                    creep.sleep(20);

                }

            }
            creep.memory.cID_max = undefined;
        }

    }

   

    if (creep.memory.task == 'FILL_FILLERS_CONTAINERS') {
        if (Game.getObjectById(creep.memory.container_to_fill) != null && Game.getObjectById(creep.memory.container_to_fill).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.task = undefined
            return;
        }
        if (creep.transfer(Game.getObjectById(creep.memory.container_to_fill), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(creep.memory.container_to_fill), { reusePath: 10, avoidCreeps: false })
        }
    }


    if (creep.memory.task == 'FILL_UPGRADERS_CONTAINER') {
        if (Game.getObjectById(creep.memory.container_to_fill) != null && Game.getObjectById(creep.memory.container_to_fill).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.task = undefined
            return;
        }
        if (creep.transfer(Game.getObjectById(creep.memory.container_to_fill), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(creep.memory.container_to_fill), { reusePath: 10, avoidCreeps: false })
        }
    }

    if (creep.memory.task == 'FILL_EXTENSIONS') {
        var extensions = [];
        for (id of creep.memory.extensions_id) {
            if (Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                extensions.push(Game.getObjectById(id));
            }

        }

        if (extensions.length > 0) {
            var closestExtension = creep.pos.findClosestByRange(extensions);
            if (closestExtension) {
                if (creep.transfer(closestExtension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy
                    creep.moveTo(closestExtension, { reusePath: 11 });
                    //move_avoid_hostile(creep, closestExtension.pos, 1, false);
                }
            }

        }
        else {

            if (creep.store[RESOURCE_ENERGY] == 0) {
                var avoid = [];

                if (creep.pos.inRangeTo(spawn, 3)) {
                    avoid.push(spawn)
                }
                if (creep.room.storage != undefined && creep.pos.inRangeTo(creep.room.storage, 3)) {
                    avoid.push(creep.room.storage)
                }
                if (avoid.length > 0) {
                    creep.fleeFrom(avoid, 3);
                }
                else {
                    creep.sleep(20);

                }

            }
            //creep.sleep(20)
        }
    }

    if (creep.memory.task == 'FILL_SPAWN') {
        if (creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn, { reusePath: 10, avoidCreeps: false })
        }
    }



};

function defineStructures(creep, spawn) {


    // filler containers
    if (creep.memory.filler_containers == undefined) {
        if (creep.memory.filler_containers_renew == undefined) {
            creep.memory.filler_containers_renew = 1;
        }
        else {
            creep.memory.filler_containers_renew++;
        }
        var filler_containers = creep.room.find(FIND_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_CONTAINER &&
                    ((structure.pos.x == spawn.pos.x + 2 && structure.pos.y == spawn.pos.y - 2) ||
                        (structure.pos.x == spawn.pos.x - 2 && structure.pos.y == spawn.pos.y - 2));
            }
        });

        if (filler_containers.length > 0) {
            creep.memory.filler_containers = [];
            for (let i = 0; i < filler_containers.length; i++) {
                creep.memory.filler_containers.push(filler_containers[i].id)
            }
            if (spawn.room.storage != undefined && creep.memory.filler_containers.length > 1) {
                var closer_container = spawn.room.storage.pos.findClosestByPath(filler_containers)
                if (closer_container.id != creep.memory.filler_containers[0]) {
                    var aux = creep.memory.filler_containers[0]
                    creep.memory.filler_containers[0] = creep.memory.filler_containers[1]
                    creep.memory.filler_containers[1] = aux;
                }
            }


        }

    }


    // upgraders container
    if (creep.memory.upgraders_container != undefined && Game.getObjectById(creep.memory.upgraders_container) == null) {
        creep.memory.upgraders_container = undefined
    }

    if (creep.memory.upgraders_container == undefined) {
        if (spawn.memory.controller_container_pos != undefined) {
            var cont = creep.room.find(FIND_STRUCTURES, {
                filter:
                    function (str) {
                        return str.structureType === STRUCTURE_CONTAINER && str.pos.x == spawn.memory.controller_container_pos.x
                            && str.pos.y == spawn.memory.controller_container_pos.y && str.pos.roomName == spawn.memory.controller_container_pos.roomName
                    }
            });
            if (cont.length > 0) {
                creep.memory.upgraders_container = cont[0].id
            }
        }
    }


    // extensions
    if (creep.memory.extensions_id != undefined) {
        for (let id of creep.memory.extensions_id) {
            if (Game.getObjectById(id) == null) {
                creep.memory.extensions_id = undefined;
                break;
            }
        }
    }

    if (creep.memory.extensions_id == undefined) {
        if (creep.memory.extensions_renew == undefined) {
            creep.memory.extensions_renew = 1;
        }
        else {
            creep.memory.extensions_renew++;
        }
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        if (extensions != undefined && extensions.length > 0) {
            creep.memory.extensions_id = [];
            for (ext of extensions) {
                creep.memory.extensions_id.push(ext.id);
            }
        }
    }

    var extensions = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_EXTENSION
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    creep.memory.extensions_full = 0;// 1 when tyey are all full




    if (creep.memory.extensions_id == undefined || creep.memory.extensions_id < 1) {
        creep.memory.extensions_full = 1;
    }

}

