export const CONFIG = Object.freeze({
    INPUT_FEATURES: 7,
    HIDDEN_UNITS: 80,
    OUTPUT_CLASSES: 3,
    TRAINING_EPOCHS: 100,
    LABEL_NAMES: Object.freeze(["premium", "medium", "basic"]),
    AGE_MIN: 25,
    AGE_MAX: 40,
    // Caminho relativo da pasta/arquivo onde o modelo é salvo em disco.
    MODEL_SAVE_PATH: './saved_models/modelo_v1',
    // URL no formato exigido pelo TensorFlow.js Node (file://).
    MODEL_SAVE_URL: 'file://./saved_models/modelo_v1',
});