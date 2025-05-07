function maxQuadRanger(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>5100)
    {
        cap=5100;
    }

    parts.push(RANGED_ATTACK);
    parts.push(MOVE);
    parts.push(MOVE);
    parts.push(HEAL);
    cap-=500;
    
    for(let i=0;i<Math.floor(cap/200);i++)
    {
        parts.push(MOVE);
    }
    for(let i=0;i<Math.floor(cap/200);i++)
    {
        parts.push(RANGED_ATTACK);
    }
    
    return parts;
}
module.exports = maxQuadRanger;