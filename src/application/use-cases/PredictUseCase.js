import { ResultPresenter } from '../../infrastructure/presentation/ResultPresenter.js';
import { ModelPersistenceService } from '../../infrastructure/ml/ModelPersistenceService.js';

export class PredictUseCase {
    #persistence;
    #encoder;
    #model;

    constructor(encoder, persistence = new ModelPersistenceService()) {
        this.#encoder = encoder;
        this.#persistence = persistence;
    }

    async execute(person) {
        const model = await this.#getModel();
        const featureVector = this.#encoder.encode(person);
        const rawPredictions = await this.#predict(model, featureVector);
        return ResultPresenter.formatar(rawPredictions);
    }

    /**
     * Obtém o modelo carregado do disco, em vez de treinar ou recriar do zero.
     * O carregamento é feito apenas uma vez e reaproveitado em chamadas seguintes.
     */
    async #getModel() {
        if (this.#model) return this.#model;
        this.#model = await this.#persistence.load();
        return this.#model;
    }

    async #predict(model, featureVector) {
        const tf = await import('@tensorflow/tfjs-node');
        const tfInput = tf.tensor2d([featureVector.toArray()]);
        const rawOutput = await model.predict(tfInput).array();
        return rawOutput[0].map((probability, index) => ({ probability, index }));
    }
}