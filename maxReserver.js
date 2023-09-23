function maxReserver(cap)// return array with max possible work parts for hauler
{
    if(cap>1500)
    {
        cap=1500;
    }
    var parts=[];
    parts.push(CLAIM);
    parts.push(CLAIM)
    parts.push(MOVE);
    cap-=1350;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/50);i++)
    {
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxReserver;