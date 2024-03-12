const { toArray } = require("lodash");
var RoomPositionFunctions = require('roomPositionFunctions');
const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require("./move_avoid_hostile");
const { boosting_driver } = require('boosting_driver');

const keeper_farmer = {
    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        //creep.suicide();
        if (creep.memory.boosting_list == undefined) {
            creep.memory.boosting_list = ["UO", "UHO2", "XUHO2"];

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
        if (creep.room.name == creep.memory.home_room.name &&
            boosting_driver(creep, spawn, creep.memory.boosting_list, WORK) != -1) {
            return;
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
            creep.memory.is_working = true;
            var closest_hostile=creep.pos.findInRange(FIND_HOSTILE_CREEPS,4);
            if (closest_hostile!=undefined && closest_hostile.length>0) {
                creep.say("RUN2");
                //goOutOfRange(creep, 5);
                creep.fleeFrom(closest_hostile,5);
                return;
            }


            if (creep.memory.sources != undefined && creep.memory.sources.length > 0) {
                for (let i = 0; i < creep.memory.sources.length; i++) {
                    if (Game.getObjectById(creep.memory.sources[i].id) == undefined || Game.getObjectById(creep.memory.sources[i].id)==null
                || Game.getObjectById(creep.memory.closest_source)==null) {
                        creep.memory.sources = undefined;
                        creep.memory.closest_source=undefined;
                        creep.say("del source");
                        break;
                    }
                    else if(Game.getObjectById(creep.memory.closest_sourcesource)!=null 
                    && Game.getObjectById(creep.memory.closest_source).pos.findInRange(FIND_HOSTILE_CREEPS,4).length>0)
                    {
                        creep.memory.sources = undefined;
                        creep.say("del source");
                        break;
                    }
                }
            }
            else if (creep.memory.sources == undefined || (creep.memory.sources!=undefined && creep.memory.sources.length==0)) {
                creep.memory.sources = creep.room.find(FIND_SOURCES, {
                    filter: function (source) {
                        return source.energy > 0 && source.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length < 1
                            && source.pos.findInRange(FIND_STRUCTURES, 5, { // finding lairs that have spawning timer <20
                                filter: function (structure) {
                                    return structure.structureType == STRUCTURE_KEEPER_LAIR
                                        && structure.ticksToSpawn < 20;
                                }
                            }).length < 1;
                    }
                });
                closest_source=creep.pos.findClosestByPath(creep.memory.sources);
                if(closest_source!=null)
                {
                    creep.memory.closest_source=closest_source.id;
                }
            }


            if (Game.getObjectById(creep.memory.closest_source) == undefined) {
                delete creep.memory.my_path;
                if (creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0) {
                    //goOutOfRange(creep, 5, creep.pos.findClosestByRange(FIND_SOURCES));
                    creep.fleeFrom(creep.pos.findClosestByRange(FIND_SOURCES),5);
                }
                else {
                    //creep.say("K1")
                    var healer = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                        filter: function (healer) {
                            return healer.memory.role == 'keeperHealer';
                        }
                    });
                    if (healer != undefined) {
                        //creep.my_path=undefined;
                        //creep.say("K2");
                        //move_avoid_hostile(creep, healer.pos, 6, false);
                        creep.moveTo(healer,{range:3,avoidSk:true});
                        return;
                        //creep.moveTo(killer,{range:5});
                    }
                }
            }

            if (Game.getObjectById(creep.memory.closest_source) != undefined) {
                if(Game.getObjectById(creep.memory.closest_source).energy==0)
                {
                    creep.memory.closest_source=undefined;
                }
                else if (creep.harvest(Game.getObjectById(creep.memory.closest_source)) == ERR_NOT_IN_RANGE) {
                    //move_avoid_hostile(creep, Game.getObjectById(creep.memory.closest_source).pos, 0);
                    creep.moveTo(Game.getObjectById(creep.memory.closest_source));
                }
                else {
                    delete creep.memory.path;
                }
            }

        }


    }
};

module.exports = keeper_farmer;



