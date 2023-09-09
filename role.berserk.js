const berserkRole = {
  /** @param {Creep} creep **/
  run: function (creep) {
    // Check if the creep has a target room
    if (!creep.memory.targetRoom) {
      // If not, set the target room (replace 'W1N1' with the room you want to attack)
      creep.memory.targetRoom = 'W7S34';//'W7S33';
    }
    creep.memory.targetRoom = 'W7S34';//my room
    //creep.memory.targetRoom='W7S33';//room above me
    if(creep.memory.targetRoom=='W7S34')
    {
      creep.moveTo(Game.flags['Bersker_Camp']);
      console.log('CAMPING')
    }
    // Check if the creep is in the target room
    if (creep.room.name !== creep.memory.targetRoom) {
      // If not, move to the target room
      creep.say("mov");
      const exitDir = Game.map.findExit(creep.room, creep.memory.targetRoom);
      //const exit = creep.pos.findClosestByPath(exitDir);
      const exit = new RoomPosition(25, 25, creep.memory.targetRoom);
      creep.moveTo(exit);
    } 
    else 
    {
      // If in the target room, attack hostile creeps
      //creep.say("");
      //console.log("ENTERING ENEMY ROOML ", creep.room.name);
      const hostileCreep = creep.room.find(FIND_HOSTILE_CREEPS, {
        filter: (enemyCreep) => enemyCreep.owner.username !== 'Jeally_Rabbit',
      });

      console.log("num of hostile creeps: ", hostileCreep.length);
      if (hostileCreep) {
        //console.log("Attacking");
        console.log("ranged attack: ",creep.rangedAttack(hostileCreep));
        if (creep.rangedAttack(hostileCreep) == ERR_NOT_IN_RANGE) {
          creep.moveTo(hostileCreep);
        }
      } else {
        // If no hostile creeps, attack player-owned structures
        const structures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
          filter: (structure) => structure.owner !== 'Jeally_Rabbit',
        });
        if (structures.length > 0) {
          if (creep.rangedAttack(structures[0]) === ERR_NOT_IN_RANGE) {
            creep.moveTo(structures[0]);
          }
        } else {
          // If no targets found, move to my rooms
          const homeRoom = Game.rooms['Jeally_Rabbit']; // Replace with your home room name
          if (homeRoom) {
            // If no targets are found, move back to your home room
            creep.moveTo(homeRoom.controller);
          }
        }
      }
    }
  },
};

module.exports = berserkRole;