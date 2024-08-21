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
                    let actions = [];
                    let spellcastingAbility = '';
                    let spellSaveDC = '';
                    let spellAttackBonus = '';

                    // Check if the monster has spellcasting traits
                    if (monster.trait) {
                        monster.trait.forEach(trait => {
                            if (trait.name && trait.name[0] === 'Spellcasting.') {
                                spellcastingDesc = trait.text && trait.text[0] ? trait.text[0] : '';

                                // Remove all asterisks and preprocess the text
                                const cleanedSpellcastingDesc = spellcastingDesc.replace(/\*\s*/g, '');

                                // Extract spellcasting ability
                                const abilityMatch = cleanedSpellcastingDesc.match(/(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) as the spellcasting ability|its spellcasting ability is (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/i);
                                if (abilityMatch) {
                                    spellcastingAbility = abilityMatch[1] || abilityMatch[2] || '';
                                }

                                // Extract Spell Save DC
                                const saveDCMatch = cleanedSpellcastingDesc.match(/spell save DC (\d+)/i);
                                if (saveDCMatch) {
                                    spellSaveDC = saveDCMatch[1] || '';
                                }

                                // Extract Spell Attack Bonus
                                const attackBonusMatch = cleanedSpellcastingDesc.match(/\+(\d+) to hit with spell attacks/i);
                                if (attackBonusMatch) {
                                    spellAttackBonus = attackBonusMatch[1] || '';
                                }

                                // Extract cantrips
                                const cantripRegex = /Cantrips \(at will\):\s*((?:<a href="\/spell\/([^"]+)">[^<]+<\/a>(?:,\s*)?)*)/i;
                                const cantripsMatch = cantripRegex.exec(cleanedSpellcastingDesc);
                                if (cantripsMatch && cantripsMatch[1]) {
                                    const cantripLinks = cantripsMatch[1].match(/\/spell\/([^"]+)/g);
                                    if (cantripLinks) {
                                        const cantripIds = cantripLinks.map(link => link.split('/').pop());
                                        if (cantripIds.length > 0) {
                                            spellsByLevel.push({
                                                level: 'cantrips',
                                                slots: 0,
                                                spells: cantripIds
                                            });
                                        }
                                    }
                                }

                                // Extract spells for each level
                                const spellsRegex = /(\d+)(?:st|nd|rd|th) level \((\d+) slots?\):\s*((?:<a href="\/spell\/[^"]+">[^<]+<\/a>(?:,\s*)?)*)/gi;
                                let spellLevelMatch;

                                while ((spellLevelMatch = spellsRegex.exec(cleanedSpellcastingDesc)) !== null) {
                                    const level = spellLevelMatch[1]; // Spell level (e.g., 1)
                                    const slots = parseInt(spellLevelMatch[2], 10); // Number of slots
                                    const spellLinks = spellLevelMatch[3]; // All spell links as a single string

                                    // Split spell links by comma, then extract IDs
                                    const spellLinkMatches = spellLinks.match(/\/spell\/([^"]+)/g);
                                    if (spellLinkMatches) {
                                        const spells = spellLinkMatches.map(link => link.split('/').pop());
                                        if (spells.length > 0) {
                                            spellsByLevel.push({
                                                level: level,
                                                slots: slots,
                                                spells: spells
                                            });
                                        }
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

                    // Extract actions
                    if (monster.action) {
                        monster.action.forEach(action => {
                            if (action.name && action.text) {
                                const actionText = action.text[0];
                
                                // Extract action details
                                const typeMatch = actionText.match(/<i>(.*?)<\/i>/i);
                                const toHitMatch = actionText.match(/\+[\d-]+/);
                                const reachMatch = actionText.match(/reach (\d+ ft\.)/);
                                const rangeMatch = actionText.match(/range (\d+\/\d+ ft\.)/);
                                const targetsMatch = actionText.match(/one target/);
                                const damageMatch = actionText.match(/(\d+) \((\d+d\d+ [\+\-] \d+)\) ([a-zA-Z]+) damage/);
                                const altDamageMatch = actionText.match(/, or (\d+) \((\d+d\d+ [\+\-] \d+)\) ([a-zA-Z]+) damage if used with two hands/);
                
                                const actionDetails = {
                                    name: action.name[0],
                                    type: typeMatch ? typeMatch[1] : '',
                                    toHit: toHitMatch ? toHitMatch[0] : '',
                                    reach: reachMatch ? reachMatch[1] : '',
                                    range: rangeMatch ? rangeMatch[1] : '',
                                    targets: targetsMatch ? targetsMatch[0] : '',
                                    damage: damageMatch ? `${damageMatch[1]} (${damageMatch[2]}) ${damageMatch[3]} damage` : '',
                                    altDamage: altDamageMatch ? `${altDamageMatch[1]} (${altDamageMatch[2]}) ${altDamageMatch[3]} damage if used with two hands` : '',
                                    info: actionText.replace(/<[^>]+>/g, '') // Strip HTML tags for additional info
                                };
                
                                actions.push(actionDetails);
                            }
                        });
                    }

                    return {
                        name: (monster.name && monster.name[0]) || '',
                        hp: hpMatch ? parseInt(hpMatch[1], 10) : 0,
                        currentHp: hpMatch ? parseInt(hpMatch[1], 10) : 0,
                        ac: (monster.ac && monster.ac[0]) || 0,
                        size: (monster.size && monster.size[0]) || '',
                        passivePerception: parseInt((monster.passive && monster.passive[0]) || 0),
                        skills: (monster.skill && monster.skill[0]) || '',
                        saves: (monster.save && monster.save[0]) || '',
                        cr: parseFloat((monster.cr && monster.cr[0]) || 0),
                        alignment: (monster.alignment && monster.alignment[0]) || '',
                        spellcasting: spellcastingDesc,
                        spellcastingAbility: spellcastingAbility, // Add spellcasting ability
                        spellSaveDC: spellSaveDC,               // Add spell save DC
                        spellAttackBonus: spellAttackBonus,     // Add spell attack bonus
                        spellsByLevel: spellsByLevel,           // Store spells grouped by level
                        traits: traits,                        // Store traits
                        action: actions //actions
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
