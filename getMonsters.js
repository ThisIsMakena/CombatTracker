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
                    const hpMatch = monster.hp && monster.hp[0] ? monster.hp[0].match(/^(\d+)/) : null;

                    // Initialize spell details
                    let spellcastingDesc = '';
                    let spellsByLevel = [];
                    let traits = [];

                    // Check if the monster has spellcasting traits
                    if (monster.trait) {
                        monster.trait.forEach(trait => {
                            if (trait.name && trait.name[0] === 'Spellcasting.') {
                                spellcastingDesc = trait.text && trait.text[0] ? trait.text[0] : '';

                                // Remove all asterisks and preprocess the text
                                const cleanedSpellcastingDesc = spellcastingDesc.replace(/\*\s*/g, '');

                                // Extract cantrips
                                const cantripRegex = /Cantrips \(at will\):\s*((?:<a href="\/spell\/[^"]+">[^<]+<\/a>(?:,\s*)?)*)/i;
                                const cantripsMatch = cantripRegex.exec(cleanedSpellcastingDesc);
                                if (cantripsMatch) {
                                    const cantripLinks = cantripsMatch[1].split(',').map(s => s.trim()).filter(Boolean);
                                    if (cantripLinks.length > 0) {
                                        spellsByLevel.push({
                                            level: 'cantrips',
                                            slots: 0,
                                            spells: cantripLinks
                                        });
                                    }
                                }

                                // Extract spells for each level
                                const spellsRegex = /(\d+)(?:st|nd|rd|th) level \((\d+) slots?\):\s*((?:<a href="\/spell\/[^"]+">[^<]+<\/a>(?:,\s*)?)*)/gi;
                                let spellLevelMatch;

                                while ((spellLevelMatch = spellsRegex.exec(cleanedSpellcastingDesc)) !== null) {
                                    const level = spellLevelMatch[1]; // Spell level (e.g., 1)
                                    const slots = parseInt(spellLevelMatch[2], 10); // Number of slots
                                    const spellLinks = spellLevelMatch[3]; // All spell links as a single string

                                    // Split spell links by comma, then trim whitespace
                                    const spells = spellLinks.split(',').map(s => s.trim()).filter(Boolean);

                                    if (spells.length > 0) {
                                        spellsByLevel.push({
                                            level: level,
                                            slots: slots,
                                            spells: spells
                                        });
                                    }
                                }
                            } else {
                                // Extract other traits
                                if (trait.name && trait.text) {
                                    traits.push({
                                        name: trait.name[0],
                                        text: trait.text[0]
                                    });
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
                        spellsByLevel: spellsByLevel,  // Store spells grouped by level
                        traits: traits  // Store traits
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
