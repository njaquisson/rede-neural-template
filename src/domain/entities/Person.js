export class Person {
    #nome;
    #idade;
    #cor;
    #localizacao;

    constructor(nome, idade, cor, localizacao) {
        if (!nome || typeof nome !== 'string') throw new Error('nome é obrigatório e deve ser uma string');
        if (idade == null || typeof idade !== 'number') throw new Error('idade é obrigatória e deve ser um número');
        if (!cor || typeof cor !== 'string') throw new Error('cor é obrigatória e deve ser uma string');
        if (!localizacao || typeof localizacao !== 'string') throw new Error('localização é obrigatória e deve ser uma string');

        this.#nome = nome;
        this.#idade = idade;
        this.#cor = cor;
        this.#localizacao = localizacao;
    }

    get nome() { return this.#nome; }
    get idade() { return this.#idade; }
    get cor() { return this.#cor; }
    get localizacao() { return this.#localizacao; }
}