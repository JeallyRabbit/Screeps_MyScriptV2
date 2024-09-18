function maxSoldier2(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>3120)
    {
        cap=3120;
    }

    for(let i=0;i<Math.floor(cap/260);i++)
    {
        parts.push(MOVE);
        parts.push(MOVE);
        parts.push(RANGED_ATTACK);
        parts.push(TOUGH);
    }
    
    return parts;
}
module.exports = maxSoldier2;