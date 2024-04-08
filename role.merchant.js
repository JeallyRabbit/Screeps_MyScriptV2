//const getClosestEnergyDeposit = require("./getClosestEnergyDeposit");
const FILL_TERMINAL_ENERGY = "FILL_TERMINAL_ENERGY"
const FILL_STORAGE_ENERGY = "FILL_STORAGE_ENERGY"
const FILL_LINK = "FILL_LINK"
var roleMerchant = {//transfer energy grom containers to storage

    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        
        //creep.suicide()
        var terminal = spawn.room.terminal;
        var storage = spawn.room.storage;
        if (spawn.memory.manager_link_id != undefined) {
            var link = Game.getObjectById(spawn.memory.manager_link_id);
        }
        //creep.say(creep.moveTo(terminal.pos.x + 1, terminal.pos.y - 1));
        //return;
        if (storage!=undefined && (creep.pos.x != storage.pos.x - 1 || creep.pos.y != storage.pos.y + 1)) {
            creep.moveTo(new RoomPosition(storage.pos.x - 1, storage.pos.y + 1, spawn.room.name));
            creep.say(spawn.room.name)
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
            }
            if (storage != undefined) {
                if (link != undefined) {
                    if (link.store[RESOURCE_ENERGY] < 700 && storage != undefined) {
                        //creep.say("LINK")
                        creep.memory.task = FILL_LINK;
                    }
                }
            }




            if (creep.memory.task == FILL_LINK) {
                creep.withdraw(storage, RESOURCE_ENERGY)
                creep.transfer(link, RESOURCE_ENERGY)
            }
            if (creep.memory.task == FILL_TERMINAL_ENERGY) {
                creep.withdraw(storage, RESOURCE_ENERGY);
                creep.transfer(terminal, RESOURCE_ENERGY);
            }
            else if (creep.memory.task == FILL_STORAGE_ENERGY) {
                creep.withdraw(terminal, RESOURCE_ENERGY);
                creep.transfer(storage, RESOURCE_ENERGY);
            }
        }

    }
};
module.exports = roleMerchant;