# Rede Neural — Template de Classificação com TensorFlow.js

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange)](https://www.tensorflow.org/js)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Sobre o Projeto

Template de **classificação multiclasse** com TensorFlow.js em Node.js, estruturado em camadas segundo princípios de **Clean Code, Domain-Driven Design (DDD)** e **Design Patterns**.

O objetivo conceitual é demonstrar o fluxo completo de Machine Learning — **preparação de dados → construção do modelo → treinamento → predição** — organizado de forma que cada responsabilidade esteja isolada em seu próprio módulo, facilitando a manutenção e a evolução do código.

> **Analogia funcional**: assim como um profissional aprende a reconhecer perfis ao longo do tempo avaliando exemplos, a rede neural ajusta seus pesos internos em múltiplas passagens pelos dados de treinamento, refinando sua capacidade de generalizar para casos novos.

---

## Exemplo de Domínio

Para tornar o template concreto, usamos um domínio simples: **classificação de pessoas em categorias** (`premium`, `medium`, `basic`) a partir de seus atributos.

| Atributo | Tipo | Codificação |
|---|---|---|
| **Idade** | contínua | Normalizada para `[0, 1]` |
| **Cor** (`azul`, `vermelho`, `verde`) | categórica | One-hot encoding |
| **Localização** (`São Paulo`, `Rio`, `Curitiba`) | categórica | One-hot encoding |

Exemplo de amostra de treino — a pessoa *Erick* (30 anos, cor azul, São Paulo) é classificada como `premium`:

```js
// Vetor de features: [idade_norm, azul, vermelho, verde, SP, Rio, Curitiba]
[0.33, 1, 0, 0, 1, 0, 0]  // → categoria: premium (label [1, 0, 0])
```

---

## Arquitetura do Modelo

```
Entrada (7 features) → Camada Oculta (80 neurônios, ReLU) → Saída (3 classes, Softmax)
```

| Camada | Função | Detalhes |
|---|---|---|
| **Entrada** | Vetor numérico normalizado | 7 features: idade normalizada + 3 cores (one-hot) + 3 localizações (one-hot) |
| **Oculta** | Extração de padrões | 80 neurônios com ativação ReLU para introduzir não-linearidade |
| **Saída** | Classificação | 3 neurônios com softmax — cada saída representa a probabilidade de uma classe |

- **ReLU** (Rectified Linear Unit): descarta valores negativos, permitindo relações não-lineares entre features e classes.
- **Softmax**: converte valores brutos em probabilidades (soma = 1).
- **categoricalCrossentropy**: penaliza previsões confiantes e incorretas.
- **Adam**: otimizador que adapta a taxa de aprendizado por parâmetro.

---

## Arquitetura de Software (Camadas)

O projeto segue **Clean Architecture / DDD**, separando domínio, aplicação e infraestrutura:

| Camada | Pasta | Responsabilidade |
|---|---|---|
| **Domain** | `src/domain/` | Entidades, value objects e contratos (repositories) — pura, sem dependência externa |
| **Application** | `src/application/` | Casos de uso (orquestração de treino e predição) e DTOs |
| **Infrastructure** | `src/infrastructure/` | Implementações concretas: dados em memória, TensorFlow, encoding e apresentação |
| **Config** | `src/config/` | Constantes centralizadas de hiperparâmetros |

Isso permite trocar a fonte de dados (ex.: memória → banco de dados) **sem alterar a lógica de domínio**, graças ao **padrão Repository**.

---

## Persistência do Modelo

O modelo treinado é **persistido em disco** e pode ser **carregado posteriormente** sem necessidade de re-treinar. A responsabilidade fica isolada em `src/infrastructure/ml/ModelPersistenceService.js`:

| Operação | Quando ocorre | Responsável |
|---|---|---|
| **Salvar** | Após `model.fit()`, o modelo é gravado em `./saved_models/modelo_v1` (arquivos `model.json` + `weights.bin`) | `TrainUseCase` → `ModelPersistenceService.save()` |
| **Carregar** | Antes de prever, o modelo é lido do disco com `tf.loadLayersModel()` | `PredictUseCase` → `ModelPersistenceService.load()` |
| **Verificar** | Checa se `model.json` existe antes de carregar | `ModelPersistenceService.exists()` |

Pontos importantes:

- O **diretório de destino é criado automaticamente** caso não exista (`fs.mkdirSync(..., { recursive: true })`).
- O `PredictUseCase` **não re-treina**: carrega o modelo salvo. Se ele não existir, o erro orienta o usuário a executar `npm run train` primeiro.
- No TensorFlow.js Node, o carregamento via `file://` deve apontar **diretamente para o arquivo `model.json`** (não para o diretório), ao contrário do salvamento.
- A pasta `saved_models/` está no `.gitignore` para evitar que binários de pesos pesados sejam enviados ao GitHub.

---

## Estrutura do Projeto

```
rede-neural-template/
├── index.js                              # Bootstrap → executa o fluxo combinado (src/index.js)
├── package.json                          # Dependências e scripts
├── README.md                             # Documentação
└── src/
    ├── index.js                          # Fluxo combinado: treina + persiste + prediz
    ├── train.js                          # Entry point: somente treinamento (npm run train)
    ├── predict.js                        # Entry point: somente predição (npm run predict)
    ├── config/
    │   └── index.js                      # CONFIG: hiperparâmetros, classes e caminho do modelo
    ├── domain/
    │   ├── entities/
    │   │   ├── Person.js                 # Entidade Pessoa (nome, idade, cor, localização)
    │   │   └── TrainingSample.js         # Amostra de treino (Pessoa + categoria)
    │   ├── value-objects/
    │   │   ├── FeatureVector.js          # Vetor numérico de features (imutável)
    │   │   ├── Category.js               # Categoria com one-hot encoding
    │   │   └── PredictionResult.js       # Resultado de predição
    │   └── repositories/
    │       └── TrainingDataRepository.js # Contrato abstrato (interface)
    ├── application/
    │   ├── dto/
    │   │   └── TrainingDataDTO.js        # Transferência de dados de treino
    │   └── use-cases/
    │       ├── TrainUseCase.js           # Caso de uso: treinar e persistir o modelo
    │       └── PredictUseCase.js         # Caso de uso: carregar modelo e prever categoria
    └── infrastructure/
        ├── data/
        │   └── InMemoryTrainingRepository.js # Repository em memória (dataset de exemplo)
        ├── ml/
        │   ├── ModelFactory.js           # Factory Pattern: criação do modelo TensorFlow
        │   └── ModelPersistenceService.js # Persistência: salvar/carregar modelo em disco
        ├── encoding/
        │   └── FeatureEncoder.js         # Normalização + one-hot encoding
        └── presentation/
            └── ResultPresenter.js        # Formatação e exibição dos resultados
```

---

## Como Usar Este Template para Seu Próprio Treinamento

### 1. Clone e instale

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-projeto>
npm install
```

### 2. Configure o seu dataset

O dataset de exemplo vive no **repositório em memória** em `src/infrastructure/data/InMemoryTrainingRepository.js`. Adicione novas pessoas no método `#seedData()`:

```js
#seedData() {
    this.#samples = [
        new TrainingSample(new Person('Erick', 30, 'azul', 'São Paulo'), Category.PREMIUM),
        new TrainingSample(new Person('Ana', 25, 'vermelho', 'Rio'), Category.MEDIUM),
        new TrainingSample(new Person('Carlos', 40, 'verde', 'Curitiba'), Category.BASIC),
        // Adicione mais amostras aqui — quanto mais dados, melhor a generalização
    ];
}
```

### 3. Ajuste os hiperparâmetros

Edite o objeto `CONFIG` em `src/config/index.js`:

```js
export const CONFIG = Object.freeze({
    INPUT_FEATURES: 7,       // Total de features por amostra (após encoding)
    HIDDEN_UNITS: 80,        // Neurônios na camada oculta
    OUTPUT_CLASSES: 3,       // Número de categorias de saída
    TRAINING_EPOCHS: 100,    // Épocas de treinamento
    LABEL_NAMES: ["premium", "medium", "basic"], // Nomes das categorias
    AGE_MIN: 25,             // Faixa usada na normalização da idade
    AGE_MAX: 40,
    MODEL_SAVE_PATH: './saved_models/modelo_v1', // Caminho do modelo salvo em disco
    MODEL_SAVE_URL: 'file://./saved_models/modelo_v1', // URL file:// exigida pelo TF.js Node
});
```

**Regras gerais:**
- **Mais features** → aumente `INPUT_FEATURES` e ajuste o `FeatureEncoder`.
- **Mais categorias** → aumente `OUTPUT_CLASSES` e adicione nomes em `LABEL_NAMES`.
- **Mais complexidade** → adicione camadas em `src/infrastructure/ml/ModelFactory.js`.
- **Mudar onde o modelo é salvo** → altere `MODEL_SAVE_PATH` e `MODEL_SAVE_URL` de forma coordenada.

### 4. Entenda a codificação dos dados

Toda entrada precisa ser **numérica**. As regras ficam em `src/infrastructure/encoding/FeatureEncoder.js`:

- **Normalize features contínuas** para `[0, 1]`:
  ```
  valor_normalizado = (valor - min) / (max - min)
  ```
- **Encode variáveis categóricas** com one-hot encoding:
  ```
  // Cor: ["azul", "vermelho", "verde"]
  "azul"     → [1, 0, 0]
  "vermelho" → [0, 1, 0]
  "verde"    → [0, 0, 1]
  ```

### 5. Configure a predição

No entry point `src/predict.js`, crie uma `Person` com os atributos desejados. O `PredictUseCase` carrega o modelo **já salvo em disco** (não re-treina) e o `FeatureEncoder` aplica automaticamente a codificação e a normalização:

```js
const encoder = new FeatureEncoder(CONFIG.AGE_MIN, CONFIG.AGE_MAX);
const predictUseCase = new PredictUseCase(encoder);

const pessoa = new Person('Zé', 28, 'verde', 'Curitiba'); // idade 28, cor verde, Curitiba
const resultados = await predictUseCase.execute(pessoa);

ResultPresenter.exibir(pessoa.nome, resultados);
```

> **Importante**: se não existir um modelo salvo em disco, a predição falha com um erro orientando a executar o treinamento primeiro.

### 6. Execute

Os scripts estão definidos no `package.json`:

```json
"scripts": {
    "start": "TF_CPP_MIN_LOG_LEVEL=2 node --no-warnings --watch index.js",
    "train": "TF_CPP_MIN_LOG_LEVEL=2 node --no-warnings src/train.js",
    "predict": "TF_CPP_MIN_LOG_LEVEL=2 node --no-warnings src/predict.js",
    "test": "echo \"Error: no test specified\" && exit 1"
}
```

| Comando | Quando/por que executar |
|---|---|
| **`npm start`** | Executa o **fluxo completo**: treina o modelo, persiste em disco e em seguida faz uma predição de exemplo. Ideal para validar rapidamente todo o pipeline de ponta a ponta. |
| **`npm run train`** | Executa **somente o treinamento**, salvando o modelo em `./saved_models/modelo_v1`. Use quando você alterou o dataset (`#seedData`) ou os hiperparâmetros (`CONFIG`) e precisa gerar/atualizar o modelo no disco. |
| **`npm run predict`** | Executa **somente a predição**, carregando o modelo já salvo em disco. Use quando o modelo já foi treinado e você deseja apenas classificar uma nova pessoa — sem re-treinar. |
| **`npm test`** | Placeholder (nenhum teste implementado). |

**Fluxo típico de uso**:

```bash
npm install          # primeira vez
npm run train        # 1) treina e salva o modelo
npm run predict      # 2) carrega o modelo salvo e prevê
```

Exemplo de saída da predição (ordenada por probabilidade):

```
Previsão para Zé: [
  { categoria: 'basic',    probabilidade: '72.18%' },
  { categoria: 'medium',   probabilidade: '15.80%' },
  { categoria: 'premium',  probabilidade: '12.02%' }
]
```

> **Observação**: como o dataset de treino é muito pequeno (3 amostras), as probabilidades variam a cada execução. Com mais dados o modelo se torna estável e preciso.

---

## Como estender (próximas iterações)

- **Conectar um banco de dados** → crie uma nova classe que estenda `TrainingDataRepository` e injete-a no `TrainUseCase`. Nenhuma outra camada precisa mudar.
- **Interface web** → o `ResultPresenter` pode ser substituído por um componente que envie os dados a uma UI.
- **Tornar o domínio genérico** → abstrair `Person`/`Category` para classes parametrizáveis, permitindo reutilizar o template para qualquer problema de classificação.
- **Outras estratégias de persistência** → criar uma nova implementação que siga o contrato do `ModelPersistenceService` (ex.: salvar em nuvem, banco de dados ou localStorage no navegador).

---

## Pré-requisitos

- **Node.js** (versão 22 ou superior)
- **npm** (gerenciado junto com o Node.js)

### Instalação do Node.js (via nvm)

```bash
nvm install 22
nvm use 22
```

### Instalação do TensorFlow.js

```bash
npm i @tensorflow/tfjs-node@4.22
```

---

## Licença

Distribuído sob a licença ISC. Veja [`LICENSE`](LICENSE) para mais informações.