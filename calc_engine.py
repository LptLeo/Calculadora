#!/usr/bin/env python3
"""
=============================================================================
MOTOR DE CÁLCULO MATEMÁTICO DE ALTA PRECISÃO (100% PYTHON)
=============================================================================
Este arquivo contém a lógica matemática pura da calculadora.
Ele foi escrito de forma simples e comentada para que qualquer programador
iniciante em Python possa entender facilmente como os cálculos funcionam.
"""

from decimal import Decimal, InvalidOperation, getcontext

# Definimos uma precisão de até 50 dígitos para evitar qualquer erro de arredondamento
getcontext().prec = 50


def formatar_numero(numero_decimal: Decimal) -> str:
    """
    Transforma um número Decimal em um texto (string) limpo.
    - Se for um número inteiro (ex: 20.0), remove o '.0' e retorna '20'.
    - Se for decimal (ex: 0.3000), remove os zeros extras à direita e retorna '0.3'.
    - Evita notação científica indesejada (como 2E+1).
    """
    if numero_decimal.is_zero():
        return "0"

    # Verifica se o número é um inteiro exato (ex: 5.0 vira 5)
    if numero_decimal == numero_decimal.to_integral():
        return str(int(numero_decimal))

    # Formata como número decimal comum (sem notação científica)
    texto = format(numero_decimal, "f")
    if "." in texto:
        texto = texto.rstrip("0").rstrip(".")
    return texto


def somar(a: Decimal, b: Decimal) -> Decimal:
    """Realiza a Adição (a + b)"""
    return a + b


def subtrair(a: Decimal, b: Decimal) -> Decimal:
    """Realiza a Subtração (a - b)"""
    return a - b


def multiplicar(a: Decimal, b: Decimal) -> Decimal:
    """Realiza a Multiplicação (a * b)"""
    return a * b


def dividir(a: Decimal, b: Decimal) -> Decimal:
    """Realiza a Divisão (a / b)"""
    return a / b


def calcular(operando1_str: str, operando2_str: str, operador: str) -> dict:
    """
    Função principal que recebe dois números e o operador escolhido (+, -, *, /).
    Retorna um dicionário com o resultado e a explicação matemática.
    """
    # Passo 1: Validar se o operador é suportado
    operadores_validos = ["+", "-", "*", "/"]
    if operador not in operadores_validos:
        return {
            "success": False,
            "error": f"Operador inválido '{operador}'. Use apenas: +, -, * ou /."
        }

    # Passo 2: Converter as strings em números Decimal de alta precisão
    try:
        s1 = str(operando1_str).strip().replace(",", ".")
        s2 = str(operando2_str).strip().replace(",", ".")
        a = Decimal(s1)
        b = Decimal(s2)
    except (InvalidOperation, TypeError, ValueError):
        return {
            "success": False,
            "error": "Por favor, digite números válidos."
        }

    # Passo 3: Tratamento de Divisão por Zero e numeradores/denominadores nulos
    if operador == "/":
        if b == Decimal(0) or a == Decimal(0):
            return {
                "success": False,
                "error": "Erro, Divisão por Zero",
                "result": "Erro, Divisão por Zero",
                "operand1": formatar_numero(a),
                "operand2": formatar_numero(b),
                "operator": "/",
                "operatorName": "Divisão",
                "operatorSymbol": "÷",
                "algebraicConcept": "Inversibilidade Indefinida",
                "algebraicExplanation": "Divisão envolvendo zero é indefinida (o inverso multiplicativo não existe no corpo R)."
            }

    # Passo 4: Executar a operação escolhida usando if / elif simples
    if operador == "+":
        resultado_dec = somar(a, b)
        nome_op = "Adição"
        simbolo_op = "+"
        conceito = "Translação Linear / Acumulação"
        explicacao = f"{formatar_numero(a)} + {formatar_numero(b)} = {formatar_numero(resultado_dec)} (Elemento neutro: 0, propriedade comutativa: {formatar_numero(b)} + {formatar_numero(a)} = {formatar_numero(resultado_dec)})"

    elif operador == "-":
        resultado_dec = subtrair(a, b)
        nome_op = "Subtração"
        simbolo_op = "−"
        conceito = "Inverso Aditivo (Simétrico)"
        explicacao = f"{formatar_numero(a)} − {formatar_numero(b)} ≡ {formatar_numero(a)} + ({formatar_numero(-b)}) = {formatar_numero(resultado_dec)} (A subtração é a soma pelo elemento simétrico -b)"

    elif operador == "*":
        resultado_dec = multiplicar(a, b)
        nome_op = "Multiplicação"
        simbolo_op = "×"
        conceito = "Escalonamento Linear / Homomorfismo"
        explicacao = f"{formatar_numero(a)} × {formatar_numero(b)} = {formatar_numero(resultado_dec)} (Elemento neutro: 1, elemento absorvente: 0, distributiva sobre a adição)"

    elif operador == "/":
        resultado_dec = dividir(a, b)
        nome_op = "Divisão"
        simbolo_op = "÷"
        conceito = "Inverso Multiplicativo (Recíproco)"
        reciproco = formatar_numero(Decimal(1) / b)
        explicacao = f"{formatar_numero(a)} ÷ {formatar_numero(b)} ≡ {formatar_numero(a)} × ({reciproco}) = {formatar_numero(resultado_dec)} (A divisão é o produto pelo inverso recíproco b⁻¹)"

    # Passo 5: Formatar e retornar o dicionário com todas as informações
    return {
        "success": True,
        "result": formatar_numero(resultado_dec),
        "operand1": formatar_numero(a),
        "operand2": formatar_numero(b),
        "operator": operador,
        "operatorName": nome_op,
        "operatorSymbol": simbolo_op,
        "algebraicConcept": conceito,
        "algebraicExplanation": explicacao,
        "engine": "Python 3.10 Decimal (Precisão Arbitrária)",
        "isExactDecimal": True
    }


# Alias em inglês para compatibilidade
calculate = calcular


# Execução direta pelo terminal (CLI ou teste rápido)
if __name__ == "__main__":
    import sys
    import json

    # Se receber 3 argumentos (ex: python3 calc_engine.py 10 + 10), calcula e imprime em JSON
    if len(sys.argv) == 4:
        operando1 = sys.argv[1]
        operador = sys.argv[2]
        operando2 = sys.argv[3]
        resultado = calcular(operando1, operando2, operador)
        print(json.dumps(resultado, ensure_ascii=False))
    else:
        # Se for rodado sem argumentos, roda testes demonstrativos rápidos
        print("=" * 55)
        print("  DEMONSTRAÇÃO DO MOTOR MATEMÁTICO (calc_engine.py)")
        print("=" * 55)
        exemplos = [
            ("10", "+", "10"),
            ("10", "/", "2"),
            ("5", "*", "4"),
            ("5", "-", "3"),
            ("0", "/", "10"),
            ("10", "/", "0"),
            ("0.1", "+", "0.2")
        ]
        for a, op, b in exemplos:
            res = calcular(a, b, op)
            valor = res.get("result") if res["success"] else res.get("error")
            print(f"  {a:>4} {op} {b:<4} = {valor}")
        print("=" * 55)
