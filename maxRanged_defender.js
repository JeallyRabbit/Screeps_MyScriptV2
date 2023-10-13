function maxRanged_defender(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(TOUGH)
    parts.push(TOUGH)
    cap-=150;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(TOUGH)
        parts.push(TOUGH)
    }
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(RANGED_ATTACK);
    }
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
    }
    
    
    return parts;
}
module.exports = maxRanged_defender;