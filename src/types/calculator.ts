export interface CalculationResult {
  success: boolean;
  result: string;
  operand1: string;
  operand2: string;
  operator: '+' | '-' | '*' | '/';
  operatorName: string;
  operatorSymbol: string;
  algebraicConcept: string;
  algebraicExplanation: string;
  fractionRepresentation?: string | null;
  engine: string;
  isExactDecimal: boolean;
  error?: string;
}

export interface CalculationHistoryItem extends CalculationResult {
  id: string;
  timestamp: number;
}

export interface PresetCalculation {
  id: number;
  op1: string;
  op: '+' | '-' | '*' | '/';
  op2: string;
}

export interface MathOperationTheory {
  id: string;
  name: string;
  symbol: string;
  concept: string;
  formalDefinition: string;
  identityElement: string;
  properties: string[];
  description: string;
}

export interface MathTheoryResponse {
  title: string;
  field: string;
  summary: string;
  operations: MathOperationTheory[];
  relationshipSummary: string;
}
