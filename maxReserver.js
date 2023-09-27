function maxReserver(cap)// return array with max possible work parts for hauler
{
    if (cap > 2600) {
        cap = 2600;
    }
    var parts = [];
    parts.push(CLAIM)
    parts.push(MOVE);
    cap -= 650;

    //console.log("avaliable work parts: ", Math.floor(cap/100));
    for (let i = 0; i < Math.floor(cap / 650); i++) {
        parts.push(MOVE);
        parts.push(CLAIM);
    }
    return parts;
}
module.exports = maxReserver;