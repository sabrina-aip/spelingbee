export class Prompts {
    constructor(Prompts) {
        this.Prompts = Prompts;
        this.listeners = new Map();
        this.isLoaded = false; // Prompts are initialized and added to DOM
        this.isReady = false; // Player has interacted with at least one prompt
        this.isComplete = false; // All prompts have been evaluated
        this.prompts = null;
        this.audioController = null;
        this.activePlayer = null;
        this.wordCount = 0;
        this.correctCount = 0;
        this.words = null;
        this.activeWord = null;
        this.results = [];
        this.difficulty = null;

        this.resetPrompts = () => {
            this.isReady = this.isLoaded = this.isComplete = false;
            this.prompts = this.words = this.audioController = this.activePlayer = this.activeWord = this.difficulty = null;
            this.wordCount = this.correctCount = 0;
            this.results = [];
        };

        this.buildPrompts = (difficulty, words) => {
            const prompts = [];
            this.wordCount = words.length;
            this.difficulty = difficulty;

            words.forEach((word, wordIndex) => {
                // Build prompt
                const playerButton = document.createElement('button');
                const playerAudio = document.createElement('audio');
                playerAudio.src = `assets/audio/${difficulty}/${word}.mp3`;
                playerButton.appendChild(playerAudio);
                playerButton.classList.add('prompt', 'boxed', 'keyboard-button', 'fa', 'fa-play-circle');

                if(wordIndex == 0){
                    playerButton.classList.add('selected');
                    this.activeWord = words[wordIndex];
                    this.activePlayer = playerButton;
                    this.activePlayer.focus();
                }

                playerButton.addEventListener("click", () => {
                    if (!this.isReady) {
                        this.isReady = true;
                        this.trigger('ready');
                    }
                    if (this.activePlayer != playerButton) {
                        this.trigger('select', { selectedPlayer: playerButton, selectedWord: words[wordIndex] });
                    }
                    this.activeWord = words[wordIndex];
                    this.activePlayer = playerButton;
                    this.updatePlayer(this.activePlayer);
                });

                prompts.push(playerButton);
            });
            
            return prompts;
        };

        document.addEventListener('keydown',(e)=>{
            e.preventDefault();
            const pressedKey = e.key.toLowerCase();
            if(pressedKey == ' '){
                this.activePlayer.click();
                return;
            }
            if(pressedKey == 'tab'){
                this.activePlayer.classList.remove('selected');
                if(this.activePlayer.classList.contains('active')){
                    this.activePlayer.click();
                }

                let found = false;
                let currentIndex = this.prompts.indexOf(this.activePlayer);
                let index;

                while (!found){
                    currentIndex++;
                    index = currentIndex % this.prompts.length;
                    found = !this.prompts[index].classList.contains('submitted');
                }

                this.activeWord = this.words[index];
                this.activePlayer = this.prompts[index];
                this.activePlayer.classList.add('selected');
                this.activePlayer.focus();
                return;
            }
        })

        this.trigger = (label, ...args) => {
            let res = false;
            let _trigger = (inListener, label, ...args) => {
                let listeners = inListener.get(label);
                if (listeners && listeners.length) {
                    listeners.forEach((listener) => {
                        listener(...args);
                    });
                    res = true;
                }
            };
            _trigger(this.listeners, label, ...args);
            return res;
        };
        this.on = (label, callback) => {
            if (!this.listeners.has(label)) {
                this.listeners.set(label, []);
            }
            this.listeners.get(label).push(callback);
        };
    }

    updatePlayer(player) {

        if (!this.activePlayer) return;

        const playerAudio = this.activePlayer.childNodes[0];

        if (player.classList.contains('active')) {
            this.stopAudio(playerAudio, true);
            player.classList.remove('active', 'fa-circle-stop');
            player.classList.add('fa-play-circle');
            player.style.background = 'white';
            return;
        }

        this.prompts.forEach((prompt) => {

            if (!prompt.classList.contains('submitted') && prompt != this.activePlayer) {

                prompt.classList.remove('active', 'selected', 'fa-circle-stop');
                prompt.style.background = 'white';
                this.stopAudio(prompt.childNodes[0]);

            } else if (!prompt.classList.contains('submitted') && prompt == this.activePlayer) {

                if (this.audioController) this.audioController.abort();

                this.audioController = new AbortController();

                this.activePlayer.classList.add('active', 'selected', 'fa-circle-stop');
                playerAudio.play();

                this.trigger('play', { activePlayer: this.activePlayer, activeWord: this.activeWord });

                playerAudio.addEventListener('timeupdate', (e) => {

                    if (!this.activePlayer) return;

                    const track = e.target;
                    const progress = (track.currentTime / track.duration) * 100;

                    this.activePlayer.style.background = `linear-gradient(90deg, #cdcdcd 0% ${progress}%, white ${progress}%)`;

                }, { signal: this.audioController.signal });

                playerAudio.addEventListener('ended', (e) => {

                    if (!this.activePlayer) return;

                    this.stopAudio(playerAudio, true);
                    this.activePlayer.classList.remove('active', 'fa-circle-stop');
                    this.activePlayer.classList.add('fa-play-circle');
                    this.activePlayer.style.background = 'white';

                }, { once: true, signal: this.audioController.signal });
            }
        });
    }

    stopAudio(sound, abort = false) {
        sound.pause();
        sound.currentTime = 0;

        if (this.audioController && abort) {
            this.audioController.abort();
            this.audioController = null;
            this.trigger('stopped', { stoppedPlayer: this.activePlayer, activeWord: this.activeWord });
            return;
        }

        this.trigger('ended', { activePlayer: this.activePlayer, activeWord: this.activeWord });
    }

    addWords(level, ...words) {

        if (this.isLoaded && this.isComplete) this.resetPrompts();
        this.words = words;
        this.prompts = this.buildPrompts(level, ...words);

        if (this.Prompts.childElementCount > 0) {
            this.Prompts.replaceChildren(...this.prompts);
        } else {
            this.Prompts.append(...this.prompts);
        }

        this.isLoaded = true;
        this.trigger('load', this.difficulty);
    }

    evaluatePrompt(submission) {

        if (!this.activeWord || !this.activePlayer) return;

        const playerAudio = this.activePlayer.childNodes[0];
        const isSpelledCorrect = submission.toLowerCase() == this.activeWord.toLowerCase();
        const evaluatedIcon = (isSpelledCorrect) ? 'fa-check' : 'fa-xmark';
        const evaluatedColor = (isSpelledCorrect) ? "#79b15a" : '#d25842';
        const result = {
            word: this.activeWord,
            submission: submission,
            isCorrect: isSpelledCorrect
        };

        if (isSpelledCorrect) this.correctCount++;

        this.stopAudio(playerAudio, true);
        this.activePlayer.classList.remove('active', 'selected', 'fa-play-circle', 'fa-circle-stop', 'btn');
        this.activePlayer.classList.add('submitted', evaluatedIcon);
        this.activePlayer.style.background = evaluatedColor;
        this.activePlayer.disabled = true;

        this.results.push(result);

        this.trigger('evaluate', result);
        this.activeWord = this.activePlayer = null;
        this.isReady = false;
        this.prompts.forEach((prompt, index) => {
            if(this.activePlayer) return;

            if(!prompt.classList.contains('submitted')){
                this.activeWord = this.words[index];
                this.activePlayer = this.prompts[index];
                this.activePlayer.classList.add('selected');
                this.activePlayer.focus();
            }
        })

        if (this.results.length === this.wordCount) {
            this.isComplete = true;
            this.trigger('complete', {
                correct: this.correctCount,
                difficulty: this.difficulty,
                results: this.results,
            });
        }
    }

    clear() {
        this.resetPrompts();
    }

    onLoad(callback) {
        this.on('load', callback);
    }

    onReady(callback) {
        this.on('ready', callback);
    }
}