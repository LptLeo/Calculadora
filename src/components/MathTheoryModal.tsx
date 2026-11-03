import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  CornerDownLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import type { MathTheoryResponse, CalculationResult } from '../types/calculator';

interface MathTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theory: MathTheoryResponse | null;
  onApplyExample: (a: string, op: '+' | '-' | '*' | '/', b: string) => void;
}

interface OperationState {
  op1: string;
  op2: string;
  result: CalculationResult | null;
  isLoading: boolean;
  error: string | null;
}

export const MathTheoryModal: React.FC<MathTheoryModalProps> = ({
  isOpen,
  onClose,
  onApplyExample,
}) => {
  // Estado interativo de teste para cada uma das 4 operações dentro do próprio modal
  const [opStates, setOpStates] = useState<Record<string, OperationState>>({
    add: { op1: '14.5', op2: '35.5', result: null, isLoading: false, error: null },
    sub: { op1: '42', op2: '19', result: null, isLoading: false, error: null },
    mul: { op1: '12.5', op2: '8', result: null, isLoading: false, error: null },
    div: { op1: '100', op2: '8', result: null, isLoading: false, error: null },
  });

  if (!isOpen) return null;

  const handleInputChange = (key: string, field: 'op1' | 'op2', value: string) => {
    setOpStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleExecuteModalTest = async (key: string, opSymbol: '+' | '-' | '*' | '/') => {
    const current = opStates[key];
    setOpStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], isLoading: true, error: null },
    }));

    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operand1: current.op1,
          operand2: current.op2,
          operator: opSymbol,
        }),
      });

      const data: CalculationResult = await response.json();

      setOpStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isLoading: false,
          result: data,
          error: data.success ? null : (data.error || 'Erro na operação'),
        },
      }));
    } catch (err) {
      setOpStates((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          isLoading: false,
          error: 'Falha de comunicação com o motor de cálculo.',
        },
      }));
    }
  };

  const handleApplyToMainCalc = (op1: string, op: '+' | '-' | '*' | '/', op2: string) => {
    onApplyExample(op1, op, op2);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f131f] border border-slate-700/60 rounded-3xl shadow-2xl text-slate-200 p-5 sm:p-7 md:p-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Corpo Algébrico (ℝ, +, ·)
                </span>
                <span className="text-xs text-slate-400">Laboratório & Teoria</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Fundamentos Matemáticos & Teste Interativo
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Thesis Card */}
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                Princípio Unificador dos Corpos Numéricos
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
                Em matemática rigorosa, existem apenas <strong>duas operações primitivas</strong>: a <strong>Adição</strong> e a <strong>Multiplicação</strong>. A subtração e a divisão <strong>não são operações autônomas</strong>, mas sim a aplicação dos respectivos <em>inversos algébricos</em> (elemento simétrico $-b$ e elemento recíproco $b^{-1}$).
              </p>
            </div>
          </div>
        </div>

        {/* 4 Operations Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          {/* 1. ADIÇÃO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center font-mono text-sm">
                    +
                  </span>
                  <h3 className="font-semibold text-white text-sm">1. Adição (Translação Linear)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                  Primitiva
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Acumulação contínua na reta real. Elemento neutro: <strong>0</strong> (<code className="text-indigo-300 font-mono">a + 0 = a</code>).
              </p>

              {/* Interactive testing inputs */}
              <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Testar Adição no Motor:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opStates.add.op1}
                    onChange={(e) => handleInputChange('add', 'op1', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Op 1"
                  />
                  <span className="text-indigo-400 font-bold font-mono">+</span>
                  <input
                    type="text"
                    value={opStates.add.op2}
                    onChange={(e) => handleInputChange('add', 'op2', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="Op 2"
                  />
                  <button
                    onClick={() => handleExecuteModalTest('add', '+')}
                    disabled={opStates.add.isLoading}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1 transition-all shrink-0"
                    title="Calcular teste no motor"
                  >
                    {opStates.add.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>Calcular</span>
                  </button>
                </div>

                {/* Result breakdown inside modal */}
                {opStates.add.result && (
                  <div className="mt-2.5 p-2 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs animate-fade-in font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      Resultado: {opStates.add.result.result}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {opStates.add.result.algebraicExplanation}
                    </div>
                  </div>
                )}
                {opStates.add.error && (
                  <div className="mt-2 text-rose-400 text-xs font-mono">{opStates.add.error}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleApplyToMainCalc(opStates.add.op1, '+', opStates.add.op2)}
              className="mt-2 w-full py-2 px-3 text-xs rounded-xl bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-slate-700/60 hover:border-indigo-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Carregar na Calculadora Principal ({opStates.add.op1} + {opStates.add.op2})</span>
            </button>
          </div>

          {/* 2. SUBTRAÇÃO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center font-mono text-sm">
                    −
                  </span>
                  <h3 className="font-semibold text-white text-sm">2. Subtração (Inverso Aditivo)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                  Simétrico
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Definição formal: <code className="text-amber-300 font-mono">a − b ≡ a + (−b)</code>, onde <code className="text-amber-300 font-mono">b + (−b) = 0</code>.
              </p>

              {/* Interactive testing inputs */}
              <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Testar Subtração no Motor:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opStates.sub.op1}
                    onChange={(e) => handleInputChange('sub', 'op1', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Op 1"
                  />
                  <span className="text-amber-400 font-bold font-mono">−</span>
                  <input
                    type="text"
                    value={opStates.sub.op2}
                    onChange={(e) => handleInputChange('sub', 'op2', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    placeholder="Op 2"
                  />
                  <button
                    onClick={() => handleExecuteModalTest('sub', '-')}
                    disabled={opStates.sub.isLoading}
                    className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium flex items-center gap-1 transition-all shrink-0"
                    title="Calcular teste no motor"
                  >
                    {opStates.sub.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>Calcular</span>
                  </button>
                </div>

                {/* Result breakdown inside modal */}
                {opStates.sub.result && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-500/20 text-xs animate-fade-in font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      Resultado: {opStates.sub.result.result}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {opStates.sub.result.algebraicExplanation}
                    </div>
                  </div>
                )}
                {opStates.sub.error && (
                  <div className="mt-2 text-rose-400 text-xs font-mono">{opStates.sub.error}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleApplyToMainCalc(opStates.sub.op1, '-', opStates.sub.op2)}
              className="mt-2 w-full py-2 px-3 text-xs rounded-xl bg-slate-800 hover:bg-amber-600/30 text-amber-300 border border-slate-700/60 hover:border-amber-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Carregar na Calculadora Principal ({opStates.sub.op1} − {opStates.sub.op2})</span>
            </button>
          </div>

          {/* 3. MULTIPLICAÇÃO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center font-mono text-sm">
                    ×
                  </span>
                  <h3 className="font-semibold text-white text-sm">3. Multiplicação (Escalonamento)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                  Primitiva
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Dilatação linear. Elemento neutro: <strong>1</strong> | Elemento absorvente: <strong>0</strong>.
              </p>

              {/* Interactive testing inputs */}
              <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Testar Multiplicação no Motor:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opStates.mul.op1}
                    onChange={(e) => handleInputChange('mul', 'op1', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="Op 1"
                  />
                  <span className="text-cyan-400 font-bold font-mono">×</span>
                  <input
                    type="text"
                    value={opStates.mul.op2}
                    onChange={(e) => handleInputChange('mul', 'op2', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="Op 2"
                  />
                  <button
                    onClick={() => handleExecuteModalTest('mul', '*')}
                    disabled={opStates.mul.isLoading}
                    className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1 transition-all shrink-0"
                    title="Calcular teste no motor"
                  >
                    {opStates.mul.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>Calcular</span>
                  </button>
                </div>

                {/* Result breakdown inside modal */}
                {opStates.mul.result && (
                  <div className="mt-2.5 p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-xs animate-fade-in font-mono">
                    <div className="text-emerald-400 font-bold text-sm">
                      Resultado: {opStates.mul.result.result}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {opStates.mul.result.algebraicExplanation}
                    </div>
                  </div>
                )}
                {opStates.mul.error && (
                  <div className="mt-2 text-rose-400 text-xs font-mono">{opStates.mul.error}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleApplyToMainCalc(opStates.mul.op1, '*', opStates.mul.op2)}
              className="mt-2 w-full py-2 px-3 text-xs rounded-xl bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Carregar na Calculadora Principal ({opStates.mul.op1} × {opStates.mul.op2})</span>
            </button>
          </div>

          {/* 4. DIVISÃO */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center font-mono text-sm">
                    ÷
                  </span>
                  <h3 className="font-semibold text-white text-sm">4. Divisão (Inverso Multiplicativo)</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-rose-300 font-mono">
                  Recíproco
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Definição: <code className="text-rose-300 font-mono">a ÷ b ≡ a × b⁻¹</code> com <code className="text-rose-400 font-bold font-mono">b ≠ 0</code>.
              </p>

              {/* Interactive testing inputs */}
              <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 mb-2">Testar Divisão no Motor:</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opStates.div.op1}
                    onChange={(e) => handleInputChange('div', 'op1', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    placeholder="Op 1"
                  />
                  <span className="text-rose-400 font-bold font-mono">÷</span>
                  <input
                    type="text"
                    value={opStates.div.op2}
                    onChange={(e) => handleInputChange('div', 'op2', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                    placeholder="Op 2"
                  />
                  <button
                    onClick={() => handleExecuteModalTest('div', '/')}
                    disabled={opStates.div.isLoading}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1 transition-all shrink-0"
                    title="Calcular teste no motor"
                  >
                    {opStates.div.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>Calcular</span>
                  </button>
                </div>

                {/* Result breakdown inside modal */}
                {opStates.div.result && (
                  <div className={`mt-2.5 p-2 rounded-lg border text-xs animate-fade-in font-mono ${
                    opStates.div.result.success
                      ? 'bg-rose-950/40 border-rose-500/20'
                      : 'bg-red-950/60 border-red-500/40 text-red-300'
                  }`}>
                    <div className="font-bold text-sm">
                      {opStates.div.result.success ? `Resultado: ${opStates.div.result.result}` : opStates.div.result.error}
                    </div>
                    {opStates.div.result.algebraicExplanation && (
                      <div className="text-[11px] text-slate-300 mt-0.5">
                        {opStates.div.result.algebraicExplanation}
                      </div>
                    )}
                  </div>
                )}
                {opStates.div.error && !opStates.div.result && (
                  <div className="mt-2 text-rose-400 text-xs font-mono">{opStates.div.error}</div>
                )}
              </div>
            </div>

            <button
              onClick={() => handleApplyToMainCalc(opStates.div.op1, '/', opStates.div.op2)}
              className="mt-2 w-full py-2 px-3 text-xs rounded-xl bg-slate-800 hover:bg-rose-600/30 text-rose-300 border border-slate-700/60 hover:border-rose-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Carregar na Calculadora Principal ({opStates.div.op1} ÷ {opStates.div.op2})</span>
            </button>
          </div>
        </div>

        {/* Inter-relation table */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Síntese de Inter-relação das Operações no Corpo (ℝ, +, ·)</span>
          </h4>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2 px-3">Eixo Algébrico</th>
                  <th className="py-2 px-3">Operação Primitiva</th>
                  <th className="py-2 px-3">Neutro</th>
                  <th className="py-2 px-3">Operação Inversa</th>
                  <th className="py-2 px-3">Restrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                <tr>
                  <td className="py-2 px-3 text-indigo-400 font-semibold">Aditivo</td>
                  <td className="py-2 px-3">Adição: a + b</td>
                  <td className="py-2 px-3">0</td>
                  <td className="py-2 px-3 text-amber-300">Subtração: a + (-b)</td>
                  <td className="py-2 px-3 text-emerald-400">Total em ℝ</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-cyan-400 font-semibold">Multiplicativo</td>
                  <td className="py-2 px-3">Multiplicação: a · b</td>
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3 text-rose-300">Divisão: a · b⁻¹</td>
                  <td className="py-2 px-3 text-rose-400">b ≠ 0 (zero absorvente)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            Entendido, Voltar à Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};
