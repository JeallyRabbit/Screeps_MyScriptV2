function maxCarrier(cap)// return array with max possible work parts for hauler
{
    if(cap>400)
    {
        cap=400;
    }
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    cap-=100;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/100);i++)
    {
        parts.push(MOVE);
        parts.push(CARRY);
    }
    return parts;
}
module.exports = maxCarrier;