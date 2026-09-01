import { CONFIG } from '../../config/index.js';
import { ResultPresenter } from '../../infrastructure/presentation/ResultPresenter.js';

export class PredictUseCase {
    #model;
    #encoder;

    constructor(model, encoder) {
        this.#model = model;
        this.#encoder = encoder;
    }

    async execute(person) {
        const featureVector = this.#encoder.encode(person);
        const rawPredictions = await this.#predict(featureVector);
        return ResultPresenter.formatar(rawPredictions);
    }

    async #predict(featureVector) {
        const tf = await import('@tensorflow/tfjs-node');
        const tfInput = tf.tensor2d([featureVector.toArray()]);
        const rawOutput = await this.#model.predict(tfInput).array();
        return rawOutput[0].map((probability, index) => ({ probability, index }));
    }
}