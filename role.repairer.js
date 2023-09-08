var roleBuilder=require('role.builder');
const getMaxEnergyDeposit = require("getMaxEnergyDeposit");

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //var targets=creep.room.find(FIND_CONSTRUCTION_SITES)
        var targets=creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits<object.hitsMax && object.hits<200000
        });
        if(targets.length<1)
        {
            //creep.say("no repair");
            //roleBuilder.run(creep);
        }
        else{
            targets.sort((a,b)=> a.hits - b.hits);
        //console.log("require repair: ", targets.length);
        creep.memory.repairing=true;

	    if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) { // if don't have energy go harvest
            creep.memory.repairing = false;
            //creep.say('🔄 harvest');
            
	    }
        //console.log("wolne miejsce: ",creep.store.getFreeCapacity());
	    if(creep.memory.repairing==false && creep.store.getFreeCapacity() == 0) { // go repair
	        creep.memory.repairing = true;
	        //creep.say('🚧 Repairing');
	    }
        
	    if(creep.memory.repairing) {
            //creep.say("QWERT");
	        //var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length ) {
                if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
	    }
        else if(getMaxEnergyDeposit(creep)!=-1 && creep.store[RESOURCE_ENERGY]==0)
        {// go to deposits
            var source=getMaxEnergyDeposit(creep);
            var withdraw_amount=0;
            withdraw_amount=Math.min(creep.store.getFreeCapacity(), source.store[RESOURCE_ENERGY]);
            //console.log("withdraw_amount: ",withdraw_amount);
            if(withdraw_amount>0)
            {
                //console.log("energy");
                if(creep.withdraw(source,RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE)
                {
                    //creep.say("Going to Cintainer");
                    creep.moveTo(source);
                }
            }
            //console.log("qwert");
        }
	    else if(creep.store[RESOURCE_ENERGY]==0 )
        {
            //console.log("ASDASDASDAS");
	        var sources = creep.room.find(FIND_SOURCES); // go to source
            
            if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
	    }
        }
        
	    
	}
};

module.exports = roleRepairer;
