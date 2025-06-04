
Spawn.prototype.lab = function lab(spawn) {


    var input1=Game.getObjectById(this.room.memory.input1_lab_id)
    var input2=Game.getObjectById(this.room.memory.input2_lab_id)

    if(input1==null || input2==null ||  this.room.memory.output_labs_id==undefined)
    {
        return ;

    }
    else{
        for(id of this.room.memory.output_labs_id)
        {
            var lab=Game.getObjectById(id)
            if(this.room.memory.boosting_lab_id!=undefined && id==this.room.memory.boosting_lab_id)
            {
                if(global.heap.rooms[this.room.name].boostingRequests!=undefined && global.heap.rooms[this.room.name].boostingRequests.length>0)
                {
                    var boostingRequest=global.heap.rooms[this.room.name].boostingRequests[0]
                    if(lab.store[boostingRequest.boost]>0 || true)
                    {
                        console.log("boosting request: ")
                        console.log("creep.id: ",boostingRequest.id)
                        console.log("boost: ",boostingRequest.boost)
                        console.log('bodypartsAmount: ',boostingRequest.bodypartsAmount)
                        lab.boostCreep(boostingRequest.id,boostingRequest.bodypartsAmount)
                    }
                }
            }
            if(lab!=null)
            {
                if(lab.cooldown==0)
                {
                    lab.runReaction(input1,input2)
                }
            }
        }
    }
};

//module.exports = lab