function spawnCreep(spawn) {
    
    //const room=Game.rooms[myRooms[0]];
    const sources=spawn.room.find(FIND_SOURCES);
    //console.log(sources_hp.length);
    var sources_hp=[];// harvesting power assigned to every source in my room (working only for first room)
    for(let i=0;i<sources.length;i++)
    {  
        sources_hp[i]=0;
    }
    
    var pop_harvesters=0;
    var pop_carriers=0;
    var pop_builders=0;
    var pop_upgraders=0;
    var pop_repairers=0;
    var pop_haulers=0;
    var pop_soldiers=0;
    var pop_farmers=0;
    var pop_berserkers=0;
    var pop_transporters=0;
    var pop_towerKeepers=0;
    var pop_claimers=0;
    var pop_distanceBuilders=0;
    var pop_reservers=0;
    var pop_distanceCarriers=0;
    var pop_keeperKillers=0;
    var pop_keeperHealers=0;
    var pop_keeperCarriers=0;
    if(Game.spawns[spawnName].memory.roles_counter>roles_num){Game.spawns[spawnName].memory.roles_counter=0;}

    
    
}
module.exports = spawnCreeps;