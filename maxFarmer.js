function maxFarmer(cap,spawn,limit)// return array with max possible work parts for builder
{
    var rcl=spawn.room.controller.level;
    var rcl=0;
    var parts=[];
    if(limit==undefined)
    {
        limit=false;
    }
    if(cap>1000 && limit==true)
    {
        cap=1000;
    }
    if(cap>1100)
    {
        parts.push(CARRY);
        parts.push(CARRY);
        cap-=100;
    }
    
    parts.push(MOVE);
    parts.push(CARRY);
    //parts.push(CARRY);
    parts.push(WORK);
    //parts.push(MOVE);
    parts.push(WORK);
    cap-=300;
    if(cap>100)
    {
        parts.push(MOVE);
        cap-=100;
    }
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