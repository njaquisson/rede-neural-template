import tf from '@tensorflow/tfjs-node';
import { CONFIG } from '../../config/index.js';

export class ModelFactory {
    create() {
        const model = tf.sequential();

        model.add(tf.layers.dense({
            units: CONFIG.HIDDEN_UNITS,
            activation: 'relu',
            inputShape: [CONFIG.INPUT_FEATURES],
        }));

        model.add(tf.layers.dense({
            units: CONFIG.OUTPUT_CLASSES,
            activation: 'softmax',
        }));

        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy'],
        });

        return model;
    }
}