function maxRepairer(cap, if_limit)// return array with max possible work parts for repairer
{
    var parts = [];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(CARRY);
    parts.push(WORK);
    cap -= 250;
    if (cap > 800 && if_limit == true) {
        cap = 800;
    }
    else {
        if (cap >= 250) {
            parts.push(MOVE);
            parts.push(CARRY);
            parts.push(CARRY);
            parts.push(WORK);
            cap -= 250
        }
        cap = cap % 1350
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for (let i = 0; i < Math.floor(cap / 150); i++) {
        parts.push(WORK);
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxRepairer;