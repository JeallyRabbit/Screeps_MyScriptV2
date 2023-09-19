function getClosestEnergyDeposit(creep)// return closest not empty energy deposit
{
            
        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]>0;
            }
        });
        
        if(deposits.length>0)
        {
            return creep.pos.findClosestByRange(deposits);
        }
        else{
            return -1;
        }
        
}
module.exports = getClosestEnergyDeposit;
