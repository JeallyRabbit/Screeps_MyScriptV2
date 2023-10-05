function maxHarvester(cap)// return array with max possible work parts for harvester
{
    var parts=[];
    parts.push(MOVE);
    //parts.push(CARRY);
    parts.push(WORK);
    parts.push(WORK);
    cap-=250;
    if(cap>500)
    {
        cap=500;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/100);i++)
    {
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxHarvester;