#!/usr/bin/env python3
"""
Suíte Abrangente de Testes Unitários e de Integração
Cobre todas as funcionalidades matemáticas e endpoints da aplicação.
"""

import json
import urllib.request
from calc_engine import calculate

test_cases = [
    # 1. Casos Originais Solicitados pelo Usuário
    {"name": "Adição Básica", "op1": "10", "op": "+", "op2": "10", "expected": "20", "type": "result"},
    {"name": "Divisão Básica", "op1": "10", "op": "/", "op2": "2", "expected": "5", "type": "result"},
    {"name": "Multiplicação Básica", "op1": "5", "op": "*", "op2": "4", "expected": "20", "type": "result"},
    {"name": "Subtração Básica", "op1": "5", "op": "-", "op2": "3", "expected": "2", "type": "result"},
    {"name": "Numerador Mínimo em Divisão", "op1": "0", "op": "/", "op2": "10", "expected": "Erro, Divisão por Zero", "type": "error"},
    {"name": "Denominador Nulo em Divisão", "op1": "10", "op": "/", "op2": "0", "expected": "Erro, Divisão por Zero", "type": "error"},

    # 2. Funcionalidades do Modal de Fundamentos Matemáticos
    {"name": "Modal - Adição Decimais", "op1": "14.5", "op": "+", "op2": "35.5", "expected": "50", "type": "result"},
    {"name": "Modal - Subtração Simétrico", "op1": "42", "op": "-", "op2": "19", "expected": "23", "type": "result"},
    {"name": "Modal - Multiplicação Escalonamento", "op1": "12.5", "op": "*", "op2": "8", "expected": "100", "type": "result"},
    {"name": "Modal - Divisão Recíproco", "op1": "100", "op": "/", "op2": "8", "expected": "12.5", "type": "result"},

    # 3. Literatura Matemática e IEEE 754 Presets
    {"name": "IEEE 754 Float-Free Adição", "op1": "0.1", "op": "+", "op2": "0.2", "expected": "0.3", "type": "result"},
    {"name": "IEEE 754 Float-Free Subtração", "op1": "1.03", "op": "-", "op2": "0.42", "expected": "0.61", "type": "result"},
    {"name": "IEEE 754 Float-Free Multiplicação", "op1": "0.7", "op": "*", "op2": "0.1", "expected": "0.07", "type": "result"},
    {"name": "IEEE 754 Float-Free Divisão (1/8)", "op1": "1", "op": "/", "op2": "8", "expected": "0.125", "type": "result"},
    {"name": "Literatura Gauss Multiplicação", "op1": "12.5", "op": "*", "op2": "4", "expected": "50", "type": "result"},
    {"name": "Literatura Dedekind Subtração", "op1": "45", "op": "-", "op2": "18", "expected": "27", "type": "result"},

    # 4. Limites e Numeradores Mínimos (Zero)
    {"name": "Zero Neutro na Adição (0 + 0)", "op1": "0", "op": "+", "op2": "0", "expected": "0", "type": "result"},
    {"name": "Zero na Subtração (0 - 0)", "op1": "0", "op": "-", "op2": "0", "expected": "0", "type": "result"},
    {"name": "Zero Absorvente na Multiplicação (0 * 0)", "op1": "0", "op": "*", "op2": "0", "expected": "0", "type": "result"},
    {"name": "Zero Translação (0 + 15)", "op1": "0", "op": "+", "op2": "15", "expected": "15", "type": "result"},
    {"name": "Zero Simétrico (0 - 15)", "op1": "0", "op": "-", "op2": "15", "expected": "-15", "type": "result"},
    {"name": "Zero Absorção (0 * 15)", "op1": "0", "op": "*", "op2": "15", "expected": "0", "type": "result"},

    # 5. Números Negativos
    {"name": "Negativos - Adição", "op1": "-5", "op": "+", "op2": "-10", "expected": "-15", "type": "result"},
    {"name": "Negativos - Subtração", "op1": "-15", "op": "-", "op2": "-5", "expected": "-10", "type": "result"},
    {"name": "Negativos - Multiplicação", "op1": "-4", "op": "*", "op2": "-5", "expected": "20", "type": "result"},
    {"name": "Negativos - Divisão", "op1": "-20", "op": "/", "op2": "4", "expected": "-5", "type": "result"}
]

print("=" * 60)
print(" SUÍTE DE TESTES UNITÁRIOS - MOTOR PYTHON (calc_engine.py)")
print("=" * 60)

passed = 0
failed = 0

for i, tc in enumerate(test_cases, 1):
    res = calculate(tc["op1"], tc["op2"], tc["op"])
    if tc["type"] == "result":
        actual = res.get("result")
        success = res.get("success") and actual == tc["expected"]
    else:
        actual = res.get("error")
        success = (not res.get("success")) and ("Divisão por Zero" in str(actual) or actual == tc["expected"])

    status = "APROVADO" if success else "FALHOU"
    if success:
        passed += 1
    else:
        failed += 1
    print(f"[{status}] #{i:02d} {tc['name']}: {tc['op1']} {tc['op']} {tc['op2']} = '{actual}'")

print(f"\nResultado Motor Python: {passed}/{len(test_cases)} testes aprovados.\n")

print("=" * 60)
print(" SUÍTE DE TESTES DE INTEGRAÇÃO FULL-STACK - API EXPRESS")
print("=" * 60)

api_passed = 0
api_failed = 0

for i, tc in enumerate(test_cases[:10], 1):
    url = "http://localhost:3000/api/calculate"
    payload = json.dumps({"operand1": tc["op1"], "operand2": tc["op2"], "operator": tc["op"]}).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            actual = data.get("result")
            success = actual == tc["expected"]
    except urllib.error.HTTPError as e:
        data = json.loads(e.read().decode('utf-8'))
        actual = data.get("error") or data.get("result")
        success = "Divisão por Zero" in str(actual) or actual == tc["expected"]
    except Exception as e:
        actual = str(e)
        success = False

    status = "APROVADO" if success else "FALHOU"
    if success:
        api_passed += 1
    else:
        api_failed += 1
    print(f"[{status}] API #{i:02d} {tc['name']}: {tc['op1']} {tc['op']} {tc['op2']} -> '{actual}'")

# Teste da Rota de Teoria
theory_url = "http://localhost:3000/api/theory"
with urllib.request.urlopen(theory_url) as resp:
    theory_data = json.loads(resp.read().decode('utf-8'))
    theory_ok = "title" in theory_data and len(theory_data.get("operations", [])) == 4
    print(f"[{'APROVADO' if theory_ok else 'FALHOU'}] API #11 Endpoint /api/theory: Retornou {len(theory_data.get('operations', []))} operações formais.")

print(f"\nResultado API Full-Stack: {api_passed + (1 if theory_ok else 0)}/11 testes aprovados.")

if failed == 0 and api_failed == 0:
    print("\n>>> TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! <<<")
else:
    print(f"\n>>> HOUVE {failed + api_failed} FALHAS! <<<")
    exit(1)
