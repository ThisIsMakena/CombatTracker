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
                    const hpMatch = monster.hp && monster.hp[0].match(/^(\d+)/);
                    return {
                        name: (monster.name && monster.name[0]) || '',
                        hp: hpMatch ? parseInt(hpMatch[1], 10) : 0,
                        ac: (monster.ac && monster.ac[0]) || 0,
                        size: (monster.size && monster.size[0]) || 0,
                        passivePerception: (monster.passive && monster.passive[0]) || 0,
                        skills: (monster.skill && monster.skill[0]) || 0,
                        saves: (monster.save && monster.save[0]) || 0,
                        cr: (monster.cr && monster.cr[0]) || 0,
                        alignment: (monster.alignment && monster.alignment[0]) || 0,
                        spells: (monster.trait && monster.trait.map(trait => trait.text[0]).join(' ')) || ''
                        //add extra values here
                    };
                }); 

                callback(null, monsters);
                //console.log(monsters);
                console.log('Monsters loaded successfully.');
            } else {
                console.error('Unexpected XML structure:', result);
                callback(new Error('Unexpected XML structure'), null);
            }
        });
    });
}

module.exports = { getMonsters };