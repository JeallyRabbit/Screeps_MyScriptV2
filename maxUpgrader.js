function maxUpgrader(cap)// return array with max possible work parts for upgrader
{
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=200;
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/250);i++)
    {
        parts.push(CARRY);
        parts.push(WORK);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxUpgrader;