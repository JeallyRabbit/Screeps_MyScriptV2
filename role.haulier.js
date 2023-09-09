
var roleBuilder = require('role.builder');

var roleHaulier = {//transfer energy grom containers to extensions and spawn

    /** @param {Creep} creep **/
    run: function(creep) {
        var extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION;
            }
        });
        var extensions_full=1;//1 when all are full
        for(let i=0;i<extensions.length;i++)
        {
            if(extensions[i].store[RESOURCE_ENERGY]<50)
            extensions_full=0;
        }
        //console.log("extensions_full: ", extensions_full);

        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });
        if(containers.length==0)
        {
            roleBuilder.run(creep);
        }
	    if(creep.store[RESOURCE_ENERGY] == 0) // if is empty go to container
        {// go to container
            var cID=-1;

            for(let i=0;i<containers.length;i++)
            {// finding not empty container
                
                if(containers[i].store[RESOURCE_ENERGY]>0)
                {
                    cID=i;
                    //console.log(cID);
                    break;
                }
            }

            
            var withdraw_amount=1;
            //console.log(cID);
            if(cID>=0)
            {
                //var q=containers[cID].store.ge
            withdraw_amount=Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, containers[cID].store[RESOURCE_ENERGY]);
            //console.log("withfrawing code: ",creep.withdraw(containers[cID],RESOURCE_ENERGY,withdraw_amount));
            if(creep.withdraw(containers[cID],RESOURCE_ENERGY,withdraw_amount)==ERR_NOT_IN_RANGE /*&& creep.store[RESOURCE_ENERGY]==0*/ && cID>=0)
            {// if creep have no energy go to container and withdraw energy
                //creep.say("Going to container");
                creep.moveTo(containers[cID]);
            }
            }
            
        }
        else if(extensions_full==1)// if all extensions are full go to spawn
        {
            var transfered_amount=1;
            transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], Game.spawns['Spawn1'].store[RESOURCE_ENERGY].getFreeCapacity);
            //console.log("ASDASDASDASD");
            if(creep.transfer(Game.spawns['Spawn1'],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE /* && creep.store[RESOURCE_ENERGY]>0*/)
                {// if creep have some energy go to extension and fill with energy
                    //creep.say("Going do spawn");
                    creep.moveTo(Game.spawns['Spawn1']);
                }

        }
        else // go to extension and put all energy to extension ( if have some energy)
        {
            
            var eID=-1;
            for(let i=0;i<extensions.length;i++)
            {// finding not full extensions
                if(extensions[i].store[RESOURCE_ENERGY]<50)
                {
                    eID=i;
                    break;
                }
            }
            //console.log('eID: ',eID);
            if(eID>=0)
            {
                
                var transfered_amount=1;
                transfered_amount=Math.min(creep.store[RESOURCE_ENERGY], extensions[eID].store[RESOURCE_ENERGY].getFreeCapacity);
                //console.log("transfering code: ", creep.transfer(extensions[eID],RESOURCE_ENERGY,1));
                //console.log("transfered amount: ", transfered_amount);
                if(creep.transfer(extensions[eID],RESOURCE_ENERGY,transfered_amount)==ERR_NOT_IN_RANGE /* && creep.store[RESOURCE_ENERGY]>0*/)
                {// if creep have some energy go to extension and fill with energy
                    //creep.say("Going do extension");
                    creep.moveTo(extensions[eID]);
                }
                //console.log("FUUUCK");
            }
            
        }


	}
};
module.exports = roleHaulier;