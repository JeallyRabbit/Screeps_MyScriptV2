
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