import { easyWords, mediumWords, hardWords } from "./word-list.js";
import { cyrb128, sfc32 } from "./utils.js";

export class WordGen {
    constructor(Seed) {
        this.Seed = Seed;
        // Localize date to EST(New York) while stripping time values
        this._date = new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }).split(',')[0]);
        // If Seed is provided, use it; Otherwise, use today's date string
        this._seed = (Seed) ? Seed : this._date.toLocaleString("en-US").split(',')[0];
        // Set P-RNG
        let hashes = cyrb128(this._seed);
        this._rand = sfc32(hashes[0], hashes[1], hashes[2], hashes[3]);
    }
    get seed() {
        return this._seed;
    }
    set seed(seed) {
        this._seed = seed;
        // Update P-RNG
        let hashes = cyrb128(this._seed);
        this._rand = sfc32(hashes[0], hashes[1], hashes[2], hashes[3]);
    }
    get date() {
        return this._date;
    }
    selectWordList(difficulty = 'medium') {
        switch (difficulty) {
            case 'easy':
                return easyWords;
            case 'medium':
                return mediumWords;
            case 'hard':
                return hardWords;
        }
    }
    chooseWords(difficulty = 'medium', amount = 5) {
        const list = this.selectWordList(difficulty);
        const results = [];
        while (results.length < amount) {
            const item = list[Math.floor(this._rand() * list.length)];
            if (results.includes(item)) {
                return;
            }
            results.push(item);
        }
        return results;
    }
    shuffle(difficulty = 'medium') {
        const list = this.selectWordList(difficulty);
        let currentIndex = list.length;
        // While there remain elements to shuffle.
        while (currentIndex > 0) {
            // Pick a remaining element.
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [list[currentIndex], list[randomIndex]] = [
                list[randomIndex], list[currentIndex]
            ];
        }
        return list;
    }
}

WordGen.EPOC = new Date("1/12/2024").getTime();