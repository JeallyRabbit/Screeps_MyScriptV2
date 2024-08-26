Spawn.prototype.links=function links (spawn){

   // /** @param {Game} game **/
    //tick: function (spawn) {

        if (spawn.room.storage == undefined ) {
            return;
        }

        /*
        spawn.memory.manager_link_id=undefined
        spawn.memory.filler_link_id=undefined
        spawn.memory.sources_links_id=undefined
        */

        // FIND MANAGER_LINK
        if (spawn.memory.manager_link_id != undefined && Game.getObjectById(spawn.memory.manager_link_id) == null) {
            spawn.memory.manager_link_id == undefined;
        }
        if (spawn.memory.manager_link_id == undefined && spawn.memory.manager_link_pos != undefined) {
            var manager_link = spawn.room.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.memory.manager_link_pos.x && str.pos.y == spawn.memory.manager_link_pos.y;
                }
            });
            if (manager_link != undefined && manager_link.length > 0) {
                spawn.memory.manager_link_id = manager_link[0].id;
            }
        }
        //console.log(spawn.memory.manager_link_id)

        // FIND FILLER LINK
        if (spawn.memory.filler_link_id != undefined && Game.getObjectById(spawn.memory.filler_link_id) == null) {
            spawn.memory.filler_link_id == undefined;
        }
        if (spawn.memory.filler_link_id == undefined && spawn.memory.filler_link_pos != undefined) {
            var manager_link = spawn.room.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.memory.filler_link_pos.x && str.pos.y == spawn.memory.filler_link_pos.y;
                }
            });
            if (manager_link != undefined && manager_link.length > 0) {
                spawn.memory.filler_link_id = manager_link[0].id;
            }
        }

        // FIND SOURCES LINKS

        if (spawn.memory.sources_links_id != undefined && spawn.memory.farming_rooms!=undefined && spawn.memory.farming_rooms.length>0) {
            if(spawn.memory.sources_links_id.length<spawn.memory.farming_rooms[0].sources_num)
            {
                spawn.memory.sources_links_id = undefined
            }
            else if (spawn.memory.sources_links_id.length > 0) {
                for (let id of spawn.memory.sources_links_id) {
                    if (Game.getObjectById(id) == null) {
                        spawn.memory.sources_links_id = undefined
                    }
                }
            }
            else {
                spawn.memory.sources_links_id = undefined
            }

        }
        if (spawn.memory.sources_links_id == undefined) {
            spawn.memory.sources_links_id = [];
            if (spawn.memory.sources_links_pos != undefined && spawn.memory.sources_links_pos.length > 0) {
                var src1_link = spawn.room.find(FIND_STRUCTURES, {
                    filter: function (str) {
                        return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.memory.sources_links_pos[0].x && str.pos.y == spawn.memory.sources_links_pos[0].y;
                    }
                });
                if (src1_link != undefined && src1_link.length > 0) {
                    spawn.memory.sources_links_id.push(src1_link[0].id)
                }
            }

            if (spawn.memory.sources_links_pos != undefined && spawn.memory.sources_links_pos.length > 1) {
                var src2_link = spawn.room.find(FIND_STRUCTURES, {
                    filter: function (str) {
                        return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.memory.sources_links_pos[1].x && str.pos.y == spawn.memory.sources_links_pos[1].y;
                    }
                });
                if (src2_link != undefined && src2_link.length > 0) {
                    spawn.memory.sources_links_id.push(src2_link[0].id)
                }
            }
        }

        // FIND CONTROLLER LINK

        if (spawn.memory.controller_link_id != undefined && Game.getObjectById(spawn.memory.controller_link_id) == null) {
            spawn.memory.controller_link_id == undefined;
        }
        if (spawn.memory.controller_link_id == undefined && spawn.memory.controller_link_pos != undefined) {
            var controller_link = spawn.room.find(FIND_STRUCTURES, {
                filter: function (str) {
                    return str.structureType == STRUCTURE_LINK && str.pos.x == spawn.memory.controller_link_pos.x && str.pos.y == spawn.memory.controller_link_pos.y;
                }
            });
            if (controller_link != undefined && controller_link.length > 0) {
                spawn.memory.controller_link_id = controller_link[0].id;
            }
        }



        var manager_link = Game.getObjectById(spawn.memory.manager_link_id)
        var filler_link = Game.getObjectById(spawn.memory.filler_link_id)
        var controller_link = Game.getObjectById(spawn.memory.controller_link_id)
        var sources_links = []
        for (let link_id of spawn.memory.sources_links_id) {
            var link = Game.getObjectById(link_id)
            if (link != null) {
                sources_links.push(link)
            }
        }

        // Driver for manager link
        if (manager_link != undefined && manager_link != null && manager_link.cooldown == 0) {
            //console.log("manager Link")
            if (manager_link != null && manager_link.cooldown == 0 && manager_link.store[RESOURCE_ENERGY] >= 700) {
                //console.log("controller link: ",controller_link.id)
                var transfered = false
                //transfer to filler link
                if (filler_link != null && filler_link.store.getFreeCapacity([RESOURCE_ENERGY]) > 150) {
                    //console.log("transfering to filler")
                    if(manager_link.transferEnergy(filler_link)==0)
                    {
                        transfered = true;
                    }
                    
                }
                if (controller_link != null && controller_link.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                    //console.log("transfering to controller")
                    manager_link.transferEnergy(controller_link)
                }
            }
        }

        // Driver for sources_links
        if (sources_links != undefined && sources_links.length > 0) {
            for (let src_link of sources_links) {
                if (src_link.cooldown == 0 && src_link.store[RESOURCE_ENERGY] > 400) {
                    var transfered = false;
                    if (filler_link != null && filler_link.store.getFreeCapacity([RESOURCE_ENERGY]) > 150) {
                        if(src_link.transferEnergy(filler_link)==0)
                        {
                            transfered = true;
                        }
                        
                    }
                    if (manager_link != null && manager_link.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                        if(src_link.transferEnergy(manager_link)==0)
                        {
                            transfered=true
                        }
                    }
                    if (manager_link != null && manager_link.store.getFreeCapacity([RESOURCE_ENERGY]) > 150 && transfered == false) {
                        if(src_link.transferEnergy(manager_link)==0)
                        {
                            transfered=true
                        }
                    }
                }
            }
        }
    //}
}//;

//module.exports = links;