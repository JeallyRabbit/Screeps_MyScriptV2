const { create } = require("lodash");

function create_extension_stamp(spawn,x,y)
{
    spawn.room.createConstructionSite(x,y,STRUCTURE_EXTENSION);//midle
    spawn.room.createConstructionSite(x-1,y,STRUCTURE_EXTENSION);//left
    spawn.room.createConstructionSite(x+1,y,STRUCTURE_EXTENSION);//right
    spawn.room.createConstructionSite(x,y-1,STRUCTURE_EXTENSION);//up
    spawn.room.createConstructionSite(x,y+1,STRUCTURE_EXTENSION);//down

    if(spawn.room.controller.level>1)
    {
        spawn.room.createConstructionSite(x,y+2,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x,y-2,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x+2,y,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x-2,y,STRUCTURE_ROAD);

        spawn.room.createConstructionSite(x+1,y+1,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x+1,y-1,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x-1,y+1,STRUCTURE_ROAD);
        spawn.room.createConstructionSite(x-1,y-1,STRUCTURE_ROAD); 
    }
    
    return 0;
}

function create_ramparts(spawn)
{
    //vertical and horizontal borders - right and left side
    var x_left=spawn.pos.x-7;
    var x_right=spawn.pos.x+7;
    var y=spawn.pos.y-3;
    var y_down=spawn.pos.y+7;
    var y_up=spawn.pos.y-7;
    var x=spawn.pos.x-3;

    for(let i=0;i<7;i++)
    {
        spawn.room.createConstructionSite(x_left,y,STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_right,y,STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x,y_down,STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x,y_up,STRUCTURE_RAMPART);
        x++;
        y++;
    }

    //diagonal borders

    //left 
    x_left=spawn.pos.x-7;
    x_right=spawn.pos.x+7;
    var y_up1=spawn.pos.y-2;
    var y_up2=spawn.pos.y-3;
    var y_down1=spawn.pos.y+2;
    var y_down2=spawn.pos.y+3;
    for(let i=0;i<5;i++)
    {
        //left
        spawn.room.createConstructionSite(x_left,y_up1,STRUCTURE_RAMPART);//going up
        spawn.room.createConstructionSite(x_left,y_up2,STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_left,y_down1,STRUCTURE_RAMPART);//going down
        spawn.room.createConstructionSite(x_left,y_down2,STRUCTURE_RAMPART);

        //right
        spawn.room.createConstructionSite(x_right,y_up1,STRUCTURE_RAMPART);//going up
        spawn.room.createConstructionSite(x_right,y_up2,STRUCTURE_RAMPART);
        spawn.room.createConstructionSite(x_right,y_down1,STRUCTURE_RAMPART);//going down
        spawn.room.createConstructionSite(x_right,y_down2,STRUCTURE_RAMPART);

        x_right--;
        x_left++;
        y_up1--;
        y_up2--;
        y_down1++;
        y_down2++;
    }
    return 0;
}



function setBaseLayout(spawn)// return most full energy deposit - container
{
    var myStructures=spawn.room.find(FIND_MY_STRUCTURES);
            
            //first layer 
            create_extension_stamp(spawn,spawn.pos.x+3,spawn.pos.y);
            create_extension_stamp(spawn,spawn.pos.x,spawn.pos.y+3);
            create_extension_stamp(spawn,spawn.pos.x-3,spawn.pos.y);
            create_extension_stamp(spawn,spawn.pos.x,spawn.pos.y-3);

            //second layer

            // right down
            create_extension_stamp(spawn,spawn.pos.x+5,spawn.pos.y+2);
            create_extension_stamp(spawn,spawn.pos.x+2,spawn.pos.y+5);

            //left down
            create_extension_stamp(spawn,spawn.pos.x-2,spawn.pos.y+5);
            create_extension_stamp(spawn,spawn.pos.x-5,spawn.pos.y+2);   
            
            //left up
            create_extension_stamp(spawn,spawn.pos.x-5,spawn.pos.y-2);
            create_extension_stamp(spawn,spawn.pos.x-2,spawn.pos.y-5)

            //right up
            create_extension_stamp(spawn,spawn.pos.x+5,spawn.pos.y-2);
            create_extension_stamp(spawn,spawn.pos.x+2,spawn.pos.y-5);

            //Create STORAGE
            spawn.room.createConstructionSite(spawn.pos.x+2,spawn.pos.y-2,STRUCTURE_STORAGE);

            //create link next to storage
            spawn.room.createConstructionSite(spawn.pos.x+3,spawn.pos.y-3,STRUCTURE_LINK);

            //Create TOWERS
            spawn.room.createConstructionSite(spawn.pos.x+2,spawn.pos.y+2,STRUCTURE_TOWER);//right down
            spawn.room.createConstructionSite(spawn.pos.x-2,spawn.pos.y+2,STRUCTURE_TOWER);//left down
            spawn.room.createConstructionSite(spawn.pos.x-2,spawn.pos.y-2,STRUCTURE_TOWER);//left up
            spawn.room.createConstructionSite(spawn.pos.x-6,spawn.pos.y,STRUCTURE_TOWER);//left
            spawn.room.createConstructionSite(spawn.pos.x+6,spawn.pos.y,STRUCTURE_TOWER);//right
            spawn.room.createConstructionSite(spawn.pos.x,spawn.pos.y-6,STRUCTURE_TOWER);//up

            //create terminal
            spawn.room.createConstructionSite(spawn.pos.x+1,spawn.pos.y-1,STRUCTURE_TERMINAL);// build terminal

            create_ramparts(spawn);
            
        }
module.exports = setBaseLayout;