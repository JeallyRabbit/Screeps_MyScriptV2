
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

Creep.prototype.roleSigner = function roleSigner(creep, spawn) {


    //creep.say("R");
    //var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
    if (creep.signController(creep.room.controller, "Please don't attack and feel free to message me if you need something") == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller);
    }


};
