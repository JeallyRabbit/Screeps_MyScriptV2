

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) 
    {
        creep.say("C");
        //creep.suicide();
        //creep.say(creep.memory.target_room==creep.room.name);
        //creep.say(creep.room.name==creep.memory.target_room.name);
        
            if(creep.memory.target_room)
            {
                if(creep.room.name==creep.memory.target_room)
                {// if in target room - go claim 
                    
                    if(creep.room.controller) {
                        //creep.say(creep.claimController(creep.room.controller));
                        //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room));
                        if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            //creep.say("QWE");
                            creep.moveTo(creep.room.controller,{reusePath:15,avoidSk:true});
                        }
                        if(creep.claimController(creep.room.controller) == ERR_INVALID_TARGET) {
                            //creep.say("QWE");
                            //creep.say(creep.claimController(creep.room.controller));
                            creep.attackController(creep.room.controller);
                            
                        }
                        creep.room.createConstructionSite(creep.memory.to_colonize.spawn_pos_x,creep.memory.to_colonize.spawn_pos_y+2,
                            STRUCTURE_SPAWN,creep.room.name+"_1");
                    }
                    
                }
                else{ // not in target room - go claim
                    //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
                    //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room,{reusePath:15,avoidSk:true}),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
                
                    creep.moveToRoom(creep.memory.target_room);
                }
            }
            else{
                creep.say("No Target");
            }
	}
};
module.exports = roleClaimer;