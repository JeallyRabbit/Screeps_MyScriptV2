Spawn.prototype.towers = function towers(spawn) {

    // /** @param {Game} game **/
    //tick: function (spawn) {
        /*
    towers = spawn.room.find(FIND_MY_STRUCTURES, {
        filter: { structureType: STRUCTURE_TOWER }
    });
    */

    if (spawn.memory.damagedStructures != undefined) {
        while (spawn.memory.damagedStructures.length > 0 && Game.getObjectById(spawn.memory.damagedStructures[0]) != null
            && (Game.getObjectById(spawn.memory.damagedStructures[0]).hits > 3000 ||
                (Game.getObjectById(spawn.memory.damagedStructures[0]).hits == Game.getObjectById(spawn.memory.damagedStructures[0]).hitsMax))) {
            spawn.memory.damagedStructures.shift();
        }
        if (spawn.memory.damagedStructures.length > 0) {
            var mostDamagedStructure = Game.getObjectById(spawn.memory.damagedStructures[0]);
            if (mostDamagedStructure == null) {
                spawn.memory.damagedStructures = undefined;
            }
            //console.log("most damaged Structure: ",mostDamagedStructure);
        }
        else {
            //console.log("nothing to repair");
            spawn.memory.damagedStructures = undefined;
        }

    }
    if (spawn.memory.damagedStructures == undefined && Game.time % 5 == 0) {
        var damagedStructures = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => (structure.hits < structure.hitsMax && structure.hits < 2000 && structure.structureType != STRUCTURE_RAMPART)
                 || (structure.hits < 2000 && structure.structureType == STRUCTURE_RAMPART)
        });
        damagedStructures.sort((a, b) => b.hits - a.hits);

        spawn.memory.damagedStructures = [];
        for (let i = 0; i < damagedStructures.length; i++) {
            spawn.memory.damagedStructures.push(damagedStructures[i].id);
        }
    }

    var ramparts=spawn.room.find(FIND_MY_STRUCTURES,{filter:
        function(str)
        {
            return str.structureType==STRUCTURE_RAMPART && str.hits<str.hitsMax && str.hits<5000
        }
    })
    var mostDamagedRampart=undefined;
    if(ramparts.length>0){
        mostDamagedRampart=ramparts[0]
    }
    for(r of ramparts)
    {
        if(r.hits<mostDamagedRampart.hits-RAMPART_DECAY_AMOUNT)
        {
            mostDamagedRampart=r;
        }
    }
    //_.forEach(towers, function (tower) 
    if (spawn.memory.towers_id == undefined) {
        return;
    }
    
    var damagedCreeps = spawn.room.find(FIND_MY_CREEPS, {
        filter:
            function (myCreep) {
                return myCreep.hits < myCreep.hitsMax;
            }
    });
    

    for (tower_id of spawn.memory.towers_id) {
        var tower = Game.getObjectById(tower_id);
        if (tower == null) { continue; }




        //console.log("damged Creeps: ",damagedCreeps.length);

        /*
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            //tower.attack(closestHostile);
        }
        */
        if (damagedCreeps.length>0 && damagedCreeps[0].hitsMax-damagedCreeps[0].hits>=spawn.memory.towers_id*
            TOWER_POWER_HEAL*TOWER_FALLOFF*TOWER_FALLOFF_RANGE) {
            tower.heal(damagedCreeps[0]);
        }

        //return;
        if (spawn.memory.weakest_healer != undefined && false) {
            if (Game.getObjectById(spawn.memory.weakest_healer) != null) {
                tower.attack(Game.getObjectById(spawn.memory.weakest_healer))
            }

        }
        else if (spawn.memory.weakest_attacker != undefined) {
            if (Game.getObjectById(spawn.memory.weakest_attacker) != null) {
                tower.attack(Game.getObjectById(spawn.memory.weakest_attacker))
            }
        }
        else if (spawn.memory.weakest_ranged != undefined) {
            if (Game.getObjectById(spawn.memory.weakest_ranged) != null) {
                tower.attack(Game.getObjectById(spawn.memory.weakest_ranged))
            }
        }
        else if (spawn.memory.weakest_any != undefined) {
            if (Game.getObjectById(spawn.memory.weakest_any) != null) {
                tower.attack(Game.getObjectById(spawn.memory.weakest_any))
            }
        }
        else if(mostDamagedRampart!=undefined)
        {
            //spawn.room.visual.text(mostDamagedRampart.pos.x+" "+mostDamagedRampart.pos.y,tower.pos.x,tower.pos.y-1)
            tower.repair(mostDamagedRampart)
        }

        else if (mostDamagedStructure) {
            //console.log("tower most damaged str: ",mostDamagedStructure.pos);
            //console.log(tower.repair(mostDamagedStructure));
            tower.repair(mostDamagedStructure)
        }
        else if(spawn.memory.weakest_any!=undefined)
        {
            if (Game.getObjectById(spawn.memory.weakest_any) != null) {
                tower.attack(Game.getObjectById(spawn.memory.weakest_any))
            }
        }
        
        else if (damagedCreeps) {
            tower.heal(damagedCreeps[0]);
        }
        
    }
    // }
}//;

//module.exports = towers;