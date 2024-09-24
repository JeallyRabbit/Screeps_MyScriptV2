function maxUpgrader(cap, spawn, max)// return array with max possible work parts for upgrader
{
    var rcl = spawn.room.controller.level;

    if (spawn.room.controller.level == 8 && spawn.memory.req_upgraders_parts < 10) {
        return [MOVE, CARRY, WORK]
    }
    else if (spawn.room.controller.level == 8) {
        cap = 1650;
    }
    else if (spawn.room.controller.level == 2) {
        return [MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, CARRY]
    }

    if (cap > 3200) {
        cap = 3200;
    }
    if (max != undefined && cap > max) {
        cap = max;
    }

    var parts = [];
    parts.push(MOVE);
    parts.push(CARRY);
    parts.push(WORK);
    cap -= 200;
    if (cap >= 150) {
        parts.push(MOVE);
        parts.push(CARRY);
        parts.push(MOVE)
        cap -= 150;
    }
    //console.log("avaliable work parts: ", Math.floor(cap/100));
    if (spawn.room.memory.distanceToController != undefined && spawn.room.memory.distanceToController > 10) {
        for (let i = 0; i < Math.floor(cap / 200); i++) {
            parts.push(WORK);
            parts.push(MOVE);
            parts.push(CARRY)
        }
    }
    else {

        for (let i = 0; i < Math.floor(cap / 150); i++) {
            parts.push(WORK);
            parts.push(MOVE);
        }
    }

    return parts;
}
module.exports = maxUpgrader;

