function maxDistanceBuilder(cap)// return array with max possible work parts for builder
{
    if(cap>2000)
    {
        cap=2000;
    }
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=200;
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/200);i++)
    {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxDistanceBuilder;