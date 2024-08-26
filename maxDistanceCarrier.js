function maxDistanceCarrier(cap,spawn,limit,min)// return array with max possible work parts for hauler
{
    if(min!=undefined && min>cap)
    {
        
        cap=min;
    }
    var rcl=spawn.room.controller.level;
    if(limit==undefined)
    {
        limit=false;
    }
    if(limit==true)
    {
        if(cap>1200)
        {
            cap=1200;
        }
    }
    else{
        if(cap>1950)
        {
            cap=1950;
        }
    }
    
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    cap-=150;
    /*
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    cap-=150;
    */
    

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(CARRY);
    }
    return parts;
}
module.exports = maxDistanceCarrier;