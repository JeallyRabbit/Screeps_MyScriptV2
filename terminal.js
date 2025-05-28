const STATE_DEVELOPING = 'STATE_DEVELOPING'
const STATE_UNDER_ATTACK = 'STATE_UNDER_ATTACK'
const STATE_NEED_MILITARY_SUPPORT = 'STATE_NEED_MILITARY_SUPPORT'
const STATE_NEED_ENERGY = 'STATE_NEED_ENERGY'
const STATE_STATE_NEED_MILITARY_ENERGY = 'STATE_NEED_MILITARY_ENERGY'


const MIN_AMOUNT_TERMINAL = 5000
const MIN_AMOUNT_BUY = 2500


Spawn.prototype.terminal = function terminal(spawn) {

    // /** @param {Game} game **/
    //tick: function (spawn) {
    if (spawn.room.terminal == undefined || spawn.room.storage == undefined) {
        return
    }
    var terminal = spawn.room.terminal;

    var storage = spawn.room.storage;
    //console.log("orders num: ",Game.market.getAllOrders().length)
    //console.log("creditas: ",Game.market.credits)

    if (terminal != undefined && storage != undefined && Game.time % 5 == 0) {




        //sharing basic resources
        if (terminal.room.controller.level >= 6 && terminal.cooldown == 0) {
            for (main of Memory.main_spawns) {
                //console.log("main: ", main)
                main_spawn = Game.getObjectById(main)
                if (main_spawn == null || main_spawn.room.name == spawn.room.name) {
                    continue
                }
                //console.log("main2: ", main_spawn.room.name)
                var sending_result = false
                var basic_resources = ["O", "H", "O", "U", "L", "K", "Z", "X", "OH"]
                for (res of basic_resources) {
                    if (main_spawn.room.memory.need_resources != undefined && terminal.store[res] > MIN_AMOUNT_TERMINAL * 2 && main_spawn.room.memory.need_resources.includes(res)) {
                        sending_result = terminal.send(res, MIN_AMOUNT_TERMINAL, main_spawn.room.name);
                        if (sending_result == OK) {
                            return;
                        }
                    }
                }
            }
        }




        // sharing energy on rcl8
        if (terminal.room.controller.level == 8 && terminal.cooldown == 0) {

            //console.log("term")
            //looking for rooms that need energy - chosing closest one
            var amount = 5000;
            closest_to_send_energy = undefined
            min_distance = Infinity

            if (spawn.memory.state.includes(STATE_NEED_ENERGY) == false && storage != null && storage.store[RESOURCE_ENERGY] > 100000
                && terminal.store[RESOURCE_ENERGY] > amount) {


                for (main of Memory.main_spawns) {
                    //console.log("main: ", main)
                    main_spawn = Game.getObjectById(main)
                    if (main_spawn == null || main_spawn.room.name == spawn.room.name) {
                        continue
                    }


                    if (main_spawn != null && main_spawn.room.terminal != undefined && main_spawn.memory.state != undefined
                        && main_spawn.memory.state.length > 0 && main_spawn.memory.state.includes(STATE_NEED_ENERGY)) {

                        //console.log("room: ", main_spawn.room.name, " need energy - cost of sending: ", cost)
                        var cost = Game.market.calcTransactionCost(amount, terminal.room.name, main_spawn.room.name)
                        if (cost < min_distance) {
                            min_distance = cost;
                            closest_to_send_energy = main_spawn.room.name;
                        }
                    }


                }
                //console.log("closestToSendEnergy: ",closest_to_send_energy)
                if (closest_to_send_energy != undefined) {
                    //console.log("sending energy to: ", closest_to_send_energy)
                    send_result = terminal.send(RESOURCE_ENERGY, amount, closest_to_send_energy);
                    if (spawn.room.memory.energy_sent == undefined) {
                        spawn.room.memory.energy_sent = amount;
                    }
                    else {
                        spawn.room.memory.energy_sent += amount
                    }


                }
                else {// there is no room to send energy via terminal
                    // /console.log(terminal.store[RESOURCE_ENERGY]>30000 && storage.store[RESOURCE_ENERGY]>300000,"asdaaaaaaaaaaaaaaaaaaaaaaaaaa")
                    if (terminal.store[RESOURCE_ENERGY] > 30000 && storage.store[RESOURCE_ENERGY] > 300000) {

                        cost = undefined;
                        cost = sell_resource(terminal, cost, spawn, RESOURCE_ENERGY);
                        //console.log(terminal.room.name," selling energy cost: ",cost);
                    }
                }
            }
        }
        else if (terminal.room.controller.level >= 6 && terminal.room.controller.level < 8 && terminal.cooldown == 0
            && terminal.store[RESOURCE_ENERGY] > 30000 && storage.store[RESOURCE_ENERGY] > 30000
        ) {

            //Sharing energy on rcl6 and 7

            //calculate average distance to other rooms for itself
            if (spawn.memory.averageDistanceToOthers == undefined || Game.time & 12345 == 0
                && Memory.main_spawns!=undefined && Memory.main_spawns.length>2
            ) {
                var distance = 0.0;
                var counter = 0;
                for (s of Memory.main_spawns) {
                    if (s != spawn.id && Game.getObjectById(s) != null) {
                        distance += Game.map.getRoomLinearDistance(spawn.room.name, Game.getObjectById(s).room.name)
                        counter++;
                    }
                }
                spawn.memory.averageDistanceToOthers = distance / counter;
            }

            //find terminal with minimum average distance to other rooms (which is below rcl 8)
            var minDistance = 10000.0;
            var toShare=null
            for (s of Memory.main_spawns) {
                if (Game.getObjectById(s) != null && Game.getObjectById(s).memory.averageDistanceToOthers<minDistance
            && Game.getObjectById(s).memory.state.includes(STATE_NEED_ENERGY)) {
                    minDistance=Game.getObjectById(s).memory.averageDistanceToOthers
                    toShare=Game.getObjectById(s).room.name
                }
            }
            
            //share energy with it
            if(toShare!=null && toShare!=spawn.room.name)
            {
                amount=5000
                console.log("terminal from: ",spawn.room.name, " is sending energy to: ",toShare)
                send_result = terminal.send(RESOURCE_ENERGY, amount,toShare);
            }
        }


        //selling every resource (except energy) that i have more than 50k
        var cost = sell_everything_except_energy(terminal, cost, spawn)
        //console.log("cost: ",cost)
        if (cost == OK) {
            return
        }
        //console.log(terminal.room.name," cost: ",cost)




        if (spawn.memory.state.includes(STATE_NEED_ENERGY) && terminal.cooldown == 0 && storage.store[RESOURCE_ENERGY] < 60000) {
            console.log("terminal at: ", spawn.room.name, " is trying to buy energy")
            var cost2 = buy_resource(terminal, RESOURCE_ENERGY, 5000)
            console.log("result: ", cost2)
            spawn.room.visual.text(("energy: " + cost2, 25, 25, { color: '#fc03b6' }))
        }


        for (res of this.room.memory.need_resources_buy) {
            var buy_result = buy_resource(spawn, res, 2500)
            //console.log(this.room.name," ",res, " buying result: ", buy_result)
            if (buy_result == OK || this.cooldown != 0) { break; }
        }

    }





    //}
}//;



function sell_everything_except_energy(terminal, cost, spawn) {
    if (terminal.store[RESOURCE_ENERGY] < 5000) {
        //return;
    }
    for (res in terminal.store) {
        if (res == RESOURCE_ENERGY || terminal.store[res] < 50000) {
            continue;
        }
        //console.log("i have storage");
        best_profit = 0
        var best_order_id = undefined
        const energy_orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: res }) // fast
        //console.log(energy_orders.length)
        if (energy_orders != undefined && energy_orders.length > 0) {
            best_order_id = energy_orders[0].id
        }
        for (let i = 1; i < energy_orders.length; i++) {
            var trade_amount = Math.min(terminal.store[res], energy_orders[i].amount)
            var cost = Game.market.calcTransactionCost(trade_amount, energy_orders[i].roomName, spawn.room.name)
            //console.log(energy_orders[i].id);
            //console.log("Cost to trade energy: ",cost);
            var profit = (energy_orders[i].price * trade_amount) - cost
            //console.log("Profit: ",profit);
            var profit_per_unit = profit / trade_amount
            //console.log("profit per unit: ", profit_per_unit);
            if (profit_per_unit > best_profit) {
                best_profit = profit_per_unit
                best_order_id = energy_orders[i].id
            }
        }
        if (best_order_id != undefined) {

            //console.log("best offer2: ",best_order_id);
            var selling_result = undefined
            var trade_amount = Math.min(terminal.store[res], Game.market.getOrderById(best_order_id).amount)
            trade_amount /= 2
            var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
                spawn.room.name)
            var profit = (Game.market.getOrderById(best_order_id).price * trade_amount) - cost
            var profit_per_unit = profit / trade_amount
            //console.log("profit per unit: ",profit_per_unit)
            if (profit_per_unit > 10 || true) {
                //console.log("profit_per_unit: ",profit_per_unit)
                selling_result = Game.market.deal(best_order_id, trade_amount, spawn.room.name)
                //console.log(res, " selling result: ", selling_result)
                //console.log(Game.market.outgoingTransactions);

                //console.log("trade_amount: ",trade_amount);
                //console.log("cost: ",cost);
            }

        }

        /*
        console.log("outgoing transactions")
        for(a of Game.market.outgoingTransactions)
        {
            console.log(a.amount," ",a.resourceType," ",a.from," ",a.to)
        }
        */
    }
    return selling_result
}

function sell_resource(terminal, cost, spawn, res) {

    if (res == undefined) {
        return;
    }
    //console.log("i have storage");
    best_profit = 0
    var best_order_id = undefined
    const energy_orders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: res }) // fast
    if (energy_orders != undefined && energy_orders.length > 0) {
        best_order_id = energy_orders[0].id
    }
    for (let i = 1; i < energy_orders.length; i++) {
        var trade_amount = Math.min(terminal.store[res], energy_orders[i].amount)
        var cost = Game.market.calcTransactionCost(trade_amount, energy_orders[i].roomName, spawn.room.name)
        var profit = (energy_orders[i].price * trade_amount) - cost
        var profit_per_unit = profit / trade_amount
        if (profit_per_unit > best_profit) {
            best_profit = profit_per_unit
            best_order_id = energy_orders[i].id
        }
    }
    //console.log("best order id: ",best_order_id)
    if (best_order_id != undefined) {

        //onsole.log("best offer: ",best_order_id);
        var trade_amount = Math.min(terminal.store[res], Game.market.getOrderById(best_order_id).amount)
        trade_amount = 1000
        var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
            spawn.room.name)
        var profit = (Game.market.getOrderById(best_order_id).price * trade_amount) - cost
        var profit_per_unit = profit / trade_amount
        //console.log("profit per unit: ",profit_per_unit)
        if (profit_per_unit > 10 || true) {
            //console.log(res, " selling result: ", Game.market.deal(best_order_id, trade_amount, spawn.room.name))
            //console.log("trade_amount: ",trade_amount);
            //console.log("cost: ",cost);
        }

    }
    return cost
}

function buy_resource(spawn, res, amount) {
    if (res == undefined /* || res == RESOURCE_ENERGY */) {
        return -1;
    }

    var buying_result = null
    //console.log("i have storage");
    best_price = 0
    var best_order_id = undefined
    const resource_orders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: res }) // fast
    if (resource_orders != undefined && resource_orders.length > 0) {
        best_order_id = resource_orders[0].id
    }
    for (let i = 1; i < resource_orders.length; i++) {
        //console.log(i)
        var trade_amount = Math.min(amount, resource_orders[i].amount)
        var cost = Game.market.calcTransactionCost(trade_amount, resource_orders[i].roomName, spawn.room.name)
        //console.log(energy_orders[i].id);
        //console.log("Cost of energy to trade resource: ",cost);
        var price = (resource_orders[i].price * trade_amount) - cost
        //console.log("Profit: ",profit);
        var price_per_unit = price * trade_amount
        //console.log("profit per unit: ", profit_per_unit);
        if (price_per_unit < best_price) {
            best_price = price_per_unit
            best_order_id = resource_orders[i].id
        }
    }
    if (best_order_id != undefined) {

        var trade_amount = Math.min(amount, Game.market.getOrderById(best_order_id).amount)
        var cost = Game.market.calcTransactionCost(trade_amount, Game.market.getOrderById(best_order_id).roomName,
            spawn.room.name)
        console.log("cost of energy to buy resource: ", cost)
        var price = (Game.market.getOrderById(best_order_id).price * trade_amount) - cost
        var price_per_unit = price / trade_amount
        console.log("price per unit: ", price_per_unit)
        if (price_per_unit < 2000) {
            buying_result = Game.market.deal(best_order_id, trade_amount, spawn.room.name)

        }

    }
    return buying_result
}
//module.exports = terminal