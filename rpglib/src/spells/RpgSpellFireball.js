const RpgSpell = require('../RpgSpell.js')

/* eslint no-undef: "off" */
module.exports = class RpgSpellFireball extends RpgSpell {

    constructor(player) {
        let data = {
            mana: 100
        }
        super(player, data)
    }

    cast(target) {

        let damage = this.player.randPower(200, 250)
        target.health -= damage

        this.consume()

        this.player.logger(`${this.player.name} hit ${target.name} with a fireball for ${damage} damage`)
    }

}
