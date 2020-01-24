//Cette attaque place un effet de saignement sur l'adversaire, l'adversaire perd des pv pendant 3 tours
const RpgSpell = require('../RpgSpell.js')

module.exports = class RpgSpellBleeding extends RpgSpell {

    constructor(player) {
        let data = {
            mana: 100,
        }
        super(player, data)
        this.count = 1
        this.damage = this.player.randPower(180, 250)
    }

    cast(target) {

        this.consume()

        if (target.calculateResist()) {
            this.player.logger(`${this.player.name} cast bleeding on ${target.name} but they resist!`)
            return
        }

        target.addBeforeTurn(this.callback.bind(this), this.player)
        target.health -= this.damage
        this.player.logger(`${this.player.name} cast bleeding on ${target.name} ! ${target.name} lose ${this.damage} HP`)
    }

    callback(target) {
        this.count++

        if (this.count > 3 || target.health <= 0) {
            target.logger('end bleeding')
            return
        }
        target.logger(`${target.name} bleeds and lose blood`)
        target.logger(`${target.name} loose ${this.damage} HP`)
        target.health -= this.damage

        return this.callback.bind(this)

        // target.health -= this.damage

    }

}
