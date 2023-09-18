

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        //creep.say("S");
        //creep.say(creep.memory.target_room==creep.room.name);
        //creep.say(creep.room.name==creep.memory.target_room.name);
            if(creep.memory.target_room)
            {
                if(creep.room.name==creep.memory.target_room)
                {// if in target room - go claim 
                    if(creep.room.controller) {
                        if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                    }
                    
                }
                else{ // not in target room - go claim
                    //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
                    creep.moveTo(new RoomPosition(25,25, creep.memory.target_room),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
                }
            }
            else{
                creep.say("No Target");
            }
	}
};
module.exports = roleClaimer;