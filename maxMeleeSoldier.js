function maxMeleeSoldier(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap==undefined || cap>3250)
    {
        cap=3250;
    }

    /*
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    parts.push(MOVE);
    parts.push(ATTACK);
    */
    
    parts.push(ATTACK);
    parts.push(MOVE);
    //parts.push(TOUGH)
    //parts.push(TOUGH)
    cap-=130;
    
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/130);i++)
    {
        parts.push(MOVE);
    }
    for(let i=0;i<Math.floor(cap/130);i++)
    {
        parts.push(ATTACK);
    }
    
    return parts;
}
module.exports = maxMeleeSoldier;