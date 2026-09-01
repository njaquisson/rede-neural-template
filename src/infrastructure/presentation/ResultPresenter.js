import { CONFIG } from '../../config/index.js';

export class ResultPresenter {
    static formatar(rawPredictions) {
        return rawPredictions
            .sort((a, b) => b.probability - a.probability)
            .map(pred => ({
                categoria: CONFIG.LABEL_NAMES[pred.index],
                probabilidade: (pred.probability * 100).toFixed(2) + '%'
            }));
    }

    static exibir(nome, resultados) {
        console.log(`Previsão para ${nome}:`, resultados);
    }
}