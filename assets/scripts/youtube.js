import { Keyboard } from "./core/keyboard.js";
import { Prompts } from "./core/prompts.js";
import { WordGen } from "./core/word-gen.js";

const keyboardElement = document.querySelector("#keyboard")
const promptElement = document.querySelector("#prompt")
const attempt = document.querySelector("#attempt-box")
const count = document.querySelector('#count')

const title = 'Spellcheck';
const prompt = new Prompts(promptElement);
const keyboard = new Keyboard(keyboardElement, attempt);
const wordGen = new WordGen("content");
const wordList = [...wordGen.chooseWords('easy', 10), ...wordGen.chooseWords('medium', 10),  ...wordGen.chooseWords('hard', 80)];

let wordCounter = 0;

const results = {};

prompt.onLoad((e)=>{
    if(!Object.keys(results).find(key => key === title)){
        results[title] = [];
    }
    count.innerText = wordCounter;
});

prompt.onReady((e)=>{
    keyboard.enableInput();
});

prompt.on('complete', (e)=>{
    keyboard.clear();
    wordCounter++;
    count.innerText = wordList.length - wordCounter
    results[title].push(e.results[0]);
    updateLevel();
})

keyboard.on('change', (e)=>{
    attempt.value = e;
});

keyboard.on('submit', (e)=>{
    prompt.evaluatePrompt(e);
});

function updateLevel() {
    if(wordCounter == wordList.length - 1){
        endGame();
        return;
    }
    prompt.addWords(difficulty, [wordList[wordCounter]]);
    count.innerText = wordList.length - wordCounter;
}

function endGame() {
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location.replace("results.html");
}

updateLevel();