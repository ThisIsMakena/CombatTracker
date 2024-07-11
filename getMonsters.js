//getMonsters

const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

fs.readFile(__dirname + '/monsterCompendium.xml', function(err, data) {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    parser.parseString(data, function(err, result) {
        if (err) {
            console.error('Error parsing XML:', err);
            return;
        }

        const monsters = result.monsterList.monsters[0].monster.map(monster => {
            return {
                Name: monster.name[0] || '',
                HoursPlayed: monster.hoursOnRecord ? monster.hoursOnRecord[0] : 0,
                appID: monster.appID || ''
            }

        console.dir(result);
    });
});



/*
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

function getMonsters(callback) {
    const filePath = path.join(__dirname, 'monsters.csv');
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
            const monsters = records.map(monster => ({
                Name: monster.Name,
                Type: monster.Type,
                Alignment: monster.Alignment,
                Size: monster.Size,
                AC: parseInt(monster.AC, 10),
                HP: parseInt(monster.HP, 10),
                Spellcasting: monster.Spellcasting,
                'Attack 1 damage': monster['Attack 1 damage'],
                'Attack 2 Damage': monster['Attack 2 Damage'],
                'Attack 3 Damage': monster['Attack 3 Damage'],
                CR: monster.CR
            }));
            callback(null, monsters);
        });
    });
}

module.exports = { getMonsters };
*/