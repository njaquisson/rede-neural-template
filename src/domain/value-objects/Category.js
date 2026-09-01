export class Category {
    #name;
    #index;

    static PREMIUM = 0;
    static MEDIUM = 1;
    static BASIC = 2;

    constructor(name, index) {
        if (!name || typeof name !== 'string') throw new Error('name é obrigatório');
        if (!Number.isInteger(index) || index < 0) throw new Error('index deve ser um inteiro não-negativo');

        this.#name = name;
        this.#index = index;
    }

    get name() { return this.#name; }
    get index() { return this.#index; }

    toOneHot(totalClasses) {
        const encoded = new Array(totalClasses).fill(0);
        encoded[this.#index] = 1;
        return encoded;
    }
}