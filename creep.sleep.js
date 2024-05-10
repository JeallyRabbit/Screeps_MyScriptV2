Creep.prototype.sleep = function sleep(ticks) {
    if (this.memory.time_to_sleep == undefined || (this.memory.time_to_sleep!=undefined && this.memory.time_to_sleep>this.ticksToLive)) {
        this.memory.time_to_sleep = this.ticksToLive - ticks;
    }

}