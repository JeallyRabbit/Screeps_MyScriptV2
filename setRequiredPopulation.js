function setRequiredPopulation(mySpawns)
{
    ////////// spawn 1
    mySpawns['Spawn1'].memory.req_harvesters=2;// role num 0
    mySpawns['Spawn1'].memory.req_carriers=2;//role num 1
    mySpawns['Spawn1'].memory.req_farmers=10;//role num 2
    mySpawns['Spawn1'].memory.req_builders=3;// role num 3
    mySpawns['Spawn1'].memory.req_haulers=2;// role num 4
    mySpawns['Spawn1'].memory.req_upgraders=1;// role num 5
    mySpawns['Spawn1'].memory.req_repairers=1;// role num 6
    mySpawns['Spawn1'].memory.req_soldiers=4;//role num 7
    mySpawns['Spawn1'].memory.req_berserk=0;//role num 8
    mySpawns['Spawn1'].memory.req_transporters=1;//role numm 9
    mySpawns['Spawn1'].memory.req_towerKeepers=1;//role num 10
    mySpawns['Spawn1'].memory.req_claimers=2;//role num 11
    mySpawns['Spawn1'].memory.req_distanceBuilders=3//role num12
    mySpawns['Spawn1'].memory.farming_rooms=[];
    mySpawns['Spawn1'].memory.farming_rooms.push('E37N54');
    mySpawns['Spawn1'].memory.claiming_rooms=[];
    mySpawns['Spawn1'].memory.claiming_rooms.push('E37N54');

    mySpawns['Spawn2'].memory.req_harvesters=2;// role num 0
    mySpawns['Spawn2'].memory.req_carriers=3;//role num 1
    mySpawns['Spawn2'].memory.req_farmers=10;//role num 2
    mySpawns['Spawn2'].memory.req_builders=3;// role num 3
    mySpawns['Spawn2'].memory.req_haulers=3;// role num 4
    mySpawns['Spawn2'].memory.req_upgraders=1;// role num 5
    mySpawns['Spawn2'].memory.req_repairers=1;// role num 6
    mySpawns['Spawn2'].memory.req_soldiers=0;//role num 7
    mySpawns['Spawn2'].memory.req_berserk=0;//role num 8
    mySpawns['Spawn2'].memory.req_transporters=1;//role numm 9
    mySpawns['Spawn2'].memory.req_towerKeepers=0;//role num 10
    mySpawns['Spawn2'].memory.req_claimers=0;//role num 11
    mySpawns['Spawn2'].memory.req_distanceBuilders=0//role num12
    mySpawns['Spawn2'].memory.farming_rooms=[];
    mySpawns['Spawn2'].memory.farming_rooms.push('E37N54');
    mySpawns['Spawn2'].memory.farming_rooms.push('E38N53');
    mySpawns['Spawn2'].memory.claiming_rooms=[];
    mySpawns['Spawn2'].memory.claiming_rooms.push('E38N53');
}
module.exports = setRequiredPopulation;