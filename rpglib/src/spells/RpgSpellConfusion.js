
const RpgSpell = require('../RpgSpell.js')

/* eslint no-undef: "off" */
module.exports = class RpgSpellConfusion extends RpgSpell {

    constructor(player) {
        let data = {
            mana: 100
        }
        super(player, data)
    }

    cast(target) {

        this.consume()

        if (target.calculateResist()) {
            this.player.logger(`${this.player.name} cast paralysis on ${target.name} but they resist!`)
            return
        }

        target.addBeforeTurn(this.callback)
        this.player.logger(`${this.player.name} cast confusion on ${target.name}…`)
    }

    callback(target) {
        target.logger(`${target.name} are confused and hit themselves!`)
        target.melee(target)
        target.cancelAttack()
    }

}
