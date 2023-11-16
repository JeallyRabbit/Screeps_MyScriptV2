function pos_exchange(creep) {

    //creep.say("ex1");
    creep.is_moving=false;
    if(creep.memory.last_position_x==undefined || creep.memory.last_position_y==undefined)
    {
        //creep.say("-");
        creep.memory.last_position_x=creep.pos.x;
        creep.memory.last_position_y=creep.pos.y;

    }
    else{
        if(creep.pos.x!=creep.memory.last_position_x || creep.pos.y!=creep.memory.last_position_y)
        {
            //creep.say(".");
            creep.memory.is_moving=true;
            creep.memory.last_position_x=creep.pos.x;
            creep.memory.last_position_y=creep.pos.y;
        }
        else{
            creep.memory.is_moving=false;
        }
    }

    if(creep.memory.role=='harvester' && creep.pos.isNearTo(creep.pos.findClosestByRange(FIND_SOURCES)))
    {
        return;
    }
    var moving_creeps=creep.room.find(FIND_MY_CREEPS,{
        filter: function(adjacent)
        {
            return creep.pos.isNearTo(adjacent.pos)==true /*&& adjacent.memory.my_path!=undefined && adjacent.memory.path_counter!=undefined
            && adjacent.memory.path_counter<adjacent.memory.my_path.path.length */
            && adjacent.pos!=creep.pos && (adjacent.is_moving==true || adjacent.memory._move!=undefined)
            && adjacent.memory.role!='keeperKiller' && adjacent.memory.role!='keeperHealer' && adjacent.memory.role!='harvester'
            && adjacent.memory.role!='upgrader';
        }
    });

    if(creep.memory.is_moving==false &&  moving_creeps!=undefined && moving_creeps.length)
    {
        creep.say("EX");
        creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
    }
        
    return;

}
exports.pos_exchange = pos_exchange;
