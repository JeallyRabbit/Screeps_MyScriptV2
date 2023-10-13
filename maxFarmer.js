function maxFarmer(cap,spawn)// return array with max possible work parts for builder
{
    var rcl=spawn.room.controller.level;
    var rcl=0;
    cap=cap%1300+1;
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    parts.push(WORK);
    cap-=250;
    for(let i=0;i<rcl/2;i++)
    {
        parts.push(WORK);
        parts.push(MOVE);
        cap-=150;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxFarmer;