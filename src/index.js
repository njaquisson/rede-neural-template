import { train } from './train.js';
import { predict } from './predict.js';

/**
 * Fluxo combinado (demo): treina o modelo, persiste em disco e em seguida
 * carrega o modelo salvo para realizar uma predição de exemplo.
 */
async function main() {
    await train();
    await predict();
}

export { main };