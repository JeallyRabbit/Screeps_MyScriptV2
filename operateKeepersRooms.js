Spawn.prototype.operateKeepersRooms = function operateKeepersRooms() {

    //Game.rooms[keeperRoom].memory.lairs
    //Game.rooms[keeperRoom].memory.hostiles
    //Game.rooms[keeperRoom].memory.containers
    //Game.rooms[keeperRoom].memory.droppedEnergy

    if(this.memory.keepers_rooms==undefined){return}

    for (let keeperRoom of this.memory.keepers_rooms) {
        var room = Game.rooms[keeperRoom.name]

        if (room != undefined && room != null) {

            // lairs
            if (room.memory.lairs != undefined && room.memory.lairs.length > 0) {
                for (lair_id of room.memory.lairs) {
                    if (Game.getObjectById(lair_id) == null) {
                        room.memory.lairs = undefined;
                        break;
                    }
                }
            }

            if (room.memory.lairs == undefined || room.memory.lairs.length==0) {
                room.memory.lairs = [];
                var lairs = room.find(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.structureType == STRUCTURE_KEEPER_LAIR
                        }
                })
                if (lairs.length > 0) {
                    
                    for (a of lairs) {
                        room.memory.lairs.push(a.id)
                    }
                }
            }

            //invaders

            if (room.memory.invaders != undefined && room.memory.invaders.length > 0) {
                for (hostile_id of room.memory.invaders) {
                    if (Game.getObjectById(hostile_id) == null) {
                        room.memory.invaders = undefined;
                        break;
                    }
                }
            }

            if (room.memory.invaders == undefined || room.memory.invaders.length==0) {
                room.memory.invaders = [];
                var invaders = room.find(FIND_HOSTILE_CREEPS,{filter: 
                    function(hostile)
                    {
                        return hostile.owner.username=='Invader'
                    }
                })
                if (invaders.length > 0) {
                    room.memory.inavded=true
                    for (a of invaders) {
                        room.memory.invaders.push(a.id)
                    }
                }
                else{
                    room.memory.inavded=false
                }
            }


            //hostiles
            if (room.memory.hostiles != undefined && room.memory.hostiles.length > 0) {
                for (hostile_id of room.memory.hostiles) {
                    if (Game.getObjectById(hostile_id) == null) {
                        room.memory.hostiles = undefined;
                        break;
                    }
                }
            }

            if (room.memory.hostiles == undefined || room.memory.hostiles.length==0) {
                room.memory.hostiles = [];
                var hostiles = room.find(FIND_HOSTILE_CREEPS)
                if (hostiles.length > 0) {
                    
                    for (a of hostiles) {
                        room.memory.hostiles.push(a.id)
                    }
                }
            }


            //containers
            if (room.memory.containers != undefined && room.memory.containers.length > 0) {
                for (containers_id of room.memory.containers) {
                    if (Game.getObjectById(containers_id) == null) {
                        room.memory.containers = undefined;
                        break;
                    }
                }
            }

            if (room.memory.containers == undefined || room.memory.containers.length==0) {
                room.memory.containers = [];
                var containers = room.find(FIND_STRUCTURES,{filter:
                    function(str)
                    {
                        return str.structureType==STRUCTURE_CONTAINER
                    }
                })
                if (containers.length > 0) {
                    
                    for (a of containers) {
                        room.memory.containers.push(a.id)
                    }
                }
            }

            // dropped energy
            if (room.memory.droppedEnergy != undefined && room.memory.droppedEnergy.length > 0) {
                for (droppedEnergy_id of room.memory.droppedEnergy) {
                    if (Game.getObjectById(droppedEnergy_id) == null) {
                        room.memory.droppedEnergy = undefined;
                        break;
                    }
                }
            }

            if ((room.memory.droppedEnergy == undefined || room.memory.droppedEnergy.length==0 )&& Game.time%3==0) {
                room.memory.droppedEnergy = [];
                var droppedEnergy = room.find(FIND_DROPPED_RESOURCES,{filter:
                    function (res)
                    {
                        return res.resourceType==RESOURCE_ENERGY
                    }
                })
                if (droppedEnergy.length > 0) {
                    
                    for (a of droppedEnergy) {
                        room.memory.droppedEnergy.push(a.id)
                    }
                }
            }

        }
    }







}