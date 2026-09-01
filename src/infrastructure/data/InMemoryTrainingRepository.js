import { TrainingDataRepository } from '../../domain/repositories/TrainingDataRepository.js';
import { TrainingSample } from '../../domain/entities/TrainingSample.js';
import { Person } from '../../domain/entities/Person.js';
import { FeatureVector } from '../../domain/value-objects/FeatureVector.js';
import { Category } from '../../domain/value-objects/Category.js';
import { CONFIG } from '../../config/index.js';

export class InMemoryTrainingRepository extends TrainingDataRepository {
    #samples = [];

    constructor() {
        super();
        this.#seedData();
    }

    #seedData() {
        this.#samples = [
            new TrainingSample(
                new Person('Erick', 30, 'azul', 'São Paulo'),
                Category.PREMIUM
            ),
            new TrainingSample(
                new Person('Ana', 25, 'vermelho', 'Rio'),
                Category.MEDIUM
            ),
            new TrainingSample(
                new Person('Carlos', 40, 'verde', 'Curitiba'),
                Category.BASIC
            ),
        ];
    }

    async getAll() {
        return this.#samples.map(sample => ({
            person: sample.person,
            category: new Category(CONFIG.LABEL_NAMES[sample.categoryIndex], sample.categoryIndex),
            features: this.#encodePerson(sample.person),
        }));
    }

    async save(person, categoryIndex) {
        const sample = new TrainingSample(person, categoryIndex);
        this.#samples.push(sample);
    }

    async getFeatureCount() { return 7; }
    async getClassCount() { return 3; }

    #encodePerson(person) {
        const CORES = ['azul', 'vermelho', 'verde'];
        const LOCALIZACOES = ['São Paulo', 'Rio', 'Curitiba'];

        const idadeNormalizada = (person.idade - CONFIG.AGE_MIN) / (CONFIG.AGE_MAX - CONFIG.AGE_MIN);
        const corEncoded = this.#oneHot(person.cor, CORES);
        const localEncoded = this.#oneHot(person.localizacao, LOCALIZACOES);

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