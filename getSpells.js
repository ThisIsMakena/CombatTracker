//getSpells.js

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

function getSpells(callback) {
    const filePath = path.join(__dirname, 'spellList.csv');
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
                record.id = record.spellId;
                record.name = record.Name;
                record.details = record.Details;
                return record;
            });
            callback(null, records);
        });
    });
}

module.exports = { getSpells };


/*
const fs = require('fs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();

function getSpells(callback) {
    fs.readFile(__dirname + '/spellCompendium.xml', function(err, data) {
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

            if (result && result.compendium && result.compendium.spell) {
                const spells = result.compendium.spell.map(spell => {
                    return {
                        id: spell.$.id,  
                        name: (spell.name && spell.name[0]) || '',
                        level: (spell.level && spell.level[0]) || '',
                        school: (spell.school && spell.school[0]) || '',
                        ritual: (spell.ritual && spell.ritual[0]) || '',
                        time: (spell.time && spell.time[0]) || '',
                        classes: (spell.classes && spell.classes[0]) || '',
                        components: (spell.components && spell.components[0]) || '',
                        duration: (spell.duration && spell.duration[0]) || '',
                        range: (spell.range && spell.range[0]) || '',
                        text: (spell.text && spell.text[0]) || '',
                        source: (spell.source && spell.source[0]) || ''
                    };
                });

                callback(null, spells);
                console.log('spells loaded successfully.');
            } else {
                console.error('Unexpected XML structure:', result);
            }
        });
    });
}

module.exports = { getSpells };
*/