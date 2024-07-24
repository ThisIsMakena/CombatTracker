// Function to initialize player table
window.api.onInitPlayers((players) => {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    playerTableBody.innerHTML = ''; // Clear any existing rows

    players.forEach(player => {
        const row = document.createElement('tr');
    
        // Players column
        let cell = document.createElement('td');
        cell.textContent = player.Players; // Ensure correct property name
        row.appendChild(cell);
    
        // Max Health column
        cell = document.createElement('td');
        cell.textContent = player.Health;
        row.appendChild(cell);
    
        // Current Health column
        const currentHealthCell = document.createElement('td');
        //player.CurrentHealth = parseInt(player.Health, 10); // Initialize as a number
        currentHealthCell.textContent = player.CurrentHealth;
        row.appendChild(currentHealthCell);
    
        // Action column with text field and buttons
        cell = document.createElement('td');
    
        const actionInput = document.createElement('input');
        actionInput.type = 'text';
        actionInput.value = '';
        actionInput.size = 4;
    
        const healButton = document.createElement('button');
        healButton.textContent = 'Heal';
        healButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value, 10) || 0;
            try {
                const updatedEntity = await window.api.applyHealing(player, value);
                player.CurrentHealth = updatedEntity.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after healing
                console.log('Healing/Damage value:', value);
                console.log('current health:', player.CurrentHealth);
                console.log('current entity health:', updatedEntity.CurrentHealth);
                addEventToHistory(`Healed ${player.Players} for ${value}. Current Health: ${player.CurrentHealth}`);
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });
    
        const damageButton = document.createElement('button');
        damageButton.textContent = 'Damage';
        damageButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value, 10) || 0;
            try {
                const updatedEntity = await window.api.applyDamage(player, value);
                player.CurrentHealth = updatedEntity.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after damaging
                console.log('Healing/Damage value:', value);
                console.log('current health:', player.CurrentHealth);
                console.log('current entity health:', updatedEntity.CurrentHealth);
                addEventToHistory(`Damaged ${player.Players} for ${value}. Current Health: ${player.CurrentHealth}`);
            } catch (error) {
                console.error('Error applying damage:', error);
            }
        });
    
        cell.appendChild(actionInput);
        cell.appendChild(healButton);
        cell.appendChild(damageButton);
        row.appendChild(cell);
    
        // Initiative column
        const initiativeCell = document.createElement('td');
        const initiativeInput = document.createElement('input');
        initiativeInput.type = 'text';
        initiativeInput.size = 4; // Set the size to 4 characters wide
        initiativeInput.classList.add('initiative-input');
        initiativeCell.appendChild(initiativeInput);
        row.appendChild(initiativeCell);
    
        playerTableBody.appendChild(row);
    });
    
});

// Roll and sort initiative
document.getElementById('run-initiative').addEventListener('click', async () => {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const rows = playerTableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        if (cells.length > 4) {
            const initiativeCell = cells[4];
            const initiativeInput = initiativeCell.querySelector('.initiative-input');
            if (initiativeInput && initiativeInput.value.trim() === '') {
                const initiative = await window.api.rollDie(20);
                initiativeInput.value = initiative;
            }
        }
        addEventToHistory('Initiative Rolled');
    }

    const allRows = Array.from(playerTableBody.getElementsByTagName('tr')).filter(row => {
        const cells = row.getElementsByTagName('td');
        return cells.length > 4 && cells[4].querySelector('.initiative-input');
    });

    if (allRows.every(row => row.cells[4].querySelector('.initiative-input').value !== '')) {
        const sortedRows = allRows.sort((rowA, rowB) => {
            const initA = parseInt(rowA.cells[4].querySelector('.initiative-input').value) || 0;
            const initB = parseInt(rowB.cells[4].querySelector('.initiative-input').value) || 0;
            return initB - initA; // Sort in descending order
        });

        sortedRows.forEach(row => playerTableBody.appendChild(row));
        console.log('Table sorted successfully.');
    }
});

// Clear initiative
document.getElementById('clear-initiative').addEventListener('click', () => {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const rows = playerTableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const initiativeCell = row.getElementsByTagName('td')[4];
        const initiativeInput = initiativeCell.querySelector('.initiative-input');
        initiativeInput.value = ''; // Clear the initiative input field
    }
});

// Function to load monsters and populate the dropdown
async function loadMonsters() {
    try {
        const monsters = await window.api.getMonsters();
        console.log('Monsters:', monsters);

        // Populate the monsters dropdown
        const monstersDropdown = document.getElementById('monsters-dropdown');
        monstersDropdown.innerHTML = ''; // Clear existing options
        monsters.forEach(monster => {
            const option = document.createElement('option');
            option.value = monster.name;
            option.textContent = monster.name;
            monstersDropdown.appendChild(option);
        });

        // Store monsters globally
        window.monstersData = monsters;
    } catch (error) {
        console.error('Error fetching monsters:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMonsters();
    loadSpells();
    const monstersDropdown = document.getElementById('monsters-dropdown');
    if (monstersDropdown) {
        monstersDropdown.addEventListener('change', (event) => {
            const selectedMonsterName = event.target.value;
            displaySelectedMonster(selectedMonsterName);
            displaySelectedMonsterSpells(selectedMonsterName, window.spellsData);
        });
    }
});

// Function to display selected monster details
function displaySelectedMonster(monsterName) {
    const monsterTableBody = document.getElementById('monsterTableBody');
    monsterTableBody.innerHTML = ''; // Clear existing rows

    const selectedMonster = window.monstersData.find(monster => monster.name === monsterName);
    if (selectedMonster) {
        const row = document.createElement('tr');
        const fieldsToDisplay = ['name', 'hp', 'ac', 'cr', 'alignment', 'size'];
        fieldsToDisplay.forEach(field => {
            const cell = document.createElement('td');
            cell.textContent = selectedMonster[field];
            row.appendChild(cell);
        });
        monsterTableBody.appendChild(row);
    }
}

// Function to display spells, traits, and actions of the selected monster
function displaySelectedMonsterSpells(monsterName, spellsData) {
    const monsterSpellTable = document.getElementById('monsterSpellTable');
    const monsterTraitTable = document.getElementById('monsterTraitTable');
    const monsterActionTable = document.getElementById('monsterActionTable');

    // Clear existing content
    monsterSpellTable.innerHTML = '';
    monsterTraitTable.innerHTML = '';
    monsterActionTable.innerHTML = '';

    const selectedMonster = window.monstersData.find(monster => monster.name === monsterName);
    if (!selectedMonster) return;

    // Display Traits
    if (selectedMonster.traits && selectedMonster.traits.length > 0) {
        const traitsHeader = document.createElement('h3');
        traitsHeader.textContent = 'Traits';
        monsterTraitTable.appendChild(traitsHeader);

        selectedMonster.traits.forEach(trait => {
            const traitDiv = document.createElement('div');
            const traitName = document.createElement('strong');
            traitName.textContent = trait.name;
            const traitText = document.createElement('p');
            traitText.textContent = trait.text;
            traitDiv.appendChild(traitName);
            traitDiv.appendChild(traitText);
            monsterTraitTable.appendChild(traitDiv);
        });
    }

    // Display Actions
    if (selectedMonster.action && selectedMonster.action.length > 0) {
        const actionsHeader = document.createElement('h3');
        actionsHeader.textContent = 'Actions';
        monsterActionTable.appendChild(actionsHeader);

        selectedMonster.action.forEach(action => {
            const actionDiv = document.createElement('div');
            const actionName = document.createElement('div');
            actionName.classList.add('action-name'); // Adds div id for css
            actionName.textContent = `Name: ${action.name}`;
            actionDiv.appendChild(actionName);

            if (action.type) {
                const actionType = document.createElement('div');
                actionType.textContent = `Type: ${action.type}`;
                actionDiv.appendChild(actionType);
            }

            if (action.toHit) {
                const actionToHit = document.createElement('div');
                actionToHit.textContent = `To Hit: ${action.toHit}`;
                actionDiv.appendChild(actionToHit);
            }

            if (action.reach) {
                const actionReach = document.createElement('div');
                actionReach.textContent = `Reach: ${action.reach}`;
                actionDiv.appendChild(actionReach);
            }

            if (action.range) {
                const actionRange = document.createElement('div');
                actionRange.textContent = `Range: ${action.range}`;
                actionDiv.appendChild(actionRange);
            }

            if (action.targets) {
                const actionTargets = document.createElement('div');
                actionTargets.textContent = `Targets: ${action.targets}`;
                actionDiv.appendChild(actionTargets);
            }

            if (action.damage) {
                const actionDamage = document.createElement('div');
                actionDamage.textContent = `Damage: ${action.damage}`;
                actionDiv.appendChild(actionDamage);
            }

            if (action.altDamage) {
                const actionAltDamage = document.createElement('div');
                actionAltDamage.textContent = `Alternative Damage: ${action.altDamage}`;
                actionDiv.appendChild(actionAltDamage);
            }

            if (action.info) {
                const actionInfo = document.createElement('div');
                actionInfo.textContent = `Additional Info: ${action.info}`;
                actionDiv.appendChild(actionInfo);
            }
            const separator = document.createElement('p');
            separator.textContent = ''; // Empty paragraph for spacing
            monsterActionTable.appendChild(separator);
            monsterActionTable.appendChild(actionDiv);
        });
    }

    // Display Spells
    const spellsHeader = document.createElement('h3');
    spellsHeader.textContent = 'Spells';
    monsterSpellTable.appendChild(spellsHeader);

    const spellStats = document.createElement('div');
    spellStats.innerHTML = `
        Spellcasting Ability: ${selectedMonster.spellcastingAbility}<br>
        Spell Save DC: ${selectedMonster.spellSaveDC}<br>
        Spell Attack Bonus: ${selectedMonster.spellAttackBonus}<br>
        <br>
    `;
    monsterSpellTable.appendChild(spellStats);

    const monsterSpellTableBody = document.createElement('tbody');
    monsterSpellTable.appendChild(monsterSpellTableBody);

    // Group spells by level
    const spellsByLevel = {};

    selectedMonster.spellsByLevel.forEach(spellLevel => {
        const isCantrip = spellLevel.level === 'cantrips';
        const level = isCantrip ? 0 : parseInt(spellLevel.level, 10);

        if (!spellsByLevel[level]) {
            spellsByLevel[level] = [];
        }

        spellLevel.spells.forEach(spellId => {
            const spell = spellsData.find(spell => spell.id === spellId);
            if (spell) {
                spellsByLevel[level].push(spell);
            }
        });
    });

    // Include spells with damageScaling in higher levels
    const maxLevel = Math.max(...Object.keys(spellsByLevel).map(Number), 0);

    Object.keys(spellsByLevel).forEach(level => {
        const spells = spellsByLevel[level];
        spells.forEach(spell => {
            if (spell.damageScaling) {
                const scalingLevel = parseInt(level, 10);
                for (let i = scalingLevel + 1; i <= maxLevel; i++) {
                    if (!spellsByLevel[i]) {
                        spellsByLevel[i] = [];
                    }
                    if (!spellsByLevel[i].find(scaledSpell => scaledSpell.id === spell.id)) {
                        spellsByLevel[i].push(spell);
                    }
                }
            }
        });
    });

    // Render spells grouped by level
    Object.keys(spellsByLevel).sort((a, b) => a - b).forEach(level => {
        const levelSpells = spellsByLevel[level];
        const isCantrip = level === '0';

        // Create the label row
        const labelRow = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.colSpan = 8; // Span across eight columns
        labelCell.textContent = isCantrip ? 'Cantrips' : `Level ${level}`;
        labelCell.classList.add('spell-heading');
        labelRow.appendChild(labelCell);
        monsterSpellTableBody.appendChild(labelRow);

        // Create spell slots row
        const slotsRow = document.createElement('tr');
        const slotsCell = document.createElement('td');
        slotsCell.colSpan = 8;
        slotsCell.textContent = `slots 0/X`; // You can replace this with actual slot data
        slotsRow.appendChild(slotsCell);
        monsterSpellTableBody.appendChild(slotsRow);

        // Create spell details rows
        levelSpells.forEach(spell => {
            const spellRow = document.createElement('tr');

            // Cast button
            const castButtonCell = document.createElement('td');
            const castButton = document.createElement('button');
            castButton.textContent = `Cast ${spell.Name}`;
            castButton.addEventListener('click', async () => {
                const results = await evaluateDamage(spell.damage);
                results.forEach(result => {
                    console.log(`Total damage rolled for ${spell.Name} (${result.part}): ${result.totalDamage}`);
                    addEventToHistory(`Total damage rolled for ${spell.Name} (${result.part}): ${result.totalDamage}`);
                });
            });
            castButtonCell.appendChild(castButton);
            spellRow.appendChild(castButtonCell);

            // Range
            const rangeCell = document.createElement('td');
            rangeCell.textContent = spell.Range;
            spellRow.appendChild(rangeCell);

            // Spell Attack
            const spellAttackCell = document.createElement('td');
            spellAttackCell.textContent = selectedMonster.spellAttackBonus;
            spellRow.appendChild(spellAttackCell);

            // Spell DC
            const spellDCCell = document.createElement('td');
            spellDCCell.textContent = selectedMonster.spellSaveDC;
            spellRow.appendChild(spellDCCell);

            // Damage/Effect
            const damageEffectCell = document.createElement('td');
            damageEffectCell.textContent = spell.Damage;
            spellRow.appendChild(damageEffectCell);

            monsterSpellTableBody.appendChild(spellRow);
        });
    });
}



//spell damage got more complicated lel

async function evaluateDamage(damageStr) {
    const parts = damageStr.split('|').map(part => part.trim());
    let results = [];

    for (const part of parts) {
        // Check for a + modifier
        const [dicePart, modifierPart] = part.split('+').map(str => str.trim());

        // Roll the dice part
        if (dicePart.includes('d')) {
            const [diceCount, diceSides] = dicePart.split('d').map(Number);
            let totalDamage = 0;
            for (let i = 0; i < diceCount; i++) {
                const damage = await window.api.rollDie(diceSides);
                totalDamage += damage;
            }

            // Add the modifier if it exists
            if (modifierPart) {
                totalDamage += parseInt(modifierPart, 10);
            }

            results.push({ part, totalDamage });
        } else {
            const totalDamage = parseInt(dicePart, 10);
            if (modifierPart) {
                totalDamage += parseInt(modifierPart, 10);
            }
            results.push({ part, totalDamage });
        }
    }

    return results;
}

// Function to add the selected monster to the player table
function addMonsterToPlayerTable(monsterName) {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const selectedMonster = window.monstersData.find(monster => monster.name === monsterName);
    if (selectedMonster) {
        const monsterRow = document.createElement('tr');

        // Players column
        let cell = document.createElement('td');
        cell.textContent = selectedMonster.name;

        cell.addEventListener('click', () => {
            displaySelectedMonster(selectedMonster.name);
            displaySelectedMonsterSpells(selectedMonster.name, window.spellsData);
        });

        monsterRow.appendChild(cell);

        // Max Health column
        cell = document.createElement('td');
        cell.textContent = selectedMonster.hp;
        monsterRow.appendChild(cell);

        // Current Health column
        const currentHealthCell = document.createElement('td');
        selectedMonster.CurrentHealth = parseInt(selectedMonster.hp, 10); // Initialize CurrentHealth to max health
        if (isNaN(selectedMonster.CurrentHealth)) {
            selectedMonster.CurrentHealth = 0; // Fallback to 0 if initialization fails
        }
        console.log('CurrentHealth initialized to:', selectedMonster.CurrentHealth);
        currentHealthCell.textContent = selectedMonster.CurrentHealth;
        monsterRow.appendChild(currentHealthCell);

        cell = document.createElement('td');

        const actionInput = document.createElement('input');
        actionInput.type = 'text';
        actionInput.value = '';
        actionInput.size = 4;

        const healButton = document.createElement('button');
        healButton.textContent = 'Heal';
        healButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value) || 0;
            try {
                const updatedEntity = await window.api.applyHealing(selectedMonster, value);
                selectedMonster.CurrentHealth = updatedEntity.CurrentHealth; //update the health value
                currentHealthCell.textContent = selectedMonster.CurrentHealth; //update the table
                actionInput.value = ''; // Clear the text field after healing
                addEventToHistory(`Current Health: ${selectedMonster.CurrentHealth}, Heal Amount: ${value}`);
                
                console.log('Healing/Damage value:', value);
                console.log('Current Health:', selectedMonster.CurrentHealth, 'Heal Amount:', value);
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });

        const damageButton = document.createElement('button');
        damageButton.textContent = 'Damage';
        damageButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value) || 0;
            try {
                const updatedEntity = await window.api.applyDamage(selectedMonster, value);
                selectedMonster.CurrentHealth = updatedEntity.CurrentHealth; //update the health value
                currentHealthCell.textContent = selectedMonster.CurrentHealth; //update the table
                actionInput.value = ''; // Clear the text field after damaging
                addEventToHistory(`Current Health: ${selectedMonster.CurrentHealth}, Damage Amount: ${value}`);
                console.log('Healing/Damage value:', value);
                console.log('Current Health:', selectedMonster.CurrentHealth, 'Damage Amount:', value);
            } catch (error) {
                console.error('Error applying damage:', error);
            }
        });

        cell.appendChild(actionInput);
        cell.appendChild(healButton);
        cell.appendChild(damageButton);
        monsterRow.appendChild(cell);

        cell = document.createElement('td');
        const initiativeInput = document.createElement('input');
        initiativeInput.type = 'text';
        initiativeInput.className = 'initiative-input';
        initiativeInput.size = 4;
        cell.appendChild(initiativeInput);
        monsterRow.appendChild(cell);

        // Append the entire row to the player table body
        playerTableBody.appendChild(monsterRow);
    }
}

document.getElementById('add-monster').addEventListener('click', () => {
    const selectedMonsterName = document.getElementById('monsters-dropdown').value;
    addMonsterToPlayerTable(selectedMonsterName);
});

// Load spells data
async function loadSpells() {
    try {
        const spells = await window.api.getSpells();
        console.log('Spells:', spells);
        window.spellsData = spells;
    } catch (error) {
        console.error('Error fetching spells:', error);
    }
}


// Function to add a new event to the event history table
function addEventToHistory(eventDescription) {
    const eventHistoryBody = document.getElementById('eventHistoryBody');
    const newRow = document.createElement('tr');
    const newCell = document.createElement('td');
    newCell.textContent = eventDescription;
    newRow.appendChild(newCell);
    eventHistoryBody.appendChild(newRow);
}

