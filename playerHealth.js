// playerHealth.js

async function applyHealing(player, amount) {
    return new Promise((resolve, reject) => {
        try {
            player.CurrentHealth = Math.min(player.CurrentHealth + amount, player.Health);
            player.CurrentHealth = parseInt(player.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            resolve(player);
        } catch (error) {
            reject(error);
        }
    });
}

async function applyDamage(player, amount) {
    return new Promise((resolve, reject) => {
        try {
            player.CurrentHealth = Math.max(player.CurrentHealth - amount, 0);
            player.CurrentHealth = parseInt(player.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            resolve(player);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { applyHealing, applyDamage };