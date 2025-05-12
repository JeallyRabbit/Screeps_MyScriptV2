function maxFarmer(cap,spawn,limit)// return array with max possible work parts for builder
{
    var parts=[];
    if(limit==undefined)
    {
        limit=false;
    }
    var reqHarvPower=(SOURCE_ENERGY_CAPACITY/ENERGY_REGEN_TIME)-(2*HARVEST_POWER);

    if(cap>(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))*reqHarvPower && limit==true)
    {
        cap=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))*reqHarvPower;
    }
    parts.push(MOVE)
    parts.push(CARRY)
    parts.push(WORK)
    parts.push(WORK)
    cap-=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]));
    /*
    if(cap>750)
    {
        cap=750
    }
        */
    for(let i=0;i<Math.floor(cap/(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK])));i++)
    {
        parts.push(MOVE)
        parts.push(WORK)
        parts.push(WORK)
        cap-=(BODYPART_COST[MOVE]+(2*BODYPART_COST[WORK]))
    }
    
    return parts;
}
module.exports = maxFarmer;