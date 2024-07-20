import { Keyboard } from "./core/keyboard.js";
import { Prompts } from "./core/prompts.js";
import { WordGen } from "./core/word-gen.js";

const gameInput = document.querySelector("#gameInput")
const keyboardElement = document.querySelector("#keyboard")
const promptElement = document.querySelector("#prompt")
const attempt = document.querySelector("#attempt-box")
const roundLabel = document.querySelector('#round')
const roundType = document.querySelector('#roundType')
const currentPlayerLabel = document.querySelector('#currentPlayer')

const _players = JSON.parse(sessionStorage.getItem("customGamePlayers"));
const _rounds = JSON.parse(sessionStorage.getItem("customGameRounds"));
const prompt = new Prompts(promptElement);
const keyboard = new Keyboard(keyboardElement, attempt);
// const wordGen = new WordGen();
// const wordList = wordGen.shuffle(difficulty);

let roundIndex = 0;
let playerIndex = 0;
let wordCount = 0;

const rounds = [];
const players = [];
let wordList = [];

Object.entries(_rounds).forEach(([id,round]) => {
    rounds.push(round);
})

Object.entries(_players).forEach(([id,player]) => {
    players.push(player);
})

prompt.onLoad((e)=>{
    if(!Object.keys(players[playerIndex].results).find(key => key === `${rounds[roundIndex].name}: ${rounds[roundIndex].difficulty}`)){
        players[playerIndex].results[`${rounds[roundIndex].name}: ${rounds[roundIndex].difficulty}`] = [];
    }
    currentPlayerLabel.innerText = players[playerIndex].name
    attempt.setAttribute('placeholder', 'Play sound to start');
});

prompt.onReady((e)=>{
    keyboard.enableInput();
    attempt.setAttribute('placeholder', 'Type your answer here');
});

prompt.on('evaluate', (e)=>{
    keyboard.clear();
    attempt.setAttribute('placeholder', 'Play sound to start');
    players[playerIndex].results[`${rounds[roundIndex].name}: ${rounds[roundIndex].difficulty}`].push(e);
    playerIndex++;

    if(playerIndex == players.length){
        wordCount++;
        playerIndex = 0;
    }

    if(wordCount == rounds[roundIndex].amount){
        showNextRound();
        return;
    }

    updateLevel();
})

keyboard.on('change', (e)=>{
    attempt.value = e;
});

keyboard.on('submit', (e)=>{
    prompt.evaluatePrompt(e);
});

function genWordListPerPlayer(){
    wordList = [];
    players.forEach((res, index)=>{
        const wordGen = new WordGen(res.name + rounds[roundIndex].id);
        const list = wordGen.chooseWords(rounds[roundIndex].difficulty, rounds[roundIndex].amount);
        wordList.push(list);
    })
    console.log(wordList)
}

function updateRound() {
    if(roundIndex == rounds.length){
        return;
    }

    wordCount = 0;
    roundLabel.innerText = rounds[roundIndex].name;
    roundType.innerText = rounds[roundIndex].difficulty.toUpperCase();
    genWordListPerPlayer();

    updateLevel();
}

function showNextRound() {
    gameInput.classList.add('hidden');
    
    next.classList.remove('hidden');
    if (roundIndex == rounds.length - 1) {
        next.innerText = 'See Results';
    }
}

function updateLevel() {
    prompt.clear();
    prompt.addWords(rounds[roundIndex].difficulty, [wordList[playerIndex][wordCount]]);
}

function endGame() {
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location.replace("results.html");
}

next.addEventListener("click", (e) => {
    roundIndex++;
    if (roundIndex == rounds.length) {
        endGame();
        return;
    }
    
    gameInput.classList.remove('hidden');
    next.classList.add('hidden');
    updateRound();
})

updateRound();
