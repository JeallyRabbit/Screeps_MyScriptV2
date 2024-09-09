const { boosting_driver } = require('boosting_driver');


Creep.prototype.roleUpgrader = function roleUpgrader(creep, spawn) {

    //creep.suicide();
    if(creep.memory.work_parts_num==undefined)
    {
        creep.memory.work_parts_num=_.filter(creep.body, { type: WORK }).length
    }
    if (creep.memory.other_upgraders != undefined) {
        for (a of creep.memory.other_upgraders) {
            if (Game.getObjectById(a) == null) {
                creep.memory.other_upgraders == undefined
                break;
            }
        }

    }
    if (creep.memory.other_upgraders == undefined && spawn.memory.req_upgraders_parts>creep.memory.work_parts_num) {
        var upgraders = creep.room.find(FIND_MY_CREEPS, {
            filter: function (cr) {
                return cr.memory.role == 'upgrader' && cr.id != creep.id;
            }
        })
        if (upgraders.length > 0) {
            creep.memory.other_upgraders = [];
            for (a of upgraders) {
                creep.memory.other_upgraders.push(a.id)
            }
        }

    }

    if (creep.memory.boosting_list == undefined) {
        creep.memory.boosting_list = ["GH", "XGH2O", "GH2O"];//boost types that creep accepts
    }
    // else 
    if (boosting_driver(creep, spawn, creep.memory.boosting_list, WORK) == -1) {
        //creep.say(creep.store[RESOURCE_ENERGY], "energy");
        //creep.suicide()
        if (creep.room.name != creep.memory.home_room.name) {
            creep.moveTo(spawn)
            return
        }

        if (creep.memory.upgrading == undefined) {
            creep.memory.upgrading = false;
        }
        if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) { // if upgrading and no energy go harvest
            creep.memory.upgrading = false;
            //creep.say('🔄 harvest');
        }
        if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) { // if have energy and RCL
            creep.memory.upgrading = true;
            //creep.say('🚧 upgrade');
        }
        if ((creep.memory.deposit != undefined && Game.getObjectById(creep.memory.deposit) != null && Game.getObjectById(creep.memory.deposit).store[RESOURCE_ENERGY] == 0
           /* && Game.getObjectById(creep.memory.deposit).structureType != STRUCTURE_LINK*/)
            || (Game.getObjectById(spawn.memory.controller_link_id) != null && spawn.memory.controller_link_id != creep.memory.deposit && Game.getObjectById(spawn.memory.controller_link_id).store[RESOURCE_ENERGY] > 0)/*|| Game.time%76==0*/) {
            creep.memory.deposit = undefined;
        }
        if (creep.memory.deposit == undefined /*&& Game.time % 4 == 0*/) {

            if (spawn.memory.controller_link_id != undefined && Game.getObjectById(spawn.memory.controller_link_id) != null
                && Game.getObjectById(spawn.memory.controller_link_id).store[RESOURCE_ENERGY] > 0) {
                creep.memory.deposit = spawn.memory.controller_link_id
            }
            else {
                if (creep.memory.deposits_renew_counter == undefined) {
                    creep.memory.deposits_renew_counter = 1;
                }
                else {
                    creep.memory.deposits_renew_counter++;
                }
                var deposits = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_STORAGE &&
                            structure.store[RESOURCE_ENERGY] > 5000;
                    }
                });
                deposits = deposits.concat(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType === STRUCTURE_CONTAINER
                            && structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity();
                    }
                }));
                if (creep.room.controller == undefined) { creep.suicide() }
                var deposit = creep.room.controller.pos.findClosestByRange(deposits);
                if (deposit != null) {
                    creep.memory.deposit = deposit.id;
                }
            }




        }


        if (creep.memory.upgrading) // if upgrading go upgrade
        {
            //creep.say(creep.pos.getRangeTo(creep.room.controller));
            //creep.say(creep.upgradeController(creep.room.controller));
            if(!creep.pos.isNearTo(creep.room.controller))
            {
                creep.moveTo(creep.room.controller,{maxStuck: 10})
            }
            var upgrade_result = creep.upgradeController(creep.room.controller);
            //creep.moveTo(creep.room.controller, { reusePath: 17,maxRooms:1 });
            if (upgrade_result == ERR_NOT_IN_RANGE || upgrade_result == -9) {
                //creep.say("A");
                creep.moveTo(creep.room.controller, { reusePath: 17, maxRooms: 1 });
                //move_avoid_hostile(creep,creep.room.controller.pos,1,true);
            }
            else if (upgrade_result == 0 && creep.store[RESOURCE_ENERGY] <= _.filter(creep.body, { type: WORK }).length) {
                //creep.say("e")
                creep.withdraw(Game.getObjectById(creep.memory.deposit), RESOURCE_ENERGY);
            }


            if(creep.store[RESOURCE_ENERGY]>0 && creep.memory.other_upgraders!=undefined && creep.memory.other_upgraders.length>0)
            {
                //var to_pass=undefined
                //console.log("myrange: ",creep.pos.getMyRangeTo(creep.room.controller.pos))
                for(a of creep.memory.other_upgraders)
                {
                    //creep.say(creep.pos.getRangeTo(creep.room.controller))
                    cr=Game.getObjectById(a)
                    if(cr==null){ continue;}
                    //creep.say(creep.pos.getRangeTo(creep.room.controller))
                    if(cr!=null && cr.store[RESOURCE_ENERGY]<creep.store[RESOURCE_ENERGY] && 
                        (cr.pos.getMyRangeTo(creep.room.controller.pos)<creep.pos.getMyRangeTo(creep.room.controller.pos)
                    ||(Game.getObjectById(creep.memory.deposit)!=undefined && cr.pos.getMyRangeTo(Game.getObjectById(creep.memory.deposit).pos)>creep.pos.getMyRangeTo(Game.getObjectById(creep.memory.deposit).pos)) ) 
                    && creep.pos.isNearTo(cr.pos))
                    {
                        
                        //creep.say(creep.transfer(cr,RESOURCE_ENERGY))
                        creep.transfer(cr,RESOURCE_ENERGY)
                        break;
                    }
                }
            }


        }
        else if (!creep.memory.upgrading && Game.getObjectById(creep.memory.deposit) != null)// if no energy and there are deposits
        {// go to deposits
            //creep.say("depo");

            //var deposit = creep.pos.findClosestByRange(deposits);
            if (creep.memory.deposit != undefined) {
                if (creep.withdraw(Game.getObjectById(creep.memory.deposit), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.deposit), { reusePath: 17, maxRooms: 1 });
                    //move_avoid_hostile(creep,Game.getObjectById(creep.memory.deposit).pos,1);

                }
            }

        }
        else { // collect dropped energy
            const droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
            })
            const closestDroppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
            if (droppedEnergy.length > 0) {
                if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                    // Move to it
                    creep.moveTo(closestDroppedEnergy, { reusePath: 17, maxRooms: 1 });
                    //move_avoid_hostile(creep,closestDroppedEnergy.pos);
                }
            }
        }
    }

};
