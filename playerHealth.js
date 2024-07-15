// playerHealth.js

async function applyHealing(entity, amount) {
    return new Promise((resolve, reject) => {
        try {
            entity.CurrentHealth = Math.min(entity.CurrentHealth + amount, entity.Health);
            entity.CurrentHealth = parseInt(entity.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            resolve(entity);
        } catch (error) {
            reject(error);
        }
    });
}

async function applyDamage(entity, amount) {
    return new Promise((resolve, reject) => {
        try {
            entity.CurrentHealth = Math.max(entity.CurrentHealth - amount, 0);
            entity.CurrentHealth = parseInt(entity.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            resolve(entiy);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { applyHealing, applyDamage };