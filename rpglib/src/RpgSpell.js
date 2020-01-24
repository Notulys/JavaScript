/**
 * TODO: self-target / ennemy-target spells
 */
/* eslint no-undef: "off" */
module.exports = class RpgSpell {

    constructor(player, data) {
        this.player = player
        this.mana = data.mana
    }

    consume() {
        if (this.player.mana < this.mana)
        {
            throw new Error('Not enough mana')
        }
        this.player.mana -= this.mana
    }

    cast() {
        throw new Error('Spell has no execute method')
    }

}
