function pos_exchange(creep) {

    //creep.say("ex1");
    creep.memory.is_moving=true;

    if(creep.memory.last_pos==undefined)
    {
        creep.memory.last_pos=[];
    }
    else{
        if(creep.memory.last_pos.length==3)
        {
            //creep.say("3");
            /*
            if(creep.memory.role=='soldier')
            {
                
                console.log("-----------------------------", creep.name);
            console.log(creep.memory.last_pos[0].x," ",creep.memory.last_pos[0].y," ",
            creep.memory.last_pos[1].x," ",creep.memory.last_pos[1].y," ",
            creep.memory.last_pos[2].x," ",creep.memory.last_pos[2].y," ",);
            */
            creep.memory.last_pos.push(creep.pos);
            /*
            console.log(creep.memory.last_pos[0].x," ",creep.memory.last_pos[0].y," ",
            creep.memory.last_pos[1].x," ",creep.memory.last_pos[1].y," ",
            creep.memory.last_pos[2].x," ",creep.memory.last_pos[2].y," ",
            creep.memory.last_pos[3].x," ",creep.memory.last_pos[3].y," ");
            */
            creep.memory.last_pos.shift();
            /*
            console.log(creep.memory.last_pos[0].x," ",creep.memory.last_pos[0].y," ",
            creep.memory.last_pos[1].x," ",creep.memory.last_pos[1].y," ",
            creep.memory.last_pos[2].x," ",creep.memory.last_pos[2].y," ",);*/
            //}
            
            if(creep.memory.last_pos[0].x==creep.memory.last_pos[1].x && creep.memory.last_pos[0].y==creep.memory.last_pos[1].y
                 && creep.memory.last_pos[1].x==creep.memory.last_pos[2].x && creep.memory.last_pos[1].y==creep.memory.last_pos[2].y)
            {
                //creep.say("not_mov");
                creep.memory.is_moving=false;
            }
        }
        else{
            creep.memory.last_pos.push(creep.pos);
        }

    }
    
    /*
    if(creep.memory.last_position1_x==undefined || creep.memory.last_position1_y==undefined)
    {
        //creep.say("-");
        creep.memory.last_position1_x=creep.pos.x;
        creep.memory.last_position1_y=creep.pos.y;

    }
    else{
        if(creep.pos.x!=creep.memory.last_position1_x || creep.pos.y!=creep.memory.last_position1_y)
        {
            //creep.say(".");
            creep.memory.is_moving=true;
            creep.memory.last_position1_x=creep.pos.x;
            creep.memory.last_position1_y=creep.pos.y;
        }
        else{
            creep.memory.is_moving=false;
        }
    }*/

    if(creep.memory.role=='harvester' && creep.pos.isNearTo(creep.pos.findClosestByRange(FIND_SOURCES)))
    {
        return;
    }
    var moving_creeps=creep.room.find(FIND_MY_CREEPS,{
        filter: function(adjacent)
        {
            return creep.pos.isNearTo(adjacent.pos)==true /*&& adjacent.memory.my_path!=undefined && adjacent.memory.path_counter!=undefined
            && adjacent.memory.path_counter<adjacent.memory.my_path.path.length */
            && adjacent.pos!=creep.pos // &&adjacent.memory.is_moving==true
            && adjacent.memory.my_path!=undefined 
            && adjacent.memory.next_pos.x== creep.pos.x && adjacent.memory.next_pos.y==creep.pos.y; //&& creep.memory.building==false;
            //&& (adjacent.is_moving==false || adjacent.memory._move!=undefined)
            //&& adjacent.memory.is_moving==true;
            //&& adjacent.memory.role!='keeperKiller' && adjacent.memory.role!='keeperHealer' && adjacent.memory.role!='harvester'
            //&& adjacent.memory.role!='upgrader';
        }
    });

    if(creep.memory.is_moving==false && moving_creeps!=undefined && moving_creeps.length>0
        && creep.memory.my_path==undefined)
    {
        
        creep.say("EX");
        creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
        creep.memory.is_moving=true;
        delete creep.memory.my_path;
        delete creep.memory.path_counter;
        /*
        var aux=false;
        for(let i=moving_creeps[0].memory.path_counter;i<moving_creeps[0].memory.my_path.path.length;i++)
        {
            if(moving_creeps[0].memory.my_path.path[i].x==creep.pos.x && moving_creeps[0].memory.my_path.path[i].y==creep.pos.y)
            {
                aux=true;
                break;
            }
        }
        /*
        if(moving_creeps[0].memory.my_path.path[creep.memory.path_counter].x==creep.pos.x &&
             moving_creeps[0].memory.my_path.path[creep.memory.path_counter].y==creep.pos.y)
             {
                aux=true;
             }
           
        if(aux==true)
        {
            creep.say("EX");
            creep.move(creep.pos.getDirectionTo(moving_creeps[0].pos));
            creep.memory.is_moving=true;
            delete creep.memory.my_path;
            delete creep.memory.path_counter;
        }
    */
        
    }
        
    return;

}
exports.pos_exchange = pos_exchange;
