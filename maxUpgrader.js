function maxUpgrader(cap,spawn)// return array with max possible work parts for upgrader
{
    var rcl=spawn.room.controller.level;
    
    
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
        parts.push(CARRY);
        parts.push(WORK);
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxUpgrader;

