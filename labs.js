var lab= {

    /** @param {Game} game **/
    tick: function (spawn) {
        labs = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LAB }
        });
        _.forEach(labs, function(lab){
            var creeps=lab.pos.findInRange(FIND_MY_CREEPS, 1,{
                filter: function (creep)
                {
                    return creep.memory.need_boosting==true;
                }
            });
            if(creeps!=undefined && creeps.length>0)
            {
                lab.boostCreep(creeps[0],creeps[0].memory.parts_to_boost);
            }
            else{
                var other_labs=lab.room.find(FIND_STRUCTURES,{
                    filter: function(structure)
                    {
                        return structure.structureType==STRUCTURE_LAB
                        && structure.pos!=lab.pos;
                    }
                });
                for(let i=1;i<other_labs.length;i++)
                {
                    if(lab.runReaction(other_labs[i],other_labs[i-1])==0)
                    {
                        return;
                    }
                }
            }
            


        })
        

    }
};

module.exports = lab