function have_mineral(object) {
    //var ans = false;
    for (const resource in object.store) {
        if (resource != RESOURCE_ENERGY) {
            if (object.store[resource] > 0) {
                //console.log("RESOURCE: ",resource);
                //ans = resource;
                return [ans,object.store[ans]];
            }
        }
    }
    return null
}
exports.have_mineral = have_mineral;
