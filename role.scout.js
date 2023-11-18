const { goOutOfRange } = require("./goOutOfRange");
const { move_avoid_hostile } = require('./move_avoid_hostile');

function generateAdjacentRooms(tileName) {
    const [letterA, numX, letterB, numY] = tileName.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const adjacentTiles = [];

    for (let x = Number(numX) - 1; x <= Number(numX) + 1; x++) {
        for (let y = Number(numY) - 1; y <= Number(numY) + 1; y++) {
            if (x === Number(numX) && y === Number(numY) || x < 1 || y < 1) {
                continue; // Skip the original tile and invalid coordinates.
            }
            adjacentTiles.push(`${letterA}${x}${letterB}${y}`);
        }
    }

    return adjacentTiles;
}

function areRoomsAdjacent(tileName1, tileName2) {
    const [letterA1, numX1, letterB1, numY1] = tileName1.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);
    const [letterA2, numX2, letterB2, numY2] = tileName2.match(/([a-zA-Z])(\d+)([a-zA-Z])(\d+)/).slice(1);

    const xDiff = Math.abs(Number(numX1) - Number(numX2));
    const yDiff = Math.abs(Number(numY1) - Number(numY2));

    return (
        xDiff <= 1 && yDiff <= 1 &&
        (letterA1 === letterA2 || Math.abs(letterA1.charCodeAt(0) - letterA2.charCodeAt(0)) <= 1) &&
        (letterB1 === letterB2 || Math.abs(letterB1.charCodeAt(0) - letterB2.charCodeAt(0)) <= 1)
    );
}
var roleScout = {

    /** @param {Creep} creep **/
    run: function (creep, spawn) {

        /*
        var pos = creep.pos;
        if (pos.x > 48) {
            creep.move(LEFT);
            return;
        }
        else if (pos.x < 2) {
            creep.move(RIGHT);
            return;
        }
        if (pos.y > 48) {
            creep.move(TOP);
            return;
        }
        else if (pos.y < 2) {
            creep.move(BOTTOM);
            return;
        }
        */

        if (spawn.memory.rooms_to_scan != undefined) {
            if (creep.room.name != spawn.memory.rooms_to_scan[0]) {
                creep.say("MOV");
                const destination = new RoomPosition(25, 25, spawn.memory.rooms_to_scan[0]);
                console.log("destination: ", destination.roomName);
                //creep.moveTo(destination);
                move_avoid_hostile(creep,destination);
            }
            else {
                spawn.memory.rooms_to_scan.shift();
                var is_keeper_room = false;
                var is_farming_room = false;
                if (creep.room.find(FIND_HOSTILE_CREEPS).length > 0 && creep.room.find(FIND_SOURCES).length > 2
                    && areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true) {
                        creep.say("Keepers");
                    is_keeper_room = true;
                    spawn.memory.keepers_rooms.push(creep.room.name);
                }
                else if (creep.room.find(FIND_HOSTILE_CREEPS).length == 0 && creep.room.find(FIND_SOURCES).length == 2
                    && areRoomsAdjacent(creep.memory.home_room.name, creep.room.name) == true) {
                        creep.say("farming");
                    spawn.memory.farming_rooms.push(creep.room.name);
                }

            }
        }



    }
}

module.exports = roleScout;