//main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getPlayers } = require('./getPlayers');
const { applyHealing, applyDamage } = require('./playerHealth');
const { rollDie } = require('./diceroller');
const { getMonsters } = require('./getMonsters');
const { getSpells } = require('./getSpells.js');
const { computeAttackValue } = require('./attackOutputs'); 

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();

    // Read the players.csv file and send data to renderer process
    getPlayers((err, records) => {
        if (err) {
            console.error('Failed to read CSV file:', err.message);
            return;
        }
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('init-players', records);
        });
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('read-players-csv', (event) => {
    getPlayers((err, records) => {
        if (err) {
            event.reply('read-players-csv-response', { success: false, error: err.message });
            return;
        }
        event.reply('read-players-csv-response', { success: true, data: records });
    });
});

ipcMain.handle('apply-healing', async (event, player, amount) => {
    return await applyHealing(player, amount);
});

ipcMain.handle('apply-damage', async (event, player, amount) => {
    return await applyDamage(player, amount);
});

ipcMain.handle('roll-die', async (event, sides) => {
    return rollDie(sides);
});

ipcMain.handle('get-monsters', async () => {
    return new Promise((resolve, reject) => {
        getMonsters((err, monsters) => {
            if (err) {
                reject(err);
            } else {
                resolve(monsters);
            }
        });
    });
});


ipcMain.handle('get-spells', async () => {
    return new Promise((resolve, reject) => {
        getSpells((err, spells) => {
            if (err) {
                reject(err);
            } else {
                resolve(spells);
            }
        });
    });
});

ipcMain.handle('compute-attack-values', async (event, attackValue) => {
    return computeAttackValue(attackValue);
});