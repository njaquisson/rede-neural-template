export class TrainingDataDTO {
    #features;
    #labels;

    constructor(features, labels) {
        if (!Array.isArray(features) || !Array.isArray(labels)) throw new Error('features e labels devem ser arrays');
        if (features.length !== labels.length) throw new Error('features e labels devem ter o mesmo comprimento');

        this.#features = Object.freeze(features.map(f => Object.freeze([...f])));
        this.#labels = Object.freeze(labels.map(l => Object.freeze([...l])));
    }

    get features() { return this.#features; }
    get labels() { return this.#labels; }
    get count() { return this.#features.length; }
}