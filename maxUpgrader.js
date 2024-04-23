function maxUpgrader(cap, spawn, max)// return array with max possible work parts for upgrader
{
    var rcl = spawn.room.controller.level;

    if(spawn.room.controller.level==8)
    {
        return [MOVE,CARRY,WORK]
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
    if (cap > 100) {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(MOVE)
        cap -= 150;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    if (spawn.room.controller.level == 8 && cap > 1000) {
        cap = 1000;
    }
    for (let i = 0; i < Math.floor(cap / 100); i++) {
        parts.push(WORK);
    }

    return parts;
}
module.exports = maxUpgrader;

