var towers = {

    /** @param {Game} game **/
    tick: function(spawn) {
        towers = spawn.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_TOWER }
                })
        _.forEach(towers, function(tower){
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
                && structure.hits<100000
            });

            var DamagedStructures= tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            var mostDamagedStructure=DamagedStructures[0];
            for (let i=1;i<DamagedStructures.length;i++)
            {
                if(DamagedStructures[i].hits<mostDamagedStructure.hits)
                {
                    mostDamagedStructure=DamagedStructures[i];
                }
            }
            if(closestHostile) {
                tower.attack(closestHostile);
            }
            else if(mostDamagedStructure) {
                tower.repair(mostDamagedStructure);
            }
        })
	}
};

module.exports = towers;