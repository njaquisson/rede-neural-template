export class FeatureVector {
    #values;

    constructor(values) {
        if (!Array.isArray(values) || values.length === 0) throw new Error('values deve ser um array não-vazio');
        if (!values.every(v => typeof v === 'number')) throw new Error('todos os valores devem ser números');

        this.#values = Object.freeze([...values]);
    }

    get values() { return this.#values; }
    get length() { return this.#values.length; }

    toArray() { return [...this.#values]; }
}