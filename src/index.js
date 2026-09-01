import { CONFIG } from './config/index.js';
import { InMemoryTrainingRepository } from './infrastructure/data/InMemoryTrainingRepository.js';
import { ModelFactory } from './infrastructure/ml/ModelFactory.js';
import { FeatureEncoder } from './infrastructure/encoding/FeatureEncoder.js';
import { ResultPresenter } from './infrastructure/presentation/ResultPresenter.js';
import { TrainUseCase } from './application/use-cases/TrainUseCase.js';
import { PredictUseCase } from './application/use-cases/PredictUseCase.js';
import { Person } from './domain/entities/Person.js';

async function main() {
    const repository = new InMemoryTrainingRepository();
    const modelFactory = new ModelFactory();
    const encoder = new FeatureEncoder(CONFIG.AGE_MIN, CONFIG.AGE_MAX);

    const trainUseCase = new TrainUseCase(repository, modelFactory);
    const model = await trainUseCase.execute();

    const pessoa = new Person('Zé', 28, 'verde', 'Curitiba');

    const predictUseCase = new PredictUseCase(model, encoder);
    const resultados = await predictUseCase.execute(pessoa);

    ResultPresenter.exibir(pessoa.nome, resultados);
}

export { main };