//renderer.js

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

        const button1 = document.createElement('button');
        button1.textContent = 'Heal';
        button1.addEventListener('click', async () => {
            const value = parseInt(actionInput?.value) || 0;
            try {
                const updatedPlayer = await window.api.applyHealing(player, value);
                player.CurrentHealth = updatedPlayer.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after healing
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });

        const button2 = document.createElement('button');
        button2.textContent = 'Damage';
        button2.addEventListener('click', async () => {
            const value = parseInt(actionInput?.value) || 0;
            try {
                const updatedPlayer = await window.api.applyDamage(player, value);
                player.CurrentHealth = updatedPlayer.CurrentHealth;
                currentHealthCell.textContent = player.CurrentHealth;
                actionInput.value = ''; // Clear the text field after damaging
            } catch (error) {
                console.error('Error applying damage:', error);
            }
        });

        cell.appendChild(actionInput);
        cell.appendChild(button1);
        cell.appendChild(button2);
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

//clears inititative

document.getElementById('clear-initiative').addEventListener('click', () => {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const rows = playerTableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const initiativeCell = row.getElementsByTagName('td')[4];
        const initiativeInput = initiativeCell.querySelector('.initiative-input');
        initiativeInput.value = ''; // Clear the initiative input field
    }
});

//loads monsters from monster.csv into dropdown

async function loadMonsters() {
    try {
        const monsters = await window.api.getMonsters();
        console.log('Monsters:', monsters); // Do something with the monsters data

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
});

/*

//displays selected monster details

function displaySelectedMonster(monsterName) {
    const monsterTableBody = document.getElementById('monsterTableBody');
    monsterTableBody.innerHTML = ''; // Clear existing rows

    const selectedMonster = window.monstersData.find(monster => monster.Name === monsterName);
    if (selectedMonster) {
        const row = document.createElement('tr');
        Object.keys(selectedMonster).forEach(key => {
            const cell = document.createElement('td');
            cell.textContent = selectedMonster[key];
            row.appendChild(cell);
        });
        monsterTableBody.appendChild(row);
    }
}

document.getElementById('monsters-dropdown').addEventListener('change', (event) => {
    displaySelectedMonster(event.target.value);
});

// Function to add the selected monster to the player table
function addMonsterToPlayerTable(monsterName) {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const selectedMonster = window.monstersData.find(monster => monster.Name === monsterName);
    if (selectedMonster) {
        const monsterRow = document.createElement('tr');

        // Players column
        let cell = document.createElement('td');
        cell.textContent = selectedMonster.Name;
        monsterRow.appendChild(cell);

        // Max Health column
        cell = document.createElement('td');
        cell.textContent = selectedMonster.HP;
        monsterRow.appendChild(cell);

        // Current Health column
        const currentHealthCell = document.createElement('td');
        currentHealthCell.textContent = selectedMonster.HP;
        monsterRow.appendChild(currentHealthCell);

        // Action column with text field and buttons
        cell = document.createElement('td');

        const actionInput = document.createElement('input');
        actionInput.type = 'text';
        actionInput.value = '';
        actionInput.size = 4;

        const healButton = document.createElement('button');
        healButton.textContent = 'Heal';
        healButton.addEventListener('click', async () => {
            try {
                const updatedPlayer = await window.api.applyHealing(selectedMonster, parseInt(actionInput.value, 10));
                selectedMonster.CurrentHealth = updatedPlayer.CurrentHealth;
                currentHealthCell.textContent = selectedMonster.CurrentHealth;
                actionInput.value = ''; // Clear the text field after healing
            } catch (error) {
                console.error('Error applying healing:', error);
            }
        });

        const damageButton = document.createElement('button');
        damageButton.textContent = 'Damage';
        damageButton.addEventListener('click', async () => {
            try {
                const updatedPlayer = await window.api.applyDamage(selectedMonster, parseInt(actionInput.value, 10));
                selectedMonster.CurrentHealth = updatedPlayer.CurrentHealth;
                currentHealthCell.textContent = selectedMonster.CurrentHealth;
                actionInput.value = ''; // Clear the text field after damaging
            } catch (error) {
                console.error('Error applying damage:', error);
            }
        });

        cell.appendChild(actionInput);
        cell.appendChild(healButton);
        cell.appendChild(damageButton);
        monsterRow.appendChild(cell);

        // Initiative column (empty for now)
        cell = document.createElement('td');
        const initiativeInput = document.createElement('input');
        initiativeInput.type = 'text';
        initiativeInput.className = 'initiative-input';
        initiativeInput.size = 4;
        cell.appendChild(initiativeInput);
        monsterRow.appendChild(cell);

        // Monster Attacks column
        cell = document.createElement('td');
        ['Attack 1 damage', 'Attack 2 Damage', 'Attack 3 Damage'].forEach((attack) => {
            const attackValue = selectedMonster[attack];
            if (attackValue) {
                const attackButton = document.createElement('button');
                attackButton.textContent = attackValue;
                attackButton.addEventListener('click', async () => {
                    console.log(`Monster ${selectedMonster.Name} uses ${attack}`);
                    try {
                        const totalDamage = await window.api.computeAttackValue(attackValue); // Compute damage
                        console.log(totalDamage);
                        // Perform other actions with totalDamage as needed
                    } catch (error) {
                        console.error('Error computing attack value:', error);
                    }
                });
                cell.appendChild(attackButton);
                cell.appendChild(document.createTextNode(' | '));
            }
        });
        
        monsterRow.appendChild(cell);

        // Append the entire row to the player table body
        playerTableBody.appendChild(monsterRow);
    }
}

document.getElementById('add-monster').addEventListener('click', () => {
    const selectedMonsterName = document.getElementById('monsters-dropdown').value;
    addMonsterToPlayerTable(selectedMonsterName);
});
*/