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




function setBaseLayout(spawn)// return most full energy deposit - container
{
    var myStructures=spawn.room.find(FIND_MY_STRUCTURES);
            /*
            for(let i=0;i<myStructures.length;i++)
            {   
                
                myStructures[i].pos.createConstructionSite(STRUCTURE_RAMPART);
                if(myStructures[i].structureType==STRUCTURE_EXTENSION)
                {
                    var positions=new RoomPosition(myStructures[i].pos.x,myStructures[i].pos.y,spawn.room.name).getNearbyPositions();
                    for(j=0;j<positions.length;j++)
                    {
                        //positions[j].createConstructionSite(STRUCTURE_RAMPART);
                    }
                }
            }
            */
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
}
module.exports = setBaseLayout;