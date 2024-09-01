
Creep.prototype.roleMiner = function roleMiner(creep, spawn) {


    var mineral = Game.getObjectById(spawn.memory.mineral);
    var storage = creep.room.storage;
    if (mineral != null) {
        if (creep.store.getFreeCapacity() > 0) {
            if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
                creep.moveTo(mineral), { reusePath: 11 };
            }
        }
        else if(storage!=undefined){
            if (creep.transfer(storage, mineral.mineralType) == ERR_NOT_IN_RANGE) {
                //move_avoid_hostile(creep,storage[0].pos,1,false);
                creep.moveTo(storage, { reusePath: 11 });
            }
        }
    }

};