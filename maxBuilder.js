function maxBuilder(cap,spawn)// return array with max possible work parts for builder
{
    var rcl=spawn.room.controller.level;
    
    if(cap>3000)
    {
        cap=3000;
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
module.exports = maxBuilder;