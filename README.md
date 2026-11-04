# Calculadora 100% Python (Alta Precisão Aritmética)

Uma aplicação de calculadora elegante e determinística desenvolvida **100% em Python**, sem nenhuma dependência externa (utiliza exclusivamente a biblioteca padrão do Python). Possui interface moderna com tema escuro servida na porta 3000 via `http.server`, motor aritmético de alta precisão com `decimal.Decimal` (configurado para 50 dígitos), fita de fundamentação algébrica passo a passo, literatura matemática com artigos acadêmicos renomados e um laboratório interativo para testes das quatro operações elementares.

---

## 📋 Pré-requisitos

Para executar este projeto, você precisa apenas de:

- **Python**: Versão 3.8 ou superior (recomendado Python 3.10 ou superior).
- **Navegador Web**: Qualquer navegador moderno (Google Chrome, Mozilla Firefox, Safari ou Microsoft Edge).
- *(Nenhum gerenciador de pacotes externo como pip ou npm é obrigatório; o projeto utiliza exclusivamente a biblioteca padrão do Python: `http.server`, `decimal`, `json`, `sys`, `os`, `urllib`).*

---

## 🚀 Passo a Passo para Executar o Aplicativo

### 1. Acessar a Pasta do Projeto
Abra o seu terminal e navegue até a pasta onde o projeto está localizado:
```bash
cd Calculadora
```
*(Ou indique o caminho completo onde você clonou o repositório no seu computador).*

### 2. Iniciar o Servidor Python
Execute o comando direto no terminal utilizando o Python:
```bash
python3 server.py
```
*(Opcional via npm, caso utilize Node.js no ambiente: `npm run dev` ou `npm start`).*

O servidor aceita parâmetros opcionais de porta e host, caso deseje customizar:
```bash
python3 server.py --port 3000 --host 0.0.0.0
```

Você verá a seguinte mensagem de inicialização confirmando o funcionamento:
```text
============================================================
 Servidor Python Iniciado com Sucesso!
 Acesse no navegador: http://0.0.0.0:3000
============================================================
```

### 3. Acessar no Navegador
Abra seu navegador de preferência e acesse o endereço local:
```text
http://localhost:3000
```
*(Ou `http://127.0.0.1:3000`).*

### 4. Executar os Testes Automatizados (100% de Cobertura)
O projeto conta com suítes de testes automatizados que validam todos os componentes sem dependências externas:

1. **Suíte Geral Completa (64 testes)**:
   Testa o motor matemático puro, limites de precisão, casos de zero e números negativos, todas as transições de estado do visor e as rotas HTTP do servidor:
   ```bash
   python3 test_suite.py
   ```
   *(Ou via npm: `npm test`).*
   Todos os **64 testes** serão executados e validados com 100% de sucesso.

2. **Simulador de Fluxo de Display (18 cenários)**:
   Testa especificamente a máquina de estados da interface gráfica (digitação, ponto único, DEL apagando resultados e erros, cancelamento de operador, inversão de sinal ±, porcentagem % e limpeza AC):
   ```bash
   python3 test_display_flow.py
   ```
   Todos os **18 cenários** de fluxo serão aprovados com sucesso.

---

## ❓ Perguntas e Respostas Técnicas

### 1. Quais são os principais componentes do código gerado?

O projeto foi estruturado em módulos independentes, desacoplados e fáceis de compreender para programadores de qualquer nível de experiência em Python:

1. **`calc_engine.py` (Motor Matemático Puro):**  
   - Contém as funções aritméticas elementares: `somar()`, `subtrair()`, `multiplicar()` e `dividir()`.
   - Utiliza a classe nativa `decimal.Decimal` com precisão configurada para 50 dígitos (`getcontext().prec = 50`), eliminando qualquer imprecisão de ponto flutuante do padrão binário IEEE 754 (como a clássica anomalia `0.1 + 0.2 = 0.30000000000000004`).
   - Implementa a função `formatar_numero()` para exibir inteiros sem o sufixo `.0`, decimais sem zeros redundantes à direita e suprimir notação científica indesejada (ex: `2E+1`).
   - Trata com rigor matemático divisões por zero (denominador nulo ou numerador nulo), retornando `"Erro, Divisão por Zero"` acompanhado da justificativa algébrica de não inversibilidade no corpo real $(\mathbb{R}, +, \cdot)$.
   - Pode ser executado diretamente via linha de comando: `python3 calc_engine.py 10 + 10`.

2. **`server.py` (Servidor Web HTTP Nativo):**  
   - Construído com `http.server.HTTPServer` e `BaseHTTPRequestHandler`, operando sem frameworks externos (como Flask ou Express).
   - **`GET /` ou `GET /index.html`**: Serve o frontend autônomo (HTML5, CSS3 e JavaScript ES6).
   - **`POST /api/calculate`**: Endpoint JSON que recebe os operandos e o operador, invoca o motor matemático e devolve o resultado formatado e a explicação algébrica (HTTP 200 em caso de sucesso, HTTP 400 em caso de erro matemático).
   - **`GET /api/theory`**: Retorna os axiomas formais e a literatura matemática acadêmica das quatro operações.
   - **`GET /api/health`**: Endpoint de monitoramento de integridade da aplicação.
   - Suporte nativo aos métodos `HEAD` e tratamento padronizado de erro 404 para rotas inexistentes.

3. **`index.html` (Interface do Usuário Responsiva e Autônoma):**  
   - Visual moderno em tema escuro com estética de vidro fosco (*glassmorphism*) e tipografias elegantes (*Plus Jakarta Sans* e *Fira Code*).
   - Visor digital triplo: linha de preview superior com histórico da operação em curso, visor principal de alta legibilidade e **Fita Algébrica** expansível com fundamentação teórica.
   - Teclado completo contendo dígitos (0-9), ponto decimal único, operadores elementares (`+`, `−`, `×`, `÷`), inversão de sinal (`±`), percentual (`%`), botão de apagar (`DEL`) e limpeza total (`AC`).
   - Seção de Literatura Acadêmica Brasileira com artigos renomados (Prof. Elon Lages Lima/IMPA, RPM/SBM, SBEM/Unicamp, UNESP, UFMG), fórmulas em LaTeX e exemplos práticos.
   - Modal interativo "Fundamentos Matemáticos" contendo o laboratório de testes das quatro operações com preenchimento direto no visor da calculadora.
   - Suporte completo a atalhos do teclado físico do computador.

4. **`test_suite.py` e `test_display_flow.py` (Suíte Completa de Testes Automatizados):**  
   - `test_suite.py`: Contém 64 testes automatizados divididos em 3 etapas (36 testes unitários do motor, 21 validações do visor e 7 testes de integração com servidor HTTP real).
   - `test_display_flow.py`: Contém 18 cenários detalhados da máquina de estados do visor (`DisplaySimulator`), garantindo comportamento consistente em todas as interações do usuário.

5. **`package.json` (Scripts de Automação e Conveniência):**  
   - Mapeia comandos padrão para desenvolvedores habituados ao ecossistema Node/npm (`npm run dev`, `npm start`, `npm test`, `npm run lint`, `npm run clean`), sem adicionar nenhuma dependência em tempo de execução.

---

### 2. Como a aplicação recebe os números e identifica a operação escolhida?

O fluxo de recepção de dados, controle de estado e identificação da operação ocorre de maneira sequencial e determinística:

1. **Captura da Digitação de Números (`digitar` e `pontoDecimal`):**  
   - Ao clicar em um botão numérico (0 a 9) ou pressionar a respectiva tecla no teclado físico, a função `digitar(digito)` é disparada.
   - Se a flag `aguardandoSegundoNumero` estiver ativa (logo após a escolha de um operador ou conclusão de um cálculo anterior), o visor substitui o valor exibido pelo novo dígito digitado e reseta a flag para `false`.
   - Se o visor estiver em `"0"`, o novo dígito substitui o zero; caso contrário, o dígito é concatenado ao final da string numérica (ex: `"1"` seguido de `"4"` resulta em `"14"`).
   - A função `pontoDecimal()` garante que apenas um ponto decimal possa existir por número digitado, prevenindo valores inválidos como `"14.5.2"`.

2. **Funções Auxiliares de Modificação (`inverterSinal` e `porcentagem`):**  
   - O botão `±` (`inverterSinal`) alterna dinamicamente o sinal do número atualmente visível entre positivo e negativo (ex: de `"25"` para `"-25"` e vice-versa).
   - O botão `%` (`porcentagem`) converte o valor atual para sua representação percentual dividindo-o por 100 (ex: `"25"` torna-se `"0.25"`).

3. **Identificação e Encadeamento da Operação (`escolherOperador`):**  
   - Ao selecionar uma operação (`+`, `−`, `×`, `÷`) ou pressionar `+`, `-`, `*`, `/` no teclado físico:
     - O valor atual do visor é armazenado em `operando1`.
     - O operador matemático correspondente é armazenado em `operadorAtual`.
     - A linha de preview superior é atualizada imediatamente (ex: `"14.5 +"`).
     - A flag `aguardandoSegundoNumero` é definida como `true`, preparando o visor para o próximo termo.
     - **Encadeamento Contínuo**: Se já existia uma operação anterior pendente e o usuário digita um novo operador sem pressionar `=`, o sistema calcula automaticamente a operação em curso antes de registrar o novo operador (ex: `10 + 5` seguido de `×` resulta em `15 ×`).

4. **Edição Inteligente e Limpeza (`apagarUltimo` e `limparTudo`):**  
   - O botão **`DEL` (Backspace)** possui 4 comportamentos contextuais:
     1. *Em caso de erro*: Se o visor estiver exibindo uma mensagem de erro (como `"Erro, Divisão por Zero"`), o botão `DEL` limpa o erro instantaneamente, retornando o visor para `"0"`.
     2. *Em resultado recém-calculado*: O usuário pode apagar dígitos do resultado final com o botão `DEL` para continuar editando o valor diretamente.
     3. *Com operador pendente*: Se o usuário selecionou um operador (ex: `"10 +"`) e decide apertar `DEL` antes de digitar o segundo número, o operador pendente é cancelado e o visor retorna ao modo de edição do primeiro número.
     4. *Durante a digitação*: Remove o último caractere digitado, restaurando `"0"` quando não restarem dígitos.
   - O botão **`AC` (All Clear / Escape)** realiza o reset completo do estado da calculadora: zera o visor para `"0"`, limpa a linha de preview superior, oculta a fita algébrica e anula operandos e operadores em memória.

5. **Disparo do Cálculo (`calcularResultado`):**  
   - Ao pressionar `=` ou a tecla Enter, a função `calcularResultado()` monta o payload em formato JSON:
     ```json
     {
       "operand1": "14.5",
       "operand2": "35.5",
       "operator": "+"
     }
     ```
   - O payload é transmitido ao backend via requisição assíncrona com a API nativa `fetch('/api/calculate', { method: 'POST', ... })`.

6. **Mapeamento do Teclado Físico:**  
   - A aplicação inclui um ouvinte global de eventos (`keydown`) que mapeia com fidelidade:
     - Teclas `0` a `9`: Digitação numérica.
     - Teclas `.` ou `,`: Ponto decimal.
     - Teclas `+`, `-`, `*`, `/`: Operadores aritméticos.
     - Teclas `Enter` ou `=`: Execução do cálculo.
     - Tecla `Backspace`: Função `DEL`.
     - Tecla `Escape`: Função `AC`.

---

### 3. Como a lógica de programação é utilizada para realizar os cálculos e apresentar os resultados?

A lógica de programação foi projetada com base em princípios de determinação matemática, alta precisão e transparência didática:

1. **Recepção e Decodificação no Python Puro:**  
   - O servidor `server.py` intercepta a chamada no método `do_POST()`, lê o cabeçalho `Content-Length` e decodifica o JSON da requisição.
   - Os valores de `operand1`, `operand2` e `operator` são encaminhados para a função `calcular()` em `calc_engine.py`.

2. **Validação e Conversão com `decimal.Decimal`:**  
   - O motor valida se o operador pertence à lista de operações suportadas (`+`, `-`, `*`, `/`).
   - Os textos dos operandos são convertidos em instâncias de `Decimal(str)`. Essa conversão direta a partir de strings preserva exatamente os algarismos informados pelo usuário, contornando a representação binária aproximada de ponto flutuante do padrão IEEE 754.

3. **Tratamento Rigoroso de Divisão por Zero:**  
   - Antes de efetuar qualquer operação de divisão (`/`), o código verifica explicitamente se o divisor ou dividendo é nulo (`b == Decimal(0)` ou `a == Decimal(0)`).
   - Se for o caso, a operação é bloqueada de forma preventiva, retornando a mensagem padronizada `"Erro, Divisão por Zero"` acompanhada da explicação algébrica formal: no Corpo dos Reais $(\mathbb{R}, +, \cdot)$, o número zero não possui elemento inverso multiplicativo (recíproco).

4. **Despacho Aritmético e Construção da Explicação Algébrica:**  
   - Um bloco condicional limpo (`if / elif`) direciona os valores para a função aritmética correspondente:
     - **Adição (`+`)**: Invoca `somar(a, b)`. Retorna o conceito de *Translação Linear / Acumulação*, destacando o elemento neutro (0) e a comutatividade ($a + b = b + a$).
     - **Subtração (`-`)**: Invoca `subtrair(a, b)`. Formaliza o conceito de *Inverso Aditivo (Simétrico)*, demonstrando que subtrair $b$ equivale a somar o seu oposto: $a - b \equiv a + (-b)$.
     - **Multiplicação (`*`)**: Invoca `multiplicar(a, b)`. Formaliza o conceito de *Escalonamento Linear / Homomorfismo*, explicitando o elemento neutro (1), o elemento absorvente (0) e a distributividade sobre a adição.
     - **Divisão (`/`)**: Invoca `dividir(a, b)`. Formaliza o conceito de *Inverso Multiplicativo (Recíproco)*, explicitando que dividir por $b$ equivale a multiplicar pelo recíproco $b^{-1}$: $a \div b \equiv a \times b^{-1}$.

5. **Formatação Limpa com `formatar_numero()`:**  
   - Para entregar uma resposta visualmente limpa e legível:
     - Se o resultado for zero, retorna `"0"`.
     - Se o resultado for um número inteiro exato (ex: `20.0`), descarta a casa decimal e retorna `"20"`.
     - Se possuir casas decimais fracionárias (ex: `0.3000`), elimina os zeros desnecessários à direita, resultando em `"0.3"`.
     - Evita qualquer conversão para notação científica como `2E+1`.

6. **Atualização Dinâmica do Display:**  
   - O frontend recebe o JSON de resposta da API:
     - Em caso de sucesso (HTTP 200), o visor principal exibe o valor calculado com precisão, a linha superior de preview exibe a equação completa (ex: `14.5 + 35.5 =`) e a **Fita Algébrica** exibe o passo a passo matemático com as propriedades do corpo dos números reais.
     - Em caso de divisão por zero (HTTP 400), o visor exibe `"Erro, Divisão por Zero"` com a equação na linha de preview, permitindo ao usuário reiniciar ou corrigir o valor imediatamente pelo botão `DEL` ou `AC`.

---

## 📡 Endpoints da API REST

A aplicação disponibiliza os seguintes endpoints HTTP nativos:

| Método | Rota | Descrição | Status de Sucesso |
|---|---|---|---|
| `GET` | `/` ou `/index.html` | Interface web interativa completa | `200 OK` (HTML) |
| `POST` | `/api/calculate` | Executa a operação aritmética com motor Decimal | `200 OK` ou `400 Bad Request` (JSON) |
| `GET` | `/api/theory` | Retorna os axiomas formais e literatura acadêmica | `200 OK` (JSON) |
| `GET` | `/api/health` | Verificação de integridade e versão do motor | `200 OK` (JSON) |
| `HEAD` | `/`, `/api/theory`, `/api/health` | Cabeçalhos das rotas principais para checagem | `200 OK` |
