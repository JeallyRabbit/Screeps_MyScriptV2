function maxRampartRepairer(cap, limit, min)// return array with max possible work parts for upgrader
{

    if (min != undefined && cap < min) {
        return []
    }

    if (cap != undefined && cap > 3200) {
        cap = 3200;
    }


    var parts = [];
    parts.push(MOVE);
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    limit-=1;
    cap -= 250;
    //console.log("avaliable work parts: ", Math.floor(cap/100));

    for (let i = 0; i < Math.min(Math.floor(cap / 250),limit); i++) {
        parts.push(CARRY);
        parts.push(WORK);
        parts.push(MOVE);
        parts.push(MOVE);
    }

    return parts;
}
module.exports = maxRampartRepairer;

