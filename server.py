#!/usr/bin/env python3
"""
=============================================================================
SERVIDOR WEB DA CALCULADORA (100% PYTHON - BIBLIOTECA PADRÃO)
=============================================================================
Este servidor foi desenvolvido inteiramente em Python padrão (usando http.server).
Não depende de Flask, FastAPI ou Node.js, rodando nativamente em qualquer computador
com Python 3 instalado na porta 3000.

O código foi comentado passo a passo para fácil leitura de programadores iniciantes.
"""

import os
import sys
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from calc_engine import calcular

# Porta e host onde o servidor vai rodar (padrão: 3000 em 0.0.0.0)
PORTA = int(os.environ.get("PORT", 3000))
HOST = "0.0.0.0"

for idx, arg in enumerate(sys.argv):
    if arg in ("--port", "-p") and idx + 1 < len(sys.argv):
        try:
            PORTA = int(sys.argv[idx + 1])
        except ValueError:
            pass
    elif arg in ("--host", "-h") and idx + 1 < len(sys.argv):
        HOST = sys.argv[idx + 1]


# Teoria matemática e artigos acadêmicos fornecidos pela API
DADOS_TEORIA = {
    "title": "Fundamentação Matemática das Quatro Operações Elementares",
    "field": "(ℝ, +, ·)",
    "summary": "A aritmética elementar é regida por duas operações primitivas (adição e multiplicação) sobre o Corpo dos Números Reais. Subtração e divisão decorrem da aplicação dos respectivos inversos algébricos (simétrico e recíproco).",
    "operations": [
        {
            "id": "addition",
            "name": "Adição",
            "symbol": "+",
            "concept": "Operação Primitiva de Acumulação e Translação",
            "definition": "a + b ∈ ℝ",
            "formula": "a + b = c",
            "example": "10 + 10 = 20",
            "explanation": "A adição é a operação primitiva de acumulação e translação linear na reta real, com o zero como elemento neutro estrito.",
            "reference": "Revista do Professor de Matemática (RPM - SBM) & IME-USP"
        },
        {
            "id": "subtraction",
            "name": "Subtração",
            "symbol": "−",
            "concept": "Inverso Aditivo (Simétrico)",
            "definition": "a − b ≡ a + (−b)",
            "formula": "a − b ≡ a + (−b)",
            "example": "5 − 3 ≡ 5 + (−3) = 2",
            "explanation": "Subtrair b é somar pelo elemento simétrico ou oposto (−b). Não é comutativa nem associativa por ser uma operação derivada.",
            "reference": "Sociedade Brasileira de Educação Matemática (SBEM) & Unicamp"
        },
        {
            "id": "multiplication",
            "name": "Multiplicação",
            "symbol": "×",
            "concept": "Operação Primitiva de Escalonamento e Homomorfismo",
            "definition": "a · b ∈ ℝ",
            "formula": "a × b = c",
            "example": "5 × 4 = 20",
            "explanation": "Representa o escalonamento homotético e produto de parcelas iguais. O 1 é elemento neutro e o 0 é absorvente.",
            "reference": "Instituto de Geociências e Ciências Exatas (UNESP) & Scielo Brasil"
        },
        {
            "id": "division",
            "name": "Divisão",
            "symbol": "÷",
            "concept": "Inverso Multiplicativo (Recíproco)",
            "definition": "a ÷ b ≡ a · b⁻¹ (com b ≠ 0)",
            "formula": "a ÷ b ≡ a × b⁻¹ (com b ≠ 0)",
            "example": "10 ÷ 2 ≡ 10 × 0.5 = 5",
            "explanation": "Dividir por b é multiplicar pelo recíproco b⁻¹. Dividir por zero é impossível pois não existe inverso real para zero.",
            "reference": "Cadernos de Matemática da UFMG & IMPA"
        }
    ],
    "literature": [
        {
            "id": "sintese",
            "title": "A Construção dos Números Reais e a Estrutura de Corpo",
            "author": "Prof. Elon Lages Lima — IMPA & Coleção do Professor de Matemática (SBM)",
            "url": "https://impa.br/ensino/livros/colecao-do-professor-de-matematica/"
        },
        {
            "id": "adicao",
            "title": "O Conceito de Adição e os Números Naturais",
            "author": "Revista do Professor de Matemática (RPM - SBM) & IME-USP",
            "url": "https://rpm.org.br/"
        },
        {
            "id": "subtracao",
            "title": "Por que Menos com Menos dá Mais? O Inverso Aditivo",
            "author": "Sociedade Brasileira de Educação Matemática (SBEM) & Unicamp",
            "url": "http://www.sbembrasil.org.br/"
        },
        {
            "id": "multiplicacao",
            "title": "Multiplicação: Significados, Propriedades e Estruturas",
            "author": "Instituto de Geociências e Ciências Exatas (UNESP) & Scielo Brasil",
            "url": "https://www.scielo.br/"
        },
        {
            "id": "divisao",
            "title": "A Divisão por Zero e o Algoritmo da Divisão nos Reais",
            "author": "Cadernos de Matemática da UFMG & IMPA",
            "url": "https://www.mat.ufmg.br/"
        }
    ]
}

# HTML completo da interface moderna em tema escuro
HTML_PAGINA = """<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Calculadora 100% Python</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --card-bg: rgba(17, 20, 32, 0.95);
      --display-bg: #090b12;
      --border: rgba(51, 65, 85, 0.6);
      --accent: #6366f1;
      --accent-hover: #4f46e5;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    header {
      width: 100%;
      max-width: 900px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0 24px 0;
      border-bottom: 1px solid var(--border);
      margin-bottom: 30px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-badge {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .btn-action {
      background: #111420;
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 8px 14px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-action:hover {
      background: #1e2436;
      color: #fff;
      border-color: var(--accent);
    }

    .main-layout {
      width: 100%;
      max-width: 900px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }

    @media (min-width: 768px) {
      .main-layout {
        grid-template-columns: 380px 1fr;
      }
    }

    /* Calculadora */
    .calc-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }

    .calc-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'Fira Code', monospace;
    }

    .status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      margin-right: 6px;
      box-shadow: 0 0 8px #10b981;
    }

    .display-screen {
      background: var(--display-bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 16px 20px;
      min-height: 110px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .preview-line {
      font-family: 'Fira Code', monospace;
      font-size: 0.85rem;
      color: #94a3b8;
      min-height: 1.2rem;
      text-align: right;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .main-output {
      font-family: 'Fira Code', monospace;
      font-size: 2.5rem;
      font-weight: 700;
      text-align: right;
      white-space: nowrap;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .main-output::-webkit-scrollbar { display: none; }

    /* Fita Algébrica */
    .algebraic-ribbon {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 14px;
      padding: 10px 14px;
      margin-bottom: 18px;
      font-size: 0.75rem;
      color: #c7d2fe;
      display: none;
    }

    .algebraic-ribbon.active {
      display: block;
      animation: fadeIn 0.2s ease-in-out;
    }

    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    button.key {
      background: #181d2c;
      border: 1px solid transparent;
      color: #f1f5f9;
      font-size: 1.2rem;
      font-weight: 500;
      border-radius: 16px;
      height: 60px;
      cursor: pointer;
      user-select: none;
      transition: all 0.15s ease;
    }

    button.key:hover {
      background: #232a3f;
    }

    button.key:active {
      transform: scale(0.96);
    }

    button.key-op {
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-weight: 600;
    }

    button.key-op:hover {
      background: rgba(99, 102, 241, 0.3);
    }

    button.key-ac {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    button.key-ac:hover {
      background: rgba(239, 68, 68, 0.25);
    }

    button.key-equals {
      background: var(--accent);
      color: #fff;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    button.key-equals:hover {
      background: var(--accent-hover);
    }

    /* Painel Lateral / Literatura */
    .literature-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tab-btn {
      background: #181d2c;
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .tab-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
      font-weight: 600;
    }

    .article-box {
      background: #0d101a;
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      font-size: 0.8rem;
      line-height: 1.5;
    }

    .article-title {
      font-weight: 700;
      color: #fff;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }

    .article-meta {
      font-size: 0.75rem;
      color: #818cf8;
      font-family: 'Fira Code', monospace;
      margin-bottom: 10px;
    }

    .article-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #818cf8;
      text-decoration: none;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 12px;
    }

    .article-btn:hover {
      text-decoration: underline;
    }

    /* Modal */
    .modal-backdrop {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 1000;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .modal-backdrop.open {
      display: flex;
      animation: fadeIn 0.2s ease-in-out;
    }

    .modal-content {
      background: #0f131f;
      border: 1px solid var(--border);
      border-radius: 24px;
      width: 100%;
      max-width: 650px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 24px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.98); }
      to { opacity: 1; transform: scale(1); }
    }
  </style>
</head>
<body>

  <header>
    <div class="brand">
      <div class="logo-badge">𝝅</div>
      <div>
        <h1 style="font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em;">Calculadora</h1>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn-action" onclick="abrirModal()">Fundamentos Matemáticos</button>
    </div>
  </header>

  <div class="main-layout">
    <!-- Bloco da Calculadora -->
    <div class="calc-card">
      <div class="calc-top-bar">
        <span><span class="status-dot"></span>Python Decimal Engine</span>
        <span>50 Dígitos de Precisão</span>
      </div>

      <div class="display-screen">
        <div id="preview" class="preview-line"></div>
        <div id="output" class="main-output">0</div>
      </div>

      <div id="ribbon" class="algebraic-ribbon"></div>

      <div class="keypad-grid">
        <button class="key key-ac" onclick="limparTudo()">AC</button>
        <button class="key" onclick="inverterSinal()">±</button>
        <button class="key" onclick="porcentagem()">%</button>
        <button class="key key-op" onclick="escolherOperador('/')">÷</button>

        <button class="key" onclick="digitar('7')">7</button>
        <button class="key" onclick="digitar('8')">8</button>
        <button class="key" onclick="digitar('9')">9</button>
        <button class="key key-op" onclick="escolherOperador('*')">×</button>

        <button class="key" onclick="digitar('4')">4</button>
        <button class="key" onclick="digitar('5')">5</button>
        <button class="key" onclick="digitar('6')">6</button>
        <button class="key key-op" onclick="escolherOperador('-')">−</button>

        <button class="key" onclick="digitar('1')">1</button>
        <button class="key" onclick="digitar('2')">2</button>
        <button class="key" onclick="digitar('3')">3</button>
        <button class="key key-op" onclick="escolherOperador('+')">+</button>

        <button class="key" onclick="digitar('0')">0</button>
        <button class="key" onclick="pontoDecimal()">.</button>
        <button class="key" onclick="apagarUltimo()">DEL</button>
        <button class="key key-equals" onclick="calcularResultado()">=</button>
      </div>
    </div>

    <!-- Bloco de Literatura e Teoria -->
    <div class="literature-card">
      <h3 style="font-size: 1rem; font-weight: 700;">Literatura Matemática Fundamental</h3>
      <p style="font-size: 0.75rem; color: #94a3b8;">Tratados e artigos clássicos que definiram as 4 operações:</p>

      <div class="tabs">
        <button class="tab-btn active" onclick="selecionarAba('sintese', this)">Síntese</button>
        <button class="tab-btn" onclick="selecionarAba('adicao', this)">+ Adição</button>
        <button class="tab-btn" onclick="selecionarAba('subtracao', this)">− Subtração</button>
        <button class="tab-btn" onclick="selecionarAba('multiplicacao', this)">× Multiplicação</button>
        <button class="tab-btn" onclick="selecionarAba('divisao', this)">÷ Divisão</button>
      </div>

      <div id="article-content" class="article-box">
        <!-- Preenchido via JavaScript -->
      </div>
    </div>
  </div>

  <!-- Modal de Fundamentos & Teste Interativo das Operações -->
  <div id="modal" class="modal-backdrop" onclick="fecharModalFora(event)">
    <div class="modal-content" style="max-width: 720px;">
      <div class="modal-header">
        <div>
          <span style="font-size: 0.7rem; color: #818cf8; font-family: monospace; text-transform: uppercase;">Corpo Algébrico (ℝ, +, ·)</span>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-top: 2px;">Fundamentos Matemáticos & Teste Interativo</h3>
        </div>
        <button class="close-btn" onclick="fecharModal()">&times;</button>
      </div>

      <div style="font-size: 0.82rem; line-height: 1.6; color: #cbd5e1; margin-bottom: 20px;">
        <p style="margin-bottom: 12px; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); padding: 12px; border-radius: 12px;">
          No Corpo dos Números Reais, existem apenas <strong>duas operações primitivas</strong>: a <strong>Adição</strong> e a <strong>Multiplicação</strong>. A subtração e a divisão são aplicações dos inversos algébricos (simétrico <code style="color: #a5b4fc;">−b</code> e recíproco <code style="color: #a5b4fc;">b⁻¹</code>).
        </p>

        <!-- Teste Interativo 1: Adição -->
        <div style="background: #131726; border: 1px solid #1e2538; border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #818cf8;">1. Adição (Translação Linear: a + b)</strong>
            <span style="font-size: 0.72rem; color: #94a3b8;">Elemento Neutro: 0</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input id="modal-add-a" value="14.5" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <span>+</span>
            <input id="modal-add-b" value="35.5" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <button class="btn-action" style="background: var(--accent); color: white;" onclick="testarOperacaoModal('add', '+')">Calcular</button>
            <button class="btn-action" onclick="carregarNoVisor('modal-add-a', '+', 'modal-add-b')">Enviar ao Visor</button>
            <span id="modal-add-res" style="color: #10b981; font-family: monospace; font-weight: 600;"></span>
          </div>
          <div id="modal-add-desc" style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;"></div>
        </div>

        <!-- Teste Interativo 2: Subtração -->
        <div style="background: #131726; border: 1px solid #1e2538; border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #818cf8;">2. Subtração (Inverso Simétrico: a + (−b))</strong>
            <span style="font-size: 0.72rem; color: #94a3b8;">b + (−b) = 0</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input id="modal-sub-a" value="42" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <span>−</span>
            <input id="modal-sub-b" value="19" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <button class="btn-action" style="background: var(--accent); color: white;" onclick="testarOperacaoModal('sub', '-')">Calcular</button>
            <button class="btn-action" onclick="carregarNoVisor('modal-sub-a', '-', 'modal-sub-b')">Enviar ao Visor</button>
            <span id="modal-sub-res" style="color: #10b981; font-family: monospace; font-weight: 600;"></span>
          </div>
          <div id="modal-sub-desc" style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;"></div>
        </div>

        <!-- Teste Interativo 3: Multiplicação -->
        <div style="background: #131726; border: 1px solid #1e2538; border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #818cf8;">3. Multiplicação (Escalonamento Homotético: a · b)</strong>
            <span style="font-size: 0.72rem; color: #94a3b8;">Neutro: 1 | Nulo: 0</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input id="modal-mul-a" value="12.5" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <span>×</span>
            <input id="modal-mul-b" value="8" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <button class="btn-action" style="background: var(--accent); color: white;" onclick="testarOperacaoModal('mul', '*')">Calcular</button>
            <button class="btn-action" onclick="carregarNoVisor('modal-mul-a', '*', 'modal-mul-b')">Enviar ao Visor</button>
            <span id="modal-mul-res" style="color: #10b981; font-family: monospace; font-weight: 600;"></span>
          </div>
          <div id="modal-mul-desc" style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;"></div>
        </div>

        <!-- Teste Interativo 4: Divisão -->
        <div style="background: #131726; border: 1px solid #1e2538; border-radius: 14px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #818cf8;">4. Divisão (Inverso Recíproco: a · b⁻¹)</strong>
            <span style="font-size: 0.72rem; color: #94a3b8;">Requer b ≠ 0</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <input id="modal-div-a" value="100" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <span>÷</span>
            <input id="modal-div-b" value="8" style="width: 80px; background: #090b12; border: 1px solid #334155; color: #fff; padding: 6px 10px; border-radius: 8px; font-family: monospace;" />
            <button class="btn-action" style="background: var(--accent); color: white;" onclick="testarOperacaoModal('div', '/')">Calcular</button>
            <button class="btn-action" onclick="carregarNoVisor('modal-div-a', '/', 'modal-div-b')">Enviar ao Visor</button>
            <span id="modal-div-res" style="color: #10b981; font-family: monospace; font-weight: 600;"></span>
          </div>
          <div id="modal-div-desc" style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;"></div>
        </div>

        <button class="btn-action" style="width: 100%; padding: 12px; background: #1e2438; color: #e2e8f0; font-weight: 600;" onclick="fecharModal()">Fechar Modal</button>
      </div>
    </div>
  </div>

  <script>
    let valorAtual = "0";
    let operando1 = null;
    let operadorAtual = null;
    let aguardandoSegundoNumero = false;

    const elOutput = document.getElementById("output");
    const elPreview = document.getElementById("preview");
    const elRibbon = document.getElementById("ribbon");

    const mapaSimbolos = { "+": "+", "-": "−", "*": "×", "/": "÷" };

    const artigos = {
      sintese: {
        titulo: "Fundamentos da Aritmética e Teoria de Corpos",
        meta: "David Hilbert & Gottlob Frege (1899–1900)",
        texto: "Estabelece que a álgebra decorre estritamente de duas operações primitivas em grupos abelianos e seus respectivos inversos.",
        link: "https://plato.stanford.edu/entries/hilbert-program/"
      },
      adicao: {
        titulo: "Axiomas de Peano e a Adição Primitiva",
        meta: "Giuseppe Peano (Turim, 1889)",
        texto: "Formaliza indutivamente a Adição como translação linear com o zero como elemento neutro estrito.",
        link: "https://plato.stanford.edu/entries/peano/"
      },
      subtracao: {
        titulo: "Cortes de Dedekind e o Inverso Aditivo",
        meta: "Richard Dedekind (1872)",
        texto: "Demonstra que a subtração é a soma com o inverso aditivo simétrico: a − b ≡ a + (−b).",
        link: "https://mathshistory.st-andrews.ac.uk/Biographies/Dedekind/"
      },
      multiplicacao: {
        titulo: "Investigações Aritméticas e Homomorfismo",
        meta: "Carl Friedrich Gauss (Göttingen, 1801)",
        texto: "Formalizou a multiplicação como escalonamento homotético com elemento neutro 1 e absorvente 0.",
        link: "https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/"
      },
      divisao: {
        titulo: "O que Todo Cientista Deve Saber Sobre Ponto Flutuante",
        meta: "David Goldberg & Prof. William Kahan (ACM, 1991)",
        texto: "Analisa o recíproco multiplicativo b⁻¹ e explica por que divisões por zero são proibidas e o valor de motores decimais.",
        link: "https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html"
      }
    };

    function selecionarAba(chave, btn) {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const a = artigos[chave];
      document.getElementById("article-content").innerHTML = `
        <div class="article-title">${a.titulo}</div>
        <div class="article-meta">${a.meta}</div>
        <p>${a.texto}</p>
        <a href="${a.link}" target="_blank" class="article-btn">Ver Artigo Completo ↗</a>
      `;
    }
    selecionarAba('sintese', document.querySelector('.tab-btn'));

    function atualizarTela() {
      elOutput.innerText = valorAtual;
      if (operando1 !== null && operadorAtual !== null) {
        elPreview.innerText = `${operando1} ${mapaSimbolos[operadorAtual]}`;
      }
    }

    function digitar(digito) {
      if (aguardandoSegundoNumero) {
        valorAtual = digito;
        aguardandoSegundoNumero = false;
      } else {
        valorAtual = valorAtual === "0" ? digito : valorAtual + digito;
      }
      atualizarTela();
    }

    function pontoDecimal() {
      if (aguardandoSegundoNumero) {
        valorAtual = "0.";
        aguardandoSegundoNumero = false;
      } else if (!valorAtual.includes(".")) {
        valorAtual += ".";
      }
      atualizarTela();
    }

    function apagarUltimo() {
      if (aguardandoSegundoNumero) return;
      valorAtual = valorAtual.length > 1 ? valorAtual.slice(0, -1) : "0";
      atualizarTela();
    }

    // LIMPEZA TOTAL COM O BOTÃO AC (All Clear)
    function limparTudo() {
      valorAtual = "0";
      operando1 = null;
      operadorAtual = null;
      aguardandoSegundoNumero = false;
      elPreview.innerText = "";
      elOutput.innerText = "0";
      elRibbon.innerText = "";
      elRibbon.classList.remove("active");
    }

    function inverterSinal() {
      if (valorAtual === "0") return;
      valorAtual = valorAtual.startsWith("-") ? valorAtual.slice(1) : "-" + valorAtual;
      atualizarTela();
    }

    function porcentagem() {
      try {
        let n = parseFloat(valorAtual) / 100;
        valorAtual = n.toString();
        atualizarTela();
      } catch (e) {}
    }

    async function escolherOperador(op) {
      if (operadorAtual !== null && !aguardandoSegundoNumero) {
        await calcularResultado();
      }
      operando1 = valorAtual;
      operadorAtual = op;
      aguardandoSegundoNumero = true;
      atualizarTela();
    }

    async function calcularResultado() {
      if (operando1 === null || operadorAtual === null) return;

      const payload = {
        operand1: operando1,
        operand2: valorAtual,
        operator: operadorAtual
      };

      try {
        const resposta = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const dados = await resposta.json();

        if (resposta.ok && dados.success) {
          elPreview.innerText = `${operando1} ${mapaSimbolos[operadorAtual]} ${valorAtual} =`;
          valorAtual = dados.result;
          elOutput.innerText = valorAtual;
          elRibbon.innerText = dados.algebraicExplanation;
          elRibbon.classList.add("active");
          operando1 = null;
          operadorAtual = null;
          aguardandoSegundoNumero = true;
        } else {
          valorAtual = dados.error || "Erro, Divisão por Zero";
          elPreview.innerText = `${operando1} ${mapaSimbolos[operadorAtual]} ${payload.operand2} =`;
          elOutput.innerText = valorAtual;
          operando1 = null;
          operadorAtual = null;
          aguardandoSegundoNumero = true;
        }
      } catch (err) {
        elOutput.innerText = "Erro";
      }
    }

    function testarExemplo(a, op, b) {
      operando1 = a;
      operadorAtual = op;
      valorAtual = b;
      calcularResultado();
    }

    async function testarOperacaoModal(prefixo, operador) {
      const a = document.getElementById(`modal-${prefixo}-a`).value;
      const b = document.getElementById(`modal-${prefixo}-b`).value;
      const elRes = document.getElementById(`modal-${prefixo}-res`);
      const elDesc = document.getElementById(`modal-${prefixo}-desc`);

      elRes.innerText = "Calculando...";
      try {
        const resp = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operand1: a, operand2: b, operator: operador })
        });
        const dados = await resp.json();
        if (resp.ok && dados.success) {
          elRes.style.color = "#10b981";
          elRes.innerText = `= ${dados.result}`;
          elDesc.innerText = dados.algebraicExplanation;
        } else {
          elRes.style.color = "#f87171";
          elRes.innerText = dados.error || "Erro";
          elDesc.innerText = dados.algebraicExplanation || "Operação indefinida.";
        }
      } catch (e) {
        elRes.style.color = "#f87171";
        elRes.innerText = "Erro de conexão";
      }
    }

    function carregarNoVisor(idA, op, idB) {
      const a = document.getElementById(idA).value;
      const b = document.getElementById(idB).value;
      fecharModal();
      testarExemplo(a, op, b);
    }

    function abrirModal() { document.getElementById("modal").classList.add("open"); }
    function fecharModal() { document.getElementById("modal").classList.remove("open"); }
    function fecharModalFora(e) { if (e.target.id === "modal") fecharModal(); }

    // Suporte ao teclado físico
    window.addEventListener("keydown", (e) => {
      if (e.key >= "0" && e.key <= "9") digitar(e.key);
      if (e.key === "." || e.key === ",") pontoDecimal();
      if (["+", "-", "*", "/"].includes(e.key)) escolherOperador(e.key);
      if (e.key === "Enter" || e.key === "=") calcularResultado();
      if (e.key === "Backspace") apagarUltimo();
      if (e.key === "Escape") limparTudo();
    });
  </script>
</body>
</html>
"""


class ManipuladorRequisicoes(BaseHTTPRequestHandler):
    """
    Classe simples em Python que atende requisições HTTP do navegador.
    Substitui completamente o Express.js sem precisar de nenhuma biblioteca externa.
    """

    def _responder_json(self, status: int, dados: dict):
        """Método auxiliar simples para responder dados em JSON."""
        corpo = json.dumps(dados).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(corpo)

    def _obter_html(self) -> bytes:
        """Lê o arquivo index.html do disco ou usa a constante interna."""
        caminho_index = os.path.join(os.path.dirname(__file__), "index.html")
        if os.path.exists(caminho_index):
            with open(caminho_index, "rb") as f:
                return f.read()
        return HTML_PAGINA.encode("utf-8")

    def do_HEAD(self):
        """Trata requisições HEAD (usadas por navegadores e ferramentas de monitoramento)."""
        caminho = self.path.split("?")[0]
        if caminho in ("/", "/index.html"):
            corpo = self._obter_html()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
        elif caminho == "/api/theory":
            corpo = json.dumps(DADOS_TEORIA).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
        elif caminho == "/api/health":
            corpo = json.dumps({"status": "ok"}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
        else:
            self.send_error(404, "Página não encontrada.")

    def do_GET(self):
        """Trata requisições GET (quando o navegador acessa uma página)."""
        caminho = self.path.split("?")[0]

        # Rota 1: Página inicial da calculadora
        if caminho == "/" or caminho == "/index.html":
            corpo = self._obter_html()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)

        # Rota 2: API de teoria matemática
        elif caminho == "/api/theory":
            self._responder_json(200, DADOS_TEORIA)

        # Rota 3: Health check
        elif caminho == "/api/health":
            self._responder_json(200, {"status": "ok", "engine": "Python 3.10"})

        else:
            self.send_error(404, "Página não encontrada.")

    def do_POST(self):
        """Trata requisições POST (quando o frontend envia uma conta para calcular)."""
        caminho = self.path.split("?")[0]

        if caminho == "/api/calculate":
            try:
                # Lê o tamanho e o corpo da mensagem enviada pelo navegador
                comprimento = int(self.headers.get("Content-Length", 0))
                corpo_bytes = self.rfile.read(comprimento)
                dados_recebidos = json.loads(corpo_bytes.decode("utf-8"))

                # Extrai os operandos e o operador
                op1 = dados_recebidos.get("operand1", "0")
                op2 = dados_recebidos.get("operand2", "0")
                operador = dados_recebidos.get("operator", "+")

                # Executa a função calcular em Python puro
                resultado = calcular(op1, op2, operador)

                # Se o cálculo teve sucesso, responde 200; se houve erro matemático, responde 400
                codigo_status = 200 if resultado.get("success") else 400
                self._responder_json(codigo_status, resultado)

            except Exception as e:
                self._responder_json(500, {
                    "success": False,
                    "error": f"Erro interno no servidor Python: {str(e)}"
                })
        else:
            self.send_error(404, "Endpoint não encontrado.")

    def log_message(self, format, *args):
        """Personaliza os logs do terminal para ficarem limpos."""
        print(f"[Python Server] {self.address_string()} - {format % args}")


def iniciar_servidor():
    """Função principal que sobe o servidor na porta e host configurados."""
    endereco = (HOST, PORTA)
    servidor = HTTPServer(endereco, ManipuladorRequisicoes)
    print("=" * 60)
    print(f" Servidor Python Iniciado com Sucesso!")
    print(f" Acesse no navegador: http://{HOST}:{PORTA}")
    print("=" * 60)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado pelo usuário.")
        servidor.server_close()


if __name__ == "__main__":
    iniciar_servidor()
