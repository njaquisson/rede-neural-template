# Rede Neural — Template de Classificação com TensorFlow.js

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.22-orange)](https://www.tensorflow.org/js)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Sobre o Projeto

Este template é um ponto de partida prático para criar e treinar redes neurais de **classificação multiclasse** usando TensorFlow.js em Node.js. O objetivo conceitual é demonstrar o fluxo completo de um projeto de Machine Learning: preparação de dados, construção do modelo, treinamento e geração de previsões.

Conceitualmente, a rede recebe um conjunto de atributos numéricos de uma entidade (por exemplo, perfil de um usuário) e a classifica em uma dentre várias categorias mutuamente exclusivas, com base nos padrões aprendidos durante o treinamento.

**Analogia funcional**: assim como um profissional qualificado aprende a reconhecer perfis ao longo do tempo avaliando diversos exemplos, a rede neural ajusta seus pesos internos através de múltiplas passagens pelos dados de treinamento, refinando sua capacidade de generalizar para casos novos.

---

## Arquitetura

```
Entrada (7 features) → Camada Oculta (80 neurônios, ReLU) → Saída (3 classes, Softmax)
```

| Camada | Função | Detalhes |
|---|---|---|
| **Entrada** | Vetor numérico normalizado | 7 features: idade normalizada + 3 cores (one-hot) + 3 localizações (one-hot) |
| **Oculta** | Extração de padrões | 80 neurônios com ativação ReLU para introduzir não-linearidade |
| **Saída** | Classificação | 3 neurônios com softmax — cada saída representa a probabilidade de uma classe |

- **ReLU** (Rectified Linear Unit): ativação que descarta valores negativos, permitindo à rede aprender relações não-lineares entre features e classes.
- **Softmax**: converte os valores brutos em uma distribuição de probabilidades (soma = 1), facilitando a interpretação da saída como confiança por classe.
- **categoricalCrossentropy**: função de perda que penaliza previsões confiantes mas incorretas, guiando o modelo em direção à decisão correta.
- **Adam**: otimizador que adapta a taxa de aprendizado por parâmetro, combinando velocidade e estabilidade durante o treinamento.

---

## Como Usar Este Template para Seu Próprio Treinamento

Siga os passos abaixo para adaptar este template à sua própria rede neural de classificação:

### 1. Clone e instale as dependências

```bash
git clone <url-do-seu-repositorio>
cd <nome-do-projeto>
npm install
```

### 2. Defina o seu dataset

Substitua os dados de exemplo (`tensorPessoasNormalizado` e `tensorLabels`) pelos seus próprios dados. Para cada amostra:

- **Converta tudo para números.** Redes neurais operam exclusivamente com valores numéricos.
- **Normalize features contínuas** (como idade, salário, pontuação) para uma escala comum, tipicamente `[0, 1]` ou `[-1, 1]`:
  ```
  valor_normalizado = (valor - min) / (max - min)
  ```
- **Encode variáveis categóricas** usando one-hot encoding. Cada categoria se torna uma posição `1` no vetor e `0` nas demais:
  ```
  // Exemplo: cor com valores ["azul", "vermelho", "verde"]
  "azul"     → [1, 0, 0]
  "vermelho" → [0, 1, 0]
  "verde"    → [0, 0, 1]
  ```

### 3. Ajuste a arquitetura

Modifique as constantes no topo de `index.js` conforme seu problema:

```js
const INPUT_FEATURES = 7;       // Total de features por amostra (após encoding)
const HIDDEN_UNITS = 80;        // Neurônios na camada oculta
const OUTPUT_CLASSES = 3;       // Número de categorias de saída
const TRAINING_EPOCHS = 100;    // Épocas de treinamento
```

**Diretrizes para ajustes:**
- **Mais features** → aumente `INPUT_FEATURES` proporcionalmente.
- **Mais categorias** → aumente `OUTPUT_CLASSES` e adicione as linhas correspondentes nos labels.
- **Mais dados** → adicione mais linhas a `tensorPessoasNormalizado` e `tensorLabels`. A regra geral é: quanto mais dados, melhor a generalização.
- **Mais complexidade** → adicione mais camadas ocultas com `model.add(tf.layers.dense({ ... }))` antes da camada de saída.

### 4. Personalize as classes

Atualize o array `LABEL_NAMES` com os nomes das suas categorias:

```js
const LABEL_NAMES = ["categoria_a", "categoria_b", "categoria_c"];
```

### 5. Configure o exemplo de predição

No bloco de execução no final do arquivo, normalize o vetor de entrada seguindo a mesma lógica do treinamento e execute:

```js
const meuVetor = [0.5, 1, 0, 0, 0, 1, 0]; // mesmo formato do dataset de treino
const rawPredictions = await predict(model, meuVetor);
```

### 6. Execute

```bash
node index.js
```

O modelo será treinado e a previsão do exemplo será exibida no terminal com as probabilidades de cada classe.

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

## Estrutura do Projeto

```
rede-neural-template/
├── index.js              # Modelo, treinamento e predição
├── package.json          # Dependências e scripts
├── README.md             # Documentação
└── node_modules/         # Pacotes instalados
```

---

## Próximos Passos (Expansões Planejadas)

- **Integração com banco de dados** — carregar datasets dinâmicos de uma base de dados real.
- **Interface web** — painel visual para monitorar treinamento, métricas e predições em tempo real.
- **Generalização** — tornar o template reutilizável para qualquer problema de classificação via configuração, sem necessidade de editar a lógica central.
- **Validação e testes** — divisão treino/teste, métricas adicionais (precisão, recall, F1-score) e salvamento/reutilização de modelos treinados.

---

## Licença

Distribuído sob a licença ISC. Veja [`LICENSE`](LICENSE) para mais informações.
