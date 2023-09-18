function maxSoldier(cap)// return array with max possible work parts for hauler
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
        parts.push(MOVE);
        parts.push(ATTACK);
        parts.push(TOUGH)
        parts.push(TOUGH)
    }
    return parts;
}
module.exports = maxSoldier;