import fs from 'node:fs';
import path from 'node:path';
import tf from '@tensorflow/tfjs-node';
import { CONFIG } from '../../config/index.js';

/**
 * Camada de infraestrutura responsável por persistir o modelo no disco
 * (arquivos model.json + pesos .bin) e carregá-lo de volta quando necessário.
 *
 * Encapsula toda a lógica de I/O do TensorFlow.js, permitindo que os casos de
 * uso dependam apenas desta abstração e não de detalhes de filesystem.
 */
export class ModelPersistenceService {
    #savePath;
    #saveUrl;

    /**
     * @param {string} [savePath] - Caminho relativo do modelo (ex.: './saved_models/modelo_v1')
     * @param {string} [saveUrl] - URL no formato file:// usado pelo TensorFlow.js
     */
    constructor(savePath = CONFIG.MODEL_SAVE_PATH, saveUrl = CONFIG.MODEL_SAVE_URL) {
        this.#savePath = savePath;
        this.#saveUrl = saveUrl;
    }

    get savePath() {
        return this.#savePath;
    }

    /**
     * Verifica se o arquivo model.json já existe no diretório configurado.
     *
     * @returns {boolean} true se o modelo já foi salvo em disco
     */
    exists() {
        return fs.existsSync(this.#modelJsonPath());
    }

    /**
     * Persiste o modelo treinado em disco, criando o diretório caso não exista.
     *
     * @param {tf.LayersModel} model - Modelo treinado
     * @returns {Promise<string>} Caminho onde o modelo foi salvo
     */
    async save(model) {
        this.#ensureDirectoryExists();
        await model.save(this.#saveUrl);
        console.log(`Modelo salvo com sucesso em "${this.#savePath}".`);
        console.log(`Arquivos gerados: ${this.#modelJsonPath()} e pesos .bin`);
        return this.#savePath;
    }

    /**
     * Carrega o modelo salvo do disco. Se não existir, lança um erro
     * orientando o usuário a executar o treinamento primeiro.
     *
     * No TensorFlow.js Node, o carregamento via file:// deve apontar
     * diretamente para o arquivo model.json (não para o diretório).
     *
     * @returns {Promise<tf.LayersModel>} Modelo carregado
     */
    async load() {
        if (!this.exists()) {
            console.error(`Nenhum modelo encontrado em "${this.#savePath}".`);
            console.error('Execute o treinamento (npm run train) antes de fazer previsões.');
            throw new Error('Modelo não encontrado no disco.');
        }
        const loadUrl = `file://${this.#modelJsonPath()}`;
        return tf.loadLayersModel(loadUrl);
    }

    #modelJsonPath() {
        return path.join(this.#savePath, 'model.json');
    }

    #ensureDirectoryExists() {
        const dir = path.dirname(this.#savePath);
        fs.mkdirSync(dir, { recursive: true });
    }
}