const firstRowLetters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const secondRowLetters = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const thirdRowLetters = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];
export class Keyboard {
    constructor(keyboard, input) {
        this.keyboard = keyboard;
        this.input = input;
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.listeners = new Map();
        this.output = '';
        this.backspaceDisabled = true;
        this.submitDisabled = true;
        this.inputDisabled = true;
        this.keyPress = (e) => {
            e.preventDefault();
            const key = e.target;
            if (key.id == 'backspace') {
                this.deleteLetter();
                return;
            }
            if (key.id == 'enter') {
                this.submit();
                return;
            }
            this.writeLetter(key.id);
        };

        this.buildKeyboard();

        document.addEventListener("keydown", (e) => {

            e.preventDefault();

            if (this.inputDisabled) return;

            const pressedKey = e.key.toLowerCase();

            if (!['backspace', 'enter'].includes(pressedKey) && /[a-z]/.test(pressedKey) == false) return;

            const key = this.keyboard.querySelector(`#${pressedKey}`);

            if (!key) return;

            key.classList.add("active");
            if (pressedKey == "backspace") {
                if (this.backspaceDisabled)
                    return;
                this.deleteLetter();
                return;
            }
            if (pressedKey == "enter") {
                return;
            }
            this.writeLetter(pressedKey);
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            if (this.inputDisabled)
                return;
            const pressedKey = e.key.toLowerCase();
            if (!['backspace', 'enter'].includes(pressedKey) && /[a-z]/.test(pressedKey) == false)
                return;
            const key = this.keyboard.querySelector(`#${pressedKey}`);
            if (!key)
                return;
            key.classList.remove("active");
            if (pressedKey == "enter") {
                if (this.submitDisabled)
                    return;
                this.submit();
            }
        });

        this.input.addEventListener('click', res => {
            const ele = res.target;
            const caret = this.output.split('|')
            const word = caret.join('')
            this.selectionStart = ele.selectionStart
            this.selectionEnd = ele.selectionEnd 
            // this.output = word.slice(0, this.selectionStart) + '|' + this.output.slice(this.selectionEnd)
            this.trigger('change', this.output);
        })

        // this.input.addEventListener('focus', res => {
        //     const ele = res.target;
        //     console.log('focus')
        //     const caret = this.output.split('|')
        //     const word = caret.join('')
        //     this.selectionStart = ele.selectionStart
        //     this.selectionEnd = ele.selectionEnd 
        //     this.output = word.slice(0, this.selectionStart) + '|' + this.output.slice(this.selectionEnd)
        //     this.trigger('change', this.output);
        // })
    }
    buildKeyboard() {
        const keyboardContainer = document.createElement('div');
        const firstRow = document.createElement('div');
        const secondRow = document.createElement('div');
        const thirdRow = document.createElement('div');
        const fourthRow = document.createElement('div');
        const backspace = document.createElement('button');
        const submit = document.createElement('button');
        const addKeys = (keys, container) => {
            keys.forEach((letter) => {
                const letterButton = document.createElement('button');
                letterButton.classList.add('keyboard-button', 'letter-button', 'boxed');
                letterButton.innerText = letterButton.id = letter;
                letterButton.disabled = true;
                letterButton.addEventListener('mousedown', this.keyPress);
                container.appendChild(letterButton);
            });
        };
        // Build first row
        firstRow.classList.add('first-row');
        addKeys(firstRowLetters, firstRow);
        // Build second row
        secondRow.classList.add('second-row');
        addKeys(secondRowLetters, secondRow);
        // Build third row
        thirdRow.classList.add('third-row');
        addKeys(thirdRowLetters, thirdRow);
        backspace.classList.add('keyboard-button', 'boxed', 'fa', 'fa-delete-left');
        backspace.id = 'backspace';
        backspace.disabled = this.backspaceDisabled;
        backspace.addEventListener('mousedown', this.keyPress);
        thirdRow.appendChild(backspace);
        // Build fourth row
        fourthRow.classList.add('fourth-row');
        submit.classList.add('keyboard-button', 'boxed');
        submit.id = 'enter';
        submit.innerText = 'submit';
        submit.disabled = this.submitDisabled;
        submit.addEventListener('mousedown', this.keyPress);
        fourthRow.appendChild(submit);
        keyboardContainer.id = 'keyboard-cont';
        keyboardContainer.append(firstRow, secondRow, thirdRow, fourthRow);
        this.keyboard.appendChild(keyboardContainer);
    }
    writeLetter(letter) {
        this.output = this.output.slice(0, this.selectionStart) + letter + this.output.slice(this.selectionEnd)
        if (this.output.length > 0) {
            this.keyboard.querySelector('#backspace').disabled = this.backspaceDisabled = false;
            this.keyboard.querySelector('#enter').disabled = this.submitDisabled = false;
        }
        this.trigger('change', this.output);
        this.selectionStart++
        this.input.selectionStart = this.input.selectionEnd = this.selectionEnd = this.selectionStart;
        this.input.focus();
        this.input.setSelectionRange(this.selectionStart, this.selectionEnd );
    }

    deleteLetter() {
        if (this.selectionStart == 0 && this.selectionEnd == 0) return;
        let range = Math.abs(this.selectionStart - this.selectionEnd);
        let start = (range == 0) ? this.selectionStart - 1 : this.selectionStart;
        let end = (range == 0) ? this.selectionStart : this.selectionStart + range;
        if (this.output.length > 0) {
            this.output = this.output.slice(0, start) + this.output.slice(end);
        }
        if (this.output.length == 0) {
            this.keyboard.querySelector('#backspace').disabled = this.backspaceDisabled = true;
            this.keyboard.querySelector('#enter').disabled = this.submitDisabled = true;
        }
        this.trigger('change', this.output);
        this.selectionStart = this.selectionEnd = start;
        this.input.selectionStart = this.input.selectionEnd = this.selectionStart;
        this.input.focus();
        this.input.setSelectionRange(this.selectionStart, this.selectionEnd );
    }

    submit() {
        this.trigger('submit', this.output);
    }
    trigger(label, ...args) {
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
    }
    on(label, callback) {
        if (!this.listeners.has(label)) {
            this.listeners.set(label, []);
        }
        this.listeners.get(label).push(callback);
    }
    enableInput() {
        this.inputDisabled = false;
        this.keyboard.querySelectorAll('.letter-button').forEach((button) => {
            button.disabled = false;
        });
    }
    clear() {
        this.output = '';
        this.inputDisabled = true;
        this.keyboard.querySelector('#backspace').disabled = this.backspaceDisabled = true;
        this.keyboard.querySelector('#enter').disabled = this.submitDisabled = true;
        this.keyboard.querySelectorAll('.letter-button').forEach((button) => {
            button.disabled = true;
        });
        this.trigger('change', this.output);
    }
    calculateSelection() {
        let start
        let range = this.selectionStart - this.selectionEnd;

    }
}