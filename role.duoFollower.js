Creep.prototype.roleDuoFollower = function roleDuoFollower(spawn) {

    
    if(this.memory.leader!=undefined)
    {
        var leader=Game.getObjectById(this.memory.leader)
        if(leader==null)
        {
            return
        }
        if(!this.pos.isNearTo(leader) || leader.memory.moving)
        {
            this.say("mv")
            this.moveTo(Game.getObjectById(this.memory.leader),{avoidCreeps: false});
        }
        

        var followerHp=this.hits/this.hitsMax

        var leaderHp=leader.hits/leader.hitsMax

        if(leaderHp<=followerHp && leader.hits<leader.hitsMax)
        {
            this.say("Hl")
            this.heal(leader)
        }
        else{
            this.say("Hf")
            this.heal(this)
        }

    }

    
}