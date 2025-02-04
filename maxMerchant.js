function maxMerchant(cap)// return array with max possible work parts for hauler
{
    if(cap>850)
    {
        cap=850
    }
    var parts=[];
    parts.push(MOVE)
    parts.push(CARRY)
    cap-=100;
    for(var i=0;i<cap/50;i++)
    {
        parts.push(CARRY);
    }
    return parts
}
module.exports = maxMerchant;