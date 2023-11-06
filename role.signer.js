var roleBuilder=require('role.builder');
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //creep.say("R");
        //var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
        if(creep.signController(creep.room.controller,"Please don't attack and feel free to message me if you need something")==ERR_NOT_IN_RANGE)
        {
            creep.moveTo(creep.room.controller);
        }
	    
	}
};

module.exports = roleRepairer;
