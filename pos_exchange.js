function pos_exchange(creep) {

    //creep.say("ex1");
    creep.memory.is_moving = true;

    if (creep.memory.last_pos == undefined) {
        creep.memory.last_pos = [];
    }
    else {
        if (creep.memory.last_pos.length == 3) {
            creep.memory.last_pos.push(creep.pos);

            creep.memory.last_pos.shift();

            if (creep.memory.last_pos[0].x == creep.memory.last_pos[1].x && creep.memory.last_pos[0].y == creep.memory.last_pos[1].y
                && creep.memory.last_pos[1].x == creep.memory.last_pos[2].x && creep.memory.last_pos[1].y == creep.memory.last_pos[2].y) {
                //creep.say("not_mov");
                creep.memory.is_moving = false;
            }
        }
        else {
            creep.memory.last_pos.push(creep.pos);
        }

    }
    if (Game.time % 2 == 0) {
        var moving_creeps = creep.pos.findInRange(FIND_MY_CREEPS, 2, {
            filter: function (adjacent) {
                return creep.pos.isNearTo(adjacent.pos) == true
                    && adjacent.pos != creep.pos
                    //&& adjacent.memory.my_path!=undefined 
                    && adjacent.memory.next_pos != undefined
                    && adjacent.memory.is_working != true
                    && adjacent.fatigue == 0
                    && adjacent.memory.next_pos.x == creep.pos.x && adjacent.memory.next_pos.y == creep.pos.y;
            }
        });

        if (creep.memory.is_moving == false && moving_creeps != undefined && moving_creeps.length > 0
      /*  && creep.memory.my_path==undefined*/) {

            creep.say("EX");
            creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
            creep.memory.is_moving = true;
            delete creep.memory.my_path;
            delete creep.memory.path_counter;


        }

    }

    return;

}
exports.pos_exchange = pos_exchange;
