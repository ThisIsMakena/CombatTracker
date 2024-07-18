//preload.js

const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded');

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
    applyHealing: (player, amount) => ipcRenderer.invoke('apply-healing', player, amount),
    applyDamage: (player, amount) => ipcRenderer.invoke('apply-damage', player, amount),
    rollDie: (sides) => ipcRenderer.invoke('roll-die', sides),
    getMonsters: () => ipcRenderer.invoke('get-monsters'),
    computeAttackValue: (attackValue) => ipcRenderer.invoke('compute-attack-values', attackValue)
    
});

console.log('contextBridge exposed in main world');

window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script executed');
});
