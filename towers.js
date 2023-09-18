var towers = {

    /** @param {Game} game **/
    tick: function() {
        towers = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_TOWER }
                })
        _.forEach(towers, function(tower){
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
                && structure.hits<20000
            });
            if(closestHostile) {
                tower.attack(closestHostile);
            }
            else if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
        })
	}
};

module.exports = towers;