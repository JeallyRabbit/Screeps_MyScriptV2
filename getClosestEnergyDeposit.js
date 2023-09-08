function getClosestEnergyDeposit(creep)// return closest not empty energy deposit
{
            
        var deposits = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER
                && structure.store[RESOURCE_ENERGY]>0;
            }
        });
        deposits=deposits.concat(creep.room.find(FIND_STRUCTURES,{
            filter: (structure) => {
                return structure.structureType === STRUCTURE_STORAGE;
            }
        }));
        return creep.pos.findClosestByRange(deposits);
}
module.exports = getClosestEnergyDeposit;
