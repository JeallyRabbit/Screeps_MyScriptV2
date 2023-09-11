RoomPosition.prototype.getNearbyPositions=function getNearbyPositions(){
    var positions=[];

    let startX=this.x-1 || 1;
    let startY=this.y-1 || 1;

    for (x=startX;x<=this.x+1 && x<49;x++)
    {
        for(y=startY;y<=this.x+1 && y<49;y++)
        {
            if(x!== this.x || y!== this.y)
            {
                positions.push(new RoomPosition(x,y,this.roomName));
            }
        }
    }
    return positions;
}

RoomPosition.prototype.getOpenPositions=function getOpenPositions(){
    let nearbyPositions = this.getNearbyPositions();

    
    let terrain = Game.map.getRoomTerrain(this.roomName);
    /*
    switch(terrain.get(10,15))
    {
        case TERRAIN_MASK_WALL:
            break;
        case TARRAIN_MASK_SWAMP:
            break;
        case 0:
            break;
    }
    */
    /*
    const found=Game.flags.Flag1.pos.lookFor(LOOK_CREEPS);

    if(found.length && found[0].getActiveBodyparts(ATTACK)==0)
    {
        creep.moveTO(found[0]);
    }
    */

    let walkablePositions =_.filter(nearbyPositions, function(pos)
    {
        return terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL;

    });

    let freePositions=_.filter(walkablePositions, function(pos)
    {
        return !pos.lookFor(LOOK_CREEPS).length;

    });

    return freePositions;
}