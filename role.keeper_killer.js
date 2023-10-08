const keeper_killerRole = {
    /** @param {Creep} creep **/
    run: function (creep) {
        creep.say("!");

        var pos=creep.pos;
            if(pos.x>48)
            {
                creep.move(LEFT);
            }
            else if(pos.x<2)
            {
                creep.move(RIGHT);
            }
            if(pos.y>48)
            {
                creep.move(TOP);
            }
            else if(pos.y<2)
            {
                creep.move(BOTTOM);
            }

      // Check if the creep has a target room
      if (!creep.memory.target) {
        //creep.say(3);
        return 0;
      }
      // Check if the creep is in the target room
      if (creep.room.name != creep.memory.target) {
        // If not, move to the target room
        //creep.say(2);
        const exitDir = Game.map.findExit(creep.room, creep.memory.target);
        //const exit = creep.pos.findClosestByPath(exitDir);
        const destination = new RoomPosition(25, 25, creep.memory.target);
        creep.moveTo(destination);
      } 
      else 
      {// If in the target room
        creep.say(3);
        const healers=creep.room.find(FIND_MY_CREEPS,{
            filter: function(creep){
                return creep.memory.role=='keeperHealer'
                && creep.hits>creep.hitsMax*0.5;
            }
        });
        const killers=creep.room.find(FIND_MY_CREEPS,{
            filter: function(creep){
                return creep.memory.role=='keeperKiller'
                && creep.hits>creep.hitsMax*0.5;
            }
        });
        if(healers.length>=1 && killers.length>=1 )
        {//if enough friendly creeps to proceed attack
            creep.say(4);
            var hostileCreeps = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS /*, {
            filter: (enemyCreep) => enemyCreep.owner.username !== 'Jeally_Rabbit',
            }*/);
    
            if(hostileCreeps==undefined)
            {// there are no keepers - go to lair with smallest 
                creep.say(6);
                const lairs = creep.room.find(FIND_STRUCTURES, {
                    filter: function(structure) {
                        return structure.structureType == STRUCTURE_KEEPER_LAIR;
                    }
                });
                if(creep.hits<creep.hitsMax*0.8)
                {
                    creep.say(6.6);
                    return 0;
                }
                //creep.say(lairs.length);
                var min_lair=lairs[0];
                for(let i=1;i<lairs.length;i++)
                {
                    if(lairs[i].ticksToSpawn<min_lair.ticksToSpawn)
                    {
                        min_lair=lairs[i];
                    }
                }
                creep.moveTo(min_lair, {range: 2});
            }
            else{
                creep.say(4.5);
                var target=creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(!creep.pos.inRangeTo(target,5) && creep.hits<creep.hitsMax*0.5)
                {
                    creep.say(4.6);
                    return 0;
                }
                //console.log(creep.rangedAttack(target));
                if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                    //creep.say("A");
                }
                //creep.say(1+creep.moveTo(40,30));
                //creep.move(RIGHT);
            }
        }
        else{// in target room but not enough creeps to proceed attack - 
            creep.say(5);
            var pos=creep.pos;

            var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS,{
                filter: function(keeper) {
                    return keeper.pos.inRangeTo(creep,4)==true;
                }
            });
            if(hostileCreeps!=undefined)
            {//if is under attack try to kill attacker
                creep.rangedAttack(hostileCreeps[0]);
            }
            else
            {// else group at one creep
                var myCreeps=creep.room.find(FIND_MY_CREEPS,{
                    filter: function(myCreeps)
                    {
                        return myCreeps.memory.role=='keeperHealer' ||
                        myCreeps.memory.role=='keeperKiller';
                    }
                });
                if(myCreeps!=undefined && myCreeps.length>1)
                {
                    creep.moveTo(myCreeps[0]);
                }
            }



            if(pos.x>48)
            {
                creep.move(LEFT);
            }
            else if(pos.x<2)
            {
                creep.move(RIGHT);
            }
            if(pos.y>48)
            {
                creep.move(TOP);
            }
            else if(pos.y<2)
            {
                creep.move(BOTTOM);
            }
        }
        
      }
    },
  };
  
  module.exports = keeper_killerRole;