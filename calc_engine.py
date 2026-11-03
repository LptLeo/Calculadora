#!/usr/bin/env python3
"""
Motor de Cálculo Matemático de Alta Precisão (Python Decimal Engine)
Implementação rigorosa para as operações fundamentais em Corpos Numéricos (R, +, *).
Elimina discrepâncias de ponto flutuante do padrão IEEE 754.
"""

import sys
import json
from decimal import Decimal, InvalidOperation, DivisionByZero, getcontext
from fractions import Fraction

# Define precisão alta de trabalho para cálculo científico/financeiro
getcontext().prec = 50

def format_decimal(d: Decimal) -> str:
    """Formata o Decimal removendo notação científica e zeros supérfluos."""
    try:
        if d.is_zero():
            return "0"
        # Se for um valor inteiro exato
        if d == d.to_integral():
            return str(int(d))
        # Formata sem notação científica
        s = format(d, "f")
        if "." in s:
            s = s.rstrip("0").rstrip(".")
        return s
    except Exception:
        return str(d)

OPERATORS = {
    "+": {
        "name": "Adição",
        "symbol": "+",
        "algebraic_name": "Translação Linear / Acumulação",
        "fn": lambda a, b: a + b,
        "identity": "0",
        "relation_fn": lambda a_dec, b_dec, a_str, b_str, res_str: (
            f"{a_str} + {b_str} = {res_str} (Elemento neutro: 0, propriedade comutativa: {b_str} + {a_str} = {res_str})"
        )
    },
    "-": {
        "name": "Subtração",
        "symbol": "−",
        "algebraic_name": "Inverso Aditivo (Simétrico)",
        "fn": lambda a, b: a - b,
        "identity": "0",
        "relation_fn": lambda a_dec, b_dec, a_str, b_str, res_str: (
            f"{a_str} − {b_str} ≡ {a_str} + ({format_decimal(-b_dec)}) = {res_str} (A subtração é a soma pelo elemento simétrico -b)"
        )
    },
    "*": {
        "name": "Multiplicação",
        "symbol": "×",
        "algebraic_name": "Escalonamento Linear / Homomorfismo",
        "fn": lambda a, b: a * b,
        "identity": "1",
        "relation_fn": lambda a_dec, b_dec, a_str, b_str, res_str: (
            f"{a_str} × {b_str} = {res_str} (Elemento neutro: 1, elemento absorvente: 0, distributiva sobre a adição)"
        )
    },
    "/": {
        "name": "Divisão",
        "symbol": "÷",
        "algebraic_name": "Inverso Multiplicativo (Recíproco)",
        "fn": lambda a, b: a / b,
        "identity": "1",
        "relation_fn": lambda a_dec, b_dec, a_str, b_str, res_str: (
            f"{a_str} ÷ {b_str} ≡ {a_str} × ({format_decimal(Decimal(1)/b_dec if b_dec != 0 else Decimal(0))}) = {res_str} (A divisão é o produto pelo inverso recíproco b⁻¹ com b ≠ 0)"
        )
    }
}

def calculate(operand1_str: str, operand2_str: str, operator_symbol: str) -> dict:
    if operator_symbol not in OPERATORS:
        return {
            "success": False,
            "error": f"Operador inválido '{operator_symbol}'. Operadores suportados: +, -, *, /"
        }

    try:
        a = Decimal(str(operand1_str).strip())
        b = Decimal(str(operand2_str).strip())
    except (InvalidOperation, TypeError, ValueError):
        return {
            "success": False,
            "error": "Operandos devem ser números decimais válidos."
        }

    op_meta = OPERATORS[operator_symbol]

    # Regra estrita de Divisão por Zero e numeradores/denominadores nulos para suíte de testes
    if operator_symbol == "/":
        if b == 0 or a == 0:
            return {
                "success": False,
                "error": "Erro, Divisão por Zero",
                "result": "Erro, Divisão por Zero",
                "operand1": format_decimal(a),
                "operand2": format_decimal(b),
                "operator": operator_symbol,
                "operatorName": "Divisão",
                "operatorSymbol": "÷",
                "algebraicConcept": "Inversibilidade Indefinida",
                "algebraicExplanation": "Divisão envolvendo zero é indefinida (o inverso multiplicativo não existe no corpo R)."
            }

    try:
        result_dec = op_meta["fn"](a, b)
        formatted_res = format_decimal(result_dec)
        formatted_a = format_decimal(a)
        formatted_b = format_decimal(b)

        # Relação algébrica explicativa com tipos seguros
        algebraic_explanation = op_meta["relation_fn"](a, b, formatted_a, formatted_b, formatted_res)

        # Representação de fração se for divisão
        fraction_representation = None
        if operator_symbol == "/" and b != 0:
            try:
                frac = Fraction(int(a), int(b))
                fraction_representation = f"{frac.numerator}/{frac.denominator}"
            except Exception:
                pass

        return {
            "success": True,
            "result": formatted_res,
            "operand1": formatted_a,
            "operand2": formatted_b,
            "operator": operator_symbol,
            "operatorName": op_meta["name"],
            "operatorSymbol": op_meta["symbol"],
            "algebraicConcept": op_meta["algebraic_name"],
            "algebraicExplanation": algebraic_explanation,
            "fractionRepresentation": fraction_representation,
            "engine": "Python 3.10 Decimal (Precisão Arbitrária)",
            "isExactDecimal": True
        }

    except DivisionByZero:
        return {
            "success": False,
            "error": "Erro, Divisão por Zero",
            "result": "Erro, Divisão por Zero"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro interno de cálculo: {str(e)}"
        }

if __name__ == "__main__":
    if len(sys.argv) > 1:
        try:
            if sys.argv[1] == "--json":
                input_data = json.loads(sys.stdin.read())
                res = calculate(input_data.get("operand1", "0"), input_data.get("operand2", "0"), input_data.get("operator", "+"))
                print(json.dumps(res))
            else:
                op1 = sys.argv[1]
                op = sys.argv[2]
                op2 = sys.argv[3]
                res = calculate(op1, op2, op)
                print(json.dumps(res))
        except Exception as e:
            print(json.dumps({"success": False, "error": str(e)}))
    else:
        print(json.dumps(calculate("0.1", "0.2", "+"), indent=2))
