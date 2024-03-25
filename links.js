var links = {

    /** @param {Game} game **/
    tick: function (spawn) {

        if (spawn.room.storage == undefined) {
            return;
        }
        if (spawn.memory.manager_link_id != undefined && Game.getObjectById(spawn.memory.manager_link_id) == null) {
            spawn.memory.manager_link_id == undefined;
        }
        if (spawn.memory.manager_link_id == undefined) {
            var manager_link = spawn.room.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.room.storage.pos.x - 2 && str.pos.y == spawn.room.storage.pos.y;
                }
            });
            if (manager_link != undefined && manager_link.length > 0) {
                spawn.memory.manager_link_id = manager_link[0].id;
            }
        }

        if (spawn.memory.other_links != undefined) {
            if (spawn.memory.other_links.length == 0 || spawn.memory.filler_link == undefined || Game.getObjectById(spawn.memory.filler_link) == null) {
                spawn.memory.other_links = undefined;
            }
            else {
                for (let link in spawn.memory.other_links) {
                    if (Game.getObjectById(link) == null) {
                        spawn.memory.other_links = undefined;
                        break;
                    }
                    /*
                    else {
                        if (Game.getObjectById(link).pos.x==spawn.pos.x && Game.getObjectById(link).pos.y==spawn.pos.y-2) {
                            spawn.memory.filler_link = link;
                            break;
                        }
                    }
                    */
                }
            }
        }
        if (spawn.memory.other_links == undefined || spawn.memory.filler_link == undefined || Game % 321 == 0) {
            var other_links = spawn.room.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && (str.pos.x != spawn.room.storage.pos.x - 2 || str.pos.y != spawn.room.storage.pos.y);
                }
            });
            if (other_links != undefined && other_links.length > 0) {
                spawn.memory.other_links = [];
                for (let other_link of other_links) {
                    //console.log("other_link_id: ", other_link.id);
                    spawn.memory.other_links.push(other_link.id);
                    if (other_link.pos.x == spawn.pos.x && other_link.pos.y == spawn.pos.y - 2) {
                        spawn.memory.filler_link = other_link.id;
                    }
                }

            }
        }
        if (Game.getObjectById(spawn.memory.manager_link_id) != null && ( spawn.memory.other_links!=undefined && spawn.memory.other_links.length>0)) {
            //console.log("looping almost");
            for (target of spawn.memory.other_links) {
                if (Game.getObjectById(target).store[RESOURCE_ENERGY] < 600) {
                    if (Game.getObjectById(spawn.memory.manager_link_id).transferEnergy(Game.getObjectById(target)) == OK) {
                        break;
                    }
                }

            }
        }
        /*
        if (manager_link.length > 0 && other_links.length > 0) {
            for (target in other_links) {
                if (manager_link[0].transferEnergy(target) == OK) {
                    break;
                }
            }
        }*/



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