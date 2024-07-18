// playerHealth.js

async function applyHealing(entity, amount) {
    return new Promise((resolve, reject) => {
        try {
            if (isNaN(amount)) {
                throw new Error('Healing amount is not a number');
            }
            entity.CurrentHealth = Math.min(entity.CurrentHealth + amount, entity.hp); // Use min to cap at max health
            entity.CurrentHealth = parseInt(entity.CurrentHealth, 10); // Ensure CurrentHealth is an integer
            console.log(entity.Health)
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
            resolve(entity); 
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { applyHealing, applyDamage };
