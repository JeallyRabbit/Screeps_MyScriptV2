function setRequiredPopulation(mySpawns) {
    ////////// spawn 1
    
    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });

    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].memory.num_towers.length;
    mySpawns['Spawn1'].memory.req_harvesters =4;// role num 0
    if(mySpawns['Spawn1'].room.controller.level==1)
    {
        mySpawns['Spawn1'].memory.req_harvesters =6;
    }
    else if(mySpawns['Spawn1'].room.controller.level==2)
    {
        mySpawns['Spawn1'].memory.req_harvesters =4;
    }
    mySpawns['Spawn1'].memory.req_carriers = 1;//role num 1
    mySpawns['Spawn1'].memory.req_farmers = 0;//role num 2
    mySpawns['Spawn1'].memory.req_builders =1;// role num 3
    if (mySpawns['Spawn1'].room.find(FIND_MY_CONSTRUCTION_SITES).length == 0) {
        mySpawns['Spawn1'].memory.req_builders = 0;
    }
    mySpawns['Spawn1'].memory.req_haulers = 1;// role num 4
    mySpawns['Spawn1'].memory.req_upgraders = 2;// role num 5
    mySpawns['Spawn1'].memory.req_repairers = 1 - (100 * mySpawns['Spawn1'].memory.num_towers);// role num 6
    mySpawns['Spawn1'].memory.req_soldiers = 0;//role num 7
    mySpawns['Spawn1'].memory.req_berserk = 0;//role num 8
    mySpawns['Spawn1'].memory.req_transporters = 2;//role numm 9
    mySpawns['Spawn1'].memory.req_towerKeepers = 0;//role num 10
    mySpawns['Spawn1'].memory.req_keeperKillers=0;//role num 15
    mySpawns['Spawn1'].memory.req_keeperHealers=0;//role num 16
    mySpawns['Spawn1'].memory.req_keeperCarriers=0;//role num 17
    
    if (mySpawns['Spawn1'].memory.num_towers > 0) {
        mySpawns['Spawn1'].memory.req_towerKeepers = 1;
    }
    mySpawns['Spawn1'].memory.req_claimers = 0;//role num 11
    mySpawns['Spawn1'].memory.farming_rooms = [];
    mySpawns['Spawn1'].memory.claiming_rooms = [];
    //mySpawns['Spawn1'].memory.farming_rooms.push('E34N53');
    //mySpawns['Spawn1'].memory.farming_rooms.push('E35N52');
    mySpawns['Spawn1'].memory.farming_rooms.push('E34N53');
    //mySpawns['Spawn1'].memory.farming_rooms.push('E35N51');
    mySpawns['Spawn1'].memory.keepers_rooms=[];
    //mySpawns['Spawn1'].memory.keepers_rooms.push('E34N53');
    mySpawns['Spawn1'].memory.req_reservers = mySpawns['Spawn1'].memory.farming_rooms.length*2; // role num 13
    mySpawns['Spawn1'].memory.req_farmers = mySpawns['Spawn1'].memory.farming_rooms.length*2;
    mySpawns['Spawn1'].memory.req_claimers=mySpawns['Spawn1'].memory.claiming_rooms.length;
    //mySpawns['Spawn1'].memory.claiming_rooms.push('E3N59');
    mySpawns['Spawn1'].memory.req_berserk = mySpawns['Spawn1'].memory.claiming_rooms.length*2;
    mySpawns['Spawn1'].memory.req_distanceBuilders = 2 * mySpawns['Spawn1'].memory.claiming_rooms.length;//role num12
    mySpawns['Spawn1'].memory.req_DistanceCarriers=mySpawns['Spawn1'].memory.farming_rooms.length*3;//role num 14
    
    if(mySpawns['Spawn1'].room.controller.level>=5 && mySpawns['Spawn1'].memory.keepers_rooms.length>0)
    {
        mySpawns['Spawn1'].memory.req_keeperKillers=1;//role num 15
        mySpawns['Spawn1'].memory.req_keeperHealers=2;//role num 16
        mySpawns['Spawn1'].memory.req_keeperCarriers=2;//role num 17
    }
    

    if(Game.time%200==0)
    {
        mySpawns['Spawn1'].memory.progress=0;
        mySpawns['Spawn1'].memory.progress_old=0;
        mySpawns['Spawn1'].memory.progress_sum=0;
        mySpawns['Spawn1'].memory.progress_counter=0;
    }
    if( mySpawns['Spawn1'].memory.farmers_counter>500)
    {
        mySpawns['Spawn1'].memory.farmers_counter=0;
    }
    if(mySpawns['Spawn1'].memory.reservers_counter>500)
    {
        mySpawns['Spawn1'].memory.reservers_counter=0;
    }
    if(mySpawns['Spawn1'].memory.distance_carriers_counter>500)
    {
        mySpawns['Spawn1'].memory.distance_carriers_counter=0;
    }
    
    
    
    
}
module.exports = setRequiredPopulation;