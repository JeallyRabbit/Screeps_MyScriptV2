RoomPosition.prototype.getNearbyPositions=function getNearbyPositions(){
    var positions=[];

    let startX=this.x-1 || 1;
    let startY=this.y-1 || 1;

    for (x=startX;x<=this.x+1 && x<49;x++)
    {
        for(y=startY;y<=this.y+1 && y<49;y++)
        {
            if(x!== this.x || y!== this.y)
            {
                positions.push(new RoomPosition(x,y,this.roomName));
            }
        }
    }
    return positions;
}

RoomPosition.prototype.getNearbyPositions2=function getNearbyPositions2(){
    var positions=[];

    let startX=this.x-4 || 4;
    let startY=this.y-4 || 4;

    for (x=startX;x<=this.x+4 && x<49;x++)
    {
        for(y=startY;y<=this.y+4 && y<49;y++)
        {
            if(x!== this.x || y!== this.y)
            {
                positions.push(new RoomPosition(x,y,this.roomName));
            }
        }
    }
    return positions;
}


RoomPosition.prototype.getOpenPositions=function getOpenPositions(){ //returns open nearby positions around 
    let nearbyPositions = this.getNearbyPositions();

    
    let terrain = Game.map.getRoomTerrain(this.roomName);

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

RoomPosition.prototype.getOpenPositions2=function getOpenPositions2(){ //returns open nearby positions around (creep can be on such pos)
    let nearbyPositions = this.getNearbyPositions();
    
    let terrain = Game.map.getRoomTerrain(this.roomName);

    let walkablePositions =_.filter(nearbyPositions, function(pos)
    {
        return terrain.get(pos.x,pos.y) !== TERRAIN_MASK_WALL;

    });

    return walkablePositions;
}