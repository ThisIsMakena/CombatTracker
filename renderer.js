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
        player.CurrentHealth = player.Health; // Initialize CurrentHealth to max health
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
            const value = parseInt(actionInput.value) || 0;
            try {
                const updatedEntity = await window.api.applyHealing(player, value);
                player.CurrentHealth = updatedEntity.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after healing
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });

        const damageButton = document.createElement('button');
        damageButton.textContent = 'Damage';
        damageButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value) || 0;
            try {
                const updatedEntity = await window.api.applyDamage(player, value);
                player.CurrentHealth = updatedEntity.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after damaging
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
    monsterSpellTable.innerHTML = ''; // Clear existing content

    const selectedMonster = window.monstersData.find(monster => monster.name === monsterName);
    if (!selectedMonster) return;

    // Display Traits
    if (selectedMonster.traits && selectedMonster.traits.length > 0) {
        const traitsHeader = document.createElement('h3');
        traitsHeader.textContent = 'Traits';
        monsterSpellTable.appendChild(traitsHeader);

        selectedMonster.traits.forEach(trait => {
            const traitDiv = document.createElement('div');
            const traitName = document.createElement('strong');
            traitName.textContent = trait.name;
            const traitText = document.createElement('p');
            traitText.textContent = trait.text;
            traitDiv.appendChild(traitName);
            traitDiv.appendChild(traitText);
            monsterSpellTable.appendChild(traitDiv);
        });
    }

    // Display Actions
    if (selectedMonster.action && selectedMonster.action.length > 0) {
        const actionsHeader = document.createElement('h3');
        actionsHeader.textContent = 'Actions';
        monsterSpellTable.appendChild(actionsHeader);

        selectedMonster.action.forEach(action => {
            const actionDiv = document.createElement('div');
            const actionName = document.createElement('strong');
            actionName.textContent = action.name;
            const actionText = document.createElement('p');
            actionText.textContent = action.text;
            actionDiv.appendChild(actionName);
            actionDiv.appendChild(actionText);
            monsterSpellTable.appendChild(actionDiv);
        });
    }

    // Display Spells
    const spellsHeader = document.createElement('h3');
    spellsHeader.textContent = 'Spells';
    monsterSpellTable.appendChild(spellsHeader);

    const monsterSpellTableBody = document.createElement('tbody');
    monsterSpellTable.appendChild(monsterSpellTableBody);

    const processedSpellIds = new Set();

    // Display Cantrips if they exist
    const cantrips = selectedMonster.spellsByLevel.find(spellLevel => spellLevel.level === 'cantrips');
    if (cantrips && cantrips.spells.length > 0) {
        const cantripRow = document.createElement('tr');
        const cantripCell = document.createElement('td');
        cantripCell.textContent = 'Cantrips';
        cantripRow.appendChild(cantripCell);
        monsterSpellTableBody.appendChild(cantripRow);

        cantrips.spells.forEach(spellId => {
            const spell = spellsData.find(spell => spell.id === spellId);
            if (spell) {
                    processedSpellIds.add(spellId);
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td'); 
                    nameCell.textContent = spell.name;
                    row.appendChild(nameCell);
                    const textCell = document.createElement('td'); 
                    textCell.textContent = spell.text;
                    row.appendChild(textCell);
                    monsterSpellTableBody.appendChild(row);
                }
        });
    }

    // Display spells for each level
    selectedMonster.spellsByLevel.forEach(spellLevel => {
        if (spellLevel.level !== 'cantrips') {
            const levelRow = document.createElement('tr');
            const levelCell = document.createElement('td');
            levelCell.textContent = `Level ${spellLevel.level}`;
            levelRow.appendChild(levelCell);
            monsterSpellTableBody.appendChild(levelRow);
    
            spellLevel.spells.forEach(spellId => {
                const spell = spellsData.find(spell => spell.id === spellId);
                if (spell && !processedSpellIds.has(spellId)) {
                    processedSpellIds.add(spellId);
                    const row = document.createElement('tr');
                    const nameCell = document.createElement('td'); 
                    nameCell.textContent = spell.name;
                    row.appendChild(nameCell);
                    const textCell = document.createElement('td'); 
                    textCell.textContent = spell.text;
                    row.appendChild(textCell);
                    monsterSpellTableBody.appendChild(row);
                }
            });
        }
    });
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
                console.log('Current Health:', selectedMonster.CurrentHealth, 'Heal Amount:', value);
        
                const updatedEntity = await window.api.applyHealing(selectedMonster, value);
                selectedMonster.CurrentHealth = updatedEntity.CurrentHealth; //update the health value
                currentHealthCell.textContent = selectedMonster.CurrentHealth; //update the table
                actionInput.value = ''; // Clear the text field after healing
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });

        const damageButton = document.createElement('button');
        damageButton.textContent = 'Damage';
        damageButton.addEventListener('click', async () => {
            const value = parseInt(actionInput.value) || 0;
            try {
                console.log('Current Health:', selectedMonster.CurrentHealth, 'Damage Amount:', value);

                const updatedEntity = await window.api.applyDamage(selectedMonster, value);
                selectedMonster.CurrentHealth = updatedEntity.CurrentHealth; //update the health value
                currentHealthCell.textContent = selectedMonster.CurrentHealth; //update the table
                actionInput.value = ''; // Clear the text field after damaging
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

        // Store spells globally
        window.spellsData = spells;
    } catch (error) {
        console.error('Error fetching spells:', error);
    }
}
