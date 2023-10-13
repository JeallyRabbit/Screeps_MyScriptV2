function maxHauler(cap,spawn)// return array with max possible work parts for hauler
{
    var rcl=spawn.room.controller.level;
    
    cap=cap%2000+1;
    var parts=[];
    parts.push(MOVE);
    parts.push(CARRY);
    cap-=100;
    
    for(let i=0;i<rcl-1;i++)//minimum body
    {
        parts.push(MOVE);
        parts.push(CARRY);
        cap-=100;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for(let i=0;i<Math.floor(cap/100);i++)
    {
        parts.push(MOVE);
        parts.push(CARRY);
    }
    return parts;
}
module.exports = maxHauler;