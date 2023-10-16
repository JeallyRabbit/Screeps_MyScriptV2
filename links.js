var links = {

    /** @param {Game} game **/
    tick: function(spawn) {
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
            if(link.cooldown==0 && link.store[RESOURCE_ENERGY]>=600)
            {
                console.log(link.transferEnergy(target_link[0]));
            }
        })
	}
};

module.exports = links;