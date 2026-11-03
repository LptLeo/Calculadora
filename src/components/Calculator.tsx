import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  History,
  BookOpen,
  Cpu,
  Delete,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { playKeyClick } from '../utils/audio';
import type { CalculationResult, CalculationHistoryItem, PresetCalculation } from '../types/calculator';

interface CalculatorProps {
  onOpenTheory: () => void;
  onOpenIEEE: () => void;
  onOpenHistory: () => void;
  history: CalculationHistoryItem[];
  onCalculationCompleted: (item: CalculationHistoryItem) => void;
  presetCalculation?: PresetCalculation | null;
  onClearPreset?: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  onOpenTheory,
  onOpenIEEE,
  onOpenHistory,
  history,
  onCalculationCompleted,
  presetCalculation,
  onClearPreset,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [prevOperand, setPrevOperand] = useState<string | null>(null);
  const [operator, setOperator] = useState<'+' | '-' | '*' | '/' | null>(null);
  const [waitingForNextOperand, setWaitingForNextOperand] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCalculation, setLastCalculation] = useState<CalculationResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeKeyHighlight, setActiveKeyHighlight] = useState<string | null>(null);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);
  const lastHandledPresetId = useRef<number | null>(null);

  // Symbol mapping
  const symbolMap: Record<string, string> = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
  };

  const triggerKeyVisual = useCallback((keyId: string) => {
    setActiveKeyHighlight(keyId);
    setTimeout(() => {
      setActiveKeyHighlight((cur) => (cur === keyId ? null : cur));
    }, 140);
  }, []);

  // Copy display value to clipboard
  const handleCopyDisplay = () => {
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Append digit
  const inputDigit = useCallback((digit: string) => {
    playKeyClick('num', soundEnabled);
    triggerKeyVisual(digit);
    setErrorMessage(null);

    setDisplayValue((prev) => {
      if (waitingForNextOperand) {
        setWaitingForNextOperand(false);
        return digit;
      }
      return prev === '0' ? digit : prev + digit;
    });
  }, [waitingForNextOperand, soundEnabled, triggerKeyVisual]);

  // Decimal point
  const inputDot = useCallback(() => {
    playKeyClick('num', soundEnabled);
    triggerKeyVisual('.');
    setErrorMessage(null);

    setDisplayValue((prev) => {
      if (waitingForNextOperand) {
        setWaitingForNextOperand(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [waitingForNextOperand, soundEnabled, triggerKeyVisual]);

  // Backspace / Delete
  const deleteLastChar = useCallback(() => {
    playKeyClick('clear', soundEnabled);
    triggerKeyVisual('DEL');
    setErrorMessage(null);

    setDisplayValue((prev) => {
      if (waitingForNextOperand) return prev;
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [waitingForNextOperand, soundEnabled, triggerKeyVisual]);

  // Clear all (AC)
  const clearAll = useCallback(() => {
    playKeyClick('clear', soundEnabled);
    triggerKeyVisual('AC');
    setDisplayValue('0');
    setPrevOperand(null);
    setOperator(null);
    setWaitingForNextOperand(false);
    setErrorMessage(null);
  }, [soundEnabled, triggerKeyVisual]);

  // Inverter sinal (±) - Inverso aditivo
  const toggleSign = useCallback(() => {
    playKeyClick('op', soundEnabled);
    triggerKeyVisual('±');
    setErrorMessage(null);

    setDisplayValue((prev) => {
      if (prev === '0') return '0';
      if (prev.startsWith('-')) {
        return prev.slice(1);
      }
      return '-' + prev;
    });
  }, [soundEnabled, triggerKeyVisual]);

  // Porcentagem (%)
  const inputPercent = useCallback(() => {
    playKeyClick('op', soundEnabled);
    triggerKeyVisual('%');
    setErrorMessage(null);

    setDisplayValue((prev) => {
      const num = parseFloat(prev);
      if (isNaN(num)) return prev;
      // Precisão simples local para percentual
      const res = (num / 100).toString();
      return res;
    });
  }, [soundEnabled, triggerKeyVisual]);

  // Perform Calculation through Python Backend
  const executeCalculation = useCallback(
    async (op1Str: string, opSymbol: '+' | '-' | '*' | '/', op2Str: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            operand1: op1Str,
            operand2: op2Str,
            operator: opSymbol,
          }),
        });

        const data: CalculationResult = await response.json();

        if (response.ok && data.success) {
          setDisplayValue(data.result);
          setLastCalculation(data);
          const historyItem: CalculationHistoryItem = {
            ...data,
            id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            timestamp: Date.now(),
          };
          onCalculationCompleted(historyItem);
          setPrevOperand(null);
          setOperator(null);
          setWaitingForNextOperand(true);
        } else {
          const errText = data.error || 'Erro, Divisão por Zero';
          setErrorMessage(errText);
          setDisplayValue(errText);
          if (data.algebraicExplanation) {
            setLastCalculation(data);
          }
          setPrevOperand(null);
          setOperator(null);
          setWaitingForNextOperand(true);
        }
      } catch (err) {
        console.error('Calculation API call error:', err);
        // Fallback local caso haja interrupção temporária de rede
        setErrorMessage('Erro, Divisão por Zero');
        setDisplayValue('Erro, Divisão por Zero');
        setWaitingForNextOperand(true);
      } finally {
        setIsLoading(false);
      }
    },
    [onCalculationCompleted]
  );

  // Set Operator (+, -, *, /)
  const chooseOperator = useCallback(
    (nextOperator: '+' | '-' | '*' | '/') => {
      playKeyClick('op', soundEnabled);
      triggerKeyVisual(nextOperator);
      setErrorMessage(null);

      if (operator && !waitingForNextOperand && prevOperand !== null) {
        // Se já havia um operador e um operando prévio, computa primeiro em cadeia
        executeCalculation(prevOperand, operator, displayValue);
        setPrevOperand(displayValue);
        setOperator(nextOperator);
        setWaitingForNextOperand(true);
        return;
      }

      setPrevOperand(displayValue);
      setOperator(nextOperator);
      setWaitingForNextOperand(true);
    },
    [operator, waitingForNextOperand, prevOperand, displayValue, soundEnabled, triggerKeyVisual, executeCalculation]
  );

  // Equals (=)
  const handleEquals = useCallback(() => {
    playKeyClick('equals', soundEnabled);
    triggerKeyVisual('=');

    if (operator === null || prevOperand === null) {
      return;
    }

    executeCalculation(prevOperand, operator, displayValue);
  }, [operator, prevOperand, displayValue, soundEnabled, triggerKeyVisual, executeCalculation]);

  // Handle external presets (e.g. from Theory or IEEE modal)
  useEffect(() => {
    if (presetCalculation && presetCalculation.id !== lastHandledPresetId.current) {
      lastHandledPresetId.current = presetCalculation.id;
      setDisplayValue(presetCalculation.op1);
      setPrevOperand(presetCalculation.op1);
      setOperator(presetCalculation.op);
      executeCalculation(presetCalculation.op1, presetCalculation.op, presetCalculation.op2);
      
      const opSym = symbolMap[presetCalculation.op] || presetCalculation.op;
      setToastFeedback(`Exemplo aplicado: ${presetCalculation.op1} ${opSym} ${presetCalculation.op2}`);
      setTimeout(() => setToastFeedback(null), 3000);

      onClearPreset?.();
    }
  }, [presetCalculation, executeCalculation, onClearPreset]);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea if any
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        inputDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        inputDot();
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        e.preventDefault();
        chooseOperator(e.key as '+' | '-' | '*' | '/');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        deleteLastChar();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearAll();
      } else if (e.key === '%') {
        e.preventDefault();
        inputPercent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputDigit, inputDot, chooseOperator, handleEquals, deleteLastChar, clearAll, inputPercent]);

  // Dynamic font sizing for main display to prevent overflows
  const getDisplayFontSize = (text: string) => {
    const len = text.length;
    if (len <= 8) return 'text-4xl md:text-5xl';
    if (len <= 12) return 'text-3xl md:text-4xl';
    if (len <= 16) return 'text-2xl md:text-3xl';
    if (len <= 24) return 'text-xl md:text-2xl';
    return 'text-base md:text-lg';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card */}
      <div className="relative bg-[#111420]/95 backdrop-blur-xl border border-slate-800/90 rounded-[32px] p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(99,102,241,0.06)] transition-all">
        {/* Top utility action bar */}
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Python 3.10 Decimal
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
              title={soundEnabled ? 'Desativar som de tecla' : 'Ativar som de tecla'}
              aria-label="Alternar som"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenIEEE}
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/70 transition-colors"
              title="Comparar com Ponto Flutuante IEEE 754"
              aria-label="Ponto Flutuante"
            >
              <Cpu className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenTheory}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800/70 transition-colors"
              title="Explicação Matemática & Álgebra"
              aria-label="Teoria Algébrica"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenHistory}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 transition-colors"
              title="Histórico de Cálculos"
              aria-label="Histórico"
            >
              <History className="w-4 h-4" />
              {history.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#111420]" />
              )}
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="bg-[#090b12] border border-slate-800/90 rounded-2xl p-4 sm:p-5 mb-5 shadow-inner flex flex-col justify-between min-h-[125px] relative group overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Upper preview expression */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 h-5">
            {toastFeedback ? (
              <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-sans font-medium animate-fade-in truncate">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{toastFeedback}</span>
              </span>
            ) : (
              <span className="truncate pr-2">
                {prevOperand !== null && operator !== null ? (
                  <>
                    {prevOperand} <span className="text-indigo-400 font-bold">{symbolMap[operator] || operator}</span>
                  </>
                ) : lastCalculation ? (
                  <>
                    {lastCalculation.operand1} {lastCalculation.operatorSymbol} {lastCalculation.operand2} =
                  </>
                ) : (
                  'Pronta para calcular'
                )}
              </span>
            )}

            {isLoading && (
              <span className="flex items-center gap-1 text-[11px] text-indigo-400 font-sans shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Processando...
              </span>
            )}
          </div>

          {/* Main output display */}
          <div className="flex items-end justify-between gap-3 mt-2">
            <div
              className={`font-mono-numbers font-bold text-white tracking-tight break-all ${getDisplayFontSize(
                displayValue
              )} select-all`}
            >
              {displayValue}
            </div>

            <button
              onClick={handleCopyDisplay}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/80 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              title="Copiar resultado"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Error notice if any */}
          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2 pt-2 border-t border-rose-900/30">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Algebraic Insight Ribbon */}
        {lastCalculation && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs animate-fade-in">
            <div className="flex items-center justify-between text-indigo-300 font-medium mb-1">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{lastCalculation.algebraicConcept}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-900/50 text-indigo-300">
                Corpo (ℝ, +, ·)
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-300 leading-tight">
              {lastCalculation.algebraicExplanation}
            </p>
          </div>
        )}

        {/* Calculator Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className={`h-14 sm:h-16 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === 'AC'
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800/80 hover:bg-slate-800 text-rose-400 border border-slate-700/60'
            }`}
          >
            AC
          </button>

          <button
            onClick={toggleSign}
            className={`h-14 sm:h-16 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '±'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
            title="Inverter sinal (Inverso Aditivo: -x)"
          >
            ±
          </button>

          <button
            onClick={inputPercent}
            className={`h-14 sm:h-16 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '%'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
            }`}
          >
            %
          </button>

          <button
            onClick={() => chooseOperator('/')}
            className={`h-14 sm:h-16 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              operator === '/' || activeKeyHighlight === '/'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30'
            }`}
            title="Divisão (Inverso Multiplicativo: × b⁻¹)"
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputDigit('7')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '7'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            7
          </button>

          <button
            onClick={() => inputDigit('8')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '8'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            8
          </button>

          <button
            onClick={() => inputDigit('9')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '9'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            9
          </button>

          <button
            onClick={() => chooseOperator('*')}
            className={`h-14 sm:h-16 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              operator === '*' || activeKeyHighlight === '*'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30'
            }`}
            title="Multiplicação (Escalonamento Linear)"
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputDigit('4')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '4'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            4
          </button>

          <button
            onClick={() => inputDigit('5')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '5'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            5
          </button>

          <button
            onClick={() => inputDigit('6')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '6'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            6
          </button>

          <button
            onClick={() => chooseOperator('-')}
            className={`h-14 sm:h-16 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              operator === '-' || activeKeyHighlight === '-'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30'
            }`}
            title="Subtração (Soma com Simétrico: + (-b))"
          >
            −
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputDigit('1')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '1'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            1
          </button>

          <button
            onClick={() => inputDigit('2')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '2'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            2
          </button>

          <button
            onClick={() => inputDigit('3')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '3'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            3
          </button>

          <button
            onClick={() => chooseOperator('+')}
            className={`h-14 sm:h-16 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              operator === '+' || activeKeyHighlight === '+'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30'
            }`}
            title="Adição (Translação Linear)"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputDigit('0')}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-medium text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '0'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            0
          </button>

          <button
            onClick={inputDot}
            className={`h-14 sm:h-16 rounded-2xl font-mono-numbers font-bold text-lg sm:text-xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === '.'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-800'
            }`}
          >
            .
          </button>

          <button
            onClick={deleteLastChar}
            className={`h-14 sm:h-16 rounded-2xl font-semibold transition-all duration-150 flex items-center justify-center select-none active:scale-95 ${
              activeKeyHighlight === 'DEL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
            title="Apagar último dígito"
          >
            <Delete className="w-5 h-5" />
          </button>

          <button
            onClick={handleEquals}
            disabled={isLoading}
            className={`h-14 sm:h-16 rounded-2xl font-bold text-xl sm:text-2xl transition-all duration-150 flex items-center justify-center select-none active:scale-95 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ${
              activeKeyHighlight === '=' ? 'scale-95 ring-2 ring-indigo-300' : ''
            }`}
            title="Calcular (Enter / =)"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
