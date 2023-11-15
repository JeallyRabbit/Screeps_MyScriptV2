function pos_exchange(creep) {

    //creep.say("ex1");


    var moving_creeps=creep.room.find(FIND_MY_CREEPS,{
        filter: function(adjacent)
        {
            return creep.pos.isNearTo(adjacent.pos)==true && adjacent.memory.my_path!=undefined && adjacent.memory.path_counter!=undefined
            && adjacent.memory.path_counter<adjacent.memory.my_path.path.length
            && adjacent.pos!=creep.pos
            && adjacent.memory.role!='keeperKiller' && adjacent.memory.role!='keeperHealer';
        }
    });

    if(moving_creeps!=undefined && moving_creeps.length>0 && creep.memory.my_path==undefined)
    {
        //creep.say("PX");
        //for(let i=moving_creeps[0].memory.path_counter;i<moving_creeps[0].memory.my_path.path.length;i++)
        //{ 
                if(moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter].x==creep.pos.x && 
                    moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter].y==creep.pos.y)
                {
                    creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
                    creep.say("EX1");
                    delete creep.memory.path;
                    delete creep.memory.path_counter;
                   // break;
                }
                if(moving_creeps[0].memory.path_counter<moving_creeps[0].memory.my_path.path.length-1)
                {
                    if(moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter+1].x==creep.pos.x && 
                        moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter+1].y==creep.pos.y)
                    {
                        creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
                        creep.say("EX2");
                        delete creep.memory.path;
                        delete creep.memory.path_counter;
                       // break;
                    }
                }
                if(moving_creeps[0].memory.path_counter>0)
                {
                    if(moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter-1].x==creep.pos.x && 
                        moving_creeps[0].memory.my_path.path[moving_creeps[0].memory.path_counter-1].y==creep.pos.y)
                    {
                        creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
                        creep.say("EX3");
                        delete creep.memory.path;
                        delete creep.memory.path_counter;
                       // break;
                    }
                }
        //}
    }
        





















    /*
    if(creep.memory.my_path!=undefined)
    {// if creep want to exchange position
        creep.say("1");
         var creeps_pos_exchange_out = creep.room.find(FIND_MY_CREEPS,{
            filter:function (adjacent)
            {
                return adjacent.pos!=creep.pos && creep.pos.isNearTo(adjacent);
                /*(creep.memory.my_path.path[creep.memory.path_counter]==ex.pos
                || creep.memory.my_path.path[creep.memory.path_counter+1]==ex.pos
                || creep.memory.my_path.path[creep.memory.path_counter-1]==ex.pos)
               // || creep.pos==ex.memory.my_path[ex.memory.path_counter])
                && ex.pos!=creep.pos;
            }
        });
    }
    else{//if any other creep want to exchange
        creep.say("2");
        var creeps_pos_exchange_in=creep.room.find(FIND_MY_CREEPS,{
            filter: function(adjacent)
            {
                return adjacent.memory.my_path!=undefined
                && ((creep.pos.x==adjacent.memory.my_path[adjacent.memory.path_counter-1].x && creep.pos.y==adjacent.memory.my_path[adjacent.memory.path_counter-1].y))
                   && adjacent.pos!=creep.pos && creep.pos.isNearTo(adjacent);
                   /* || creep.pos==adjacent.memory.my_path[adjacent.memory.path_counter+1]
                    || creep.pos==adjacent.memory.my_path[adjacent.memory.path_counter-1])
            }
        });

    }

    if (creeps_pos_exchange_out != undefined && creeps_pos_exchange_out.length > 0) {
        
        creep.say(creeps_pos_exchange_out[0].pos.x+' '+creeps_pos_exchange_out[0].pos.y); 
        creep.say("Ex1");
        creep.move(creep.pos.getDirectionTo(creeps_pos_exchange_out[0].pos));
        //delete creep.memory.my_path;
    }
    else if(creeps_pos_exchange_in!=undefined && creeps_pos_exchange_in.length>0)
    {
        creep.say(creeps_pos_exchange_in[0].pos.x+' '+creeps_pos_exchange_in[0].pos.y);
        creep.say("Ex2");
        creep.move(creep.pos.getDirectionTo(creeps_pos_exchange_in[0].pos));
        //delete creep.memory.my_path;
    }*/
    return;

}
exports.pos_exchange = pos_exchange;
