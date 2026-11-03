# Calculadora Algébrica & Aritmética de Alta Precisão

Calculadora moderna full-stack com interface escura minimalista em React e motor de cálculo determinístico de alta precisão em Python (`decimal.Decimal`), eliminando discrepâncias de ponto flutuante do padrão IEEE 754. O sistema oferece suporte às quatro operações fundamentais (adição, subtração, multiplicação e divisão), atalhos de teclado físico, histórico persistente de cálculos e laboratório interativo dos fundamentos algébricos.

---

## 📋 Pré-requisitos

Para executar a aplicação localmente, certifique-se de ter instalado em seu ambiente:

- **Node.js**: Versão 18.x ou superior
- **npm**: Versão 9.x ou superior (já integrado ao Node.js)
- **Python**: Versão 3.10 ou superior (com biblioteca padrão `decimal`, `json`, `sys` e `fractions`)
- **Navegador Web Moderno**: Google Chrome, Mozilla Firefox, Microsoft Edge ou Safari

---

## 🚀 Passo a Passo para Executar o Aplicativo

### 1. Clonar ou Acessar o Diretório do Projeto
Abra o terminal e navegue até a pasta raiz da aplicação:
```bash
cd calculator-app
```

### 2. Instalar as Dependências do Projeto
Instale os pacotes necessários do frontend e do servidor Express:
```bash
npm install
```

### 3. Iniciar o Servidor Full-Stack (Backend Express + Frontend Vite)
Execute o comando de desenvolvimento:
```bash
npm run dev
```

O servidor será inicializado na porta 3000:
```text
Calculadora Server rodando em http://localhost:3000
```

### 4. Acessar a Aplicação
Abra seu navegador e acesse:
```
http://localhost:3000
```

### 5. (Opcional) Executar a Suíte Automatizada de Testes
Para verificar a integridade de todas as operações, limites de zero, números negativos e endpoints HTTP, execute:
```bash
python3 test_suite.py
```

---

## ❓ Perguntas e Respostas Técnicas

### Quais são os principais componentes do código gerado?

1. **`calc_engine.py` (Motor de Cálculo em Python):**  
   Núcleo aritmético que utiliza a biblioteca nativa `decimal.Decimal` com precisão de 50 dígitos. Executa as operações matemáticas, aplica as regras algébricas de corpos $(\mathbb{R}, +, \cdot)$, trata restrições como divisão por zero e formata os valores eliminando notações científicas indesejadas.

2. **`server.ts` (Servidor Full-Stack Express):**  
   Servidor Node.js que expõe as rotas REST `/api/calculate` (que invoca o script Python via `child_process.execFile`) e `/api/theory` (que fornece as definições axiomáticas), além de montar os middlewares do Vite no ambiente de desenvolvimento.

3. **`src/components/Calculator.tsx` (Componente Principal da Calculadora):**  
   Interface do usuário que gerencia o estado da digitação, a fita algébrica em tempo real, os atalhos de teclado físico, a escala dinâmica de fonte do display e a comunicação com a API.

4. **`src/components/MathTheoryModal.tsx` (Laboratório de Fundamentos Matemáticos):**  
   Modal interativo que apresenta a teoria dos corpos numéricos e permite testar cálculos individualmente em cada uma das quatro operações com explicações axiomáticas em tempo real.

5. **`src/components/MathOverviewCard.tsx` (Literatura Acadêmica):**  
   Card com resumos de artigos históricos de matemática (Peano, Dedekind, Gauss, Hilbert e Goldberg/Kahan) com links para as publicações oficiais.

6. **`src/components/HistoryDrawer.tsx` e `src/components/IEEE754ComparisonModal.tsx`:**  
   Componentes para controle de histórico local (`localStorage`) e demonstração comparativa prática entre o ponto flutuante tradicional (IEEE 754) e o motor decimal exato.

7. **`test_suite.py` (Suíte de Testes):**  
   Script automatizado que valida 26 testes unitários no Python e 11 testes de integração HTTP na API.

---

### Como a aplicação recebe os números e identifica a operação escolhida?

1. **Captura dos Dígitos:**  
   O usuário insere os números através de cliques nos botões da tela ou digitando no teclado físico (capturado pelo listener global `keydown`). A função `inputDigit()` acumula os caracteres na string `displayValue`.

2. **Identificação e Armazenamento da Operação:**  
   Ao selecionar um operador (`+`, `−`, `×` ou `÷`), a função `chooseOperator()` é acionada:
   - O valor atual da tela é salvo como `prevOperand`.
   - O símbolo correspondente é armazenado no estado `operator`.
   - A flag `waitingForNextOperand` é ativada para que o próximo dígito digitado inicie um novo termo.
   - Caso já exista uma operação pendente na memória, a aplicação calcula o resultado intermediário antes de encadear o novo operador.

3. **Envio da Operação:**  
   Ao pressionar `=` ou `Enter`, a função `handleEquals()` valida se ambos os operandos existem e envia uma requisição HTTP `POST /api/calculate` com o payload JSON `{ operand1, operator, operand2 }`.

---

### Como a lógica de programação é utilizada para realizar os cálculos e apresentar os resultados?

1. **Processamento Matemático Determinístico:**  
   O backend recebe os dados e os converte em objetos `Decimal(str)`. As operações são executadas de forma determinística por meio de um mapeamento funcional (`+`, `-`, `*`, `/`). A divisão verifica previamente se o divisor ou o termo inicial é nulo (`b == 0` ou `a == 0`), retornando imediatamente `Erro, Divisão por Zero`.

2. **Normalização e Eliminação de Erros de Ponto Flutuante:**  
   A função `format_decimal()` verifica se o resultado é um inteiro exato (convertendo com `str(int(d))`) ou um decimal, removendo zeros desnecessários à direita. Isso assegura que contas como `0.1 + 0.2` resultem no exato `0.3`, sem resíduos binários como `0.30000000000000004`.

3. **Renderização e Apresentação no Frontend:**  
   Ao receber a resposta JSON:
   - O valor retornado substitui `displayValue` no visor principal.
   - A função `getDisplayFontSize()` ajusta dinamicamente o tamanho da fonte para acomodar números grandes ou mensagens de erro sem quebrar o layout.
   - A **Fita Algébrica** exibe logo abaixo da tela a relação algébrica formal do cálculo realizado (ex.: demonstrando que $5 - 3 \equiv 5 + (-3) = 2$ por meio do inverso aditivo).
   - O cálculo é arquivado na gaveta de histórico e persistido no `localStorage`.
