export class TrainingDataRepository {
    async getAll() {
        throw new Error('Método getAll() deve ser implementado pela subclasse');
    }

    async save(sample) {
        throw new Error('Método save() deve ser implementado pela subclasse');
    }

    async getFeatureCount() {
        throw new Error('Método getFeatureCount() deve ser implementado pela subclasse');
    }

    async getClassCount() {
        throw new Error('Método getClassCount() deve ser implementado pela subclasse');
    }
}