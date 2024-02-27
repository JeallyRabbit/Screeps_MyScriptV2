var links = {

    /** @param {Game} game **/
    tick: function(spawn) {


        var manager_link=spawn.room.find(FIND_STRUCTURES,{
            filter:function(str)
            {
                return str.structureType==STRUCTURE_LINK && str.pos.x==spawn.room.storage.pos.x && str.pos.y==spawn.room.storage.pos.y;
            }
        });

        var other_links=spawn.room.find(FIND_STRUCTURES,{
            filter:function(str)
            {
                return str.structureType==STRUCTURE_LINK && (str.pos.x!=spawn.room.storage.pos.x || str.pos.y!=spawn.room.storage.pos.y);
            }
        });

        if(manager_link.length>0 && other_links.length>0)
        {
            for(target in other_links)
            {
                if(manager_link[0].transferEnergy(target)==OK)
                {
                    break;
                }
            }
        }
        /*
        var links = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: (structure)=>{ return structure.structureType==STRUCTURE_LINK
                         && structure.pos.x!=24 && structure.pos.y!=11}
                });
        //console.log("links: ",links);
        var target_link=spawn.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => { return structure.structureType==STRUCTURE_LINK &&
                 structure.pos.x == spawn.pos.x+3 && structure.pos.y == spawn.pos.y-3}
        });
        //console.log("target_link: ",target_link[0].pos);

        //links[0].transferEnergy(target_link,100);
        
        _.forEach(links, function(link){
            if(link.cooldown==0 && link.store[RESOURCE_ENERGY]>0 )
            {
                link.transferEnergy(target_link[0]);
            }
        })
        */
	}
};

module.exports = links;