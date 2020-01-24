/**
 * TODO: an event log system
 */
/* eslint no-undef: "off" */
module.exports = class RpgCharacter {

    /**
     * RpgCharacter constructor
     * @param String name       Character's name
     * @param String type       Character's type
     * @param Object stats      Stats
     * @param Array  spells     List of spells
     */
    constructor(name, type, stats, spells) {

        this.SPECS_NEEDED = [
            'strength', 'dexterity', 'intelligence',
            'luck', 'speed', 'wisdom', 'constitution'
        ]

        this.cancel = false
        this.stats = {}
        this.currentBuffs = []
        this.beforeTurn = []
        this.spells = spells ? spells : []

        if (!stats) {
            throw new Error('Stats are missing')
        }

        if (!Array.isArray(this.spells)) {
            throw new Error('spells should be an array')
        }

        if (typeof name !== 'string' || name === '') {
            throw new Error('Invalid character name')
        }

        this.name = name

        for (const value of this.SPECS_NEEDED) {
            if (value in stats === false) {
                throw new Error('Stats are missing properties')
            }
            let v = parseInt(stats[value])
            this.stats[value] = v > 0 ? v : 1
        }

        this.health = this.baseHealth
        this.mana = this.baseMana
    }

    /* -----------------------------------------------------------------------
     * GETTERS
    /* --------------------------------------------------------------------- */

    /**
     * Vie totale, avec buffs
     */
    get baseHealth() {
        return this.constitution * 200
    }
    /**
     * Mana totale, avec buffs
     */
    get baseMana() {
        return this.intelligence * 200
    }
    /**
     * Vie actuelle
     */
    get health() {
        return this._health
    }
    /**
     * Mana actuelle
     */
    get mana() {
        return this._mana
    }
    /**
     * Puissance d'attaque calculée
     * TODO: l'attaque devrait dépendre d’une arme
     */
    get attack() {
        return this.strength * 10
    }
    /**
     * Défense calculée
     * TODO: la défense devrait dépendre de l'armure
     */
    get defense() {
        return this.strength * 5 + this.constitution * 5
    }
    /**
     * TODO: factoriser avec un proxy get
     */
    get constitution() {
        return this.withBuff('constitution')
    }
    get strength() {
        return this.withBuff('strength')
    }
    get dexterity() {
        return this.withBuff('dexterity')
    }
    get intelligence() {
        return this.withBuff('intelligence')
    }
    get luck() {
        return this.withBuff('luck')
    }
    get speed() {
        return this.withBuff('speed')
    }
    get wisdom() {
        return this.withBuff('wisdom')
    }
    /**
     * Pourcentage de chance de rater un coup
     */
    get miss() {
        return (100 - this.dexterity) / 20
    }
    /**
     * Pourcentage de chance d’esquiver un coup
     */
    get dodge() {
        return 2 + this.dexterity / 5
    }
    /**
     * Pourcentage de chance de réaliser un critique
     */
    get critical() {
        return 3 + this.luck / 10
    }
    /**
     * Pourcentage de chance de résister à un sort
     */
    get resist() {
        return 3 + this.wisdom / 20 + this.intelligence / 20
    }
    /* -----------------------------------------------------------------------
     * SETTERS
    /* --------------------------------------------------------------------- */

    /**
     * Règle la vie courante en effectuant des vérifications
     * @param Int health
     */
    set health(value) {
        if (value < 0) {
            value = 0
        }
        else if (value > this.baseHealth) {
            value = this.baseHealth
        }
        this._health = parseInt(value)
    }
    /**
     * Règle la mana courante en effectuant des vérifications
     * @param Int mana
     */
    set mana(value) {
        if (value < 0) {
            value = 0
        }
        else if (value > this.baseMana) {
            value = this.baseMana
        }
        this._mana = parseInt(value)
    }

    /* -----------------------------------------------------------------------
     * METHODS
    /* --------------------------------------------------------------------- */
    /**
     * Logger par défaut, à écraser
     */
    logger(str) {
        /* eslint no-console: "off" */
        //console.log(str)
        return str
    }
    /**
     * Additionne tous les buffs pour stats
     * @param String stat Buff to get
     * @return Int
     */
    getBuff(stat) {
        return this.currentBuffs.filter(row => row.stat == stat)
            .reduce( (a, r) => a + r.value, 0)
    }
    /**
     * Vérifie si un ou plusieurs buff / debuff sont en cours
     * @return Boolean
     */
    hasBuff(stat) {
        return (this.currentBuffs.filter(row => row.stat == stat).length > 0)
    }
    /**
     * Retourne le stat avec buff
     * @param String stat Buff to get
     * @return Int
     */
    withBuff(stat) {
        let val = this.stats[stat] + this.getBuff(stat)
        return val > 1 ? val : 1
    }
    /**
     * Vérifie se le personnage est mort
     * @return Boolean
     */
    isDead() {
        return this.health === 0
    }
    /**
     * Vérifie si l'utilisateur possède le sort
     * @return Boolean
     */
    hasSpell(name) {
        return this.spells.includes(name)
    }
    /**
     * Tue le personnage
     */
    suicide() {
        this.health = 0
    }
    /**
     * Une méthode de debug
     * @return String
     */
    show() {
        return `
            ---------------------------------------------------
            name: ${this.name}
            ---------------------------------------------------
            health: ${this.health}/${this.baseHealth}
            mana: ${this.mana}/${this.baseMana}
            attack: ${this.attack}
            defense: ${this.defense}
            miss chance: ${this.miss}%
            crit chance: ${this.critical}%
            dodge chance: ${this.dodge}%
        `
    }
    /**
     * Lance un sort sur target
     * @param String        name    Spell name
     * @param RpgCharacter  target  Spell target
     */
    cast(name, target) {

        let spell

        this.checkAttack(target)

        if (target instanceof RpgCharacter === false) {
            throw new Error('Invalid character given')
        }

        if (!this.hasSpell(name)) {
            throw new Error('Spell not registered for this character')
        }

        try {
            spell = require(`./spells/RpgSpell${name}.js`)
        }
        catch (error) {
            throw new Error(`Unable to find spell ./spells/RpgSpell${name}.js`)
        }

        let aspell = new spell(this)

        if (aspell.mana > this.mana) {
            this.logger('Not enough mana…')
            return false
        }

        this.newTurn(target)
        aspell.cast(target)
        this.checkDeath(target)
        this.endTurn()
        return true
    }
    /**
     * Résistance aux sorts
     * @return Boolean
     */
    calculateResist() {
        return this.resist > this.randPercent()
    }
    /**
     * Esquives
     * @return Boolean
     */
    calculateDodge() {
        return this.dodge > this.randPercent()
    }
    /**
     * Ratés
     * @return Boolean
     */
    calculateMiss() {
        return this.miss > this.randPercent()
    }
    /**
     * Critiques
     * @return Boolean
     */
    calculateCritical() {
        return this.critical > this.randPercent()
    }
    /**
     * Retourne un nombre entre 0 et 100
     * @return Number
     */
    randPercent() {
        return Number((Math.random() * 100).toFixed(2))
    }
    /**
     * Retourne une puissance de coup aléatoire entre min et max
     * @param Int min
     * @param Int max
     * @return Int
     */
    randPower(min, max) {
        return Math.floor(Math.random() * Math.floor(max)) + min;
    }
    /**
     * Calcule les dégâts sur un adversaire
     * @param RpgCharacter opponent
     * @return Int
     */
    meleeDamage(opponent) {
        let damage = this.randPower(this.attack + 100, this.attack + 180) - opponent.defense
        if (this.calculateCritical(opponent)) {
            damage *= 1.2
            this.logger('Critical Hit!')
        }
        damage = damage > 0 ? Math.round(damage) : 0
        opponent.health -= damage
        return damage
    }
    /**
     * Melee attack
     * @param RpgCharacter opponent
     */
    melee(target) {

        this.checkAttack(target)

        // execute les callback (effets de sorts) et annule le coup si
        // le callback a annulé le tour
        if (!this.newTurn(target)) {
            this.endTurn()
            return
        }

        // coup raté ?
        if (this.calculateMiss()) {
            this.logger(`${this.name} missed ${target.name}!`)
        }
        // coup évité ?
        else if (target.calculateDodge()) {
            this.logger(`${target.name} dodged ${this.name}'s attack!`)
        }
        else {
            let damage = this.meleeDamage(target)
            this.logger(`${this.name} hit ${target.name} for ${damage} damage (${target.health}/${target.baseHealth})`)
            this.checkDeath(target)
        }

        this.endTurn()
    }
    /**
     * Annule tout effet en cours sur l'attribut
     * @param String stat       Stat key name
     * @param Int    value      Stat value
     * @param Int    duration   Number of turns
     */
    addBuff(stat, value, duration) {
        if (!this.SPECS_NEEDED.includes(stat)) {
            throw new Error('Invalid stat name')
        }

        value    = Math.round(parseInt(value))
        duration = Math.round(parseInt(duration))

        if (isNaN(value) || isNaN(duration)) {
            throw new Error('Invalid values for buff')
        }

        if (value > 0) {
            this.logger(`${this.name} gain +${value} ${stat}`)
        }
        else {
            this.logger(`${this.name} loses ${value} ${stat}`)
        }
        this.currentBuffs.push({
            stat: stat,
            value: value,
            duration: duration
        })
    }
    /**
     * Indique un nouveau tour
     * On annule les buffs dépassés
     * @param RpgCharacter  target
     * @return Boolean
     */
    newTurn(target) {
        this.executeBeforeTurn(target)
        return !this.checkTurnCancelled()
    }
    /**
     * Fin du tour, on supprime les buffs terminés
     */
    endTurn() {
        for (let key = 0 ; key < this.currentBuffs.length ; key++) {

            let c = this.currentBuffs[key]
            c.duration--

            if (c.duration <= 0) {
                // annule le buff
                this.currentBuffs.splice(key, 1)
            }
        }
    }
    /**
     * Vérifie si le tour a été annulé et remet l'indicateur à zéro
     * @return Boolean
     */
    checkTurnCancelled() {
        let result = this.cancel
        this.cancel = false
        return result
    }
    /**
     * Annonce la mort de l'adversaire s'il est décédé
     * @param RpgCharacter opponent
     * @return Boolean
     */
    checkDeath(opponent) {
        if (opponent.isDead()) {
            this.logger(`${this.name} killed ${opponent.name}`)
            return true
        }
        return false
    }
    checkAttack(opponent) {

        if (this.isDead()) {
            throw new Error('Deads cannot fight…')
        }

        if (opponent instanceof RpgCharacter === false) {
            throw new Error('Invalid character given')
        }

        if (opponent.isDead()) {
            throw new Error('You cannot fight with the deads…')
        }

    }
    /**
     * Annule la prochaine attaque
     */
    cancelAttack() {
        this.cancel = true
    }
    /**
     * Enregistre un callback à jouer avant le prochain tour
     * @param function callback
     */
    addBeforeTurn(callback) {
        this.beforeTurn.push(callback)
    }
    /**
     * Execute tous les callbacks enregistrés avant chaque tour
     * @param RpgCharacter target
     */
    executeBeforeTurn(target) {
        let turn, nextTurn = []
        // important: on utilise pop, il faut absolument enlever le callback
        // avant de l'executer pour éviter une boucle infinie
        /* eslint no-cond-assign: "off" */
        while (turn = this.beforeTurn.pop()) {
            // turn contient le callback
            let next = turn(this, target)
            if (typeof next === 'function') {
                nextTurn.push(next)
            }
        }
        this.beforeTurn = nextTurn
    }
}
