const RpgSpell = require('../RpgSpell.js')

/* eslint no-undef: "off" */
module.exports = class RpgSpellParalysis extends RpgSpell {

    constructor(player) {
        let data = {
            mana: 100
        }
        super(player, data)
        this.count = 1
    }

    cast(target) {

        this.consume()

        if (target.calculateResist()) {
            this.player.logger(`${this.player.name} cast paralysis on ${target.name} but they resist!`)
            return true
        }

        target.addBeforeTurn(this.callback.bind(this))
        this.player.logger(`${this.player.name} cast paralysis on ${target.name}…`)
        return true
    }

    callback(target) {

        this.count++

        if (this.count > 3) {
            target.logger('end paralysis')
            return
        }

        target.logger(`${target.name} cannot move!`)
        target.cancelAttack()

        return this.callback.bind(this)
    }

}
