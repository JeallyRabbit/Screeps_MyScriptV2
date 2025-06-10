

Creep.prototype.move_avoid_hostile= function move_avoid_hostile(creep,destination,reusePath,visualize) {

    //creep.memory.myPath=undefined
    if(visualize==undefined)
    {
        visualize=false;
    }
    if(creep.ticksToLive%reusePath==0)
    {
        creep.memory.myPath=undefined
    }
    
    if(creep.memory.myPath==undefined && creep.spawning==false && Game.cpu.bucket>1000 && Game.cpu.getUsed()<100)//&& Game.cpu.tickLimit-Game.cpu.getUsed()>50)
    {
        creep.say("renew path")
        var ret = PathFinder.search(this.pos, destination, {
            //maxRooms: 64,
            plainCost: 1,
            range: 5 ,
            swampCost: 5,
            maxOps: 8000,
    
            roomCallback: function (roomName) {
    
                
    
    
                let room = Game.rooms[roomName];
                if (!room) { return; }
                    costs = new PathFinder.CostMatrix;
                    const terrain = room.getTerrain()
    
                    for (let y = 0; y < 50; y++) {
                        for (let x = 0; x < 50; x++) {
                            const tile = terrain.get(x, y);
                            const weight =
                                tile === TERRAIN_MASK_WALL ? 255 : // wall  => unwalkable
                                    tile === TERRAIN_MASK_SWAMP ? 10 : // swamp => weight:  10
                                        1; // plain => weight:  2
                            costs.set(x, y, weight);
                        }
                    }
    
    
    
                //spawn.
                room.find(FIND_STRUCTURES).forEach(function (struct) {
                    if (struct.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(struct.pos.x, struct.pos.y, 1);
                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                        (struct.structureType !== STRUCTURE_RAMPART ||
                            !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 255);
                    }
                });
    
                //not avoiding construction sites
    
                //favour roads under construction
                //spawn.
                room.find(FIND_CONSTRUCTION_SITES, {
                    filter: function (construction) {
                        return construction.structureType == STRUCTURE_ROAD;
                    }
                }).forEach(function (struct) {
                    costs.set(struct.pos.x, struct.pos.y, 1);
                });
    

                room.find(FIND_HOSTILE_CREEPS).forEach(function (a) {
                    costs.set(a.pos.x, a.pos.y, 255);


                    for(var i=a.pos.x-5;i<a.pos.x+5;i++)
                    {
                        for(var j=a.pos.y-5;j<a.pos.y+5;j++)
                        {
                            if(i>=0 && i<=49 && j>=0 && i<=49)
                            {
                                costs.set(i,j,255)
                            }
                        }
                    }
                });

                room.find(FIND_HOSTILE_STRUCTURES).forEach(function (a) {
                    costs.set(a.pos.x, a.pos.y, 255);
                });


                room.find(FIND_CREEPS).forEach(function (a) {
                    costs.set(a.pos.x, a.pos.y, 255);
                });
                costs.set(creep.pos.x, creep.pos.y, 1);

                return costs;
            }
        });


        if(ret.incomplete==false )
        {
            //creep.say("ret: "+ret.incomplete)
            creep.memory.myPath=(ret.path)
            
            if(visualize==true)
            {
                for (a of ret.path) {
                    if(Game.rooms[a.roomName]!=undefined)
                    {
                        Game.rooms[a.roomName].visual.circle(a.x, a.y, { fill: 'white', radius: 0.5, stroke: 'red' });
                    }
                    
                }
            }
        }
        else{
            //creep.say(ret.incomplete)
        }
    }


    if(creep.memory.myPath!=undefined)
    {
        var aux_path=[]
        for(a of creep.memory.myPath)
        {
            aux_path.push(new RoomPosition(a.x,a.y,a.roomName))
        }
        var move_result=creep.moveByPath(aux_path)
        if(move_result==-5)
        {
            creep.memory.myPath=undefined
        }
       // creep.say(move_result)
        
       
    }
    //creep.move(BOTTOM)
}
