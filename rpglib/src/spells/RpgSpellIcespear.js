const RpgSpell = require('../RpgSpell.js')

/* eslint no-undef: "off" */
module.exports = class RpgSpellFireball extends RpgSpell {

    constructor(player) {
        let data = {
            mana: 200
        }
        super(player, data)
    }

    cast(target) {

        let info = 'Piercing their defense'
        target.health -= this.player.randPower(280, 370)

        // ignore opponent defense if wisdom <= 10
        let damage = this.player.attack + this.player.randPower(10, 20)
        if (target.stats.wisdom > 10) {
            damage -= target.defense
            info = ''
        }
        damage = damage > 0 ? damage : 0
        target.health -= damage

        this.consume()

        this.player.logger(`${this.player.name} hit ${target.name} with an icespear for ${damage} damage ${info}`)
    }

}
