function maxSoldier2(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>2280)
    {
        cap=2280;
    }

    for(let i=0;i<Math.floor(cap/140);i++)
    {
        parts.push(MOVE);
        parts.push(MOVE);
        parts.push(RANGED_ATTACK);
        parts.push(TOUGH);
    }
    
    return parts;
}
module.exports = maxSoldier2;