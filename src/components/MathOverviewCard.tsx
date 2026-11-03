import React, { useState } from 'react';
import { BookOpen, ExternalLink, ArrowRight, Award, GraduationCap } from 'lucide-react';

interface MathArticle {
  id: 'sintese' | 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao';
  tabTitle: string;
  paperTitle: string;
  originalTitle: string;
  authors: string;
  institutionYear: string;
  abstractSummary: string;
  coreContribution: string;
  externalUrl: string;
  exampleA: string;
  exampleOp: '+' | '-' | '*' | '/';
  exampleB: string;
}

const ARTICLES: Record<string, MathArticle> = {
  sintese: {
    id: 'sintese',
    tabTitle: 'Síntese Algébrica',
    paperTitle: 'Os Fundamentos da Aritmética e a Teoria Axiomática de Corpos',
    originalTitle: 'Grundlagen der Geometrie & Über den Zahlbegriff',
    authors: 'David Hilbert & Gottlob Frege',
    institutionYear: 'Universidade de Göttingen (1899–1900)',
    abstractSummary:
      'Tratado canônico que estabelece a estrutura axiomática formal do Corpo dos Números Reais (ℝ, +, ·). Demonstra que toda a álgebra elementar provém estritamente de duas operações primitivas em grupos abelianos complementares, interligados pela propriedade distributiva.',
    coreContribution:
      'Unificação dos eixos aditivo e multiplicativo: demonstra que subtração e divisão são as imagens inversas de grupos fundamentais.',
    externalUrl: 'https://plato.stanford.edu/entries/hilbert-program/',
    exampleA: '0.1',
    exampleOp: '+',
    exampleB: '0.2',
  },
  adicao: {
    id: 'adicao',
    tabTitle: '+ Adição',
    paperTitle: 'Princípios da Aritmética: Fundamentação Axiomática da Adição',
    originalTitle: 'Arithmetices principia, nova methodo exposita',
    authors: 'Giuseppe Peano',
    institutionYear: 'Academia das Ciências de Turim (1889)',
    abstractSummary:
      'Apresentação dos célebres Axiomas de Peano. Define a Adição como a operação primitiva binária de translação linear contínua e agregação indutiva, demonstrando a comutatividade, associatividade e o papel do 0 como elemento neutro estrito.',
    coreContribution:
      'Formalização indutiva da soma como operador de translação de ordem total na reta numérica.',
    externalUrl: 'https://plato.stanford.edu/entries/peano/',
    exampleA: '14.5',
    exampleOp: '+',
    exampleB: '35.5',
  },
  subtracao: {
    id: 'subtracao',
    tabTitle: '− Subtração',
    paperTitle: 'Continuidade, Cortes de Dedekind e o Inverso Aditivo',
    originalTitle: 'Stetigkeit und irrationale Zahlen',
    authors: 'Richard Dedekind',
    institutionYear: 'Universidade de Zurique / TU Braunschweig (1872)',
    abstractSummary:
      'Artigo fundamental que constrói a completude dos números reais via Cortes de Dedekind. Prova que a subtração não possui autonomia formal, configurando-se estritamente como a adição pelo elemento simétrico: a − b ≡ a + (−b), onde b + (−b) = 0.',
    coreContribution:
      'Eliminação da subtração como operador independente em favor da estrutura de Grupo Aditivo com involução simétrica.',
    externalUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Dedekind/',
    exampleA: '45',
    exampleOp: '-',
    exampleB: '18',
  },
  multiplicacao: {
    id: 'multiplicacao',
    tabTitle: '× Multiplicação',
    paperTitle: 'Investigações Aritméticas e Homomorfismo Escalar',
    originalTitle: 'Disquisitiones Arithmeticae',
    authors: 'Carl Friedrich Gauss',
    institutionYear: 'Universidade de Göttingen (1801)',
    abstractSummary:
      'Obra-prima de Gauss que formalizou a multiplicação como escalonamento e dilatação métrica homotética. Estabelece a estrutura multiplicativa do corpo, o elemento neutro 1, a propriedade distributiva e o zero como elemento absorvente.',
    coreContribution:
      'Apresentação estrutural da multiplicação além da mera soma iterada, integrando-a ao corpo contínuo.',
    externalUrl: 'https://mathshistory.st-andrews.ac.uk/Biographies/Gauss/',
    exampleA: '12.5',
    exampleOp: '*',
    exampleB: '4',
  },
  divisao: {
    id: 'divisao',
    tabTitle: '÷ Divisão',
    paperTitle: 'O que Todo Cientista da Computação Deve Saber Sobre Aritmética e Divisão',
    originalTitle: 'What Every Computer Scientist Should Know About Floating-Point Arithmetic',
    authors: 'David Goldberg & Prof. William Kahan (Turing Award)',
    institutionYear: 'ACM Computing Surveys / Xerox PARC (1991)',
    abstractSummary:
      'Publicação de referência que analisa o inverso multiplicativo recíproco b⁻¹ e a impossibilidade da divisão por zero. Discute por que representações em ponto flutuante IEEE 754 produzem resíduos binários e defende arquiteturas decimais de alta precisão.',
    coreContribution:
      'Fundamentação do recíproco multiplicativo (a ÷ b ≡ a · b⁻¹) e a justificativa para o uso de motores decimais com restrição estrita de b ≠ 0.',
    externalUrl: 'https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html',
    exampleA: '100',
    exampleOp: '/',
    exampleB: '8',
  },
};

interface MathOverviewCardProps {
  onLoadExpression: (op1: string, op: '+' | '-' | '*' | '/', op2: string) => void;
  onOpenFullModal: () => void;
}

export const MathOverviewCard: React.FC<MathOverviewCardProps> = ({
  onLoadExpression,
}) => {
  const [activeTab, setActiveTab] = useState<'sintese' | 'adicao' | 'subtracao' | 'multiplicacao' | 'divisao'>('sintese');

  const currentArticle = ARTICLES[activeTab];

  return (
    <div className="w-full bg-[#111420]/80 border border-slate-800/80 rounded-3xl p-5 md:p-6 text-slate-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Literatura Matemática Fundamental
            </h3>
            <p className="text-xs text-slate-400">
              Resumos acadêmicos dos artigos e tratados canônicos das 4 operações
            </p>
          </div>
        </div>

        <a
          href={currentArticle.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 flex items-center gap-1.5 font-medium transition-all self-start sm:self-auto shadow-sm"
        >
          <span>Ver Artigo Completo</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 my-4">
        {(Object.keys(ARTICLES) as Array<keyof typeof ARTICLES>).map((key) => {
          const item = ARTICLES[key];
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.tabTitle}
            </button>
          );
        })}
      </div>

      {/* Article Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-3 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-mono mb-1">
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>{currentArticle.institutionYear}</span>
          </div>
          <h4 className="text-base font-bold text-white leading-snug">
            {currentArticle.paperTitle}
          </h4>
          <p className="text-xs text-slate-400 italic mt-0.5">
            Título original: &ldquo;{currentArticle.originalTitle}&rdquo; &bull; Autor(es): <span className="text-slate-300 font-medium">{currentArticle.authors}</span>
          </p>
        </div>

        {/* Abstract */}
        <div className="pt-2 border-t border-slate-800/60">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-indigo-400" />
            Resumo do Artigo (Abstract)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentArticle.abstractSummary}
          </p>
        </div>

        {/* Core contribution */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
          <span className="font-semibold text-indigo-300">Contribuição Algébrica: </span>
          <span className="text-slate-300">{currentArticle.coreContribution}</span>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <a
            href={currentArticle.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 font-medium transition-colors"
          >
            <span>Acessar publicação oficial &bull; {currentArticle.authors.split('&')[0].trim()}</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() =>
              onLoadExpression(
                currentArticle.exampleA,
                currentArticle.exampleOp,
                currentArticle.exampleB
              )
            }
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Testar cálculo fundamentado ({currentArticle.exampleA} {currentArticle.exampleOp} {currentArticle.exampleB})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
