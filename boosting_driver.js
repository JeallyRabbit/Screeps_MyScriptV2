function boosting_driver(creep,spawn,boosting_list,body_type_to_boost)
{
    //creep.say("BOS1");
    return -1;
    if(creep.ticksToLive<1200)
    {
        return -1;
    }

    // change this to find first output lab (first output lab position should be stored in spawn.memory)
    // also cache its id in spawn.memory so there will be no need to call Room.find() thath often
    var lab = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB
                && (structure.pos.x==spawn.pos.x+4 && structure.pos.y==spawn.pos.y-0);
        }
    });
    creep.memory.parts_to_boost = _.filter(creep.body, part => _.isUndefined(part.boost) && part.type == body_type_to_boost);

    if (creep.memory.parts_to_boost != undefined && creep.memory.parts_to_boost.length>0 && lab != undefined) {
        creep.memory.need_boosting = true;
        // store designed object (bosting_request - create it) in spawn.memory so boosting lab (first output lab) do not have to call room.find
        for (let i = 0; i < creep.memory.parts_to_boost.length; i++) {
            //console.log(typeof creep.memory.parts_to_boost[i].boost);
        }
    }
    else {
        creep.memory.need_boosting = false;
        return -1;
    }
    
    var contains_booster=false;
    var booster=undefined;
    var storage = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {//["GH","XGH2O","GH2O"]
            return structure.structureType == STRUCTURE_STORAGE;
        }
    });
    //creep.say("BOS2");
    //check for doctor should be done next to (before or after) checking for boosting_lab and it should be done by checking doctor_id in spawn.memory
    // if there is no such field in spawn.memory - add it when runnig Creep.roleDoctor
    var doctor=creep.room.find(FIND_MY_CREEPS,{
        filter: function (doc)
        {
            return doc.memory.role=='doctor';
        }
    });
    if(doctor==undefined || doctor.length<1 || storage==undefined || storage.length<1)
    {
        return -1;
    }
    /////////////////


    // checkign for booster (order of boosters defined in Creep.role)
    for(const i in boosting_list)
    {
        //console.log("resource: ", boosting_list[i]);
        if((storage[0].store[ boosting_list[i]]>30 || doctor[0].store[ boosting_list[i]]>30 ) && boosting_list[i]!=RESOURCE_ENERGY){
            contains_booster=true;
            booster= boosting_list[i];
        }
    }
    //creep.say("BOS3");
    if(contains_booster==false)
    {//there is no required booster in storage or doctor.store
        //creep.say("BOS4");
        storage==undefined;
        return -1;
    }
    else{
        if(creep.memory.need_boosting==true && contains_booster==true)
        {
            creep.say("BOS");
            creep.moveTo(lab[0]);
        }
        creep.memory.booster=booster;
    }
}
exports.boosting_driver = boosting_driver;