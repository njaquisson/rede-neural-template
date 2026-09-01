import { pathToFileURL } from 'node:url';
import { InMemoryTrainingRepository } from './infrastructure/data/InMemoryTrainingRepository.js';
import { ModelFactory } from './infrastructure/ml/ModelFactory.js';
import { TrainUseCase } from './application/use-cases/TrainUseCase.js';

/**
 * Rotina de treinamento: constrói, treina e persiste o modelo em disco.
 * Após a execução, o modelo fica disponível para a rotina de predição.
 */
export async function train() {
    const repository = new InMemoryTrainingRepository();
    const modelFactory = new ModelFactory();
    const trainUseCase = new TrainUseCase(repository, modelFactory);

    await trainUseCase.execute();
    console.log('Treinamento concluído com sucesso.');
}

// Executa apenas quando este arquivo é o ponto de entrada (node src/train.js)
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
    train();
}