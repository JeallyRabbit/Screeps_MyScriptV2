function getMaxEnergyDeposit(creep)// return most full energy deposit - container
{
            
        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });
        deposits=deposits.concat(creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        }));
        //creep.say(deposits.length);
        if(deposits.length==0){return -1;}
        //var a=deposits[0].get
        var full=0;
        var max_store=0;
        var id_max_full=-1;
        //console.log("deposits: ",depositslength);
        for(let i=0;i<deposits.length;i++)
        {
            full=deposits[i].store[RESOURCE_ENERGY];
            //console.log(full[i]);
            if(full>max_store)
            {
                id_max_full=i;
                max_store=full[i];
            }
        }
        //console.log("found deposit energy: ",deposits[id_max_full].store[RESOURCE_ENERGY]);
        //console.log("id: ",id_max_full);
        if(id_max_full>=0)
        {
            return deposits[id_max_full];
        }
        else{return -1;}
}
module.exports = getMaxEnergyDeposit;