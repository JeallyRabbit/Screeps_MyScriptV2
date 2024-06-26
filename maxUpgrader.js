function maxUpgrader(cap, spawn, max)// return array with max possible work parts for upgrader
{
    var rcl = spawn.room.controller.level;

    if(spawn.room.controller.level==8 && spawn.memory.req_upgraders_parts<10)
    {
        return [MOVE,CARRY,WORK]
    }
    else if(spawn.room.controller.level==8 )
        {
            cap=1250;
        }
    if (cap > 3200) {
        cap = 3200;
    }
    if (max != undefined && cap > max) {
        cap = max;
    }
    //temporary
    /*
    if(cap>1000)
    {
        cap=1000;
    }
    */
    var parts = [];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    cap -= 200;
    if (cap >=150) {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(MOVE)
        cap -= 150;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for (let i = 0; i < Math.floor(cap / 100); i++) {
        parts.push(WORK);
    }

    return parts;
}
module.exports = maxUpgrader;

