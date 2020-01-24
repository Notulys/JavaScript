const RpgCharacter = require("../index.js")

/*
 * Some shortcuts for testing quickly
 */
const baseData = {
    strength: 8, dexterity: 12, intelligence: 3, constitution: 1000,
    wisdom: 3, luck: 10, speed: 4
}
const baseData2 = {
    strength: 1, dexterity: 1, intelligence: 1, constitution: 1000,
    wisdom: 1, luck: 1, speed: 1
}
const spellData = ['Fireball', 'Icespear']
const testData = [
    ['Test1', 'warrior', baseData],
    ['Test2', 'mage', baseData2, spellData]
]
const specs = [
    ['strength'], ['dexterity'], ['intelligence'],
    ['luck'], ['speed'], ['wisdom'], ['constitution']
]

describe.each(testData)("RpgCharacter class", (name, type, data) => {

    it("should register name properly", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.name).toEqual(name);
    });

    it("should create a new character with given data", () => {
        let a = new RpgCharacter(name, type, data)
        expect(a.stats).toEqual(data);
    });

    it("should throw an error when data is missing", () => {
        expect(() => { new RpgCharacter(name, type) }).toThrowErrorMatchingSnapshot();
    });

    it("should throw an error when spell is invalid", () => {
        expect(() => { new RpgCharacter(name, type, data, 'error') }).toThrowErrorMatchingSnapshot();
    });

    it("should not accept an invalid name", () => {
        expect(() => { new RpgCharacter({}, type, data) }).toThrowErrorMatchingSnapshot()
        expect(() => { new RpgCharacter('', type, data) }).toThrowErrorMatchingSnapshot()
    });

    it("should throw an error when missing properties", () => {
        const input = {
            strength: 8,
            dexterity: 12,
            intelligence: 3,
            constitution: 10,
            wisdom: 3,
            luck: 10
        }
        expect(() => { new RpgCharacter(name, type, input) }).toThrowErrorMatchingSnapshot();
    });

    it("should convert and truncate non int numbers", () => {
        const input = {
            strength: -8,
            dexterity: '12',
            intelligence: 3.4,
            constitution: 10,
            wisdom: 3,
            luck: 10,
            speed: 3
        }
        const output = {
            strength: 1,
            dexterity: 12,
            intelligence: 3,
            constitution: 10,
            wisdom: 3,
            luck: 10,
            speed: 3
        }
        let r = new RpgCharacter(name, type, input)
        expect(r.stats).toEqual(output);
    });


});

describe.each(testData)("RpgCharacter isDead method", (name, type, data) => {

    it("should detect dead characters", () => {
        let r = new RpgCharacter(name, type, data)
        r.health = 0
        expect(r.isDead()).toBeTruthy();
    });

    it("should detect alive characters", () => {
        let r = new RpgCharacter(name, type, data)
        r.health = 1
        expect(r.isDead()).toBeFalsy();
    });

});

describe.each(testData)("RpgCharacter suicide method", (name, type, data) => {

    it("should kill the character", () => {
        let r = new RpgCharacter(name, type, data)
        r.suicide()
        expect(r.isDead).toBeTruthy();
    });

});

describe.each(testData)("RpgCharacter melee method", (name, type, data) => {

    it("should throw an error if the character is invalid", () => {
        let r = new RpgCharacter(name, type, data)
        expect(() => { r.melee('error') }).toThrowErrorMatchingSnapshot();
    });

    it("should not be possible to fight a dead", () => {
        let a = new RpgCharacter(name, type, data)
        let b = new RpgCharacter(name, type, data)
        b.suicide()
        expect(() => { a.melee(b) }).toThrowErrorMatchingSnapshot()
    });

    it("should not be possible to melee attack when dead", () => {
        let a = new RpgCharacter(name, type, data)
        let b = new RpgCharacter(name, type, data)
        a.suicide()
        expect(() => { a.melee(b) }).toThrowErrorMatchingSnapshot();
    });

    it("should call the logger", () => {
        let a = new RpgCharacter('test1', 'warrior', baseData)

        const mockFn = jest.fn()

        a.logger = mockFn
        a.melee(a)

        expect(mockFn.mock.calls.length).toBeGreaterThanOrEqual(1)
    });

});

describe.each(testData)("RpgCharacter cast method", (name, type, data) => {

    it("should throw an error with invalid spells", () => {
        let r = new RpgCharacter(name, type, data, ['Fake'])
        expect(() => { r.cast('Fake', r) }).toThrowErrorMatchingSnapshot();
    });

    it("should throw an error if the character is invalid", () => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(() => { r.cast('Fireball', 'error') }).toThrowErrorMatchingSnapshot();
    });

    it("should be forbidden to cast unregistered spells", () => {
        let a = new RpgCharacter(name, 'mage', data)
        let b = new RpgCharacter(name, type, data)
        expect(() => { a.cast('Fireball', b) }).toThrowErrorMatchingSnapshot();
    });

    it("should not be possible to cast spell on a dead", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data)

        a.cast('Fireball', b)

        expect(b.health < b.baseHealth).toBeTruthy()
    });

    it("should not be possible to cast spells when dead", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data)
        a.suicide()
        expect(() => { a.cast('Fireball', b) }).toThrowErrorMatchingSnapshot();
    });

    /*
    it("should return the event string", () => {
        let a = new RpgCharacter('test1', 'warrior', baseData, spellData)
        let b = new RpgCharacter('test2', 'warrior', baseData)
        expect(a.cast('Fireball', b)).toContain('test1')
    });
    */

    it("should drain mana to cast a spell", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data)
        let mana = a.mana
        a.cast('Fireball', b)
        expect(a.mana).toBeLessThan(mana)
    });

});

describe.each(testData)("RpgCharacter attack getter", (name, type, data) => {
    it("should return a number", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.attack).toBeGreaterThanOrEqual(0)
    });
});

describe.each(testData)("RpgCharacter defense getter", (name, type, data) => {
    it("should return a number", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.defense).toBeGreaterThanOrEqual(0)
    });
});

describe.each(testData)("RpgCharacter health getter and setters", (name, type, data) => {

    it("should have baseHealth equal to health on init", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.health).toEqual(r.baseHealth)
    });

    it("should return the computed health value", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.health).toBeGreaterThanOrEqual(100)
    });

    it("should save health as an Int", () => {
        let r = new RpgCharacter(name, type, data)
        r.health = 100.1
        expect(r.health).toEqual(100)
    });

    it("should convert négative value to 0", () => {
        let r = new RpgCharacter(name, type, data)
        r.health = -1
        expect(r.health).toEqual(0)
    });

    it("should never be more than baseHealth", () => {
        let r = new RpgCharacter(name, type, data)
        r.health = r.baseHealth + 1
        expect(r.health).toEqual(r.baseHealth)
    });
})

describe.each(testData)("RpgCharacter mana getter", (name, type, data) => {

    it("should have baseMana equal to mana on init", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.mana).toEqual(r.baseMana)
    });

    it("should return the computed mana value", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.mana).toBeGreaterThanOrEqual(100)
    });

    it("should return 0 for non magic character", () => {
        let r = new RpgCharacter(name, type, data)
        expect(r.mana).toBeGreaterThanOrEqual(0)
    });

    it("should never be negative", () => {
        let r = new RpgCharacter(name, type, data)
        r.mana = -1
        expect(r.mana).toEqual(0)
    });

    it("should never be greater than baseMana", () => {
        let r = new RpgCharacter(name, type, data)
        r.mana = r.baseMana + 1
        expect(r.mana).toEqual(r.baseMana)
    });
});

describe.each(testData)("checkAttack", (name, type, data) => {

    it("should disallow fighting dead", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data, spellData)
        b.suicide()
        expect(() => { a.checkAttack({}) }).toThrowErrorMatchingSnapshot()
    });

    it("should allow fighting alive characters", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data, spellData)
        expect(() => { a.checkAttack(b) }).not.toThrow()
    });

    it("should detetect invalid targets", () => {
        let a = new RpgCharacter(name, type, data, spellData)
        expect(() => { a.checkAttack({}) }).toThrowErrorMatchingSnapshot()
    });
});

describe.each(testData)("RpgCharacter show method", (name, type, data) => {

    it("should return a string", () => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(r.show()).toContain(name)
    });
});

describe.each(testData)("RpgCharacter hasSpell method", (name, type, data) => {

    it("should return true when spell has been registered", () => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(r.hasSpell('Fireball')).toBeTruthy()
    });

    it("should return false when spell has not been registered", () => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(r.hasSpell('Holyslap')).toBeFalsy()
    });
});

describe.each(testData)("addBuff()", (name, type, data) => {

    it.each(specs)("should register the buff", (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, 2, 4)
        r.addBuff('intelligence', 2, 4)
        expect(r.currentBuffs[0]).toEqual({
            stat: stat,
            value: 2,
            duration: 4
        })
        expect(r.currentBuffs[1]).toEqual({
            stat: 'intelligence',
            value: 2,
            duration: 4
        })
    });

    it.each(specs)("should convert string to int", (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, '2', '4')
        expect(r.currentBuffs[0]).toEqual({
            stat: stat,
            value: 2,
            duration: 4
        })
    });

    it("should throw with invalid stats", () => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(() => { r.addBuff('fake', 2, 2) }).toThrowErrorMatchingSnapshot()
    });

    it.each(specs)("should be deleted after the given duration", (stat) => {
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data, spellData)
        a.addBuff(stat, 2, 1)
        a.melee(b)
        expect(a.currentBuffs).toHaveLength(0)
    });

});

describe.each(testData)("buff", (name, type, data) => {

    it.each(specs)("should register the buff %i", (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, 2, 4)
        expect(r.currentBuffs[0]).toEqual({
            stat: stat,
            value: 2,
            duration: 4
        })
    });

});

describe.each(testData)("hasBuff", (name, type, data) => {

    it.each(specs)("detect if a buff is applied", (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, 2, 4)
        expect(r.hasBuff(stat)).toBeTruthy()
    });

    it.each(specs)("detect if a buff is not applied", (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        expect(r.hasBuff(stat)).toBeFalsy()
    });

});

describe.each(testData)("buffs getters", (name, type, data) => {

    it.each(specs)('should return the stats %i with buff', (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, 2, 4)
        expect(r[stat]).toEqual(r.stats[stat] + 2)
    });

    it.each(specs)('should never be lower than 1', (stat) => {
        let r = new RpgCharacter(name, type, data, spellData)
        r.addBuff(stat, -100000, 4)
        expect(r[stat]).toEqual(1)
    });

    it('should return the health with buff computed', () => {
        let r = new RpgCharacter(name, type, data, spellData)
        let health = r.baseHealth
        r.addBuff('constitution', 2, 4)
        expect(r.baseHealth).toBeGreaterThan(health)
    });

    it('should return the mana with buff computed', () => {
        let r = new RpgCharacter(name, type, data, spellData)
        let mana = r.baseMana
        r.addBuff('intelligence', 2, 4)
        expect(r.baseMana).toBeGreaterThan(mana)
    });

});

describe.each(testData)("logger method", (name, type, data) => {

    it("should be possible to replace logger", () => {

        const mockFn = jest.fn()

        let a = new RpgCharacter(name, type, data, spellData)
        a.logger = mockFn
        a.melee(a)

        expect(mockFn.mock.calls.length).toBe(1)
    })

})

describe.each(testData)("addBeforeTurn", (name, type, data) => {

    it("add callback to the queue", () => {
        let mockFn = jest.fn()
        let a = new RpgCharacter(name, type, data, spellData)
        a.addBeforeTurn(mockFn)
        expect(a.beforeTurn.length).toBe(1)
    })

    it("execute the callback when using melee()", () => {
        let mockFn = jest.fn()
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data, spellData)
        a.addBeforeTurn(mockFn)
        expect(mockFn.mock.calls.length).toBe(0)
        a.melee(b)
        expect(mockFn.mock.calls.length).toBe(1)
    })

    it("execute the callback when using cast()", () => {
        let mockFn = jest.fn()
        let a = new RpgCharacter(name, type, data, spellData)
        let b = new RpgCharacter(name, type, data, spellData)
        a.addBeforeTurn(mockFn)
        expect(mockFn.mock.calls.length).toBe(0)
        a.cast('Fireball', b)
        expect(mockFn.mock.calls.length).toBe(1)
    })

})
