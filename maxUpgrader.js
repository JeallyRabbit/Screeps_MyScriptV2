function maxUpgrader(cap,spawn)// return array with max possible work parts for upgrader
{
    var rcl=spawn.room.controller.level;
    
    cap=cap%2001;
    var parts=[];
    for(let i=0;i<rcl-1;i++)//minimum body
    {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(WORK);
        cap-=200;
    }
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

