function maxClaimer(cap)// return array with max possible work parts for hauler
{
    if(cap>1000)
    {
        cap=1000;
    }
    var parts=[];
    parts.push(CLAIM);
    cap-=600;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/50);i++)
    {
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxClaimer;