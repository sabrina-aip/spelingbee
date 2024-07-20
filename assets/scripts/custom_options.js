import { generateString } from './core/utils.js';

const playerListContainer = document.getElementById('playerList');
const playerListInput = document.getElementById('playerName');
const playerListAddButton = document.getElementById('addPlayer');

const roundListContainer = document.getElementById('roundList');
const roundListAddButton = document.getElementById('addRound');
const startGame = document.getElementById('startGame');

const playerList = new Map();
const roundList = new Map();


playerListAddButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (playerListInput.value.trim() == '') return;
    if (playerList.size == 5) return;

    const player = {
        name: playerListInput.value,
        lives: 1,
        results: {}
    }

    const id = generateString(5);

    playerList.set(id, player);

    const playerListItem = document.createElement('div');
    const playerListItemName = document.createElement('p');
    const playerListItemRemoveButton = document.createElement('button');

    playerListItem.id = id
    playerListItem.classList.add('player-list-item')
    playerListItemName.innerText = player.name

    playerListItemRemoveButton.innerText = 'remove'
    playerListItemRemoveButton.classList.add('keyboard-button', 'boxed', 'remove-player')
    playerListItemRemoveButton.addEventListener('click', (e) => {
        playerList.delete(id)
        playerListContainer.removeChild(playerListItem);
        if (playerList.size < 5) { playerListAddButton.removeAttribute('disabled') };
        if (playerList.size == 0) { startGame.setAttribute('disabled', 'true') };
    })

    playerListItem.append(playerListItemName, playerListItemRemoveButton)
    playerListContainer.appendChild(playerListItem);
    playerListInput.value = '';
    if (playerList.size == 5) { playerListAddButton.setAttribute('disabled', 'true') };
    if (playerList.size > 0) { startGame.removeAttribute('disabled') };
})


roundListAddButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (roundList.size == 5) return;

    const round = {
        name: 'Round ' + (roundList.size + 1),
        difficulty: 'easy',
        amount: 5,
        id: generateString(5)
    }

    const roundListItem = document.createElement('div');
    const roundListItemName = document.createElement('p');
    const roundOptions = document.createElement('div');
    const roundDifficulty = document.createElement('select');
    const roundDifficultyEasy = document.createElement('option');
    const roundDifficultyMedium = document.createElement('option');
    const roundDifficultyHard = document.createElement('option');
    const roundWordCount = document.createElement('input');
    const roundRemoveButton = document.createElement('button');

    roundListItem.id = round.id
    roundListItem.classList.add('round-list-item')

    roundListItemName.id = 'name_' + round.id
    roundListItemName.innerText = round.name
    roundListItemName.classList.add('round-name')

    roundOptions.classList.add('round-options')

    // Difficulty Input
    roundDifficulty.classList.add('round-difficulty')

    roundDifficultyEasy.innerText = 'Easy'
    roundDifficultyEasy.setAttribute('value', 'easy')
    roundDifficultyEasy.setAttribute('selected', 'true')

    roundDifficultyMedium.innerText = 'Medium'
    roundDifficultyMedium.setAttribute('value', 'medium')

    roundDifficultyHard.innerText = 'Hard'
    roundDifficultyHard.setAttribute('value', 'hard')

    roundDifficulty.append(roundDifficultyEasy, roundDifficultyMedium, roundDifficultyHard)

    roundDifficulty.addEventListener('change', (e) => {
        round.difficulty = e.target.value
        roundList.set(round.id, round);
    })

    // Amount Input
    roundWordCount.setAttribute('type', 'number')
    roundWordCount.setAttribute('value', '5')
    roundWordCount.setAttribute('max', '20')
    roundWordCount.setAttribute('min', '5')
    roundWordCount.classList.add('round-word-count')

    roundWordCount.addEventListener('input', (e) => {
        round.amount = Number(e.target.value)
        roundList.set(round.id, round);
    })

    // Remove button
    roundRemoveButton.innerText = 'remove'
    roundRemoveButton.classList.add('keyboard-button', 'boxed', 'remove-player')

    roundRemoveButton.addEventListener('click', (e) => {
        if (roundList.size == 1) return;
        if (roundList.size < 5) { roundListAddButton.removeAttribute('disabled') };
        roundList.delete(round.id)
        roundListContainer.removeChild(roundListItem);
        let index = 1;
        roundList.forEach((round, id) => {
            const roundName = roundListContainer.querySelector(`#name_${id}`)
            roundName.innerText = 'Round ' + index
            round.name = 'Round ' + index
            roundList.set(id, round)
            index++
        })
    })

    roundOptions.classList.add('round-options')

    if (roundList.size == 0) {
        roundOptions.append(roundDifficulty, roundWordCount)
    } else {
        roundOptions.append(roundDifficulty, roundWordCount, roundRemoveButton)
    }

    roundListItem.append(roundListItemName, roundOptions)
    roundListContainer.appendChild(roundListItem);
    roundList.set(round.id, round);

    if (roundList.size == 5) { roundListAddButton.setAttribute('disabled', 'true') };
})

startGame.addEventListener('click', (e) => {
    e.preventDefault();
    const players = Object.fromEntries(playerList)
    const rounds = Object.fromEntries(roundList)
    sessionStorage.setItem('customGamePlayers', JSON.stringify(players))
    sessionStorage.setItem('customGameRounds', JSON.stringify(rounds))
    window.location.replace("custom_game.html");
})

roundListAddButton.click()