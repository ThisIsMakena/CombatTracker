const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

// Custom functions
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

contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        let validChannels = ['read-players-csv'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ['init-players'];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    onInitPlayers: (callback) => {
        ipcRenderer.on('init-players', (event, players) => callback(players));
    },
    applyHealing: (player, amount) => applyHealing(player, amount),
    applyDamage: (player, amount) => applyDamage(player, amount),
    rollDie: (sides) => ipcRenderer.invoke('roll-die', sides)
});

console.log('contextBridge exposed in main world');

window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script executed');
});
