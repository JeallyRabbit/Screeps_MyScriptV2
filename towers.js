var towers = {

    /** @param {Game} game **/
    tick: function (spawn) {
        towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        if (spawn.memory.damagedStructures != undefined) {
            while (spawn.memory.damagedStructures.length > 0 && Game.getObjectById(spawn.memory.damagedStructures[0])!=null
             && (Game.getObjectById(spawn.memory.damagedStructures[0]).hits > 30000 ||
              (Game.getObjectById(spawn.memory.damagedStructures[0]).hits==Game.getObjectById(spawn.memory.damagedStructures[0]).hitsMax))) {
                spawn.memory.damagedStructures.shift();
            }
            if(spawn.memory.damagedStructures.length > 0)
            {
                var mostDamagedStructure = Game.getObjectById(spawn.memory.damagedStructures[0]);
                console.log("most damaged Structure: ",mostDamagedStructure);
            }
            else{
                spawn.memory.damagedStructures=undefined;
            }
            
        }
        if (spawn.memory.damagedStructures == undefined && Game.time%23==0) {
            var damagedStructures = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax*0.3
                    && structure.hits < 50000
            });
            damagedStructures.sort((a, b) => b.hits - a.hits);

            spawn.memory.damagedStructures=[];
            for(let i=0;i<damagedStructures.length;i++)
            {
                spawn.memory.damagedStructures.push(damagedStructures[i].id);
            }
        }

        _.forEach(towers, function (tower) {
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);


            var damagedCreeps = spawn.room.find(FIND_MY_CREEPS, {
                filter:
                    function (myCreep) {
                        return myCreep.hits < myCreep.hitsMax;
                    }
            });
            //console.log("damged Creeps: ",damagedCreeps.length);


            if (closestHostile) {
                tower.attack(closestHostile);
            }

            else if (mostDamagedStructure) {
                console.log("tower most damaged str: ",mostDamagedStructure.pos);
                console.log(tower.repair(mostDamagedStructure));
            }
            else if (damagedCreeps) {
                tower.heal(damagedCreeps[0]);
            }
        })
    }
};

module.exports = towers;