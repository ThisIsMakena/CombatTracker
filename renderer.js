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
            const value = parseInt(actionInput.value, 10);
            if (isNaN(value)) {
                console.error('Invalid number for healing');
                return;
            }

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
            const value = parseInt(actionInput.value, 10);
            if (isNaN(value)) {
                console.error('Invalid number for damage');
                return;
            }

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
    const rowsArray = Array.from(rows);

    for (let row of rows) {
        const initiativeCell = row.getElementsByTagName('td')[4];
        const initiativeInput = initiativeCell.querySelector('.initiative-input');
        if (initiativeInput.value.trim() !== '') {
            continue;
        }
        const initiative = await window.api.rollDie(20);
        initiativeInput.value = initiative;
    }

    // Check if all initiatives are filled
    if (rowsArray.every(row => row.cells[4].querySelector('.initiative-input').value !== '')) {
        const table = document.getElementById('playerTable');
        const rowsArray = Array.from(table.rows).slice(1); // Exclude the header row

        rowsArray.sort((rowA, rowB) => {
            const initA = parseInt(rowA.cells[4].querySelector('.initiative-input').value) || 0;
            const initB = parseInt(rowB.cells[4].querySelector('.initiative-input').value) || 0;
            return initB - initA; // Sort in descending order
        });

        const tbody = table.tBodies[0];
        rowsArray.forEach(row => tbody.appendChild(row));
        console.log('Table sorted successfully.');
    }
});

document.getElementById('clear-initiative').addEventListener('click', () => {
    const playerTableBody = document.getElementById('playerTable').getElementsByTagName('tbody')[0];
    const rows = playerTableBody.getElementsByTagName('tr');

    for (let row of rows) {
        const initiativeCell = row.getElementsByTagName('td')[4];
        const initiativeInput = initiativeCell.querySelector('.initiative-input');
        initiativeInput.value = ''; // Clear the initiative input field
    }
});

async function loadMonsters() {
    try {
        const monsters = await window.api.getMonsters();
        console.log('Monsters:', monsters); // Do something with the monsters data

        // Populate the monsters dropdown or table
        const monstersDropdown = document.getElementById('monsters-dropdown');
        monstersDropdown.innerHTML = ''; // Clear existing options
        monsters.forEach(monster => {
            const option = document.createElement('option');
            option.value = monster.Name;
            option.textContent = monster.Name;
            monstersDropdown.appendChild(option);
        });

        // You can also populate the monster table if needed
        const monsterTableBody = document.getElementById('monsterTableBody');
        monsterTableBody.innerHTML = ''; // Clear existing rows
        monsters.forEach(monster => {
            const row = document.createElement('tr');
            Object.keys(monster).forEach(key => {
                const cell = document.createElement('td');
                cell.textContent = monster[key];
                row.appendChild(cell);
            });
            monsterTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching monsters:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadMonsters();
});