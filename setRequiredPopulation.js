function setRequiredPopulation(mySpawns) {
    ////////// spawn 1
    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });

    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].memory.num_towers.length;
    mySpawns['Spawn1'].memory.req_harvesters =4;// role num 0
    mySpawns['Spawn1'].memory.req_carriers = 3;//role num 1
    mySpawns['Spawn1'].memory.req_farmers = 4;//role num 2
    mySpawns['Spawn1'].memory.req_builders = 4;// role num 3
    if (mySpawns['Spawn1'].room.find(FIND_MY_CONSTRUCTION_SITES).length == 0) {
        mySpawns['Spawn1'].memory.req_builders = 0;
    }
    mySpawns['Spawn1'].memory.req_haulers = 3;// role num 4
    mySpawns['Spawn1'].memory.req_upgraders = 1;// role num 5
    mySpawns['Spawn1'].memory.req_repairers = 1 - (100 * mySpawns['Spawn1'].memory.num_towers);// role num 6
    mySpawns['Spawn1'].memory.req_soldiers = 0;//role num 7
    mySpawns['Spawn1'].memory.req_berserk = 0;//role num 8
    mySpawns['Spawn1'].memory.req_transporters = 1;//role numm 9
    mySpawns['Spawn1'].memory.req_towerKeepers = 0;//role num 10
    if (mySpawns['Spawn1'].memory.num_towers > 0) {
        mySpawns['Spawn1'].memory.req_towerKeepers = 1;
    }
    mySpawns['Spawn1'].memory.req_claimers = 0;//role num 11
    mySpawns['Spawn1'].memory.farming_rooms = [];
    mySpawns['Spawn1'].memory.claiming_rooms = [];
    //mySpawns['Spawn1'].memory.farming_rooms.push('W57N15');
    //mySpawns['Spawn1'].memory.farming_rooms.push('W57N16');
    mySpawns['Spawn1'].memory.farming_rooms.push('W3N6');
    //mySpawns['Spawn1'].memory.farming_rooms.push('E3N58');
    //mySpawns['Spawn1'].memory.farming_rooms.push('W58N16');


    mySpawns['Spawn1'].memory.req_reservers = mySpawns['Spawn1'].memory.farming_rooms.length*2; // role num 13
    mySpawns['Spawn1'].memory.req_farmers = mySpawns['Spawn1'].memory.farming_rooms.length*4;
    mySpawns['Spawn1'].memory.req_claimers=mySpawns['Spawn1'].memory.claiming_rooms.length;
    //mySpawns['Spawn1'].memory.claiming_rooms.push('E3N59');
    mySpawns['Spawn1'].memory.req_berserk = mySpawns['Spawn1'].memory.claiming_rooms.length*2;
    mySpawns['Spawn1'].memory.req_distanceBuilders = 2 * mySpawns['Spawn1'].memory.claiming_rooms.length;//role num12
    mySpawns['Spawn1'].memory.req_DistanceCarriers=mySpawns['Spawn1'].memory.farming_rooms.length*4;//role num 14

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
    
    
    
    
    ///////////////////////// spawn2
    /*
    mySpawns['Spawn2'].memory.num_towers = mySpawns['Spawn2'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });

    
    mySpawns['Spawn2'].memory.num_towers = mySpawns['Spawn2'].memory.num_towers.length;
    mySpawns['Spawn2'].memory.req_harvesters =2;// role num 0
    mySpawns['Spawn2'].memory.req_carriers = 2;//role num 1
    mySpawns['Spawn2'].memory.req_farmers = 4;//role num 2
    mySpawns['Spawn2'].memory.req_builders = 2;// role num 3
    if (mySpawns['Spawn2'].room.find(FIND_MY_CONSTRUCTION_SITES).length == 0) {
        mySpawns['Spawn2'].memory.req_builders = 0;
    }
    mySpawns['Spawn2'].memory.req_haulers = 2;// role num 4
    mySpawns['Spawn2'].memory.req_upgraders = 3;// role num 5
    mySpawns['Spawn2'].memory.req_repairers = 1 - (100 * mySpawns['Spawn2'].memory.num_towers);// role num 6
    mySpawns['Spawn2'].memory.req_soldiers = 0;//role num 7
    mySpawns['Spawn2'].memory.req_berserk = 0;//role num 8
    mySpawns['Spawn2'].memory.req_transporters = 1;//role numm 9
    mySpawns['Spawn2'].memory.req_towerKeepers = 0;//role num 10
    if (mySpawns['Spawn2'].memory.num_towers > 0) {
        mySpawns['Spawn2'].memory.req_towerKeepers = 1;
    }
    mySpawns['Spawn2'].memory.req_claimers = 0;//role num 11
    mySpawns['Spawn2'].memory.farming_rooms = [];
    mySpawns['Spawn2'].memory.claiming_rooms = [];


    mySpawns['Spawn2'].memory.req_reservers = mySpawns['Spawn2'].memory.farming_rooms.length*2; // role num 13
    mySpawns['Spawn2'].memory.req_farmers = mySpawns['Spawn2'].memory.farming_rooms.length*6;
    mySpawns['Spawn2'].memory.req_claimers=mySpawns['Spawn2'].memory.claiming_rooms.length;
    //mySpawns['Spawn2'].memory.claiming_rooms.push('E37N54');
    mySpawns['Spawn2'].memory.req_distanceBuilders = 2 * mySpawns['Spawn2'].memory.claiming_rooms.length;//role num12
    mySpawns['Spawn2'].memory.req_DistanceCarriers=mySpawns['Spawn2'].memory.farming_rooms.length*8;//role num 14

    if(Game.time%200==0)
    {
        mySpawns['Spawn2'].memory.progress=0;
        mySpawns['Spawn2'].memory.progress_old=0;
        mySpawns['Spawn2'].memory.progress_sum=0;
        mySpawns['Spawn2'].memory.progress_counter=0;
    }
    */
}
module.exports = setRequiredPopulation;