function maxQuadRanger(cap)// return array with max possible work parts for hauler
{
    var parts = [];
    if (cap > 4800) {
        cap = 4800;
    }

    parts.push(RANGED_ATTACK);
    parts.push(MOVE);
    parts.push(MOVE);
    parts.push(HEAL);
    cap -= 500;

    for (let i = 0; i < Math.floor(cap / 500); i++) {
        parts.push(MOVE);
    }
    for (let i = 0; i < Math.floor(cap / 500); i++) {
        parts.push(MOVE);
    }
    for (let i = 0; i < Math.floor(cap / 500); i++) {
        parts.push(RANGED_ATTACK);
    }

    for (let i = 0; i < Math.floor(cap / 500); i++) {
        parts.push(HEAL);
    }
    return parts;
}
module.exports = maxQuadRanger;