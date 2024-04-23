var towers = {

    /** @param {Game} game **/
    tick: function (spawn) {
        towers = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER }
        });

        if (spawn.memory.damagedStructures != undefined) {
            while (spawn.memory.damagedStructures.length > 0 && Game.getObjectById(spawn.memory.damagedStructures[0])!=null
             && (Game.getObjectById(spawn.memory.damagedStructures[0]).hits > 3000 ||
              (Game.getObjectById(spawn.memory.damagedStructures[0]).hits==Game.getObjectById(spawn.memory.damagedStructures[0]).hitsMax))) {
                spawn.memory.damagedStructures.shift();
            }
            if(spawn.memory.damagedStructures.length > 0)
            {
                var mostDamagedStructure = Game.getObjectById(spawn.memory.damagedStructures[0]);
                if(mostDamagedStructure==null)
                {
                    spawn.memory.damagedStructures=undefined;
                }
                //console.log("most damaged Structure: ",mostDamagedStructure);
            }
            else{
                //console.log("nothing to repair");
                spawn.memory.damagedStructures=undefined;
            }
            
        }
        if (spawn.memory.damagedStructures == undefined && Game.time%1==0) {
            var damagedStructures = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => (structure.hits < structure.hitsMax && structure.hits<3000 && structure.structureType!=STRUCTURE_RAMPART)
                    || (structure.hits < 50000 && structure.structureType==STRUCTURE_RAMPART)
            });
            damagedStructures.sort((a, b) => b.hits - a.hits);

            spawn.memory.damagedStructures=[];
            for(let i=0;i<damagedStructures.length;i++)
            {
                spawn.memory.damagedStructures.push(damagedStructures[i].id);
            }
        }

        //_.forEach(towers, function (tower) 
        for(tower_id of spawn.memory.towers_id)
        {
            var tower=Game.getObjectById(tower_id);
            if(tower==null){continue;}
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
                //console.log("tower most damaged str: ",mostDamagedStructure.pos);
                //console.log(tower.repair(mostDamagedStructure));
                tower.repair(mostDamagedStructure)
            }
            else if (damagedCreeps) {
                tower.heal(damagedCreeps[0]);
            }
        }
    }
};

module.exports = towers;