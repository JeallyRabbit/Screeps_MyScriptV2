const OUTLINE_COLOR = 'black'
const TEXT_COLOR = '#fc03b6'

Spawn.prototype.visualize = function visualize(spawn, farming_needs_satisfied=false, spawned_body_parts=0, pop_haulers=0, pop_claimers=0, pop_scanners=0, pop_colonizers=0,pop_doctors=0) {

    var energyCap = spawn.room.energyAvailable;


    this.room.visual.text("energyCap: " + energyCap, 4, 2, { color: TEXT_COLOR })
    this.room.visual.text("Body parts: " + spawned_body_parts, 4, 3, { color: TEXT_COLOR })
    var farmingColor = 'red'
    var roomNameColor = 'white'
    if (farming_needs_satisfied) {
        farmingColor = 'green'

    }


    console.log("VISUALIZING ", this.room.name)

    //topLeft box (first from left) - general room informations
    {
        spawn.room.visual.text(spawn.room.name + "⛏️", 4, 1, { color: roomNameColor, opacity: 2 })
        this.room.visual.rect(1, 0, 6, 1.3, { fill: farmingColor })

        this.room.visual.line(1, 0, 7, 0, { color: 'grey' }) // top vertical line
        this.room.visual.line(1, 1.3, 7, 1.3, { color: 'grey' }) // Header down line
        this.room.visual.line(1, 6, 7, 6, { color: 'grey' })
        this.room.visual.line(1, 0, 1, 6, { color: 'grey' })
        this.room.visual.line(7, 0, 7, 6, { color: 'grey' })
    

        spawn.room.visual.text("Haulers: " + pop_haulers + "/" + spawn.memory.req_haulers, 4, 4, { color: '#fc03b6' })
        spawn.room.visual.text("Doctors: " + pop_doctors + "/" + spawn.memory.req_doctors, 4, 5, { color: '#fc03b6' })

    }



    //second left (colonizing box)
    {
        this.room.visual.line(8, 0, 14, 0, { color: 'grey' }) // top vertical line
        this.room.visual.line(8, 1.3, 14, 1.3, { color: 'grey' }) // Header down line
        this.room.visual.line(8, 4.5, 14, 4.5, { color: 'grey' })
        this.room.visual.line(8, 0, 8, 4.5, { color: 'grey' })
        this.room.visual.line(14, 0, 14, 4.5, { color: 'grey' })

        spawn.room.visual.text("Colonizing", 11, 1, { color: 'white' })

        var colonizeColor = 'red'
        if (spawn.memory.req_scanners > 0 || spawn.memory.req_claimers > 0) {
            colonizeColor = 'green'
        }
        this.room.visual.rect(8, 0, 6, 1.3, { fill: colonizeColor })

        spawn.room.visual.text("scanners: " + pop_scanners + "/" + spawn.memory.req_scanners, 11, 2, { color: '#fc03b6' })
        spawn.room.visual.text("Claimers: " + pop_claimers + "/" + spawn.memory.req_claimers, 11, 3, { color: '#fc03b6' })
        spawn.room.visual.text("Colonizers; " + pop_colonizers + "/" + spawn.memory.req_colonizers, 11, 4, { color: '#fc03b6' })
    }



    //visuals around controller
    {
        //this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y, this.room.controller.pos.x + 3, this.room.controller.pos.y, { color: OUTLINE_COLOR })
        //this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y - 1.5, this.room.controller.pos.x + 3, this.room.controller.pos.y + 1.5, { color: OUTLINE_COLOR })

        //this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y, this.room.controller.pos.x, this.room.controller.pos.y + 1.5, { color: OUTLINE_COLOR })
        //this.room.visual.line(this.room.controller.pos.x + 3, this.room.controller.pos.y, this.room.controller.pos.x + 3, this.room.controller.pos.y + 1.5, { color: OUTLINE_COLOR })
        this.room.visual.rect(this.room.controller.pos.x, this.room.controller.pos.y - 1.5, 3, 1.5, { fill: 'grey' })
        this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y - 1.5, this.room.controller.pos.x, this.room.controller.pos.y, { color: 'OUTLINE_COLOR' }) // left vertical
        this.room.visual.line(this.room.controller.pos.x + 3, this.room.controller.pos.y - 1.5, this.room.controller.pos.x + 3, this.room.controller.pos.y, { color: 'OUTLINE_COLOR' }) // right vertical
        this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y - 1.5, this.room.controller.pos.x + 3, this.room.controller.pos.y - 1.5, { color: 'OUTLINE_COLOR' }) // horozontal above controler
        this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y, this.room.controller.pos.x + 3, this.room.controller.pos.y, { color: 'OUTLINE_COLOR' }) // horizontal separating

        spawn.room.visual.text('⬆️' + (Math.round((spawn.memory.progress_sum / spawn.memory.progress_counter) * 100) / 100) + "/t",
            spawn.room.controller.pos.x + 1.5, spawn.room.controller.pos.y + 1, { color: TEXT_COLOR })


        if (spawn.memory.progress_sum != undefined && spawn.memory.progress_counter != undefined) {
            var ttu = (spawn.room.controller.progressTotal - spawn.room.controller.progress) / (Math.round((spawn.memory.progress_sum / spawn.memory.progress_counter) * 100) / 100)


            this.room.visual.rect(this.room.controller.pos.x, this.room.controller.pos.y, 3, 1.5, { fill: 'grey' })
            spawn.room.visual.text('🕓' + Math.round((ttu)),
                spawn.room.controller.pos.x + 1.5, spawn.room.controller.pos.y - 0.5, { color: TEXT_COLOR })
            this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y, this.room.controller.pos.x, this.room.controller.pos.y + 1.5, { color: 'OUTLINE_COLOR' }) // left vertical
            this.room.visual.line(this.room.controller.pos.x + 3, this.room.controller.pos.y, this.room.controller.pos.x + 3, this.room.controller.pos.y + 1.5, { color: 'OUTLINE_COLOR' }) // right vertical
            this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y + 1.5, this.room.controller.pos.x + 3, this.room.controller.pos.y + 1.5, { color: 'OUTLINE_COLOR' }) // horozontal below controler

            //this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y, this.room.controller.pos.x, this.room.controller.pos.y, { color: OUTLINE_COLOR })
            //this.room.visual.line(this.room.controller.pos.x, this.room.controller.pos.y + 1.5, this.room.controller.pos.x, this.room.controller.pos.y + 1.5, { color: OUTLINE_COLOR })
            //this.room.visual.line(this.room.controller.pos.x + 3, this.room.controller.pos.y, this.room.controller.pos.x - 3, this.room.controller.pos.y + 1.5, { color: OUTLINE_COLOR })
        }
    }

    //spawn.room.visual.text("Upgraders: " + upgraders_parts + "/" + spawn.memory.req_upgraders_parts, 4, 2, { color: '#fc03b6' })
}