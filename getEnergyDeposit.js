function getEnergyDeposit(creep)// return most full energy deposit - container
{
            
        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER;
            }
        });
        //console.log(deposits.length);
        if(deposits.length==0){return -1;}
        //var a=deposits[0].get
        const full=[];
        var id_max_full=-1;
        //console.log("deposits: ",depositslength);
        for(let i=0;i<deposits.length;i++)
        {
            full[i]=deposits[i].store[RESOURCE_ENERGY];
            //console.log(full[i]);
            if(full[i]>id_max_full)
            {
                id_max_full=i;

            }
        }
        //console.log("found deposit energy: ",deposits[id_max_full].store[RESOURCE_ENERGY]);
        if(id_max_full>0)
        {
            return deposits[id_max_full];
        }
        else{return -1;}
}
module.exports = getEnergyDeposit;