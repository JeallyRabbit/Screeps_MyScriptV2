
function calculateDistance(point1, point2) {
    // Adjusted regular expression to match the new format
    const regex = /^([WE])(\d+)([NS])(\d+)$/;
    const match1 = point1.match(regex);
    const match2 = point2.match(regex);

    if (!match1 || !match2) {
       console.log("Invalid point format");
       console.log(point1);
       console.log(point2);
    }

    // Extracting coordinates
    const x1 = parseInt(match1[2]) * (match1[1] === 'E' ? 1 : -1);
    const y1 = parseInt(match1[4]) * (match1[3] === 'N' ? 1 : -1);

    const x2 = parseInt(match2[2]) * (match2[1] === 'E' ? 1 : -1);
    const y2 = parseInt(match2[4]) * (match2[3] === 'N' ? 1 : -1);

    // Calculating distance using the Pythagorean theorem
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx**2 + dy**2);

    return distance;
}


 
function setRequiredPopulation(mySpawns) {
    ////////// spawn 1
    /*
    if(mySpawns['Spawn1'].memory.keepers_rooms.length>1)
    {
        mySpawns['Spawn1'].memory.keepers_rooms.pop();
    }
    */
    //delete spawn.memory.rooms_to_scan;
    //delete spawn.memory.keepers_rooms;
    mySpawns['Spawn1'].memory.req_carriers = 1;


    mySpawns['Spawn1'].memory.req_scouts=1;

    if(mySpawns['Spawn1'].memory.rooms_to_scan!=undefined && mySpawns['Spawn1'].memory.rooms_to_scan.length==0)
    {
        mySpawns['Spawn1'].memory.req_scouts=0;
    }
    
    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_TOWER;
        }
    });

    mySpawns['Spawn1'].memory.num_towers = mySpawns['Spawn1'].memory.num_towers.length;
    mySpawns['Spawn1'].memory.req_harvesters =3;// role num 0
    mySpawns['Spawn1'].memory.req_upgraders = 1;
    if(mySpawns['Spawn1'].room.controller.level<=3)
    {
        mySpawns['Spawn1'].memory.req_carriers =3
    }

    if(mySpawns['Spawn1'].room.controller.level==1)
    {
        mySpawns['Spawn1'].memory.req_harvesters =6;
    }
    else if(mySpawns['Spawn1'].room.controller.level==2)
    {
        mySpawns['Spawn1'].memory.req_harvesters =4;
        mySpawns['Spawn1'].memory.req_upgraders=6;
        if(mySpawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length>0)
         {
            mySpawns['Spawn1'].memory.req_upgraders=1;
         }
    }
    else if(mySpawns['Spawn1'].room.controller.level==3)
    {
         mySpawns['Spawn1'].memory.req_upgraders=2;
         if(mySpawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length<1)
         {
            mySpawns['Spawn1'].memory.req_upgraders=12;
         }
         else{
            mySpawns['Spawn1'].memory.req_upgraders=1;
         }
    }
    else if(mySpawns['Spawn1'].room.controller.level==4)
    {
         if(mySpawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES).length<1)
         {
            mySpawns['Spawn1'].memory.req_upgraders=3;
         }
         else{
            mySpawns['Spawn1'].memory.req_upgraders=1;
         }
    }
    mySpawns['Spawn1'].memory.req_farmers = 0;//role num 2
    mySpawns['Spawn1'].memory.req_builders =0;// role num 3
    if (mySpawns['Spawn1'].room.find(FIND_MY_CONSTRUCTION_SITES).length >0) {
        mySpawns['Spawn1'].memory.req_builders = 5;
    }
    mySpawns['Spawn1'].memory.req_haulers =1;// role num 4
    mySpawns['Spawn1'].memory.req_berserk = 0;//role num 8
    mySpawns['Spawn1'].memory.req_transporters =2;//role numm 9
    mySpawns['Spawn1'].memory.req_towerKeepers = 0;//role num 10
    if(mySpawns['Spawn1'].memory.num_towers>0)
    {
        mySpawns['Spawn1'].memory.req_towerKeepers = 1;
    }
    mySpawns['Spawn1'].memory.req_keeperKillers=0;//role num 15
    mySpawns['Spawn1'].memory.req_keeperHealers=0;//role num 16
    mySpawns['Spawn1'].memory.req_keeperCarriers=0;//role num 17
    mySpawns['Spawn1'].memory.req_keeperFarmers=0;//role num 17
    mySpawns['Spawn1'].memory.req_claimers = 0;//role num 11
    mySpawns['Spawn1'].memory.req_doctors=0;
    if(mySpawns['Spawn1'].memory.farming_rooms==undefined)
    {
        mySpawns['Spawn1'].memory.farming_rooms = [];

    }
    else if(mySpawns['Spawn1'].memory.farming_rooms.length>1)
    {
        mySpawns['Spawn1'].memory.farming_rooms.sort((a,b) => a.distance-b.distance);
        while(mySpawns['Spawn1'].memory.farming_rooms.length>1)
        {
            mySpawns['Spawn1'].memory.farming_rooms.pop();
        }
    }


    if( mySpawns['Spawn1'].memory.claiming_rooms == undefined)
    {
        mySpawns['Spawn1'].memory.claiming_rooms = [];
    }
    
    //mySpawns['Spawn1'].memory.farming_rooms.push('E34N53');
    //mySpawns['Spawn1'].memory.farming_rooms.push('E38S4');
    //mySpawns['Spawn1'].memory.farming_rooms.push('E38S5');
    if(mySpawns['Spawn1'].memory.keepers_rooms==undefined)
    {
        mySpawns['Spawn1'].memory.keepers_rooms=[];
    }
    else if(mySpawns['Spawn1'].memory.keepers_rooms.length>1)
    {
        mySpawns['Spawn1'].memory.keepers_rooms.sort((a,b)=>a.distance-b.distance);
        while(mySpawns['Spawn1'].memory.keepers_rooms.length>1)
        {
            mySpawns['Spawn1'].memory.keepers_rooms.pop();
        }
    }
    var storage=mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: function(structure)
        {
            return structure.structureType==STRUCTURE_STORAGE;
        }
    });
    if(storage!=undefined && storage.length>0 && mySpawns['Spawn1'].memory.num_towers > 0)
    {
        mySpawns['Spawn1'].memory.req_towerKeepers = 1;
        if(storage[0].store[RESOURCE_ENERGY]>15000)
        {
            mySpawns['Spawn1'].memory.need_keeperKiller=undefined;
            mySpawns['Spawn1'].memory.need_keeperHealer=undefined;
            mySpawns['Spawn1'].memory.need_keeperCarrier=undefined;
            mySpawns['Spawn1'].memory.need_keeperFarmer=undefined;

            for(let i=0;i<mySpawns['Spawn1'].memory.keepers_rooms.length;i++)
            {
                if(mySpawns['Spawn1'].memory.keepers_rooms[i].keeperKiller==undefined
                && mySpawns['Spawn1'].memory.need_keeperKiller==undefined)
                {
                    mySpawns['Spawn1'].memory.need_keeperKiller=mySpawns['Spawn1'].memory.keepers_rooms[i].name;
                }

                if(mySpawns['Spawn1'].memory.keepers_rooms[i].keeperHealer==undefined
                && mySpawns['Spawn1'].memory.need_keeperHealer==undefined)
                {
                    mySpawns['Spawn1'].memory.need_keeperHealer=mySpawns['Spawn1'].memory.keepers_rooms[i].name;
                }

                if(mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power<mySpawns['Spawn1'].memory.keepers_rooms[i].sources_num*10
                && mySpawns['Spawn1'].memory.keepers_rooms[i].farmers<mySpawns['Spawn1'].memory.keepers_rooms[i].max_farmers 
                && mySpawns['Spawn1'].memory.keepers_rooms[i].keeperHealer!=undefined
                && mySpawns['Spawn1'].memory.keepers_rooms[i].keeperKiller!=undefined)
                {
                    mySpawns['Spawn1'].memory.need_keeperFarmer=mySpawns['Spawn1'].memory.keepers_rooms[i].name;
                }

                if(mySpawns['Spawn1'].memory.keepers_rooms[i].carry_power<mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power*0.8)
                {
                    mySpawns['Spawn1'].memory.need_keeperCarrier=mySpawns['Spawn1'].memory.keepers_rooms[i].name;
                }
            }



            //mySpawns['Spawn1'].memory.keepers_rooms=[];
            /*
            if(mySpawns['Spawn1'].memory.keepers_rooms==undefined || mySpawns['Spawn1'].memory.keepers_rooms.length<1)
            {
                //mySpawns['Spawn1'].memory.keepers_rooms.push('E36S4')
            }
            if(mySpawns['Spawn1'].room.controller.level>=5 && mySpawns['Spawn1'].memory.keepers_rooms.length>0)
            {
                mySpawns['Spawn1'].memory.req_keeperKillers=1;//role num 15
                mySpawns['Spawn1'].memory.req_keeperHealers=1;//role num 16
                mySpawns['Spawn1'].memory.req_keeperCarriers=3;//role num 17
                mySpawns['Spawn1'].memory.req_keeperFarmers=1;
            }*/
            if(storage[0].store[RESOURCE_ENERGY]>100000)
            {
                mySpawns['Spawn1'].memory.req_upgraders =2;
                //mySpawns['Spawn1'].memory.req_upgraders = 2;
            }
            
        }
        /*
        else if(storage[0].store[RESOURCE_ENERGY]<3000 && mySpawns['Spawn1'].memory.keepers_rooms!=undefined && mySpawns['Spawn1'].memory.keepers_rooms.length>0)
        {
            //mySpawns['Spawn1'].memory.keepers_rooms=[];
            //mySpawns['Spawn1'].memory.req_towerKeepers = 0;
            mySpawns['Spawn1'].memory.req_keeperKillers=0;//role num 15
            mySpawns['Spawn1'].memory.req_keeperHealers=0;//role num 16
            mySpawns['Spawn1'].memory.req_keeperCarriers=0;//role num 17
            mySpawns['Spawn1'].memory.req_keeperFarmers=0;
        }*/ 
        
        
        if(storage[0].store[RESOURCE_ENERGY]>5000)
        {
            mySpawns['Spawn1'].memory.req_harvesters =3;
        }
    }
    
    
    mySpawns['Spawn1'].memory.req_repairers = 1 - (100 * mySpawns['Spawn1'].memory.req_towerKeepers);
    
    
    if(mySpawns['Spawn1'].memory.farming_rooms!=undefined && mySpawns['Spawn1'].memory.farming_rooms.length>0)
    {
       // console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP");
        mySpawns['Spawn1'].memory.need_DistanceCarrier=undefined;

        for(let i=0;i<mySpawns['Spawn1'].memory.farming_rooms.length;i++)
        {
            if(mySpawns['Spawn1'].memory.farming_rooms[i].carry_power<mySpawns['Spawn1'].memory.farming_rooms[i].sources_num*10
            && mySpawns['Spawn1'].memory.farming_rooms[i].carry_power<mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power)
            {
                //console.log("NNNNNNNNNEEEEEEEEEEEEEEEEEEDDDDDDDDDDD");
                mySpawns['Spawn1'].memory.need_DistanceCarrier=mySpawns['Spawn1'].memory.farming_rooms[i].name;
                break;
            }
        }
        console.log(mySpawns['Spawn1'].memory.need_DistanceCarrier);
        mySpawns['Spawn1'].memory.need_farmer=undefined;
        for(let i=0;i<mySpawns['Spawn1'].memory.farming_rooms.length;i++)
        {
            if(mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power<mySpawns['Spawn1'].memory.farming_rooms[i].sources_num*10
            && mySpawns['Spawn1'].memory.farming_rooms[i].farmers<mySpawns['Spawn1'].memory.farming_rooms[i].max_farmers)
            {
                mySpawns['Spawn1'].memory.need_farmer=mySpawns['Spawn1'].memory.farming_rooms[i].name;
                break;
            }
        }
        //console.log('Need farmer: ',mySpawns['Spawn1'].memory.need_farmer);
        //console.log('Need DistanceCarrier: ',mySpawns['Spawn1'].memory.need_DistanceCarrier);
        mySpawns['Spawn1'].memory.req_reservers = mySpawns['Spawn1'].memory.farming_rooms.length*1; // role num 13
        //mySpawns['Spawn1'].memory.req_farmers = mySpawns['Spawn1'].memory.farming_rooms.length*2;
        //mySpawns['Spawn1'].memory.req_DistanceCarriers=mySpawns['Spawn1'].memory.farming_rooms.length*2;//role num 14
        mySpawns['Spawn1'].memory.req_soldiers=mySpawns['Spawn1'].memory.farming_rooms.length*1;
   
   
   
    }
    else{
        mySpawns['Spawn1'].memory.req_reservers =0;
        mySpawns['Spawn1'].memory.req_farmers = 0;
        mySpawns['Spawn1'].memory.req_DistanceCarriers=0;
        mySpawns['Spawn1'].memory.req_soldiers=0;
    }
    
    if(mySpawns['Spawn1'].memory.claiming_rooms==undefined && mySpawns['Spawn1'].memory.claiming_rooms.length>0)
    {
        mySpawns['Spawn1'].memory.req_claimers=mySpawns['Spawn1'].memory.claiming_rooms.length;
        //mySpawns['Spawn1'].memory.claiming_rooms.push('E3N59');
        mySpawns['Spawn1'].memory.req_berserk = mySpawns['Spawn1'].memory.claiming_rooms.length*2;
        mySpawns['Spawn1'].memory.req_distanceBuilders = 2 * mySpawns['Spawn1'].memory.claiming_rooms.length;//role num12
    }
    else{
        mySpawns['Spawn1'].memory.req_claimers=0;
        mySpawns['Spawn1'].memory.req_berserk =0;
        mySpawns['Spawn1'].memory.req_distanceBuilders =0;
    }
    
    

    mySpawns['Spawn1'].memory.soldiers_counter=0;

    var terminal = mySpawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return structure.structureType == STRUCTURE_TERMINAL;
        }
    });
    if(terminal!=undefined && terminal.length>0)
    {
        mySpawns['Spawn1'].memory.req_merchants=1;
    }
    else{
        mySpawns['Spawn1'].memory.req_merchants=0;
    }

    var extractor=mySpawns['Spawn1'].room.find(FIND_STRUCTURES,{
        filter: function(structure)
        {
            return structure.structureType==STRUCTURE_EXTRACTOR;
        }
    });
    var mineral=mySpawns['Spawn1'].room.find(FIND_MINERALS);
    if(extractor!=undefined && extractor.length>0 && mineral[0].mineralAmount>0)
    {
        mySpawns['Spawn1'].memory.req_miners=1;
    }
    else{
        mySpawns['Spawn1'].memory.req_miners=0;
    }


    var labs=mySpawns['Spawn1'].room.find(FIND_STRUCTURES,{
        filter: function (structure)
        {
            return structure.structureType==STRUCTURE_LAB;
        }
    });
    if(labs!=undefined && labs.length>0)
    {
        //mySpawns['Spawn1'].memory.req_doctors=1;
        mySpawns['Spawn1'].memory.req_doctors=1;
    }




    if(Game.time%200==0)
    {
        mySpawns['Spawn1'].memory.progress=0;
        mySpawns['Spawn1'].memory.progress_old=0;
        mySpawns['Spawn1'].memory.progress_sum=0;
        mySpawns['Spawn1'].memory.progress_counter=0;
    }
    if( mySpawns['Spawn1'].memory.farmers_counter==undefined || mySpawns['Spawn1'].memory.farmers_counter>500)
    {
        mySpawns['Spawn1'].memory.farmers_counter=0;
    }
    if(mySpawns['Spawn1'].memory.reservers_counter==undefined || mySpawns['Spawn1'].memory.reservers_counter>500)
    {
        mySpawns['Spawn1'].memory.reservers_counter=0;
    }
    if(mySpawns['Spawn1'].memory.distance_carriers_counter==undefined || mySpawns['Spawn1'].memory.distance_carriers_counter>500)
    {
        mySpawns['Spawn1'].memory.distance_carriers_counter=0;
    }
    if(mySpawns['Spawn1'].memory.soldiers_counter==undefined || mySpawns['Spawn1'].memory.soldiers_counter>500)
    {
        mySpawns['Spawn1'].memory.soldiers_counter=0;
    }
    

    for(let i=0;i<mySpawns['Spawn1'].memory.farming_rooms.length;i++)
    {
        if(mySpawns['Spawn1'].memory.farming_rooms[i].carry_power==undefined)
        {
            mySpawns['Spawn1'].memory.farming_rooms[i].carry_power=0;
        }
        if(mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power==undefined)
        {
            mySpawns['Spawn1'].memory.farming_rooms[i].harvesting_power=0;
        }

        /*
        if(mySpawns['Spawn1'].memory.farming_rooms[i].distance==undefined)
        {
            mySpawns['Spawn1'].memory.farming_rooms[i].distance=Math.abs(calculateDistance(mySpawns['Spawn1'].room.name,
                mySpawns['Spawn1'].memory.farming_rooms[i].name));
        }
        */

    }
    for(let i=0;i<mySpawns['Spawn1'].memory.keepers_rooms.length;i++)
    {
        if(mySpawns['Spawn1'].memory.keepers_rooms[i].carry_power==undefined)
        {
            mySpawns['Spawn1'].memory.keepers_rooms[i].carry_power=0;
        }
        if(mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power==undefined)
        {
            mySpawns['Spawn1'].memory.keepers_rooms[i].harvesting_power=0;
        }

        /*
        if(mySpawns['Spawn1'].memory.keepers_rooms[i].distance==undefined)
        {
            mySpawns['Spawn1'].memory.keepers_rooms[i].distance=Math.abs(calculateDistance(mySpawns['Spawn1'].room.name,
                mySpawns['Spawn1'].memory.keepers_rooms[i].name));
        }
        */
    }

    
}
module.exports = setRequiredPopulation;