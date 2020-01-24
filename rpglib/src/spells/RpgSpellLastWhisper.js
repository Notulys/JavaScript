const RpgSpell = require('../RpgSpell.js')

/* eslint no-undef: "off" */
module.exports = class RpgSpellLastWhisper extends RpgSpell {

    constructor(player) {
        let data = {
            //Le sort coute 300 de mana.
            mana: 300
        }
        super(player, data)
        //On initialise un compteur pour que le sort dure 2 tours uniquement.
        this.count = 1
    }

    cast(player) {
        this.consume()
        if (this.player.health < 500) {
            //Le sort n'est lançable que si le joueur a moins de 500HP et si il dispose de 300 de mana.
            this.player.logger(`${this.player.name} casts Last Whisper on himself and heal 650 HP. He gains +50 defense !`)
            //Le joueur gagne récupère alors 650HP et gagne 50 d'armure pendant 2 tours.
            this.player.health += 650
            this.player.addBuff("strength", +50, 2)
            this.player.spells.splice(7, 1)
            return true
        }
        this.player.logger(`${this.player.name} fails !`)
        return true
        //Si le joueur a plus de 500HP, la mana est quand même consommée mais le sort n'est pas lancé.
    }

    callback(player) {

        this.count++

        //A la fin des 2 tours, le joueur perd la defense gagnée grâce au spell.
        if (this.count == 3) {
            this.player.addBuff("strength", -100, 100)
            return 
        }
        //Sinon, le buff dure 1 tour de plus.
        this.player.health += 650
        this.player.addBuff("strength", +50, 2)
    }
}