export class PredictionResult {
    #category;
    #probability;
    #rawProbabilities;

    constructor(category, probability, rawProbabilities) {
        this.#category = category;
        this.#probability = probability;
        this.#rawProbabilities = Object.freeze([...rawProbabilities]);
    }

    get category() { return this.#category; }
    get probability() { return this.#probability; }
    get rawProbabilities() { return this.#rawProbabilities; }
    get confidence() { return this.#probability; }
}