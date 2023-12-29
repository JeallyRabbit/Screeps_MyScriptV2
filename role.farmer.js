var RoomPositionFunctions = require('roomPositionFunctions');
//var routeCreep = require('routeCreep');

var roleFarmer = {
    run: function (creep, spawn) {

        //creep.say(creep.room.controller.reservation.username);
        var sources = creep.room.find(FIND_SOURCES);
        var target_room = creep.memory.target_room;
        //console.log(target_room);
        //var x_source=25,y_source=25;
        var repair_sites=creep.room.find(FIND_STRUCTURES, {
            filter: object => object.hits<object.hitsMax && object.hits<150000 && object.hits!=object.hitsMax
            && object.structureType!=STRUCTURE_ROAD && object.pos.inRangeTo(creep.pos,3)
        });
        var construction_sites=creep.room.find(FIND_CONSTRUCTION_SITES,{
            filter: function (structure)
            {
                return structure.pos.inRangeTo(creep.pos,3);
            }
        });
        if(creep.store[RESOURCE_ENERGY]==0)
        {
            creep.memory.building=false;
        }
        else if(creep.store.getFreeCapacity(RESOURCE_ENERGY)==0 && construction_sites!=undefined)
        {
            creep.memory.building=true;
        }
        
        if(creep.room.name==target_room && creep.memory.building==true && (repair_sites.length>0 || construction_sites.length>0))
        {
            //creep.say("REP");
            //roleRepairer.run(creep);

            if(repair_sites.length ) {//repair close sites
                if(creep.repair(repair_sites[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(repair_sites[0]);
                }
            }
            else
            {//build close sites
                if(creep.memory.building==true)
                {
                    var closest_construction=creep.pos.findClosestByRange(construction_sites);
                    if(creep.build(closest_construction) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closest_construction);
                    }
                }
                
            }

        }
        else if (creep.room.name == target_room && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) 
        {// if have some free space and at destination room - go harvest
            //creep.say("!");
            var position=creep.pos;
            if (position.x > 48) {
                creep.move(LEFT);
            }
            else if (position.x < 2) {
                creep.move(RIGHT);
            }
            if (position.y > 48) {
                creep.move(TOP);
            }
            else if (position.y < 2) {
                creep.move(BOTTOM);
            }

            var sources = creep.room.find(FIND_SOURCES);
            
            var min_source_farmers=10;
            if (creep.memory.source_id == undefined || (creep.ticksToLive%2==0)
                 && creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id))==false )  {
                //console.log("sources: ",sources.length);
                creep.say("#");
                var sources = creep.room.find(FIND_SOURCES);
                var min_hp=100;
                var sources_hp=[];
                sources_hp[0]=sources[0];
                for(let i=0;i<sources.length;i++){sources_hp[i]=0;}
    
                for (let i=0;i<sources.length;i++)
                {
                    var farmers=creep.room.find(FIND_MY_CREEPS,{
                        filter: farmer => farmer.pos.isNearTo(sources[i])
                    });
                    for(let j=0;j<farmers.length;j++)
                    {
                        sources_hp[i]+=_.filter(farmers[j].body, { type: WORK }).length*2;
                    }
                    if(sources_hp[i]<min_hp+_.filter(creep.body, { type: WORK }).length*2)
                    {
                        creep.memory.source_id=sources[i].id;
                        min_hp=sources_hp[i];
                    }
                }
                /*
                for (let i = 0; i < sources.length; i++) {
                    //console.log("open positions: ", sources[i].pos.getOpenPositions());
                    if (sources[i].pos.getOpenPositions().length < min_source_farmers && sources[i].pos.getOpenPositions().length>0) {
                        //creep.say(sources[i].pos.getOpenPositions().length);
                        min_source_farmers=sources[i].pos.getOpenPositions().length ;
                        creep.memory.source_id = sources[i].id;
                        //console.log("harvest: ",creep.harvest(sources[i]));

                    }
                }*/
            }
            else if (Game.getObjectById(creep.memory.source_id).pos.getOpenPositions().length < 1 && 
            creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id))==false) 
            {// if sources became unavailable ( due to creeps around it) and creep is not near this source 
                creep.say(creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)));
                //console.log('Farmer .isnearto: ', creep.pos.isNearTo(Game.getObjectById(creep.memory.source_id)));
                creep.memory.source_id = undefined;
                //creep.say("U");
            }
            else {
                //creep.say(creep.harvest(sources[creep.memory.source_id]));
                if (creep.harvest(Game.getObjectById(creep.memory.source_id)) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(Game.getObjectById(creep.memory.source_id), { noPathFinding: false, reusePath: 9 });
                }
            }

        }
        else if (creep.room.name != target_room && creep.store[RESOURCE_ENERGY] == 0) 
        {// not in target room and have free space - go to target room
            const destination = new RoomPosition(25, 25, creep.memory.target_room); // Replace with your destination coordinates and room name


            if (!creep.memory.path) {
                // Calculate and cache the path if it doesn't exist in memory
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
                //creep.say("Calc");
            }

            if (creep.memory.path) {
                //creep.say("USE");

                const path = JSON.parse(creep.memory.path);
                if (path.length > 0) {
                    const moveResult = creep.moveByPath(path);
                    if (moveResult === OK) {
                        // Successfully moved along the path
                    } else if (moveResult === ERR_NOT_FOUND) {
                        // Path is no longer valid, clear the cached path
                        delete creep.memory.path;
                    }
                } else {
                    // The path is empty, meaning the creep has reached its destination
                    // Clear the cached path
                    delete creep.memory.path;
                }
            } else {
                // If the cached path doesn't exist, recalculate it and store it
                const path = creep.pos.findPathTo(destination, { ignoreCreeps: false });
                creep.memory.path = JSON.stringify(path);
            }

            //routeCreep(creep,destination);
            //creep.moveTo(new RoomPosition(25,25, creep.memory.target_room), {noPathFinding: true, reusePath: 5 });
        }
        else if (creep.room.name == creep.memory.target_room && creep.store.getFreeCapacity() == 0 /*&& creep.room.name==home_room*/)//if not in home room and no free space, put energy to most empty container
        {// in target room and no free space - put energy to container or build one if there is no container close

            //creep.say("FULL");
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                    && /*structure.pos.inRangeTo(creep.pos,3)*/
                    structure.store[RESOURCE_ENERGY]<2000
                    && structure.pos.inRangeTo(creep,5);
                }
            });
            
            
            if(containers.length>0)
            {// store in to container
                var closestContainer = creep.pos.findClosestByRange(containers);
                    var transfer_amount = 1;
                    transfer_amount = Math.min(creep.store[RESOURCE_ENERGY].getFreeCapacity, closestContainer.store[RESOURCE_ENERGY]);
                    if (creep.transfer(closestContainer, RESOURCE_ENERGY, transfer_amount) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(closestContainer);
                    }

            }
            else if(construction_sites.length<1)
            {// build container next to source
                
                creep.say("BU");
                var positions=new RoomPosition(Game.getObjectById(creep.memory.source_id).pos.x,Game.getObjectById(creep.memory.source_id).pos.y,creep.room.name).getOpenPositions2();
                
                if(positions!= undefined && positions.length>0)
                {
                    positions[0].createConstructionSite(STRUCTURE_CONTAINER);
                }
            }
            else{
                return;
            }
            

        }
    }
};
module.exports = roleFarmer;