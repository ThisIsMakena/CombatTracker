//attackOutputs

const { rollDie } = require('./diceroller'); 

function computeAttackValue(attackValue) {
    const regex = /(\d+)d(\d+)\+(\d+)/;
    const match = attackValue.match(regex);

    if (match) {
        const x = parseInt(match[1], 10); // Number of dice rolls
        const y = parseInt(match[2], 10); // Number of sides on each die
        const z = parseInt(match[3], 10); // Constant modifier

        let total = 0;
        for (let i = 0; i < x; i++) {
            const roll = rollDie(y); // Roll a die with y sides
            console.log(`Roll ${i + 1}: ${roll}`);
            total += roll;
        }

        total += z; // Add the constant modifier

        console.log(`Total Attack Value: ${total}`);
        return total;
    } else {
        console.error(`Invalid attack value format: ${attackValue}`);
        return 0; // Or handle error as needed
    }
}

module.exports = { computeAttackValue };
