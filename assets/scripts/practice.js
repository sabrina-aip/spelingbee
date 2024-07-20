import { Keyboard } from "./core/keyboard.js";
import { Prompts } from "./core/prompts.js";
import { WordGen } from "./core/word-gen.js";

const keyboardElement = document.querySelector("#keyboard")
const promptElement = document.querySelector("#prompt")
const attempt = document.querySelector("#attempt-box")
const totalCount = document.querySelector('#total-count')
const livesCount = document.querySelector('#correct-count')

const difficulty = sessionStorage.getItem("level");
const prompt = new Prompts(promptElement);
const keyboard = new Keyboard(keyboardElement, attempt);
const wordGen = new WordGen();
const wordList = wordGen.shuffle(difficulty);

let wordCounter = 0;
let numCorrect = 0;
let livesCounter = 5;

const results = {};

prompt.onLoad((e)=>{
    if(!Object.keys(results).find(key => key === `Practice: ${difficulty}`)){
        results[`Practice: ${difficulty}`] = [];
    }
    totalCount.innerText = wordCounter;
    livesCount.innerText = livesCounter;
});

prompt.onReady((e)=>{
    keyboard.enableInput();
});

prompt.on('complete', (e)=>{
    keyboard.clear();
    wordCounter++;
    totalCount.innerText = wordCounter
    results[`Practice: ${difficulty}`].push(e.results[0]);
    if(e.results[0].isCorrect){
        numCorrect++;
    } else {
        livesCounter--;
    }
    updateLevel();
})

keyboard.on('change', (e)=>{
    attempt.value = e;
});

keyboard.on('submit', (e)=>{
    prompt.evaluatePrompt(e);
});

function updateLevel() {

    if(livesCounter == 0){
        endGame();
        return;
    }

    prompt.addWords(difficulty, [wordList[wordCounter]]);
    totalCount.innerText = wordCounter;
    livesCount.innerText = livesCounter;
    if(livesCounter < 3){
        livesCount.style.color = 'red';
        livesCount.style.fontWeight = '700';
    }
}

function endGame() {
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location.replace("results.html");
}

updateLevel();
