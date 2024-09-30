function maxSponge(cap)// return array with max possible work parts for hauler
{
    if (cap > 1950) {
        cap = 1950;
    }
    var parts = [];
    parts.push(HEAL)
    parts.push(MOVE)
    parts.push(MOVE)
    parts.push(ATTACK)
    cap -= 430;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for (let i = 0; i < Math.floor(cap / 1200); i++) {
        parts.push(MOVE);
        parts.push(TOUGH);
    }
    return parts;
}
module.exports = maxSponge;