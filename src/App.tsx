import { useState, useEffect } from 'react';
import {
  Calculator as CalcIcon,
  BookOpen,
  Cpu,
  History,
  Command,
  Info,
} from 'lucide-react';
import { Calculator } from './components/Calculator';
import { MathTheoryModal } from './components/MathTheoryModal';
import { IEEE754ComparisonModal } from './components/IEEE754ComparisonModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { MathOverviewCard } from './components/MathOverviewCard';
import type { CalculationHistoryItem, MathTheoryResponse, PresetCalculation } from './types/calculator';

export default function App() {
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isIEEEOpen, setIsIEEEOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [theoryData, setTheoryData] = useState<MathTheoryResponse | null>(null);
  const [presetCalculation, setPresetCalculation] = useState<PresetCalculation | null>(null);

  // Load theory from backend API
  useEffect(() => {
    fetch('/api/theory')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTheoryData(data);
      })
      .catch((err) => console.warn('Could not prefetch theory:', err));
  }, []);

  // Save history to localStorage
  const handleCalculationCompleted = (item: CalculationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('calc_history', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('calc_history');
    } catch {
      // ignore
    }
  };

  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    setPresetCalculation({
      id: Date.now() + Math.random(),
      op1: item.operand1,
      op: item.operator,
      op2: item.operand2,
    });
  };

  const handleApplyPreset = (op1: string, op: '+' | '-' | '*' | '/', op2: string) => {
    setPresetCalculation({
      id: Date.now() + Math.random(),
      op1,
      op,
      op2,
    });
  };

  const handleClearPreset = () => {
    setPresetCalculation(null);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between selection:bg-indigo-500/30">
      {/* Background radial ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#090c14]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <CalcIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-base tracking-tight">
                Calculadora
              </h1>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsIEEEOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 transition-all flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Decimal vs Float</span>
            </button>

            <button
              onClick={() => setIsTheoryOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/30 transition-all flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Fundamentos Matemáticos</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="relative p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
              title="Histórico"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-[#090c14]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col items-center justify-center gap-8">
        {/* Center Grid: Calculator & Context */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Calculator */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center w-full">
            <Calculator
              onOpenTheory={() => setIsTheoryOpen(true)}
              onOpenIEEE={() => setIsIEEEOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              history={history}
              onCalculationCompleted={handleCalculationCompleted}
              presetCalculation={presetCalculation}
              onClearPreset={handleClearPreset}
            />
          </div>

          {/* Right column: Pedagogical Overview Card */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4 w-full">
            <MathOverviewCard
              onLoadExpression={handleApplyPreset}
              onOpenFullModal={() => setIsTheoryOpen(true)}
            />

            {/* Quick architectural & engineering card */}
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-slate-200">
                  Arquitetura Full-Stack: Python Backend + React Frontend
                </p>
                <p className="leading-relaxed">
                  Cada cálculo é avaliado no backend pelo motor Python utilizando{' '}
                  <code className="text-indigo-300 font-mono">decimal.Decimal</code> com contexto de 50 dígitos de precisão. O frontend interage via <code className="text-indigo-300 font-mono">/api/calculate</code> com suporte completo a atalhos de teclado e feedback tátil acústico.
                </p>
              </div>
            </div>

            {/* Keyboard shortcut guide */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Command className="w-3.5 h-3.5 text-indigo-400" />
                <span>Atalhos de Teclado:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">0-9</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">+ − * /</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Enter / =</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Backspace (DEL)</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">Esc (AC)</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <MathTheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
        theory={theoryData}
        onApplyExample={handleApplyPreset}
      />

      <IEEE754ComparisonModal
        isOpen={isIEEEOpen}
        onClose={() => setIsIEEEOpen(false)}
        onApplyCalculation={handleApplyPreset}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
      />
    </div>
  );
}
