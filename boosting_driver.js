const localHeap = {}

class boostingRequest {
    constructor(id, boost, bodypartsAmount) {
        this.id = id
        this.boost = boost
        this.bodypartsAmount = bodypartsAmount
    }
}

function boosting_driver(creep, spawn, boosting_list, body_type_to_boost) {
    //creep.say("BOS1");
    //return -1;
    if (creep.ticksToLive < 1200 || boosting_list.length==0) {
        //removing boosting request
        removeRequest(creep);
        return -1;
    }

    // change this to find first output lab (first output lab position should be stored in spawn.memory)
    // also cache its id in spawn.memory so there will be no need to call Room.find() thath often
    var lab = undefined;
    if (creep.room.memory.boosting_lab_id != undefined) {
        lab = Game.getObjectById(creep.room.memory.boosting_lab_id)
    }
    /*
    var lab = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB
                && (structure.pos.x==spawn.pos.x+4 && structure.pos.y==spawn.pos.y-0);
        }
    });
    */
    localHeap.parts_to_boost = _.filter(creep.body, part => _.isUndefined(part.boost) && part.type == body_type_to_boost);
    var bodyAmount=localHeap.parts_to_boost.length
    if (localHeap.parts_to_boost != undefined && localHeap.parts_to_boost.length > 0 && lab != undefined) {
        localHeap.needBoosting = true;
        // store designed object (bosting_request - create it) in spawn.memory so boosting lab (first output lab) do not have to call room.find
        for (let i = 0; i < localHeap.parts_to_boost.length; i++) {
            //console.log(typeof localHeap.parts_to_boost[i].boost);
        }
    }
    else {
        localHeap.needBoosting = false;

        //removing boosting request
        removeRequest(creep);
        return -1;
    }

    var contains_booster = false;
    var booster = undefined;
    var storage = creep.room.storage

    //creep.say("BOS2");
    //check for doctor should be done next to (before or after) checking for boosting_lab and it should be done by checking doctor_id in spawn.memory
    // if there is no such field in spawn.memory - add it when runnig Creep.roleDoctor
    var doctor = creep.room.find(FIND_MY_CREEPS, {
        filter: function (doc) {
            return doc.memory.role == 'doctor';
        }
    });
    if (doctor == undefined || doctor.length < 1 || storage == undefined || storage.length < 1) {
        //removing boosting request
        removeRequest(creep);
        return -1;
    }
    /////////////////


    // checkign for booster (order of boosters defined in Creep.role)
    for (const i in boosting_list) {
        //console.log("resource: ", boosting_list[i]);
        var reqBoostAmountInRequests=0;
        if(global.heap.rooms[creep.room.name].boostingRequests.length>0)
        {
            for(req in global.heap.rooms[creep.room.name].boostingRequests)
            {
                if(req.boost==boosting_list[i]){reqBoostAmountInRequests+=req.boost*req.bodypartsAmount*LAB_BOOST_MINERAL}
            }
        }
        if ((storage.store[boosting_list[i]]-reqBoostAmountInRequests > (LAB_BOOST_MINERAL*bodyAmount) || doctor[0].store[boosting_list[i]]-reqBoostAmountInRequests > LAB_BOOST_MINERAL*bodyAmount) && boosting_list[i] != RESOURCE_ENERGY) {
            contains_booster = true;
            booster = boosting_list[i];
        }
    }
    //creep.say("BOS3");
    if (contains_booster == false) {//there is no required booster in storage or doctor.store
        creep.say("no bos");
        storage == undefined;
        //removing boosting request
        removeRequest(creep);
        return -1;
    }
    else {
        if (localHeap.needBoosting == true && contains_booster == true) {
            if (global.heap.rooms[creep.memory.home_room.name] != undefined) {
                if (global.heap.rooms[creep.memory.home_room.name].boostingRequests == undefined) {
                    global.heap.rooms[creep.memory.home_room.name].boostingRequests = [];
                }
                else {

                    if (!global.heap.rooms[creep.memory.home_room.name].boostingRequests.some(e => e.id == creep.id)) {// if not found itself in boosting requests
                        var boostingRequest = new boostingRequest(creep.id, booster, parts_to_boost)
                        global.heap.rooms[creep.memory.home_room.name].boostingRequests.push(boostingRequest)
                    }
                    else {
                        //if is first one on boosting requests list - go to lab
                        var position = global.heap.rooms[creep.memory.home_room.name].boostingRequests.findIndex(e => e.id == creep.id)
                        if (position == 0) {
                            creep.moveTo(lab)
                        }
                        else if (position > 0) {
                            creep.moveTo(lab, { range: 5 })
                        }
                    }
                }
            }
            creep.say("BOS");
            //creep.moveTo(lab);
        }
        //creep.memory.booster=booster;
    }
}
exports.boosting_driver = boosting_driver;

function removeRequest(creep) {
    if (global.heap.rooms[creep.memory.home_room.name].boostingRequests != undefined) {
        var position = global.heap.rooms[creep.memory.home_room.name].boostingRequests.findIndex(e => e.id == creep.id);
        if (position != -1) {
            global.heap.rooms[creep.memory.home_room.name].boostingRequests.splice(position, 1);
        }
        return position;
    }
    return -1;

}
