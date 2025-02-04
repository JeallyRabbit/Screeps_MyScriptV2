

Creep.prototype.roleClaimer = function roleClaimer(creep, spawn) {



    //creep.suicide();
    //creep.say(creep.memory.target_room==creep.room.name);
    //creep.say(creep.room.name==creep.memory.target_room.name);

    if (creep.memory.target_room) {
        if (creep.room.name == creep.memory.target_room) {// if in target room - go claim 
            creep.say("C");
            var colonizers = [];
            colonizers = creep.room.find(FIND_MY_CREEPS, {
                filter:
                    function (cr) {
                        return cr.memory.role != undefined && cr.memory.role == 'colonizer'
                    }
            })

            if (Game.rooms[creep.memory.target_room] && colonizers.length > 0) {

                if (creep.claimController(Game.rooms[creep.memory.target_room].controller) == ERR_NOT_IN_RANGE) {
                    //creep.say("QWE");
                    creep.moveTo(Game.rooms[creep.memory.target_room].controller, { reusePath: 15, avoidSk: true, maxRooms: 1 });
                }
                if (creep.claimController(Game.rooms[creep.memory.target_room].controller) == ERR_INVALID_TARGET &&
                    (Game.rooms[creep.memory.target_room].controller.owner != undefined && Game.rooms[creep.memory.target_room].controller.owner.username != 'JeallyRabbit' && Game.rooms[creep.memory.target_room].controller.owner.username != 'Jeally_Rabbit')) {
                    //creep.say("QWE");
                    //creep.say(creep.claimController(creep.room.controller));
                    creep.attackController(Game.rooms[creep.memory.target_room].controller);

                }
                if (creep.room.controller.reservation != undefined && creep.room.controller.reservation.username != 'Jeally_Rabbit' && creep.room.controller.reservation.username != 'JeallyRabbit') {
                    creep.attackController(Game.rooms[creep.memory.target_room].controller);
                }

                var signText = "Error: undefined ? To define is to limit."

                if (creep.room.controller.text != signText) {
                    creep.signController(creep.room.controller, signText)
                }

            }
            creep.moveTo(Game.rooms[creep.memory.target_room].controller, { reusePath: 15, maxRooms: 1 });
            //creep.move(LEFT)
        }
        else { // not in target room - go claim


            creep.moveToRoom(creep.memory.target_room, { reusePath: 21, avoidHostile: true, avoidCreeps: true, avoidSk: true })
        }
    }
    else {
        creep.say("No Target");
    }

};