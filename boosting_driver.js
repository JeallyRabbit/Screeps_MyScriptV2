function boosting_driver(creep,spawn,boosting_list,body_type_to_boost)
{
    //creep.say("BOS1");

    if(creep.ticksToLive<1200)
    {
        return -1;
    }

    var lab = creep.room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_LAB
                && (structure.pos.x==spawn.pos.x+4 && structure.pos.y==spawn.pos.y-0);
        }
    });
    creep.memory.parts_to_boost = _.filter(creep.body, part => _.isUndefined(part.boost) && part.type == body_type_to_boost);

    if (creep.memory.parts_to_boost != undefined && creep.memory.parts_to_boost.length>0 && lab != undefined) {
        creep.memory.need_boosting = true;
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