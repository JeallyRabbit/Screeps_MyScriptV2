function maxFarmer(cap,spawn,limit)// return array with max possible work parts for builder
{
    var parts=[];
    if(limit==undefined)
    {
        limit=false;
    }
    if(cap>2000 && limit==true)
    {
        cap=2000;
    }
    if(cap>1100)
    {
        parts.push(CARRY);
        parts.push(CARRY);
        cap-=100;
    }
    
    parts.push(MOVE);
    parts.push(CARRY);
    //parts.push(CARRY);
    parts.push(WORK);
    //parts.push(MOVE);
    parts.push(WORK);
    cap-=300;
    if(cap>100)
    {
        parts.push(MOVE);
        cap-=100;
    }
    // limit to 5 iterations
    if(spawn.memory.state.includes('STATE_DEVELOPING') && cap>1050)
    {
        cap=1050
    }
    for(let i=0;i<Math.floor(cap/150);i++)
    {
        parts.push(MOVE);
        parts.push(WORK);
    }
    return parts;
}
module.exports = maxFarmer;