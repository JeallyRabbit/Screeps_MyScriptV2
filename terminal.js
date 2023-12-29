var terminal = {

    /** @param {Game} game **/
    tick: function (spawn) {
        terminal = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TERMINAL }
        });

        storage = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_STORAGE
                    && structure.store[RESOURCE_ENERGY] > 400000;
            }
        });
        if (terminal != undefined & terminal.length > 0) {
            if (terminal[0].cooldown == 0) {
                //console.log("cooldown=0");
                //sell energy (actively)
                if (storage != undefined && storage.length > 0) {
                    //console.log("i have storage");
                    best_profit = 0;
                    var best_order_id = undefined
                    const energy_orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: RESOURCE_ENERGY }); // fast
                    if (energy_orders != undefined) {
                        best_order_id = energy_orders[0].id;
                    }
                    for (let i = 1; i < energy_orders.length; i++) {
                        var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], energy_orders[i].amount);
                        var cost = Game.market.calcTransactionCost(trade_amount, energy_orders[i].roomName, spawn.room.name);
                        //console.log(energy_orders[i].id);
                        //console.log("Cost to trade energy: ",cost);
                        var profit = (energy_orders[i].price * trade_amount) - cost;
                        //console.log("Profit: ",profit);
                        var profit_per_unit = profit / trade_amount;
                        //console.log("profit per unit: ", profit_per_unit);
                        if (profit_per_unit > best_profit) {
                            best_profit = profit_per_unit;
                            best_order_id = energy_orders[i].id;
                            // console.log(energy_orders[i].id);
                            //console.log("Cost to trade energy: ",cost);
                            //console.log("Profit: ",profit);
                            //console.log("profit per unit: ", profit_per_unit);
                        }
                    }
                    if (best_order_id != undefined) {

                        //onsole.log("best offer: ",best_order_id);
                        var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], Game.market.getOrderById(best_order_id).amount);
                        var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
                            spawn.room.name);
                        var profit = (Game.market.getOrderById(best_order_id).price * trade_amount) - cost;
                        var profit_per_unit = profit / trade_amount;
                        //console.log("profit per unit: ",profit_per_unit)
                        if (profit_per_unit > 10) {
                            console.log("energy selling result: ", Game.market.deal(best_order_id, trade_amount, spawn.room.name));
                            //console.log("trade_amount: ",trade_amount);
                            //console.log("cost: ",cost);
                        }

                    }

                }

                /// buy XGH2O (actively)
                //buy KH (actively)
                /*
                var lowest_price = 0;
                var best_order_id = undefined
                const orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: "KH" }); // fast
                if (orders != undefined && orders.length>0) {
                    best_order_id = orders[0].id;
                }
                for (let i = 1; i < orders.length; i++) {
                    var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], orders[i].amount);
                    trade_amount = 100;
                    var cost = Game.market.calcTransactionCost(trade_amount, orders[i].roomName, spawn.room.name) * 15;
                    //cost in credits
                    //console.log(orders[i].id);
                    //console.log("Cost to trade energy: ",cost);
                    var full_cost = (orders[i].price * trade_amount) + cost;
                    //console.log("full_cost: ",full_cost);
                    var full_cost_per_unit = full_cost / trade_amount;
                    //console.log("full_cost per unit: ", full_cost_per_unit);
                    if (full_cost_per_unit > lowest_price) {
                        lowest_price = full_cost_per_unit;
                        best_order_id = orders[i].id;
                        // console.log(orders[i].id);
                        //console.log("Cost to trade energy: ",cost);
                        //console.log("full_cost: ",full_cost);
                        //console.log("full_cost per unit: ", full_cost_per_unit);
                    }
                }
                if (best_order_id != undefined) {

                    //onsole.log("best offer: ",best_order_id);
                    var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], Game.market.getOrderById(best_order_id).amount);
                    var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
                        spawn.room.name);
                    var full_cost = (Game.market.getOrderById(best_order_id).price * trade_amount) + cost;
                    var full_cost_per_unit = full_cost / trade_amount;
                    //console.log("full_cost per unit: ",full_cost_per_unit)
                    if (Game.market.getOrderById(best_order_id).price < 900) {
                       // console.log("KH Buying result: ", Game.market.deal(best_order_id, trade_amount, spawn.room.name));

                    }
                    //console.log("trade_amount: ",trade_amount);
                    //console.log("cost: ",cost);
                }
                */

                /*
                //buy energy
                var lowest_price = 0;
                var best_order_id = undefined
                const orders2 = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: RESOURCE_ENERGY }); // fast
                if (orders2 != undefined) {
                    best_order_id = orders2[0].id;
                }
                for (let i = 1; i < orders2.length; i++) {
                    var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], orders2[i].amount);
                    trade_amount = 100;
                    var cost = Game.market.calcTransactionCost(trade_amount, orders2[i].roomName, spawn.room.name) * 15;
                    //cost in credits
                    //console.log(orders[i].id);
                    //console.log("Cost to trade energy: ",cost);
                    var full_cost = (orders2[i].price * trade_amount) + cost;
                    //console.log("full_cost: ",full_cost);
                    var full_cost_per_unit = full_cost / trade_amount;
                    //console.log("full_cost per unit: ", full_cost_per_unit);
                    if (full_cost_per_unit > lowest_price) {
                        lowest_price = full_cost_per_unit;
                        best_order_id = orders2[i].id;
                        // console.log(orders[i].id);
                        //console.log("Cost to trade energy: ",cost);
                        //console.log("full_cost: ",full_cost);
                        //console.log("full_cost per unit: ", full_cost_per_unit);
                    }
                }
                if (best_order_id != undefined) {

                    //onsole.log("best offer: ",best_order_id);
                    var trade_amount = Math.min(terminal[0].store[RESOURCE_ENERGY], Game.market.getOrderById(best_order_id).amount);
                    var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
                        spawn.room.name);
                    var full_cost = (Game.market.getOrderById(best_order_id).price * trade_amount) + cost;
                    var full_cost_per_unit = full_cost / trade_amount;
                    //console.log("full_cost per unit: ",full_cost_per_unit)
                    if (Game.market.getOrderById(best_order_id).price < 900) {
                        console.log("Energy Buying result: ", Game.market.deal(best_order_id, trade_amount, spawn.room.name));

                    }
                    //console.log("trade_amount: ",trade_amount);
                    //console.log("cost: ",cost);
                }
                */

                /*
                const order=Game.market.getOrderById('657f199cd464650012ee6c7f');

                if(order!=undefined)
                {
                    console.log(order.roomName);
                    if(order!=undefined)
                    {
                        console.log(order.roomName);
                        console.log("COST: ",Game.market.calcTransactionCost(1000,order.roomName,spawn.room.name));
                       /* if(Game.market.calcTransactionCost(1000,order.roomName,spawn.room.name)<10000)
                        {
                            console.log("deal: ",Game.market.deal(order.id,1000,spawn.room.name));
                        }
                    }
                }
                else{
                    console.log('order undefined');
                }*/

                /*
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
                */
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