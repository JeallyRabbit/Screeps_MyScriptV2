

var roleManager = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {
        //creep.say("F");
        if(spawn.room.storage==undefined)
        {
            spawn.memory.req_manager=0;
        }
    }
};
module.exports = roleManager;