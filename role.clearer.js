const roleClearer = {
    /** @param {Creep} creep **/
    run: function (creep) {
      // Check if the creep has a target room
      creep.memory.toAttack= new RoomPosition(37,33,'W7S34');
      creep.say(creep.rangedAttack(creep.memory.toAttack));
      if (creep.rangedAttack(creep.memory.toAttack) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.memory.toAttack);
      }
    }
  };
  
  module.exports = roleClearer;