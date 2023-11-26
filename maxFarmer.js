function maxFarmer(cap,spawn,limit)// return array with max possible work parts for builder
{
    var rcl=spawn.room.controller.level;
    var rcl=0;
    if(limit==undefined)
    {
        limit=false;
    }
    if(cap>1400 && limit==true)
    {
        cap=1400;
    }
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=250;
    /*
    for(let i=0;i<rcl-1;i++)
    {
        parts.push(WORK);
        parts.push(MOVE);
        cap-=150;
    }*/
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxFarmer;