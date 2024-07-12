//getMonsters

const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

function getMonsters(callback) {
    fs.readFile(__dirname + '/monsterCompendium.xml', function(err, data) {
        if (err) {
            console.error('Error reading file:', err);
            callback(err, null);
            return;
        }
        parser.parseString(data, function(err, result) {
            if (err) {
                console.error('Error parsing XML:', err);
                callback(err, null);
                return;
            }

            if (result && result.compendium && result.compendium.monster) {
                const monsters = result.compendium.monster.map(monster => {
                    return {
                        name: (monster.name && monster.name[0]) || '',
                        hp: (monster.hp && monster.hp[0]) || 0,
                        ac: (monster.ac && monster.ac[0]) || 0,
                        //add extra values here
                    };
                }); 

                callback(null, monsters);
                console.log(monsters);
                console.log('Monsters loaded successfully.');
            } else {
                console.error('Unexpected XML structure:', result);
                callback(new Error('Unexpected XML structure'), null);
            }
        });
    });
}

module.exports = { getMonsters };