const STATE_DEVELOPING = 'STATE_DEVELOPING'
const STATE_UNDER_ATTACK='STATE_UNDER_ATTACK'
const STATE_NEED_MILITARY_SUPPORT='STATE_NEED_MILITARY_SUPPORT'
const STATE_NEED_ENERGY = 'STATE_NEED_ENERGY'
const STATE_STATE_NEED_MILITARY_ENERGY = 'STATE_NEED_MILITARY_ENERGY'


const MIN_AMOUNT_TERMINAL=5000
const MIN_AMOUNT_BUY=2500



Spawn.prototype.setBaseState = function setBaseState()
{
    this.memory.state=[];
    if(this.room.controller.level<=7)
    {
        this.memory.state.push(STATE_DEVELOPING);
        this.memory.state.push(STATE_NEED_ENERGY)
    }
    if(this.room.storage!=undefined && this.room.storage.store[RESOURCE_ENERGY]<200000 && this.room.controller.level>7)
    {
        this.memory.state.push(STATE_NEED_ENERGY)
    }

    this.room.memory.need_resources=[]
    this.room.memory.need_resources_buy=[]
    var basic_resources=["O", "H", "O","U", "L", "K", "Z","X","OH"]
    // OH is used to upgrade res to lvl2 boost
    if(this.room.controller.level>=6 && this.room.terminal!=undefined)
    {
        var terminal=this.room.terminal
        
        for(res of basic_resources)
        {
            if(this.room.terminal.store[res]<MIN_AMOUNT_TERMINAL)
            {
                if(!(this.room.memory.need_resources.includes(res)))
                {
                    this.room.memory.need_resources.push(res)
                }

                if(this.room.terminal.store[res]<MIN_AMOUNT_BUY)
                {
                    if(!(this.room.memory.need_resources_buy.includes(res)))
                    {
                        this.room.memory.need_resources_buy.push(res)
                    }
                }
                

            }
        }

    }
}

//module.exports = setBaseState;