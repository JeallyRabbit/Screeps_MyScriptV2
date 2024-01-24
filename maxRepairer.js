function maxRepairer(cap)// return array with max possible work parts for repairer
{
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=250;
    if(cap>800)
    {
        cap=800;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(WORK);
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxRepairer;