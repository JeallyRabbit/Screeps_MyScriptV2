function have_mineral_in_it(object) {
    var ans = false;
    var mineral;
    for (const resource in object.store) {
        if (resource != RESOURCE_ENERGY) {
            if (object.store[resource] > 0) {
                //console.log("RESOURCE: ",resource);
                ans = resource;
            }
        }
    }
    return ans;
}
exports.have_mineral_in_it = have_mineral_in_it;
