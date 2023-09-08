function getClosestEnergyDeposit(creep)// return closest energy deposit
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
        return creep.pos.findClosestByRange(deposits);
}
module.exports = getClosestEnergyDeposit;
