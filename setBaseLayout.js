function setBaseLayout(spawn)// return most full energy deposit - container
{
    var myStructures=spawn.room.find(FIND_MY_STRUCTURES);
            for(let i=0;i<myStructures.length;i++)
            {
                myStructures[i].pos.createConstructionSite(STRUCTURE_RAMPART);
                if(myStructures[i].structureType==STRUCTURE_EXTENSION)
                {
                    var positions=new RoomPosition(myStructures[i].pos.x,myStructures[i].pos.y,spawn.room.name).getNearbyPositions();
                    for(j=0;j<positions.length;j++)
                    {
                        positions[j].createConstructionSite(STRUCTURE_RAMPART);
                    }
                }
            }

            for(let i=1;i<4;i++)
            {
                var x=spawn.pos.x+i;
                var y=spawn.pos.y+i;
                spawn.room.createConstructionSite(x,y,STRUCTURE_ROAD);

                if(i>1)
                {
                    var positions=new RoomPosition(x,y,spawn.room.name).getOpenPositions();
                    for(let j=0;j<positions.length;j++)
                    {
                        spawn.room.createConstructionSite(positions[j],STRUCTURE_EXTENSION);
                    }
                }
                
            }
            for(let i=1;i<4;i++)
            {
                var x=spawn.pos.x+i;
                var y=spawn.pos.y-i;
                spawn.room.createConstructionSite(x,y,STRUCTURE_ROAD);
                if(i>1)
                {
                    var positions=new RoomPosition(x,y,spawn.room.name).getOpenPositions();
                    for(let j=0;j<positions.length;j++)
                    {
                        spawn.room.createConstructionSite(positions[j],STRUCTURE_EXTENSION);
                    }
                }

            }
            for(let i=1;i<4;i++)
            {
                var x=spawn.pos.x-i;
                var y=spawn.pos.y+i;
                spawn.room.createConstructionSite(x,y,STRUCTURE_ROAD);
                if(i>1)
                {
                    var positions=new RoomPosition(x,y,spawn.room.name).getOpenPositions();
                    for(let j=0;j<positions.length;j++)
                    {
                        spawn.room.createConstructionSite(positions[j],STRUCTURE_EXTENSION);
                    }
                }
            }
            for(let i=1;i<4;i++)
            {
                var x=spawn.pos.x-i;
                var y=spawn.pos.y-i;
                spawn.room.createConstructionSite(x,y,STRUCTURE_ROAD);
                if(i>1)
                {
                    var positions=new RoomPosition(x,y,spawn.room.name).getOpenPositions();
                    for(let j=0;j<positions.length;j++)
                    {
                        spawn.room.createConstructionSite(positions[j],STRUCTURE_EXTENSION);
                    }
                }
            }
}
module.exports = setBaseLayout;