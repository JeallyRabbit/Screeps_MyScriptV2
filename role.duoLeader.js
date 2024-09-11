

Creep.prototype.roleDuoLeader = function roleDuoLeader(spawn) {


    //this.suicide();



    this.memory.target_room='W6N4'
    this.memory.task='destroy_invader_core'

    this.heal(this)
    if(this.memory.follower!=undefined && Game.getObjectById(this.memory.follower)!=null)
    {
        this.memory.moving = false;
        var follower=Game.getObjectById(this.memory.follower)
        if(!this.pos.inRangeTo(follower.pos,1))
        {// leader is to far from follower
            this.say("to far")
            if(this.pos.roomName==follower.pos.roomName)
            {
                this.moveTo(follower,{range:1})
            }
            //
            //return;
        }


        if(this.memory.target_room!=undefined && this.room.name!=this.memory.target_room)
        {
            this.memory.moving=true
            this.moveTo(new RoomPosition(25,25,this.memory.target_room),{reusePath: 10,range: 20, avodCreeps: true})
        }

        if(this.room.name==this.memory.target_room)
        {
            if(this.memory.task='destroy_invader_core')
            {
                if(this.memory.invaderCore==undefined)
                {
                    var core=this.room.find(FIND_STRUCTURES,{filter:
                        function (str)
                        {
                            return str.structureType==STRUCTURE_INVADER_CORE
                        }
                    })
                    if(core.length>0)
                    {
                        this.memory.invaderCore=core[0].id
                    }
                    else{
                        this.memory.invaderCore=null;
                    }
                }

                if(this.memory.invaderCore!=undefined && this.memory.invaderCore!=null)
                {
                    var core=Game.getObjectById(this.memory.invaderCore)
                    if(this.rangedAttack(core)==ERR_NOT_IN_RANGE)
                    {
                        this.memory.moving=true;
                        this.moveTo(core)
                        this.rangedMassAttack()
                    }
                    if(this.hits>this.hitsMax*0.75)
                    {
                        this.moveTo(core)
                        this.rangedMassAttack()
                    }

                    if(this.hits<this.hitsMax*0.75)
                    {
                        this.say("flee")
                        this.fleeFrom({core},20)
                    }
                }
            }
        }



        /*
        var target_flag=Game.flags['duo']
        if(target_flag==undefined)
        {
            return
        }
        if(this.pos.x!=target_flag.pos.x || this.pos.y!=target_flag.pos.y || this.pos.roomName!=target_flag.pos.roomName)
        {
            this.memory.moving=true
            this.moveTo(target_flag,{reusePath: 10, avodCreeps: true})
        }
            */
        

    }
    
}
