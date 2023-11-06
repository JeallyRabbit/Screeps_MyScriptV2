const { toArray } = require("lodash");
var RoomPositionFunctions = require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");
const {boosting_driver}=require('boosting_driver');

const keeper_farmer = {
    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        if(creep.memory.boosting_list==undefined)
        {
            creep.memory.boosting_list=["UO", "UHO2", "XUHO2"];
            
        }
        //creep.say("^^");
        var position = creep.pos;
        if (creep.store[RESOURCE_ENERGY] == 0 && creep.room.name == creep.memory.target_room
            /*&& creep.store[RESOURCE_ENERGY]>0*/) {

            //console.log(" 1");
            
            if (creep.room.name = creep.memory.target_room) {
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
            }


        }
        if(creep.room.name==creep.memory.home_room.name && 
            boosting_driver(creep,spawn,creep.memory.boosting_list,WORK)!=-1)
        {
            return ;
        }

        //creep.say("!");
        // Check if the creep has a target room
        if (!creep.memory.target_room) {
            //console.log(" 2");
            return 0;
        }
        // Check if the creep is in the target room
        if (creep.room.name != creep.memory.target_room) {
            //creep.say("MOV");
            const destination = new RoomPosition(25, 25, creep.memory.target_room);
            //creep.say("MOV");
            creep.moveTo(destination);
        }
        else if (creep.room.name == creep.memory.target_room) {


            if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) {
                //creep.say("RUN2");
                goOutOfRange(creep, 5);
            }
            var sources = creep.room.find(FIND_SOURCES, {
                filter: function (source) {
                    return source.energy > 0 && source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length < 1
                        && source.pos.findInRange(FIND_STRUCTURES, 5, { // finding lairs that have spawning timer <20
                            filter: function (structure) {
                                return structure.structureType == STRUCTURE_KEEPER_LAIR
                                    && structure.ticksToSpawn < 20;
                            }
                        }).length < 1;
                    //&& source.pos.getNOpenPositions(1).length>0 && !(creep.pos.isNearTo(source.pos));
                }
            });
            /*
            if(sources!=undefined && sources.length>0)
            {
                sources=sources.concat(creep.room.find(FIND_MINERALS));    
            }
            else
            {
                var sources=(creep.room.find(FIND_MINERALS));
            }*/
            
            if (sources == undefined || sources.length < 1) {
                delete creep.memory.my_path;
                if(creep.pos.findInRange(FIND_HOSTILE_CREEPS,5).length>0)
                {
                    goOutOfRange(creep, 5, creep.pos.findClosestByRange(FIND_SOURCES));
                }
                else{
                    creep.say("K1")
                    var killer=creep.pos.findClosestByRange(FIND_MY_CREEPS,{
                        filter: function (killer)
                        {
                            return killer.memory.role=='keeperKiller';
                        } });
                    if(killer!=undefined)
                    {
                        //creep.my_path=undefined;
                        creep.say("K2");
                        move_avoid_hostile(creep,killer.pos,4);
                    }
                }
                
                return;
            }
            var closest_source = creep.pos.findClosestByPath(sources);
            //creep.memory.closest_src=closest_source;
            if (creep.memory.closest_src == undefined && closest_source != undefined) {
                creep.memory.closest_src = closest_source;
            }
            else if (closest_source != undefined) {
                if (creep.memory.closest_src.id != closest_source.id) {
                    delete creep.memory.path;

                }

            }

            //creep.say(closest_source.pos.x+" "+closest_source.pos.y);
            //creep.memory.closest_src=closest_source;

            if (closest_source != undefined) {

                if (creep.harvest(closest_source) == ERR_NOT_IN_RANGE) {
                    move_avoid_hostile(creep, closest_source.pos, 0);
                }
                else
                {
                    delete creep.memory.path;
                }
            }

        }


    }
};

module.exports = keeper_farmer;



