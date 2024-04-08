

var roleReserver = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        //creep.memory.target_room='E7S5';
            if(creep.memory.target_room)
            {
                if(creep.room.name==creep.memory.target_room && creep.memory.target_room!=creep.memory.home_room.name)
                {// if in target room - go claim 
                    
                    if(creep.room.controller ) {
                        //creep.say(creep.reserveController(creep.room.controller));
                        //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room));
                        if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            //creep.say("QWE");
                            creep.moveTo(creep.room.controller,{reusePath:19});
                        }
                        else if(creep.reserveController(creep.room.controller) ==ERR_INVALID_TARGET)
                        {
                            if(creep.attackController(creep.room.controller)==ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(creep.room.controller,{reusePath:19});
                            }
                        }
                    }
                    
                }
                else{ // not in target room - go claim
                    //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
                    creep.moveTo(new RoomPosition(25,25, creep.memory.target_room),{reusePath:19});
                }
            }
            else{
                creep.say("No Target");
            }
	}
};
module.exports = roleReserver;