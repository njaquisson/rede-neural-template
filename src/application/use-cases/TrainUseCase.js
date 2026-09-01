import { CONFIG } from '../../config/index.js';
import { TrainingDataDTO } from '../dto/TrainingDataDTO.js';
import { ModelPersistenceService } from '../../infrastructure/ml/ModelPersistenceService.js';

export class TrainUseCase {
    #repository;
    #modelFactory;
    #persistence;

    constructor(repository, modelFactory, persistence = new ModelPersistenceService()) {
        this.#repository = repository;
        this.#modelFactory = modelFactory;
        this.#persistence = persistence;
    }

    async execute() {
        const rawData = await this.#repository.getAll();
        const dto = this.#buildDTO(rawData);
        const { xs, ys } = await this.#encodeData(dto);
        const model = this.#modelFactory.create();

        await this.#train(model, xs, ys);

        // Persiste o modelo treinado em disco (model.json + pesos .bin)
        await this.#persistence.save(model);

        return model;
    }

    #buildDTO(rawData) {
        const features = rawData.map(d => d.features.toArray());
        const labels = rawData.map(d => d.category.toOneHot(CONFIG.OUTPUT_CLASSES));
        return new TrainingDataDTO(features, labels);
    }

    async #encodeData(dto) {
        const tf = await import('@tensorflow/tfjs-node');
        const xs = tf.tensor2d(dto.features);
        const ys = tf.tensor2d(dto.labels);
        return { xs, ys };
    }

    async #train(model, xs, ys) {
        await model.fit(xs, ys, {
            shuffle: true,
            verbose: 0,
            epochs: CONFIG.TRAINING_EPOCHS,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    // Descomente para monitoramento:
                    // console.log(`Epoch ${epoch + 1}/${CONFIG.TRAINING_EPOCHS} — loss: ${logs.loss.toFixed(4)} | accuracy: ${(logs.acc * 100).toFixed(2)}%`);
                }
            }
        });
    }
}