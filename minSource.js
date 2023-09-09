function minSource(sources)// returns index of source with minimum HP if HP at this source is less than 14
{                           // else returns -1
    var min_source=-1;
    var min_source_value=9999999;// harvesting power at source
    for(let i=0;i<sources.length;i++)
    {
        if(sources[i]<min_source_value)
        {
            min_source=i;
            min_source_value=sources[i];
        }
    }
    if(min_source_value<14)
    {
        return min_source;
    }
    else
    {
        return -1;
    }
}
module.exports = minSource;