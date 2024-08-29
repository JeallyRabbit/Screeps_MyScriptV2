

Creep.prototype.roleClaimer = function roleClaimer(creep, spawn) {



    //creep.suicide();
    //creep.say(creep.memory.target_room==creep.room.name);
    //creep.say(creep.room.name==creep.memory.target_room.name);

    if (creep.memory.target_room) {
        if (creep.room.name == creep.memory.target_room) {// if in target room - go claim 
            creep.say("C");
            var colonizers=[];
            colonizers=creep.room.find(FIND_MY_CREEPS,{filter: 
                function(cr)
                {
                    return cr.memory.role!=undefined && cr.memory.role=='colonizer'
                }
            })
            //creep.moveTo(Game.rooms[creep.memory.target_room].controller, { reusePath: 15, avoidSk: true });
            //creep.moveTo(Game.rooms[creep.memory.target_room].controller,{reusePath:15,avoidSk:true});
            if (Game.rooms[creep.memory.target_room] && colonizers.length>0) {
                //creep.say(creep.claimController(creep.room.controller));
                //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room));
                //creep.say(creep.claimController(Game.rooms[creep.memory.target_room].controller))
                if (creep.claimController(Game.rooms[creep.memory.target_room].controller) == ERR_NOT_IN_RANGE) {
                    //creep.say("QWE");
                    creep.moveTo(Game.rooms[creep.memory.target_room].controller, { reusePath: 15, avoidSk: true });
                }
                if (creep.claimController(Game.rooms[creep.memory.target_room].controller) == ERR_INVALID_TARGET && 
            (Game.rooms[creep.memory.target_room].controller.owner.username!='JeallyRabbit' && Game.rooms[creep.memory.target_room].controller.owner.username!='Jeally_Rabbit' )) {
                    //creep.say("QWE");
                    //creep.say(creep.claimController(creep.room.controller));
                    creep.attackController(Game.rooms[creep.memory.target_room].controller);

                }
                creep.room.createConstructionSite(creep.memory.to_colonize.spawn_pos_x, creep.memory.to_colonize.spawn_pos_y + 2,
                    STRUCTURE_SPAWN, creep.room.name + "_1");
                //creep.say(creep.room.createConstructionSite(creep.memory.to_colonize.spawn_pos_x, creep.memory.to_colonize.spawn_pos_y + 2,
                //STRUCTURE_SPAWN, creep.room.name + "_1"))
            }

        }
        else { // not in target room - go claim
            //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
            //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room,{reusePath:15,avoidSk:true}),/* {visualizePathStyle: { stroke: '#ff00ff' } }*/);
            //creep.say("mov")
            creep.moveToRoom(creep.memory.target_room,{avoidSk: true,avoidHostileRooms: true, reusePath: 21});
        }
    }
    else {
        creep.say("No Target");
    }

};