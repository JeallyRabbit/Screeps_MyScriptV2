function maxHarvester(cap)// return array with max possible work parts for harvester
{
    var parts=[];
    parts.push(MOVE);
    //parts.push(CARRY);
    parts.push(WORK);
    //parts.push(WORK);
    cap-=150;
    if(cap>600)
    {
        cap=600;
        parts.push(MOVE);
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/100);i++)
    {
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxHarvester;