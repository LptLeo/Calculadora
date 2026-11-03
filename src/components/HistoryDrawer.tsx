import React from 'react';
import { History, Trash2, X, Copy, Check, CornerDownLeft } from 'lucide-react';
import type { CalculationHistoryItem } from '../types/calculator';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: CalculationHistoryItem) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md h-full bg-[#0d101a] border-l border-slate-800 p-6 flex flex-col shadow-2xl text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Histórico de Cálculos</h3>
              <p className="text-xs text-slate-400">{history.length} operações registradas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Limpar Histórico"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <History className="w-12 h-12 stroke-[1.5] mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum cálculo registrado ainda.</p>
              <p className="text-xs text-slate-600 mt-1">Realize cálculos para visualizá-los aqui com detalhes algébricos.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="font-mono">{item.operand1} {item.operatorSymbol} {item.operand2}</span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <div className="text-lg font-bold font-mono text-white mb-2 flex items-center justify-between">
                  <span>= {item.result}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(item.id, item.result)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Copiar resultado"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        onSelectHistoryItem(item);
                        onClose();
                      }}
                      className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors"
                      title="Carregar na calculadora"
                    >
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-300/90 font-mono bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/10">
                  {item.algebraicExplanation}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                const text = history
                  .map((h) => `${h.operand1} ${h.operatorSymbol} ${h.operand2} = ${h.result} [${h.algebraicExplanation}]`)
                  .join('\n');
                navigator.clipboard.writeText(text);
                setCopiedId('all');
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              {copiedId === 'all' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === 'all' ? 'Histórico Copiado!' : 'Copiar Todo o Histórico'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
