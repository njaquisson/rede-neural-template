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

## Estrutura do Projeto

```
rede-neural-template/
├── index.js                              # Bootstrap → chama main() em src/
├── package.json                          # Dependências e scripts
├── README.md                             # Documentação
└── src/
    ├── index.js                          # Composição (wiring) e ponto de entrada
    ├── config/
    │   └── index.js                      # CONFIG: hiperparâmetros e nomes das classes
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
    │       ├── TrainUseCase.js           # Caso de uso: treinar o modelo
    │       └── PredictUseCase.js         # Caso de uso: prever categoria
    └── infrastructure/
        ├── data/
        │   └── InMemoryTrainingRepository.js # Repository em memória (dataset de exemplo)
        ├── ml/
        │   └── ModelFactory.js           # Factory Pattern: criação do modelo TensorFlow
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
});
```

**Regras gerais:**
- **Mais features** → aumente `INPUT_FEATURES` e ajuste o `FeatureEncoder`.
- **Mais categorias** → aumente `OUTPUT_CLASSES` e adicione nomes em `LABEL_NAMES`.
- **Mais complexidade** → adicione camadas em `src/infrastructure/ml/ModelFactory.js`.

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

No ponto de entrada `src/index.js`, crie uma `Person` com os atributos desejados. A codificação e a normalização são aplicadas automaticamente pelo `FeatureEncoder`:

```js
const pessoa = new Person('Zé', 28, 'verde', 'Curitiba'); // idade 28, cor verde, Curitiba

const predictUseCase = new PredictUseCase(model, encoder);
const resultados = await predictUseCase.execute(pessoa);

ResultPresenter.exibir(pessoa.nome, resultados);
```

### 6. Execute

```bash
npm start
```

O modelo é treinado e a previsão do exemplo é exibida no terminal, ordenada por probabilidade:

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