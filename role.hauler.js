


//const { move_avoid_hostile } = require("./move_avoid_hostile");
var sleep = require('creep.sleep');
var roleDistanceCarrier = require('role.DistanceCarrier');



Creep.prototype.roleHauler = function roleHauler(creep, spawn) {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)

    //creep.move(TOP);
    //creep.memory.cID_max=undefined;

    //creep.say("poq");
    if (spawn.room.controller.level <= 2 || (spawn.room.storage != undefined && spawn.room.storage.store[RESOURCE_ENERGY] == 0)) {
        creep.memory.target_room = creep.room.name;
        creep.roleDistanceCarrier(creep, spawn);
        return;
    }


    if (creep.memory.filler_containers == undefined) {
        //creep.say("qwe");
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
            //creep.say("adk");
            creep.memory.filler_containers = [];
            for (let i = 0; i < filler_containers.length; i++) {
                creep.memory.filler_containers.push(filler_containers[i].id)
            }
            if(spawn.room.storage!=undefined && creep.memory.filler_containers.length>1)
            {
                var closer_container=spawn.room.storage.pos.findClosestByPath(filler_containers)
                if(closer_container.id!=creep.memory.filler_containers[0])
                {
                    var aux=creep.memory.filler_containers[0]
                    creep.memory.filler_containers[0]=creep.memory.filler_containers[1]
                    creep.memory.filler_containers[1]=aux;
                }
            }
            

        }

    }

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
    var extensions_full = 0;// 1 when tyey are all full




    if (creep.memory.extensions_id == undefined || creep.memory.extensions_id < 1) {
        //creep.say("EX");
        extensions_full = 1;
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
        }
    }

    /*
    //do i really need it ? yes
    var containers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0;
        }
    });
    */
    //if(full_containers!=undefined && full_containers.length>0)

    if (extensions_full == 1 && spawn.store[RESOURCE_ENERGY] == 300) {
        //creep.say("T");
        //roleTransporter.run(creep,spawn);
        return;
    }

    if (creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.collecting = true; // collecting from containers


    }
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        creep.memory.collecting = false;// filling extensions and spawn and filler containers
    }


    //var cID=-1;
    //var cID_max = -1, cID_min = -1;
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
    //console.log(creep, containers[cID_max].pos);
    if (creep.memory.collecting == true) // if is empty go to container
    {// go to container
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
                //creep.say(spawn.pos)
                if (avoid.length > 0) {
                    creep.fleeFrom(avoid, 3);
                }
                else {
                    creep.sleep( 20);

                }

            }
            creep.memory.cID_max = undefined;
        }
        /*
        if(creep.store[RESOURCE_ENERGY]==0 && creep.pos.inRangeTo(spawn,2))
        {
            //creep.say(spawn.pos)
            creep.fleeFrom([spawn],2);
        }*/

    }
    else if (spawn.memory.manager_link_id != undefined && Game.getObjectById(spawn.memory.manager_link_id) != null &&
        Game.getObjectById(spawn.memory.manager_link_id).store[RESOURCE_ENERGY] < 700 && spawn.memory.merchant == undefined) {
        creep.say("link");
        //creep.say(spawn.memory.merchant);
        if (creep.transfer(Game.getObjectById(spawn.memory.manager_link_id), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(Game.getObjectById(spawn.memory.manager_link_id), { reusePath: 21, avoidCreeps: true});
        }
    }
    else if (creep.memory.filler_containers != undefined && Game.getObjectById(creep.memory.filler_containers[0]) != null && creep.memory.filler_containers.length > 0
        && (Game.getObjectById(creep.memory.filler_containers[0]).store.getFreeCapacity(RESOURCE_ENERGY) >= creep.store.getCapacity(RESOURCE_ENERGY)
            || Game.getObjectById(creep.memory.filler_containers[0]).store.getFreeCapacity(RESOURCE_ENERGY) > 0)) {

        if (creep.transfer(Game.getObjectById(creep.memory.filler_containers[0]), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //creep.say("Q");

            creep.moveTo(Game.getObjectById(creep.memory.filler_containers[0]), { reusePath: 21, avoidCreeps: true });
            //move_avoid_hostile(creep, Game.getObjectById(creep.memory.filler_containers[0]).pos, 1, false);;
        }
    }
    else if ((creep.memory.filler_containers != undefined && creep.memory.filler_containers.length > 1 && Game.getObjectById(creep.memory.filler_containers[1]) != null && Game.getObjectById(creep.memory.filler_containers[1]).store.getFreeCapacity(RESOURCE_ENERGY) > 0)) {
        if (creep.transfer(Game.getObjectById(creep.memory.filler_containers[1]), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //creep.say("P");
            creep.moveTo(Game.getObjectById(creep.memory.filler_containers[1]), { reusePath: 21 , avoidCreeps: true});
            //move_avoid_hostile(creep, Game.getObjectById(creep.memory.filler_containers[1]).pos, 1, false);;
        }
    }
    else if (extensions_full == 1)// if all extensions are full go to spawn
    {
        if (spawn.store[RESOURCE_ENERGY] == 300)//if spawn is full equalize containers
        {// go to container with minimum energy
            roleTransporter.run(creep, spawn);
        }
        else // spawn is not full go fill the spawn
        {
            var transfered_amount = 1;
            transfered_amount = Math.min(creep.store[RESOURCE_ENERGY], spawn.store[RESOURCE_ENERGY].getFreeCapacity);
            if (creep.transfer(spawn, RESOURCE_ENERGY, transfered_amount) == ERR_NOT_IN_RANGE) {// if creep have some energy go to extension and fill with energy

                creep.moveTo(spawn, { reusePath: 11,avoidCreeps: true });
                //move_avoid_hostile(creep, spawn.pos, 1, false);;
            }
        }
    }
    else // go to extension and put all energy to extension ( if have some energy)
    {
        // creep.say("ext");
        /*
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION
                    && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        */
        if (creep.memory.extensions_id != undefined && creep.memory.extensions_id.length > 0) {
            //creep.say("ext")
            var extensions = [];
            for (id of creep.memory.extensions_id) {
                if (Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    extensions.push(Game.getObjectById(id));
                }

            }

            if (extensions.length > 0) {
                var closestExtension = creep.pos.findClosestByRange(extensions);
                //creep.say(closestExtension.id)
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
                    //creep.say(spawn.pos)
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
        //creep.say(extensions.length);

    }

};