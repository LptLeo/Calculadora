import express from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// API: Executar cálculo via Python Decimal Engine
app.post('/api/calculate', (req, res) => {
  const { operand1, operand2, operator } = req.body;

  if (operand1 === undefined || operand2 === undefined || !operator) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetros incompletos. Envie operand1, operand2 e operator.',
    });
  }

  const scriptPath = path.resolve(__dirname, 'calc_engine.py');

  execFile(
    'python3',
    [scriptPath, String(operand1), String(operator), String(operand2)],
    (error, stdout, stderr) => {
      if (error && !stdout) {
        return res.status(500).json({
          success: false,
          error: stderr || error.message || 'Erro ao invocar o motor Python.',
        });
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        if (!parsed.success) {
          return res.status(400).json(parsed);
        }
        return res.json(parsed);
      } catch (e) {
        return res.status(500).json({
          success: false,
          error: 'Falha ao processar resposta do motor de cálculo.',
          raw: stdout,
        });
      }
    }
  );
});

// API: Fundamentação Matemática Rigorosa
app.get('/api/theory', (_req, res) => {
  res.json({
    title: 'Fundamentação Matemática das Quatro Operações Elementares',
    field: '(ℝ, +, ·)',
    summary:
      'A aritmética elementar é regida por duas operações primitivas (adição e multiplicação) sobre o Corpo dos Números Reais. Subtração e divisão não são operações independentes, mas sim a aplicação direta dos inversos algébricos (simétrico e recíproco).',
    operations: [
      {
        id: 'addition',
        name: 'Adição',
        symbol: '+',
        concept: 'Operação Primitiva de Acumulação e Translação',
        formalDefinition: 'a + b ∈ ℝ',
        identityElement: '0 (Elemento neutro: a + 0 = a)',
        properties: [
          'Comutatividade: a + b = b + a',
          'Associatividade: (a + b) + c = a + (b + c)',
          'Existência do elemento neutro: a + 0 = a',
          'Existência do inverso aditivo: ∀a ∈ ℝ, ∃(-a) | a + (-a) = 0',
        ],
        description:
          'A adição representa o deslocamento linear vetorial na reta real. É a base construtiva de toda a álgebra aditiva.',
      },
      {
        id: 'subtraction',
        name: 'Subtração',
        symbol: '−',
        concept: 'Inverso Aditivo (Soma com o Simétrico)',
        formalDefinition: 'a − b ≡ a + (−b)',
        identityElement: 'Inexistente como operador autônomo (não comutativo)',
        properties: [
          'Não é comutativa: a − b ≠ b − a (quando a ≠ b)',
          'Não é associativa: (a − b) − c ≠ a − (b − c)',
          'Definição canônica: b + (−b) = 0',
        ],
        description:
          'Subtrair b de a é, por definição algébrica estrita, somar a ao elemento simétrico (inverso aditivo) de b. Por isso, a subtração herda as propriedades da adição através do simétrico.',
      },
      {
        id: 'multiplication',
        name: 'Multiplicação',
        symbol: '×',
        concept: 'Operação Primitiva de Escalonamento e Homomorfismo',
        formalDefinition: 'a · b ∈ ℝ (para b ∈ ℕ: ∑_{i=1}^b a)',
        identityElement: '1 (Elemento neutro: a · 1 = a)',
        properties: [
          'Comutatividade: a · b = b · a',
          'Associatividade: (a · b) · c = a · (b · c)',
          'Elemento absorvente: a · 0 = 0',
          'Distributividade sobre a adição: a · (b + c) = a·b + a·c',
          'Existência do inverso multiplicativo: ∀a ≠ 0, ∃a⁻¹ | a · a⁻¹ = 1',
        ],
        description:
          'Multiplicar corresponde à homotetia ou dilatação contínua do espaço métrico. Discretamente, é a repetição da adição, mas no corpo real é a segunda operação fundamental que forma o corpo.',
      },
      {
        id: 'division',
        name: 'Divisão',
        symbol: '÷',
        concept: 'Inverso Multiplicativo (Produto pelo Recíproco)',
        formalDefinition: 'a ÷ b ≡ a · b⁻¹ onde b · b⁻¹ = 1, com b ≠ 0',
        identityElement: 'Inexistente como operador autônomo (não comutativo)',
        properties: [
          'Não é comutativa: a ÷ b ≠ b ÷ a (para a ≠ b e a,b ≠ 0)',
          'Não é associativa: (a ÷ b) ÷ c ≠ a ÷ (b ÷ c)',
          'Condição de existência estrita: b ≠ 0',
          'Impossibilidade de divisão por zero: 0 · x = 0 ≠ 1 para todo x real',
        ],
        description:
          'Dividir a por b é multiplicar a pelo recíproco b⁻¹ de b. O zero é absorvente na multiplicação, logo não admite inverso multiplicativo, tornando a divisão por zero uma indeterminação / operação proibida no corpo.',
      },
    ],
    relationshipSummary:
      'Em resumo: Subtração é a Adição composta com a involução do Inverso Aditivo (-x). Divisão é a Multiplicação composta com a involução do Inverso Multiplicativo (x⁻¹). Juntas, elas operam em perfeita harmonia através da propriedade distributiva.',
  });
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve dist estático
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Calculadora Server rodando em http://localhost:${PORT}`);
  });
}

startServer();
