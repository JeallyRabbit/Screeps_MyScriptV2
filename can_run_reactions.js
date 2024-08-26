
function can_run_lvl_0_reaction(storage) {
    if (storage.store["H"] > 0 && storage.store["O"] > 0) {
        return ["O", "H"];
    }
    else if (storage.store["Z"] > 0 && storage.store["K"] > 0) {
        //console.log("ZKZKZKZKZKZKKZZKZK");
        return ["Z", "K"];
    }
    else if (storage.store["U"] > 0 && storage.store["L"] > 0) {
        return ["U", "L"];
    }
    else if (storage.store["ZK"] > 0 && storage.store["UL"] > 0) {
        return ["ZK", "UL"];
    }
    else {
        return "NOTHING";
    }
}
exports.can_run_lvl_0_reaction = can_run_lvl_0_reaction;

function can_run_lvl_1_reaction(storage) {
    //console.log(storage.store["K"]);
    if (storage.store["H"] > 0 && storage.store["U"] > 0) {
        return ["U", "H"];
    }
    if (storage.store["O"] > 0 && storage.store["U"] > 0) {
        return ["U", "O"];
    }
    if (storage.store["K"] > 0 && storage.store["H"] > 0) {
        return ["K", "H"];
    }
    if (storage.store["K"] > 0 && storage.store["O"] > 0) {
        return ["K", "O"];
    }
    if (storage.store["L"] > 0 && storage.store["H"] > 0) {
        return ["L", "H"];
    }
    if (storage.store["L"] > 0 && storage.store["O"] > 0) {
        return ["L", "O"];
    }
    if (storage.store["Z"] > 0 && storage.store["H"] > 0) {
        return ["Z", "H"];
    }
    if (storage.store["Z"] > 0 && storage.store["O"] > 0) {
        return ["Z", "O"];
    }
    if (storage.store["G"] > 0 && storage.store["H"] > 0) {
        return ["G", "H"];
    }
    if (storage.store["G"] > 0 && storage.store["O"] > 0) {
        return ["G", "O"];
    }
    else { return "NOTHING"; }
}
exports.can_run_lvl_1_reaction = can_run_lvl_1_reaction;
function can_run_lvl_2_reaction(storage) {
    if (storage.store["UH"] > 0 && storage.store["OH"] > 0) {
        return ["UH", "OH"];
    }
    if (storage.store["UO"] > 0 && storage.store["OH"] > 0) {
        return ["UO", "OH"];
    }
    if (storage.store["KH"] > 0 && storage.store["OH"] > 0) {
        return ["KH", "OH"];
    }
    if (storage.store["KO"] > 0 && storage.store["OH"] > 0) {
        return ["KO", "OH"];
    }
    if (storage.store["LH"] > 0 && storage.store["OH"] > 0) {
        return ["LH,", "OH"];
    }
    if (storage.store["LO"] > 0 && storage.store["OH"] > 0) {
        return ["LH", "OH"];
    }
    if (storage.store["ZH"] > 0 && storage.store["OH"] > 0) {
        return ["ZH", "OH"];
    }
    if (storage.store["ZO"] > 0 && storage.store["OH"] > 0) {
        return ["ZH", "OH"];
    }
    if (storage.store["GH"] > 0 && storage.store["OH"] > 0) {
        return ["GH", "OH"];
    }
    if (storage.store["GO"] > 0 && storage.store["OH"] > 0) {
        return ["GO", "OH"];
    }
    else {
        return "NOTHING";
    }
}
exports.can_run_lvl_2_reaction = can_run_lvl_2_reaction;
function can_run_lvl_3_reaction(storage) {
    if (storage.store["UH20"] > 0 && storage.store["X"] > 0) {
        return ["UH2O", "X"];
    }
    if (storage.store["UHO2"] > 0 && storage.store["X"] > 0) {
        return ["UHO2", "X"];
    }
    if (storage.store["KH20"] > 0 && storage.store["X"] > 0) {
        return ["KH2O", "X"];
    }
    if (storage.store["KHO2"] > 0 && storage.store["X"] > 0) {
        return ["KHO2", "X"];
    }
    if (storage.store["LH20"] > 0 && storage.store["X"] > 0) {
        return ["LH2O", "X"];
    }
    if (storage.store["LHO2"] > 0 && storage.store["X"] > 0) {
        return ["LHO2", "X"];
    }
    if (storage.store["ZH20"] > 0 && storage.store["X"] > 0) {
        return ["ZH2O", "X"];
    }
    if (storage.store["ZHO2"] > 0 && storage.store["X"] > 0) {
        return ["ZHO2", "X"];
    }
    if (storage.store["GH2O"] > 0 && storage.store["X"] > 0) {
        return ["GH2O", "X"];
    }
    if (storage.store["GHO2"] > 0 && storage.store["X"] > 0) {
        //console.log("XGHO2");
        return ["GHO2", "X"];
    }
    else {
        return "NOTHING";
    }
}
exports.can_run_lvl_3_reaction = can_run_lvl_3_reaction;

