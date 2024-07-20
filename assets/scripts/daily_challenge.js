import { Keyboard } from "./core/keyboard.js";
import { Prompts } from "./core/prompts.js";
import { WordGen } from "./core/word-gen.js";

const keyboardElement = document.querySelector("#keyboard");
const promptElement = document.querySelector("#word-prompts");
const round = document.querySelector("#round");
const roundType = document.querySelector("#roundType");
const attempt = document.querySelector("#attempt-box");
const next = document.querySelector("#next");

const prompt = new Prompts(promptElement);
const keyboard = new Keyboard(keyboardElement, attempt);
const wordGen = new WordGen();
const timeOffset = wordGen.date.getTime() - WordGen.EPOC;
const title = 'Daily #' + Math.floor(timeOffset / 86400000).toString();

const rounds = ['easy', 'medium', 'hard'];
const results = {};
let currentRound = 0;

prompt.onLoad((e) => {
    results[`${title}: ${e.toUpperCase()}`] = [];
    attempt.setAttribute('placeholder', 'Play sound to start');
});

prompt.onReady((e) => {
    keyboard.enableInput();
    attempt.setAttribute('placeholder', 'Type your answer here');
});

prompt.on('evaluate', (e) => {
    keyboard.clear();
    attempt.setAttribute('placeholder', 'Play sound to start');
});

prompt.on('complete', (e) => {
    keyboard.clear();
    results[`${title}: ${e.difficulty.toUpperCase()}`] = e.results;
    showNextRound();
});

keyboard.on('change', (e) => {
    attempt.value = e;
});

keyboard.on('submit', (e) => {
    prompt.evaluatePrompt(e);
});

function updateRound() {
    const difficulty = rounds[currentRound];
    round.innerText = title;
    roundType.innerText = difficulty.toUpperCase();
    prompt.addWords(difficulty, wordGen.chooseWords(difficulty));
}

function showNextRound() {
    keyboardElement.classList.add('hidden');
    attempt.classList.add('hidden');
    next.classList.remove('hidden');

    if (currentRound == rounds.length - 1) {
        next.innerText = 'See Results';
    }
}

function endGame() {
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location.replace("results.html");
}

next.addEventListener("click", (e) => {
    currentRound++;
    if (currentRound == rounds.length) {
        endGame();
        return;
    }
    keyboardElement.classList.remove('hidden');
    attempt.classList.remove('hidden');
    next.classList.add('hidden');
    updateRound();
})

updateRound();

