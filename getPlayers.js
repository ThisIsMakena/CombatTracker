//getPlayers

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

function getPlayers(callback) {
    const filePath = path.join(__dirname, 'players.csv');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            callback(err, null);
            return;
        }
        parse(data, { columns: true, trim: true }, (err, records) => {
            if (err) {
                callback(err, null);
                return;
            }
            // Ensure Health and CurrentHealth are integers
            records = records.map(record => {
                record.Health = parseInt(record.Health, 10);
                record.CurrentHealth = parseInt(record.Health, 10); // Initialize CurrentHealth to max Health
                return record;
            });
            callback(null, records);
        });
    });
}

module.exports = { getPlayers };
