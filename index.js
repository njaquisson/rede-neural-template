import tf from '@tensorflow/tfjs-node';

// ─── Configuração da Arquitetura ────────────────────────────────────────────
// Número de features de entrada: idade normalizada + 3 cores (one-hot) + 3 localizações (one-hot)
const INPUT_FEATURES = 7;

// Número de neurônios na camada oculta. Mais neurônios permitem capturar padrões mais complexos,
// mas aumentam o custo computacional e o risco de overfitting com poucos dados.
const HIDDEN_UNITS = 80;

// Número de categorias de saída (classes mutuamente exclusivas)
const OUTPUT_CLASSES = 3;

// Número de épocas de treinamento — cada época representa uma passagem completa pelo dataset
const TRAINING_EPOCHS = 100;

// ─── Preparação dos Dados ───────────────────────────────────────────────────
// Cada pessoa é representada por um vetor de 7 valores numéricos:
//   [idade_normalizada, azul, vermelho, verde, São_Paulo, Rio, Curitiba]
// A idade é normalizada para escala [0, 1]. Cores e localizações são one-hot encoded.

const tensorPessoasNormalizado = [
    [0.33, 1, 0, 0, 1, 0, 0], // Erick  — idade ~30, azul, São Paulo
    [0.00, 0, 1, 0, 0, 1, 0], // Ana    — idade ~25, vermelho, Rio
    [1.00, 0, 0, 1, 0, 0, 1], // Carlos — idade ~40, verde, Curitiba
];

// Labels one-hot encoded: cada posição corresponde a uma classe de saída.
// Ordem: [premium, medium, basic]
const tensorLabels = [
    [1, 0, 0], // Erick  → premium
    [0, 1, 0], // Ana    → medium
    [0, 0, 1], // Carlos → basic
];

// Nomes legíveis das classes, usados para interpretar a saída do modelo
const LABEL_NAMES = ["premium", "medium", "basic"];

// ─── Modelo ─────────────────────────────────────────────────────────────────

/**
 * Cria e treina uma rede neural sequencial para classificação multiclasse.
 *
 * Arquitetura:
 *   - Camada densa oculta com 80 neurônios e ativação ReLU
 *   - Camada de saída com 3 neurônios e ativação softmax (probabilidades)
 *
 * Compilação:
 *   - Optimizer Adam: adapta a taxa de aprendizado por parâmetro, acelerando a convergência
 *   - Loss categoricalCrossentropy: função de custo adequada para classificação multiclasse,
 *     onde cada amostra pertence a exatamente uma classe
 *   - Métrica accuracy: acompanha a acurácia durante o treinamento
 *
 * @param {tf.Tensor2D} inputXs — Tensor de entrada (amostras × features)
 * @param {tf.Tensor2D} outputYs — Tensor de labels (amostras × classes)
 * @returns {tf.LayersModel} Modelo treinado
 */
async function trainModel(inputXs, outputYs) {
    const model = tf.sequential();

    // Camada oculta: 80 neurônios com ReLU
    // A ReLU (Rectified Linear Unit) introduz não-linearidade: descarta valores negativos,
    // permitindo que a rede aprenda relações complexas entre as features e as classes.
    // Sem ativações não-lineares, a rede seria equivalente a uma única regressão linear.
    model.add(tf.layers.dense({
        units: HIDDEN_UNITS,
        activation: 'relu',
        inputShape: [INPUT_FEATURES],
    }));

    // Camada de saída: 3 neurônios com softmax
    // O softmax converte os logits brutos em uma distribuição de probabilidades que soma 1,
    // permitindo interpretar cada saída como a confiança da classe correspondente.
    model.add(tf.layers.dense({
        units: OUTPUT_CLASSES,
        activation: 'softmax',
    }));

    // Compilação do modelo
    // Adam combina momentum (inércia direcional) e adaptação de taxa de aprendizado,
    // sendo o otimizador padrão para a maioria dos problemas de classificação.
    // categoricalCrossentropy penaliza fortemente previsões confiantes e incorretas.
    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    // Treinamento: shuffle garante que os dados não sigam um padrão ordenado que
    // possa enviesar o gradiente. verbose: 0 suprime a saída de log a cada época.
    await model.fit(inputXs, outputYs, {
        shuffle: true,
        verbose: 0,
        epochs: TRAINING_EPOCHS,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                // Descomente para monitorar a perda a cada época:
                // console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${(logs.acc * 100).toFixed(2)}%`);
            }
        }
    });

    console.log("Modelo treinado com sucesso!");
    model.summary();
    return model;
}

// ─── Predição ───────────────────────────────────────────────────────────────

/**
 * Executa uma previsão com o modelo treinado sobre um novo vetor de entrada.
 *
 * @param {tf.LayersModel} model — Modelo já treinado
 * @param {number[]} personTensor — Vetor normalizado de features [idade, cores..., localizações...]
 * @returns {Array<{probabilidade: number, index: number}>} Vetor de probabilidades por classe
 */
async function predict(model, personTensor) {
    // tf.tensor2d envolve o vetor em uma dimensão de batch (1 amostra × features),
    // pois o modelo espera entradas no formato [batchSize, features].
    const tfInput = tf.tensor2d([personTensor]);
    const predictions = await model.predict(tfInput).array();

    // Mapeia o vetor bruto de probabilidades para um formato com índice e valor
    return predictions[0].map((probability, index) => ({ probability, index }));
}

// ─── Execução ───────────────────────────────────────────────────────────────

// Criação dos tensores de entrada e saída para o treinamento
const inputXs = tf.tensor2d(tensorPessoasNormalizado);
const outputYs = tf.tensor2d(tensorLabels);

// Treina o modelo
const model = await trainModel(inputXs, outputYs);

// ─── Exemplo de Predição ────────────────────────────────────────────────────
// Vetor normalizado para "Zé" (idade 28, cor verde, localização Curitiba).
// A normalização da idade segue a mesma escala usada no treinamento.
// Cores e localizações devem seguir o mesmo one-hot encoding do dataset de treino.

const pessoaTensorNormalizado = [
    0.2,  // idade normalizada: (28 - 25) / (40 - 25) = 0.2
    0,    // cor azul
    0,    // cor vermelho
    1,    // cor verde
    0,    // localização São Paulo
    0,    // localização Rio
    1,    // localização Curitiba
];

const rawPredictions = await predict(model, pessoaTensorNormalizado);

// Ordena as previsões por probabilidade decrescente e formata para exibição
const results = rawPredictions
    .sort((a, b) => b.probability - a.probability)
    .map(pred => ({
        categoria: LABEL_NAMES[pred.index],
        probabilidade: (pred.probability * 100).toFixed(2) + '%'
    }));

console.log(`Previsão para Zé:`, results);