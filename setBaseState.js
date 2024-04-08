const STATE_DEVELOPING = 'STATE_DEVELOPING'
const STATE_UNDER_ATTACK='STATE_UNDER_ATTACK'
const STATE_NEED_MILITARY_SUPPORT='STATE_NEED_MILITARY_SUPPORT'
const STATE_NEED_ENERGY = 'STATE_NEED_ENERGY'
const STATE_STATE_NEED_MILITARY_ENERGY = 'STATE_NEED_MILITARY_ENERGY'

function setBaseState(spawn)
{
    spawn.memory.state=[];
    if(spawn.room.controller.level<=7)
    {
        spawn.memory.state.push(STATE_DEVELOPING);
        spawn.memory.state.push(STATE_NEED_ENERGY)
    }
}

module.exports = setBaseState;