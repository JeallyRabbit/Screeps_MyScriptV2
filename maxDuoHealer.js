function maxDuoHealer(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>7500)
    {
        cap=7500;
    }
    parts.push(MOVE);
    parts.push(HEAL);
    //parts.push(TOUGH)
    //parts.push(TOUGH)
    cap-=300;
    
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/300);i++)
    {
        parts.push(MOVE);
        parts.push(HEAL);
    }
    
    return parts;
}
module.exports = maxDuoHealer;