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

                    // Initialize spell details
                    let spellcastingDesc = '';
                    let spellsByLevel = {};

                    // Check if the monster has spellcasting traits
                    if (monster.trait) {
                        monster.trait.forEach(trait => {
                            if (trait.name && trait.name[0] === 'Spellcasting.') {
                                spellcastingDesc = trait.text && trait.text[0];

                                // Extract spell levels and slots
                                const spellLevelsRegex = /(\d+)[a-z]{2} level \((\d+) slots\)/gi;
                                let match;
                                while ((match = spellLevelsRegex.exec(spellcastingDesc)) !== null) {
                                    const level = match[0]; // Use the entire matched text as level
                                    const slots = parseInt(match[2], 10);
                                
                                    // Initialize array for spells at this level if not already initialized
                                    if (!spellsByLevel[level]) {
                                        spellsByLevel[level] = [];
                                    }
                                
                                    // Extract spell names and IDs
                                    const spellRegex = /<a\s+href="\/spell\/([^"]+)">([^<]+)<\/a>/g;
                                    let spellMatch;
                                    while ((spellMatch = spellRegex.exec(spellcastingDesc)) !== null) {
                                        const spellId = spellMatch[1];
                                        const spellName = spellMatch[2];
                                        spellsByLevel[level].push({ id: spellId, name: spellName });
                                    }
                                }
                            }
                        });
                    }

                    return {
                        name: (monster.name && monster.name[0]) || '',
                        hp: hpMatch ? parseInt(hpMatch[1], 10) : 0,
                        ac: (monster.ac && monster.ac[0]) || 0,
                        size: (monster.size && monster.size[0]) || '',
                        passivePerception: parseInt((monster.passive && monster.passive[0]) || 0),
                        skills: (monster.skill && monster.skill[0]) || '',
                        saves: (monster.save && monster.save[0]) || '',
                        cr: parseFloat((monster.cr && monster.cr[0]) || 0),
                        alignment: (monster.alignment && monster.alignment[0]) || '',
                        spellcasting: spellcastingDesc,
                        spellsByLevel: spellsByLevel  // Store spells grouped by level
                    };
                });

                callback(null, monsters);
                console.log('Monsters loaded successfully.');
            } else {
                console.error('Unexpected XML structure:', result);
                callback(new Error('Unexpected XML structure'), null);
            }
        });
    });
}

module.exports = { getMonsters };
