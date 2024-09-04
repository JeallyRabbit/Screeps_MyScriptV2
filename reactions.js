const MIN_AMOUNT = 99
const REQ_AMOUNT = 10000
const REQ_MID_AMOUNT=1000
StructureTerminal.prototype.reactions = function reactions() {
    if (this.room.storage != undefined) {
        var storage = this.room.storage
    }
    else {
        return
    }
    if (storage.store["XGH2O"] < REQ_AMOUNT) { //1 upgrade controller boost
        if (this.store["GH2O"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["GH2O", "X"]
        }
        else if (this.store["GH"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["GH2O"]<REQ_MID_AMOUNT) {
            return ["GH", "OH"]
        }
        else if (this.store["G"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["GH"]<REQ_MID_AMOUNT) {
            return ["G", "H"]
        }
        else if (this.store["O"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["O", "H"]
        }
        else if (this.store["ZK"] > MIN_AMOUNT && this.store["UL"] > MIN_AMOUNT && this.store["G"]<REQ_MID_AMOUNT) {
            return ["ZK", "UL"]
        }
        else if (this.store["Z"] > MIN_AMOUNT && this.store["K"] > MIN_AMOUNT && this.store["ZK"]<REQ_MID_AMOUNT) {
            return ["Z", "K"]
        }
        else if (this.store["U"] > MIN_AMOUNT && this.store["L"] > MIN_AMOUNT && this.store["UL"]<REQ_MID_AMOUNT) {
            return ["U", "L"]
        }
    }
    /*
    if(storage.store["XKHO2"]<REQ_AMOUNT){ //2 ranged attack
        if (this.store["KHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT ) {
            return ["KHO2", "X"]
        }
        else if (this.store["KO"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT  && this.store["KHO2"]<REQ_MID_AMOUNT) {
            return ["KO", "OH"]
        }
        else if (this.store["K"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["KO"]<REQ_MID_AMOUNT) {
            return ["K", "O"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if(storage.store["XLHO2"]<REQ_AMOUNT){ //3 heal
        if (this.store["LHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["LHO2", "X"]
        }
        else if (this.store["LO"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["LHO2"]<REQ_MID_AMOUNT) {
            return ["LO", "OH"]
        }
        else if (this.store["L"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT && this.store["LO"]<REQ_MID_AMOUNT) {
            return ["L", "O"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if (storage.store["XGHO2"] < REQ_AMOUNT) { //4 tough
        if (this.store["GHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["GHO2", "X"]
        }
        else if (this.store["GO"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["GHO2"]<REQ_MID_AMOUNT) {
            return ["GO", "OH"]
        }
        else if (this.store["G"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT && this.store["GO"]<REQ_MID_AMOUNT) {
            return ["G", "O"]
        }
        else if (this.store["O"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["O", "H"]
        }
        else if (this.store["ZK"] > MIN_AMOUNT && this.store["UL"] > MIN_AMOUNT && this.store["G"]<REQ_MID_AMOUNT) {
            return ["ZK", "UL"]
        }
        else if (this.store["Z"] > MIN_AMOUNT && this.store["K"] > MIN_AMOUNT && this.store["ZK"]<REQ_MID_AMOUNT) {
            return ["Z", "K"]
        }
        else if (this.store["U"] > MIN_AMOUNT && this.store["L"] > MIN_AMOUN && this.store["UL"]<REQ_MID_AMOUNT) {
            return ["U", "L"]
        }
    }

    if(storage.store["XUH2O"]<REQ_AMOUNT){ //5 Attack
        if (this.store["UH2O"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["UH2O", "X"]
        }
        else if (this.store["UH"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["UH2O"]<REQ_MID_AMOUNT) {
            return ["UH", "OH"]
        }
        else if (this.store["U"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["UH"]<REQ_MID_AMOUNT) {
            return ["U", "H"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if(storage.store["XZHO2"]<REQ_AMOUNT){ //6 MOVE
        if (this.store["ZHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["ZHO2", "X"]
        }
        else if (this.store["ZO"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT  && this.store["ZHO2"]<REQ_MID_AMOUNT) {
            return ["ZO", "OH"]
        }
        else if (this.store["Z"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["ZO"]<REQ_MID_AMOUNT) {
            return ["Z", "O"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if(storage.store["XKH2O"]<REQ_AMOUNT){ //7 CAPACITY
        if (this.store["KH2O"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT ) {
            return ["KH2O", "X"]
        }
        else if (this.store["KH"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["KH2O"]<REQ_MID_AMOUNT) {
            return ["KH", "OH"]
        }
        else if (this.store["K"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["KH"]<REQ_MID_AMOUNT) {
            return ["K", "H"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if(storage.store["XUHO2"]<REQ_AMOUNT){ //8 CAPACITY
        if (this.store["UHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["UHO2", "X"]
        }
        else if (this.store["UH"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["UHO2"]<REQ_MID_AMOUNT) {
            return ["UH", "OH"]
        }
        else if (this.store["U"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["UH"]<REQ_MID_AMOUNT) {
            return ["U", "H"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

    if(storage.store["XUHO2"]<REQ_AMOUNT){ //9 HARVEST
        if (this.store["UHO2"] > MIN_AMOUNT && this.store["X"] > MIN_AMOUNT) {
            return ["UHO2", "X"]
        }
        else if (this.store["UH"] > MIN_AMOUNT && this.store["OH"] > MIN_AMOUNT && this.store["UHO2"]<REQ_MID_AMOUNT) {
            return ["UH", "OH"]
        }
        else if (this.store["U"] > MIN_AMOUNT && this.store["H"] > MIN_AMOUNT && this.store["UH"]<REQ_MID_AMOUNT) {
            return ["U", "H"]
        }
        else if (this.store["H"] > MIN_AMOUNT && this.store["O"] > MIN_AMOUNT  && this.store["OH"]<REQ_MID_AMOUNT) {
            return ["H", "O"]
        }
    }

   */
    


}

