function maxKeeperFarmer(cap,spawn)// return array with max possible work parts for builder
{
    var parts=[]
    if(cap<1650)
    {
        cap=1650
    }
    

    parts.push(MOVE)
    parts.push(WORK)
    parts.push(CARRY)

    parts.push(MOVE)
    parts.push(WORK)
    parts.push(CARRY)
    
    parts.push(MOVE)
    parts.push(WORK)
    parts.push(CARRY)
    cap-=600;

    
    if(spawn!=undefined && spawn.memory.is_for_mineral==true)
    {
        if(cap>3250){cap=3250}
        for(let i=0;i<cap/250;i++)
        {
            parts.push(WORK)
            parts.push(WORK)
            parts.push(MOVE)
        }
        return parts
    }
    if(cap>3000)
    {
        cap=3000
    }

    for(let i=0;i<7;i++)
    {
        parts.push(MOVE)
        parts.push(WORK)
    }
    cap-=1050;

    for(var i=0;i<cap%150;i++)
    {
        parts.push(MOVE)
        parts.push(WORK)
    }

    return parts
}
module.exports = maxKeeperFarmer;