function maxColonizer(cap, spawn, limit)// return array with max possible work parts for upgrader
{
    //var rcl=spawn.room.controller.level;


    if (cap > 3200) {
        cap = 3200;
    }
    if (limit != undefined && cap>limit) {
        cap = limit
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
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    cap -= 250;
    //console.log("avaliable work parts: ", Math.floor(cap/100));

    for (let i = 0; i < Math.floor(cap / 250); i++) {
        parts.push(CARRY);
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(MOVE);
    }

    return parts;
}
module.exports = maxColonizer;

