function maxFarmer(cap)// return array with max possible work parts for builder
{
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=250;
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxFarmer;