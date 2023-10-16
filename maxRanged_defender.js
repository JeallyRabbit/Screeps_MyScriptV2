function maxRanged_defender(cap)// return array with max possible work parts for hauler
{
    if(cap>2000)
    {
        cap=2000;
    }
    var parts=[];
    parts.push(MOVE);
    parts.push(RANGED_ATTACK);
    cap-=200;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/200);i++)
    {
        parts.push(RANGED_ATTACK);
        parts.push(MOVE);
    }
    
    
    return parts;
}
module.exports = maxRanged_defender;