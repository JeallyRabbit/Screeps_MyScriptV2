function maxSoldier(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>5000)
    {
        cap=5000;
    }

    /*
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    */
    
    parts.push(RANGED_ATTACK);
    parts.push(MOVE);
    parts.push(MOVE);
    parts.push(HEAL);
    //parts.push(TOUGH)
    //parts.push(TOUGH)
    cap-=500;
    
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/500);i++)
    {
        parts.push(MOVE);
        parts.push(MOVE);
    }
    for(let i=0;i<Math.floor(cap/500);i++)
    {
        parts.push(RANGED_ATTACK);
    }
    for(let i=0;i<Math.floor(cap/500);i++)
    {
        parts.push(HEAL);
    }
    
    return parts;
}
module.exports = maxSoldier;