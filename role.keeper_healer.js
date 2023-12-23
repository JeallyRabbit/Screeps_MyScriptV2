var RoomPositionFunctions=require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require('./move_avoid_hostile');

const keeper_Healer = {
    /** @param {Creep} creep **/
    run: function (creep) {
        creep.memory.target='E36S4';
        var friendlyDamagedCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: function (creep) {
                return creep.hits < creep.hitsMax && 
                (creep.memory.role=='keeperKiller' || creep.memory.role=='keeperHealer') 
                && (creep.pos.x>0 && creep.pos.x<49)
                && (creep.pos.y>0 && creep.pos.y<49);
            }
        });

        var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
        var to_avoid = [];
        for (let i = 0; i < keepers.length; i++) {
            to_avoid = to_avoid.concat(keepers[i].pos.getN_NearbyPositions(4));
        }

        var pos = creep.pos;
        if (pos.x > 48) {
            creep.move(LEFT);
        }
        else if (pos.x < 2) {
            creep.move(RIGHT);
        }
        if (pos.y > 48) {
            creep.move(TOP);
        }
        else if (pos.y < 2) {
            creep.move(BOTTOM);
        }

        ////creep.say("!");
        // Check if the creep has a target room
        if (!creep.memory.target) {
            //return 0;
        }
        // Check if the creep is in the target room
        if (creep.room.name !== creep.memory.target) {
            // If not, move to the target room
            const exitDir = Game.map.findExit(creep.room, creep.memory.target);
            //const exit = creep.pos.findClosestByPath(exitDir);
            const destination = new RoomPosition(25, 25, creep.memory.target);
            creep.moveTo(destination);
        }
        else {// If in the target room

            var keepers = creep.room.find(FIND_HOSTILE_CREEPS);
            //var to_avoid=keepers[0].pos.getNearbyPositions2();
           // console.log("to_avoid: ",to_avoid);


            if(creep.hits<creep.hitsMax)
            {
                creep.heal(creep);
            }
            const healers = creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'keeperHealer';
                }
            });
            const killers = creep.room.find(FIND_MY_CREEPS, {
                filter: function (creep) {
                    return creep.memory.role == 'keeperKiller';
                    //&& creep.pos.x>0 && creep.pos<49;
                }
            });

            if (killers.length < 1) {
                return 0;
            }

            if (killers.length >= 1) {// if there are killers go to them and support

                /*var friendlyDamagedCreeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (creep) {
                        return creep.hits < creep.hitsMax && 
                        (creep.memory.role=='keeperKiller' || creep.memory.role=='keeperHealer') ;
                    }
                });*/
                var friendlyHealthyKillers = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (killer) {
                        return killer.memory.role == 'keeperKiller';
                    }
                });
                // console.log("damaged: ",friendlyHealthyKillers.length);

                if (friendlyDamagedCreeps.length > 0) {//find most damaged one and heal up
                    ////creep.say("AAA");
                    var health_percentage = 100;
                    var damaged_id = 0;
                    for (let i = 0; i < friendlyDamagedCreeps.length; i++) {
                        if (friendlyDamagedCreeps[i].hits / friendlyDamagedCreeps[i].hitsMax < health_percentage)
                            damaged_id = i;
                        health_percentage = friendlyDamagedCreeps[i].hits / friendlyDamagedCreeps[i].hitsMax;
                    }
                    //console.log("damaged: ",friendlyDamagedCreeps);

                    

                    if (creep.heal(friendlyDamagedCreeps[damaged_id]) == ERR_NOT_IN_RANGE) {
                        move_avoid_hostile(creep,friendlyDamagedCreeps[damaged_id].pos);
                    }
                }
                else if (friendlyHealthyKillers != undefined) {
                    ////creep.say("PQPQPQPPQ");
                    //console.log(friendlyHealthyKillers[0]);
                    move_avoid_hostile(creep,friendlyHealthyKillers[0].pos);
                }


            }
            var hostileCreeps=creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: function (hostile){
                    return hostile.pos.inRangeTo(creep,3)==true;
                }
            });
            if(hostileCreeps!=undefined && hostileCreeps.length>0)
            {//if is in enemy range
                ////creep.say("R");
                var closestHostile=creep.pos.findClosestByRange(hostileCreeps);
                var friendlyCreeps = creep.room.find(FIND_MY_CREEPS, {
                    filter: function (friendly) {
                        return (friendly.memory.role=='keeperKiller' )//|| friendly.memory.role=='keeperHealer') 
                        && friendly.name!=creep.name;
                    }
                });
                goOutOfRange(creep,4);
                /*
                var health_percentage = 100;
                var damaged_id = 0;
                for (let i = 0; i < friendlyCreeps.length; i++) {
                    if (friendlyCreeps[i].hits / friendlyCreeps[i].hitsMax < health_percentage)
                        damaged_id = i;
                        health_percentage = friendlyCreeps[i].hits / friendlyCreeps[i].hitsMax;
                }
                var distance_x=closestHostile.pos.x-creep.pos.x;// if >0, enemy is on the right side
                var distance_y=closestHostile.pos.y-creep.pos.y;// if >0, enemy is below
                if(distance_x>=Math.abs(distance_y) && distance_x>0
                   )
                {//hostile is on right side
                    ////creep.say("Ri0");
                    if(friendlyCreeps!=undefined || friendlyCreeps.length>0)
                    {
                        ////creep.say("Ri");
                        if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y).length<1 )
                        {//try to hide on left
                            //creep.say("Ri1");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y);
                        }
                        else if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y+1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y+1).length<1 )
                        {//try to hide down left
                            //creep.say("Ri2");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                        else{
                            //try to hide up left
                            //creep.say("Ri3");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                    }
                }
                if(Math.abs(distance_x)>=Math.abs(distance_y) && distance_x<0
                   )
                {//hostile is on left side
                    if(friendlyCreeps!=undefined && friendlyCreeps[damaged_id]!=undefined)
                    {
                        //creep.say("L1");
                        if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y).length<1 )
                        {//try to hide on right
                            //creep.say("L1");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y);
                        }
                        else if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y+1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y+1).length<1 )
                        {//try to hide down right
                            //creep.say("L2");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                        else{
                            //try to hide up right
                            //creep.say("L3");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                    }
                }
                if(distance_y>=Math.abs(distance_x) && distance_y>0)
                {// hostile is below (down)
                    //creep.say("BO");
                    if(friendlyCreeps!=undefined)
                    {
                        if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y-1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y-1).length<1 )
                        {//try to hide on top
                            //creep.say("BO1");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y-1);
                        }
                        else if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1).length<1 )
                        {//try to hide up right
                            //creep.say("BO2");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                        else{
                            //try to hide up left
                            //creep.say("BO3");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y-1);
                        }
                    }
                }
                if(Math.abs(distance_y)>=Math.abs(distance_x) && distance_y<0)
                {//hostile is up
                    //creep.say("UP1");
                    //console.log("friendly: ",friendlyCreeps[damaged_id].pos);
                    if(friendlyCreeps!=undefined)
                    {
                        //creep.say("UP1");
                        if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y+1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y+1).length<1 )
                        {//try to hide behind healed creep (below)
                            //creep.say("UP2");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x,friendlyCreeps[damaged_id].pos.y+1);
                        }
                        else if(creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y+1)!=undefined &&
                        creep.room.lookForAt(LOOK_CREEPS, friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y+1).length<1 )
                        {//try to hide down left
                            //creep.say("UP3");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x-1,friendlyCreeps[damaged_id].pos.y+1);
                        }
                        else{
                            //try to hide down right
                            //creep.say("UP4");
                            creep.moveTo(friendlyCreeps[damaged_id].pos.x+1,friendlyCreeps[damaged_id].pos.y+1);
                        }
                    }
                }
               */ 
            }
        }
    }
};

module.exports = keeper_Healer;