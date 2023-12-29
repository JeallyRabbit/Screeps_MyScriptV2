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
                && structure.hits<50000
            });

            var DamagedStructures= tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
                && structure.hits<50000
            });
            var mostDamagedStructure=DamagedStructures[0];

            var damagedCreeps=spawn.room.find(FIND_MY_CREEPS,{filter:
            function (myCreep)
            {
                return myCreep.hits<myCreep.hitsMax;
            }});
            //console.log("damged Creeps: ",damagedCreeps.length);
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
            else if(damagedCreeps)
            {
                tower.heal(damagedCreeps[0]);
            }
        })
	}
};

module.exports = towers;