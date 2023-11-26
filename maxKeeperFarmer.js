function maxKeeperFarmer(cap,spawn)// return array with max possible work parts for KeeperFarmer
{
    var parts=[];
    if(cap>3750)
    {
        cap=3750;
    }
    for(let i=0;i<cap/150;i++)
    {
        parts.push(WORK);
        parts.push(MOVE);
    }
    return parts;
}
module.exports = maxKeeperFarmer;