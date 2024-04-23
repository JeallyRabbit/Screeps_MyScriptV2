//const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");
const FILL_TERMINAL_ENERGY = "FILL_TERMINAL_ENERGY"
const FILL_STORAGE_ENERGY = "FILL_STORAGE_ENERGY"
const FILL_LINK = "FILL_LINK"
const TAKE_FROM_LINK = "TAKE_FROM_LINK"

Creep.prototype.roleMerchant = function roleMerchant(creep, spawn) {//transfer energy grom containers to storage



    //creep.suicide()
    var terminal = spawn.room.terminal;
    var storage = spawn.room.storage;
    if (spawn.memory.manager_link_id != undefined) {
        var manager_link = Game.getObjectById(spawn.memory.manager_link_id);
    }
    //creep.say(creep.moveTo(terminal.pos.x + 1, terminal.pos.y - 1));
    //return;
    if (storage != undefined && (creep.pos.x != storage.pos.x - 1 || creep.pos.y != storage.pos.y + 1)) {
        creep.moveTo(new RoomPosition(storage.pos.x - 1, storage.pos.y + 1, spawn.room.name));
        ////creep.say(spawn.room.name)
        return;
    }
    else {

        if (terminal != undefined && storage != undefined) {



            if (terminal.store[RESOURCE_ENERGY] < 30000 && storage.store[RESOURCE_ENERGY] > 40000) {
                creep.memory.task = FILL_TERMINAL_ENERGY;
                creep.memory.energy_to_terminal = true;
                creep.memory.energy_from_terminal = false;
            }
            else if (terminal.store[RESOURCE_ENERGY] > 35000) {
                creep.memory.task = FILL_STORAGE_ENERGY;
                creep.memory.energy_from_terminal = true;
                creep.memory.energy_to_terminal = false;
            }
            else if (terminal.store[RESOURCE_ENERGY] > 30000 && terminal.store[RESOURCE_ENERGY] < 40000) {
                creep.memory.task = undefined;
                creep.memory.energy_from_terminal = -1;
                creep.memory.energy_to_terminal = -1;
            }

            if (manager_link != undefined) {
                if (manager_link.store[RESOURCE_ENERGY] < 700 && storage != undefined) {
                    //creep.say(FILL_LINK)
                    creep.memory.task = FILL_LINK;
                }
                if (spawn.memory.sources_links_id != undefined && spawn.memory.sources_links_id.length > 0) {
                    var energy_at_source_link = 0;
                    var can_they_transfer=false
                    for (let id of spawn.memory.sources_links_id) {
                        var src_link = Game.getObjectById(id)
                        if (src_link != null) {
                            energy_at_source_link += src_link.store[RESOURCE_ENERGY]
                            if(src_link.cooldown==0){can_they_transfer=true}
                        }
                    }
                    if (energy_at_source_link > 600 && can_they_transfer==true) {
                        creep.memory.task = TAKE_FROM_LINK
                        //creep.say("Take from link")
                    }
                    // /creep.say(energy_at_source_link)
                }
            }

        }







        if (creep.memory.task == FILL_LINK) {
            creep.withdraw(storage, RESOURCE_ENERGY)
            creep.transfer(manager_link, RESOURCE_ENERGY)
            //creep.say(manager_link.pos.x)
        }
        if (creep.memory.task == FILL_TERMINAL_ENERGY) {
            creep.withdraw(storage, RESOURCE_ENERGY);
            creep.transfer(terminal, RESOURCE_ENERGY);
        }
        else if (creep.memory.task == FILL_STORAGE_ENERGY) {
            creep.withdraw(terminal, RESOURCE_ENERGY);
            creep.transfer(storage, RESOURCE_ENERGY);
        }
        else if (creep.memory.task == TAKE_FROM_LINK) {
            creep.withdraw(manager_link, RESOURCE_ENERGY)
            creep.transfer(storage, RESOURCE_ENERGY)
        }
    }


};