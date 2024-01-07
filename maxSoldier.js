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
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    //parts.push(TOUGH)
    //parts.push(TOUGH)
    cap-=390;
    
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/130)-2;i++)
    {
        parts.push(ATTACK);
        parts.push(MOVE);
    }
    parts.push(HEAL);
    
    return parts;
}
module.exports = maxSoldier;