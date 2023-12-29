function maxSoldier(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>5000)
    {
        cap=5000;
    }

    if(cap>2500)
    {
        cap=2500;
    }
    parts.push(MOVE);
    parts.push(RANGED_ATTACK);
    parts.push(HEAL);
    //parts.push(TOUGH)
    //parts.push(TOUGH)
    cap-=450;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/200);i++)
    {
        parts.push(RANGED_ATTACK);
        parts.push(MOVE);
    }
    
    
    return parts;
}
module.exports = maxSoldier;