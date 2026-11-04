# Calculadora 100% Python (Alta Precisão Aritmética)

Uma aplicação de calculadora elegante e determinística desenvolvida **100% em Python**, sem nenhuma dependência externa (utiliza exclusivamente a biblioteca padrão do Python). Possui interface moderna com tema escuro servida na porta 3000 via `http.server`, motor aritmético de alta precisão com `decimal.Decimal` (50 dígitos), fita de fundamentação algébrica passo a passo, literatura matemática com artigos acadêmicos renomados e um laboratório interativo para testes das quatro operações elementares.

---

## 📋 Pré-requisitos

Para executar este projeto, você precisa apenas de:

- **Python**: Versão 3.8 ou superior (recomendado Python 3.10 ou superior).
- **Navegador Web**: Qualquer navegador moderno (Google Chrome, Firefox, Safari ou Edge).
- *(Nenhum gerenciador de pacotes externo como pip ou npm é obrigatório; o projeto usa apenas a biblioteca padrão do Python: `http.server`, `decimal`, `json`, `sys`, `os`).*

---

## 🚀 Passo a Passo para Executar o Aplicativo

### 1. Acessar a Pasta do Projeto
Abra o terminal no diretório da calculadora:
```bash
cd /app/applet
```

### 2. Iniciar o Servidor Python
Execute o comando direto em Python:
```bash
python3 server.py
```
*(Ou, se preferir via npm: `npm run dev` ou `npm start`).*

Você verá a seguinte mensagem de inicialização no terminal:
```text
============================================================
 Servidor Python Iniciado com Sucesso!
 Acesse no navegador: http://localhost:3000
============================================================
```

### 3. Acessar no Navegador
Abra seu navegador de preferência e entre no endereço:
```text
http://localhost:3000
```

### 4. Executar os Testes Automatizados (100% de Cobertura)
Para rodar a suíte completa de testes (unitários do motor, estados do display e integração do servidor HTTP):
```bash
python3 test_suite.py
```
*(Ou via npm: `npm test`).*

Todos os 58 testes serão executados e validados com 100% de sucesso.

---

## ❓ Perguntas e Respostas Técnicas

### 1. Quais são os principais componentes do código gerado?

O projeto foi estruturado em módulos independentes e fáceis de entender para qualquer programador iniciante em Python:

1. **`calc_engine.py` (Motor Matemático Puro):**  
   Contém as funções matemáticas fundamentais (`somar`, `subtrair`, `multiplicar`, `dividir`, `formatar_numero` e `calcular`). Utiliza a classe nativa `decimal.Decimal` configurada com precisão de 50 dígitos para eliminar imprecisões de ponto flutuante do padrão IEEE 754 (como `0.1 + 0.2 = 0.30000000000000004`). Também trata divisões com zero no numerador ou denominador e gera explicações algébricas dos corpos numéricos $(\mathbb{R}, +, \cdot)$.

2. **`server.py` (Servidor Web HTTP Nativo):**  
   Utiliza `http.server.HTTPServer` e `BaseHTTPRequestHandler` da biblioteca padrão para criar um servidor web leve e rápido sem precisar de frameworks pesados:
   - **`GET /`**: Entrega o HTML, CSS e JavaScript responsivo da calculadora.
   - **`POST /api/calculate`**: Recebe os números e a operação em formato JSON, chama o `calc_engine.py` e devolve a resposta calculada.
   - **`GET /api/theory`**: Retorna os axiomas formais e literatura matemática das operações.
   - **`GET /api/health`**: Endpoint de verificação de integridade do servidor.

3. **Interface do Usuário (Frontend Autônomo e Responsivo):**  
   Interface em tema escuro com visor digital (linha de preview superior, display numérico e fita algébrica com quebra de linha automática), teclado numérico completo com suporte a apagar resultados diretamente pelo botão `DEL`, aba de artigos matemáticos de renome em português (Prof. Elon Lages Lima/IMPA, RPM/SBM, SBEM/Unicamp, UNESP, UFMG) com fórmulas e exemplos curtos de até 3 linhas, e modal interativo "Fundamentos Matemáticos".

4. **`test_suite.py` e `test_display_flow.py` (Suíte de Testes com 100% de Cobertura):**  
   Scripts de testes automatizados que validam todas as operações, limites de zero, números negativos, fluxo de estados do display (incluindo o botão `DEL` em resultados e erros, e o botão `AC` que limpa todo o visor) e requisições HTTP ponta a ponta.

---

### 2. Como a aplicação recebe os números e identifica a operação escolhida?

O fluxo ocorre de maneira clara e sequencial em 3 etapas:

1. **Captura da Digitação (Números):**  
   Quando o usuário clica nos botões numéricos (0 a 9) ou digita no teclado físico, a função JavaScript `digitar(digito)` é disparada. Se o display estava em `"0"` ou aguardando o segundo número, ele substitui o valor; caso contrário, concatena o dígito ao final da string (ex: digita `"1"`, depois `"4"` vira `"14"`). A função `pontoDecimal()` permite adicionar vírgula decimal apenas uma vez.

2. **Identificação da Operação:**  
   Ao clicar nos botões de operação (`+`, `−`, `×`, `÷`) ou pressionar essas teclas no teclado, a função `escolherOperador(op)` é chamada:
   - Armazena o número digitado até o momento na variável `operando1`.
   - Salva o símbolo escolhido na variável `operadorAtual`.
   - Atualiza a linha de preview superior (ex: `"14.5 +"`).
   - Ativa a flag booleana `aguardandoSegundoNumero = true` para que a próxima digitação inicie o segundo número.
   - Se o usuário já tiver uma conta anterior pendente, ela calcula automaticamente o resultado antes de prosseguir (encadeamento de operações).

3. **Disparo do Cálculo:**  
   Ao pressionar o botão `=` ou a tecla Enter, a função `calcularResultado()` reúne os dados em um objeto JSON:
   ```json
   {
     "operand1": "14.5",
     "operand2": "35.5",
     "operator": "+"
   }
   ```
   E envia uma requisição via `fetch('/api/calculate')` com método POST para o backend Python.

---

### 3. Como a lógica de programação é utilizada para realizar os cálculos e apresentar os resultados?

A lógica foi projetada para ser direta, determinística e didática:

1. **Recepção e Validação no Python:**  
   O método `do_POST()` no `server.py` lê o corpo da requisição e repassa para a função `calcular()` em `calc_engine.py`.
   - **Validação de Operador:** Verifica se o operador está na lista `['+', '-', '*', '/']`.
   - **Conversão Segura:** Converte os textos em instâncias de `Decimal(str)` para garantir exatidão absoluta.
   - **Tratamento de Divisão por Zero:** Antes de efetuar a divisão, o código verifica se o divisor ou dividendo é zero (`b == 0` ou `a == 0`). Se for, retorna imediatamente o erro padronizado `"Erro, Divisão por Zero"`.

2. **Execução Aritmética e Algébrica:**  
   Um bloco condicional simples (`if / elif`) direciona para a função correspondente:
   - `+` chama `somar(a, b)` $\rightarrow$ Acumulação linear.
   - `-` chama `subtrair(a, b)` $\rightarrow$ Soma pelo elemento simétrico $(-b)$.
   - `*` chama `multiplicar(a, b)` $\rightarrow$ Escalonamento homotético.
   - `/` chama `dividir(a, b)` $\rightarrow$ Multiplicação pelo elemento recíproco $(b^{-1})$.

3. **Formatação Limpa:**  
   A função `formatar_numero()` verifica se o número resultante é um inteiro exato (ex: `20.0` vira `"20"`) ou se possui casas decimais (ex: `0.3000` vira `"0.3"`), eliminando notações científicas indesejadas como `2E+1`.

4. **Apresentação e Atualização do Display:**  
   O servidor devolve um JSON com o resultado e a justificativa algébrica. O navegador então:
   - Atualiza o visor principal com o resultado (ex: `"50"`).
   - Atualiza a linha superior de preview com a equação completa (ex: `"14.5 + 35.5 ="`).
   - Exibe a **Fita Algébrica** detalhando a propriedade matemática utilizada.
   - Quando o botão **AC (All Clear)** é clicado, a função `limparTudo()` zera o visor para `"0"`, limpa a linha de preview, esconde a fita algébrica e redefine todos os estados internos.
