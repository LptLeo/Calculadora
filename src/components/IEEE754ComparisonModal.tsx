import React from 'react';
import { X, Cpu, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface IEEE754ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCalculation: (op1: string, op: '+' | '-' | '*' | '/', op2: string) => void;
}

export const IEEE754ComparisonModal: React.FC<IEEE754ComparisonModalProps> = ({
  isOpen,
  onClose,
  onApplyCalculation,
}) => {
  if (!isOpen) return null;

  const comparisonCases: Array<{
    name: string;
    op1: string;
    op: '+' | '-' | '*' | '/';
    op2: string;
    standardFloat: string;
    pythonDecimal: string;
    why: string;
  }> = [
    {
      name: 'O Clássico 0.1 + 0.2',
      op1: '0.1',
      op: '+',
      op2: '0.2',
      standardFloat: '0.30000000000000004',
      pythonDecimal: '0.3',
      why: 'Em base 2 (IEEE 754), frações 1/10 e 2/10 são dízimas periódicas infinitas. O Python Decimal em base 10 preserva os valores exatos.',
    },
    {
      name: 'Subtração Financeira',
      op1: '1.03',
      op: '-',
      op2: '0.42',
      standardFloat: '0.6100000000000001',
      pythonDecimal: '0.61',
      why: 'Imprecisões na mantissa geram resíduos que causam discrepâncias em transações contábeis se não utilizado tipo Decimal.',
    },
    {
      name: 'Multiplicação de Centavos',
      op1: '0.7',
      op: '*',
      op2: '0.1',
      standardFloat: '0.06999999999999999',
      pythonDecimal: '0.07',
      why: 'O erro de aproximação se multiplica, truncando dígitos significativos em ponto flutuante padrão.',
    },
    {
      name: 'Divisão com Inverso Exato',
      op1: '1',
      op: '/',
      op2: '8',
      standardFloat: '0.125',
      pythonDecimal: '0.125 (1/8)',
      why: '8 é potência de 2 (2³), resultando em inverso exato e fração canônica perfeita tanto no float quanto no Decimal.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f131f] border border-slate-700/60 rounded-3xl shadow-2xl text-slate-200 p-6 md:p-8"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Python decimal.Decimal
                </span>
                <span className="text-xs text-slate-400">Precisão Numérica</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                Por que Python Decimal vs. Float Comum?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-sm text-slate-300 leading-relaxed">
          Os processadores convencionais operam em binário (base 2) com o padrão <strong>IEEE 754</strong>. Números simples em base 10 (como <code>0.1</code>) tornam-se dízimas binárias não-terminativas. Nosso backend utiliza <strong>Python Decimal</strong>, calculando em base 10 com precisão arbitrária de até 50 dígitos, eliminando distorções.
        </div>

        <div className="space-y-4 my-6">
          {comparisonCases.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="font-semibold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  {c.name}: <span className="font-mono text-indigo-300">{c.op1} {c.op} {c.op2}</span>
                </div>
                <button
                  onClick={() => {
                    onApplyCalculation(c.op1, c.op, c.op2);
                    onClose();
                  }}
                  className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>Executar na Calculadora</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                  <div className="text-[11px] font-semibold text-red-400 flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Padrão Float IEEE 754
                  </div>
                  <div className="font-mono text-sm text-red-200 break-all">
                    {c.standardFloat}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Nosso Backend Python Decimal
                  </div>
                  <div className="font-mono text-sm text-emerald-200 font-bold break-all">
                    {c.pythonDecimal}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">
                {c.why}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all"
          >
            Fechar Comparação
          </button>
        </div>
      </div>
    </div>
  );
};
