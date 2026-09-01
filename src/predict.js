import { pathToFileURL } from 'node:url';
import { CONFIG } from './config/index.js';
import { FeatureEncoder } from './infrastructure/encoding/FeatureEncoder.js';
import { ResultPresenter } from './infrastructure/presentation/ResultPresenter.js';
import { PredictUseCase } from './application/use-cases/PredictUseCase.js';
import { Person } from './domain/entities/Person.js';

/**
 * Rotina de predição: carrega o modelo salvo em disco e prevê a categoria
 * de uma pessoa de exemplo. Se o modelo não existir, o PredictUseCase lança
 * um erro orientando o usuário a executar o treinamento (npm run train).
 */
export async function predict() {
    const encoder = new FeatureEncoder(CONFIG.AGE_MIN, CONFIG.AGE_MAX);
    const predictUseCase = new PredictUseCase(encoder);

    const pessoa = new Person('Zé', 28, 'verde', 'Curitiba');
    const resultados = await predictUseCase.execute(pessoa);

    ResultPresenter.exibir(pessoa.nome, resultados);
}

// Executa apenas quando este arquivo é o ponto de entrada (node src/predict.js)
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
    predict();
}