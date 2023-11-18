var terminal = {

    /** @param {Game} game **/
    tick: function (spawn) {
        terminal = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TERMINAL }
        });
        if(terminal!=undefined & terminal.length>0)
        {
            if(terminal[0].cooldown==0)
            {
                
                /*
                const order=Game.market.getOrderById('655480b6e8b9dba6bb283223');
                console.log(order.roomName);
                if(order!=undefined)
                {
                    console.log(order.roomName);
                    console.log("COST: ",Game.market.calcTransactionCost(10000,order.roomName,spawn.room.name));
                    if(Game.market.calcTransactionCost(2000,order.roomName,spawn.room.name)<4000)
                    {
                        console.log("deal: ",Game.market.deal(order.id,10000,spawn.room.name));
                    }
                }*/
                
                var buy_GH20=false;

                if(buy_GH20==true)
                {
                    var orders=Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_GHODIUM_ACID,});
                    for(let i=0;i<orders.length;i++)
                    {
                        var max_amount_to_buy=Math.floor(Game.market.credits/orders[i].price);
                        if(orders[i].amount<max_amount_to_buy)
                        {
                            max_amount_to_buy=orders[i].amount;
                        }
                        //console.log("max_amount_to_buy: ", max_amount_to_buy);
                        if(Game.market.calcTransactionCost(max_amount_to_buy,orders[i].roomName,spawn.room.name)<terminal[0].store[RESOURCE_ENERGY]
                        && orders[i].price<10000.000)
                        {
                            
                            //console.log("DEAL REsult; ",Game.market.deal(orders[i].id,max_amount_to_buy,spawn.room.name));
                        }
                    }
                }
                /*
                Game.market.createOrder({
                    type: ORDER_SELL,
                    resourceType: PIXEL,
                    totalAmount: 200,
                    roomName: spawn.room.name,
                    price: 35796.123
                });
                console.log("CREATED!!!!!!!!!!!!!!!!!!!!!!!!!!!!");*/
            //const order=Game.market.getOrderById('65363ab69a89e1ab649338e0');
            //console.log("deal result: ",Game.market.deal(order.id, 40000,spawn.room.name));
            //console.log("deal cost: ", Game.market.calcTransactionCost(40000,order.roomName,spawn.room.name));
            }
            

        }
        

    }
};

module.exports = terminal