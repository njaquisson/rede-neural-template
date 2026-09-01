import { CONFIG } from '../../config/index.js';
import { FeatureVector } from '../../domain/value-objects/FeatureVector.js';

export class FeatureEncoder {
    #ageMin;
    #ageMax;
    #cores;
    #localizacoes;

    constructor(ageMin = CONFIG.AGE_MIN, ageMax = CONFIG.AGE_MAX) {
        this.#ageMin = ageMin;
        this.#ageMax = ageMax;
        this.#cores = Object.freeze(['azul', 'vermelho', 'verde']);
        this.#localizacoes = Object.freeze(['São Paulo', 'Rio', 'Curitiba']);
    }

    encode(person) {
        const idadeNormalizada = (person.idade - this.#ageMin) / (this.#ageMax - this.#ageMin);
        const corEncoded = this.#oneHot(person.cor, this.#cores);
        const localEncoded = this.#oneHot(person.localizacao, this.#localizacoes);

        return new FeatureVector([idadeNormalizada, ...corEncoded, ...localEncoded]);
    }

    #oneHot(valor, categorias) {
        const encoded = new Array(categorias.length).fill(0);
        const idx = categorias.indexOf(valor);
        if (idx === -1) throw new Error(`Categoria "${valor}" não reconhecida`);
        encoded[idx] = 1;
        return encoded;
    }
}