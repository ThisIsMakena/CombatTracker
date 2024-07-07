function rollDie(sides) {
    if (!Number.isInteger(sides) || sides < 1) {
        throw new Error('Number of sides must be a positive integer.');
    }
    return Math.floor(Math.random() * sides) + 1;
}

module.exports = { rollDie };
