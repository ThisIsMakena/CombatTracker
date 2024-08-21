// playerHealth.js

async function applyHealing(entity, amount) {
    return new Promise((resolve, reject) => {
        try {
            if (isNaN(amount)) {
                throw new Error('Healing amount is not a number');
            }
            
            // Use 'Health' for players and 'hp' for monsters
            const maxHealth = entity.hp || entity.Health;
            entity.CurrentHealth = Math.min(entity.CurrentHealth + amount, maxHealth); // Use min to cap at max health
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
            // Use 'hp' for monsters and 'Health' for players
                        entity.CurrentHealth = Math.max(entity.CurrentHealth - amount, 0);
            entity.CurrentHealth = parseInt(entity.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            resolve(entity);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { applyHealing, applyDamage };
