function maxSponge(cap)// return array with max possible work parts for hauler
{
    if (cap > 2130) {
        cap = 2130;
    }
    var parts = [];
    
    cap -= 480;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for (let i = 0; i < Math.floor(cap / 110); i++) {
        parts.push(MOVE);
        parts.push(MOVE);
        parts.push(TOUGH);
    }

    parts.push(ATTACK)
    parts.push(MOVE)
    parts.push(MOVE)
    parts.push(MOVE)
    parts.push(HEAL)
    
    return parts;
}
module.exports = maxSponge;