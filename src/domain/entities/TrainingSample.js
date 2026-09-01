import { Person } from './Person.js';

export class TrainingSample {
    #person;
    #categoryIndex;

    constructor(person, categoryIndex) {
        if (!(person instanceof Person)) throw new Error('TrainingSample requer uma instância de Person');
        if (!Number.isInteger(categoryIndex) || categoryIndex < 0) throw new Error('categoryIndex deve ser um inteiro não-negativo');

        this.#person = person;
        this.#categoryIndex = categoryIndex;
    }

    get person() { return this.#person; }
    get categoryIndex() { return this.#categoryIndex; }
}