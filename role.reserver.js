

Creep.prototype.roleReserver = function roleReserver(creep, spawn) {


    //creep.memory.target_room='E7S5';
    if (creep.memory.target_room) {
        if (creep.room.name == creep.memory.target_room && creep.memory.target_room != creep.memory.home_room.name) {// if in target room - go claim 

            if (creep.room.controller) {
                //creep.say("controller")
                //creep.say(creep.reserveController(creep.room.controller));
                //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room));
                if ((creep.room.controller.reservation != undefined && creep.room.controller.reservation.username != undefined
                    && creep.room.controller.reservation.username == 'Jeally_Rabbit' && creep.room.controller.reservation.ticksToEnd < 4990)
                    || creep.room.controller.reservation == undefined) {
                    //creep.say("res")
                    //creep.move(RIGHT)
                    var signText = "Error: undefined ? To define is to limit."

                    if (creep.room.controller.text != signText) {
                        creep.signController(creep.room.controller, signText)
                    }
                    if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        //creep.say("QWE");
                        creep.moveTo(creep.room.controller, { reusePath: 11, range: 1 });
                    }
                    //creep.say(creep.reserveController(creep.room.controller))
                }
                else {
                    if (!creep.pos.isNearTo(creep.room.controller.pos)) {
                        creep.moveTo(creep.room.controller, { reusePath: 15, maxRooms: 1 })
                    }
                    else  /* if (creep.room.controller.reservation != undefined && creep.room.controller.reservation.username != undefined
                        && creep.room.controller.reservation.username != 'Jeally_Rabbit') */ {


                        if (creep.reserveController(creep.room.controller) == ERR_INVALID_TARGET) {
                            creep.attackController(creep.room.controller)
                        }
                        //creep.say(creep.reserveController(creep.room.controller))
                    }

                    if (creep.room.controller.reservation != undefined && creep.room.controller.reservation.username != undefined
                        && creep.room.controller.reservation.username == 'Invader') {
                        if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller, { reusePath: 19 });
                        }

                    }


                }
            }

        }
        else { // not in target room - go claim
            //creep.say(creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {visualizePathStyle: { stroke: '#ff00ff' } }));
            if (Game.rooms[creep.memory.target_room] != undefined) {
                creep.moveTo(Game.rooms[creep.memory.target_room].controller, { reusePath: 8 });
                //creep.move(BOTTOM)
            }
            else {
                creep.moveTo(new RoomPosition(25,25,creep.memory.target_room), {range: 21, reusePath: 19 });
                //creep.moveToRoom(creep.memory.target_room)
            }

        }
    }
    else {
        creep.say("No Target");
    }

};