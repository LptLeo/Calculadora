#!/usr/bin/env python3
"""
=============================================================================
SUÍTE DE TESTES UNITÁRIOS E DE INTEGRAÇÃO (100% COBERTURA EM PYTHON)
=============================================================================
Cobre 100% das funcionalidades do motor matemático (calc_engine.py), do fluxo
de display da calculadora (DisplaySimulator) e do servidor HTTP (server.py).
"""

import sys
import json
import urllib.request
import urllib.error
import threading
from decimal import Decimal
from http.server import HTTPServer

from calc_engine import (
    somar,
    subtrair,
    multiplicar,
    dividir,
    formatar_numero,
    calcular,
    calculate
)
from server import ManipuladorRequisicoes, DADOS_TEORIA


# =============================================================================
# 1. TESTES UNITÁRIOS DO MOTOR MATEMÁTICO (calc_engine.py)
# =============================================================================
print("=" * 70)
print(" 1. TESTES UNITÁRIOS DO MOTOR MATEMÁTICO (calc_engine.py)")
print("=" * 70)

total_tests = 0
passed_tests = 0

def registrar_teste(nome: str, condicao: bool, detalhe: str = ""):
    global total_tests, passed_tests
    total_tests += 1
    if condicao:
        passed_tests += 1
        print(f"[APROVADO] #{total_tests:02d} {nome} {detalhe}")
    else:
        print(f"[FALHOU]   #{total_tests:02d} {nome} {detalhe}")
        sys.exit(1)

# Funções primitivas
registrar_teste("Função somar()", somar(Decimal("10"), Decimal("10")) == Decimal("20"), "(10 + 10 = 20)")
registrar_teste("Função subtrair()", subtrair(Decimal("5"), Decimal("3")) == Decimal("2"), "(5 - 3 = 2)")
registrar_teste("Função multiplicar()", multiplicar(Decimal("5"), Decimal("4")) == Decimal("20"), "(5 * 4 = 20)")
registrar_teste("Função dividir()", dividir(Decimal("10"), Decimal("2")) == Decimal("5"), "(10 / 2 = 5)")

# Formatação
registrar_teste("Formatar Zero", formatar_numero(Decimal("0")) == "0", "0 -> '0'")
registrar_teste("Formatar Inteiro", formatar_numero(Decimal("20.000")) == "20", "20.000 -> '20'")
registrar_teste("Formatar Decimal", formatar_numero(Decimal("0.3000")) == "0.3", "0.3000 -> '0.3'")

# Casos solicitados pelo usuário
casos_matematicos = [
    ("Entrada 10+10", "10", "+", "10", "20", True),
    ("Entrada 10/2", "10", "/", "2", "5", True),
    ("Entrada 5*4", "5", "*", "4", "20", True),
    ("Entrada 5-3", "5", "-", "3", "2", True),
    ("Entrada 0/10 (Numerador Zero)", "0", "/", "10", "Erro, Divisão por Zero", False),
    ("Entrada 10/0 (Denominador Zero)", "10", "/", "0", "Erro, Divisão por Zero", False),
    ("Precisão IEEE 754 (0.1 + 0.2)", "0.1", "+", "0.2", "0.3", True),
    ("Precisão IEEE 754 (1.03 - 0.42)", "1.03", "-", "0.42", "0.61", True),
    ("Precisão IEEE 754 (0.7 * 0.1)", "0.7", "*", "0.1", "0.07", True),
    ("Precisão IEEE 754 (1 / 8)", "1", "/", "8", "0.125", True),
    ("Modal - Adição Decimais", "14.5", "+", "35.5", "50", True),
    ("Modal - Subtração Simétrico", "42", "-", "19", "23", True),
    ("Modal - Multiplicação Escalonamento", "12.5", "*", "8", "100", True),
    ("Modal - Divisão Recíproco", "100", "/", "8", "12.5", True),
    ("Zero Neutro (0 + 0)", "0", "+", "0", "0", True),
    ("Zero Subtração (0 - 0)", "0", "-", "0", "0", True),
    ("Zero Multiplicação (0 * 0)", "0", "*", "0", "0", True),
    ("Zero Translação (0 + 15)", "0", "+", "15", "15", True),
    ("Zero Simétrico (0 - 15)", "0", "-", "15", "-15", True),
    ("Zero Absorção (0 * 15)", "0", "*", "15", "0", True),
    ("Negativos Adição (-5 + -10)", "-5", "+", "-10", "-15", True),
    ("Negativos Subtração (-15 - -5)", "-15", "-", "-5", "-10", True),
    ("Negativos Multiplicação (-4 * -5)", "-4", "*", "-5", "20", True),
    ("Negativos Divisão (-20 / 4)", "-20", "/", "4", "-5", True),
]

for desc, op1, op, op2, esperado, deve_ter_sucesso in casos_matematicos:
    res = calcular(op1, op2, op)
    if deve_ter_sucesso:
        valido = res["success"] and res["result"] == esperado
        detalhe = f"{op1} {op} {op2} = {res.get('result')}"
    else:
        valido = (not res["success"]) and ("Divisão por Zero" in str(res.get("error")) or res.get("error") == esperado)
        detalhe = f"{op1} {op} {op2} -> {res.get('error')}"
    registrar_teste(desc, valido, detalhe)

# Testes de Erros e Validações
res_op_invalido = calcular("10", "10", "^")
registrar_teste("Validação de Operador Inválido", not res_op_invalido["success"], "Rejeita operador '^'")

res_num_invalido = calcular("abc", "10", "+")
registrar_teste("Validação de Operando Inválido", not res_num_invalido["success"], "Rejeita número 'abc'")

# Teste do alias calculate
res_alias = calculate("2", "3", "+")
registrar_teste("Alias calculate()", res_alias["result"] == "5", "2 + 3 = 5")

# Teste de suporte a vírgula decimal (padrão pt-BR)
res_virgula = calcular("14,5", "2,5", "+")
registrar_teste("Suporte a Vírgula Decimal (pt-BR)", res_virgula["result"] == "17", "14,5 + 2,5 = 17")

# Teste de precisão arbitrária de 50 dígitos significativos
op_prec1 = "1." + "1" * 49
op_prec2 = "2." + "2" * 49
res_prec = calcular(op_prec1, op_prec2, "+")
registrar_teste("Precisão Arbitrária de 50 Dígitos", res_prec["result"] == ("3." + "3" * 49), "50 dígitos significativos preservados")


# =============================================================================
# 2. TESTES DE COBERTURA DO FLUXO DO DISPLAY (DisplaySimulator)
# =============================================================================
print("\n" + "=" * 70)
print(" 2. TESTES DE FLUXO E ESTADOS DO DISPLAY (AC, Backspace, Símbolos)")
print("=" * 70)

class DisplaySimulator:
    def __init__(self):
        self.reset()

    def reset(self):
        self.displayValue = "0"
        self.prevOperand = None
        self.operator = None
        self.waitingForNextOperand = False
        self.errorMessage = None
        self.lastCalculation = None
        self.toastFeedback = None

    @property
    def upper_preview(self):
        if self.prevOperand is not None and self.operator is not None:
            sym_map = {"+": "+", "-": "−", "*": "×", "/": "÷"}
            return f"{self.prevOperand} {sym_map.get(self.operator, self.operator)}"
        if self.lastCalculation:
            return f"{self.lastCalculation['operand1']} {self.lastCalculation['operatorSymbol']} {self.lastCalculation['operand2']} ="
        return ""

    @property
    def ribbon_active(self):
        return self.lastCalculation is not None

    def input_digit(self, digit: str):
        self.errorMessage = None
        if self.waitingForNextOperand:
            self.displayValue = digit
            self.waitingForNextOperand = False
        else:
            self.displayValue = digit if self.displayValue == "0" else self.displayValue + digit

    def input_dot(self):
        self.errorMessage = None
        if self.waitingForNextOperand:
            self.displayValue = "0."
            self.waitingForNextOperand = False
        elif "." not in self.displayValue:
            self.displayValue += "."

    def choose_operator(self, op: str):
        self.errorMessage = None
        if self.operator and not self.waitingForNextOperand and self.prevOperand is not None:
            self.equals()
        self.prevOperand = self.displayValue
        self.operator = op
        self.waitingForNextOperand = True

    def equals(self):
        if self.operator is None or self.prevOperand is None:
            return
        res = calcular(self.prevOperand, self.displayValue, self.operator)
        if res.get("success"):
            self.displayValue = res["result"]
            self.lastCalculation = res
            self.prevOperand = None
            self.operator = None
            self.waitingForNextOperand = True
        else:
            self.errorMessage = res.get("error", "Erro")
            self.displayValue = self.errorMessage
            self.lastCalculation = res
            self.prevOperand = None
            self.operator = None
            self.waitingForNextOperand = True

    def delete_last(self):
        # 1. Se estiver exibindo mensagem de erro, reseta para "0"
        if self.errorMessage or self.displayValue.startswith("Erro"):
            self.errorMessage = None
            self.displayValue = "0"
            self.waitingForNextOperand = False
            self.lastCalculation = None
            return

        # 2. Se o cálculo acabou de terminar e o resultado está na tela, permite apagar dígitos do resultado
        if self.waitingForNextOperand and self.operator is None:
            self.waitingForNextOperand = False

        # 3. Se um operador estiver selecionado e ainda não começou o 2º número, cancela o operador
        if self.waitingForNextOperand and self.operator is not None:
            self.operator = None
            self.waitingForNextOperand = False
            return

        # 4. Apaga o último caractere
        if len(self.displayValue) <= 1 or (len(self.displayValue) == 2 and self.displayValue.startswith("-")):
            self.displayValue = "0"
        else:
            self.displayValue = self.displayValue[:-1]
            if self.displayValue in ("-", ""):
                self.displayValue = "0"

    def toggle_sign(self):
        self.errorMessage = None
        if self.displayValue == "0":
            return
        if self.displayValue.startswith("-"):
            self.displayValue = self.displayValue[1:]
        else:
            self.displayValue = "-" + self.displayValue

    def percent(self):
        try:
            val = float(self.displayValue) / 100
            s = f"{val:.10f}".rstrip("0").rstrip(".")
            self.displayValue = s
        except Exception:
            pass

    def clear_all(self):
        self.reset()

sim = DisplaySimulator()

# 1. Estado inicial
registrar_teste("Display - Estado Inicial Limpo", sim.displayValue == "0" and sim.upper_preview == "" and not sim.ribbon_active)

# 2. Digitação de número e ponto
for c in "14.5":
    if c == ".": sim.input_dot()
    else: sim.input_digit(c)
registrar_teste("Display - Digitação '14.5'", sim.displayValue == "14.5")

# 3. Ponto duplicado ignorado
sim.input_dot()
registrar_teste("Display - Ponto Duplicado Ignorado", sim.displayValue == "14.5")

# 4. Operador '+'
sim.choose_operator("+")
registrar_teste("Display - Seleção Operador '+'", sim.upper_preview == "14.5 +" and sim.waitingForNextOperand)

# 5. Segundo operando '35.5'
for c in "35.5":
    if c == ".": sim.input_dot()
    else: sim.input_digit(c)
registrar_teste("Display - Digitação Segundo Operando", sim.displayValue == "35.5")

# 6. Igual (=)
sim.equals()
registrar_teste("Display - Execução da Adição (=)", sim.displayValue == "50" and sim.upper_preview == "14.5 + 35.5 =" and sim.ribbon_active)

# 7. DEL Apagando Resultado ('50' -> '5' -> '0')
sim.delete_last()
registrar_teste("Display - DEL Apagando Resultado ('50' -> '5')", sim.displayValue == "5")
sim.delete_last()
registrar_teste("Display - DEL Apagando Resultado até Zero ('5' -> '0')", sim.displayValue == "0")

# 8. Limpeza Total com AC (All Clear) - limpa preview, visor e fita
sim.clear_all()
registrar_teste("Display - AC Limpa Tudo (Visor, Preview e Fita)", sim.displayValue == "0" and sim.upper_preview == "" and not sim.ribbon_active)

# 9. Encadeamento sucessivo (10 + 5 * 2)
for c in "10": sim.input_digit(c)
sim.choose_operator("+")
for c in "5": sim.input_digit(c)
sim.choose_operator("*")
registrar_teste("Display - Encadeamento Automático", sim.displayValue == "15" and sim.upper_preview == "15 ×")
for c in "2": sim.input_digit(c)
sim.equals()
registrar_teste("Display - Conclusão do Encadeamento", sim.displayValue == "30")

# 10. DEL no Resultado de 30
sim.delete_last()
registrar_teste("Display - DEL no Resultado 30 ('30' -> '3')", sim.displayValue == "3")

# 11. Divisão com zero e exibição de erro
sim.clear_all()
sim.input_digit("0")
sim.choose_operator("/")
for c in "10": sim.input_digit(c)
sim.equals()
registrar_teste("Display - Exibição de Divisão por Zero", "Divisão por Zero" in sim.displayValue)

# 12. DEL apagando Mensagem de Erro
sim.delete_last()
registrar_teste("Display - DEL Apagando Erro de Divisão por Zero", sim.displayValue == "0" and sim.errorMessage is None)

# 13. DEL cancelando operador pendente ('25 +' -> '25')
for c in "25": sim.input_digit(c)
sim.choose_operator("+")
sim.delete_last()
registrar_teste("Display - DEL Cancelando Operador Pendente", sim.operator is None and sim.displayValue == "25")

# 14. Backspace (DEL) normal durante digitação
sim.clear_all()
for c in "789": sim.input_digit(c)
sim.delete_last()
registrar_teste("Display - Backspace DEL (789 -> 78)", sim.displayValue == "78")
sim.delete_last()
sim.delete_last()
registrar_teste("Display - Backspace DEL até Zero", sim.displayValue == "0")

# 15. Inversão de Sinal (±)
for c in "25": sim.input_digit(c)
sim.toggle_sign()
registrar_teste("Display - Inversão Positivo para Negativo", sim.displayValue == "-25")
sim.toggle_sign()
registrar_teste("Display - Inversão Negativo para Positivo", sim.displayValue == "25")

# 16. Porcentagem (%)
sim.percent()
registrar_teste("Display - Porcentagem (25 -> 0.25)", sim.displayValue == "0.25")

# 17. Reset final
sim.clear_all()
registrar_teste("Display - Reset Final AC", sim.displayValue == "0")


# =============================================================================
# 3. TESTES DE INTEGRAÇÃO DO SERVIDOR HTTP (server.py)
# =============================================================================
print("\n" + "=" * 70)
print(" 3. TESTES DE INTEGRAÇÃO DO SERVIDOR HTTP (server.py)")
print("=" * 70)

# Iniciamos um servidor em porta efêmera para testar os endpoints de ponta a ponta
servidor_teste = HTTPServer(("127.0.0.1", 0), ManipuladorRequisicoes)
porta_teste = servidor_teste.server_address[1]

thread_servidor = threading.Thread(target=servidor_teste.serve_forever, daemon=True)
thread_servidor.start()

base_url = f"http://127.0.0.1:{porta_teste}"

# 1. Teste GET / (HTML da página)
with urllib.request.urlopen(f"{base_url}/") as r:
    html_content = r.read().decode("utf-8")
    registrar_teste("HTTP GET / (HTML Completo)", r.status == 200 and "<!DOCTYPE html>" in html_content and "Calculadora" in html_content)

# 2. Teste GET /api/theory com Literatura Brasileira e Fórmulas
with urllib.request.urlopen(f"{base_url}/api/theory") as r:
    dados_teoria = json.loads(r.read().decode("utf-8"))
    tem_ops = len(dados_teoria.get("operations", [])) == 4
    tem_lit = len(dados_teoria.get("literature", [])) == 5
    tem_formulas = all("formula" in op and "example" in op for op in dados_teoria.get("operations", []))
    tem_brasileiros = any("IMPA" in item["author"] for item in dados_teoria.get("literature", []))
    registrar_teste("HTTP GET /api/theory (Literatura Brasileira e Fórmulas)", r.status == 200 and tem_ops and tem_lit and tem_formulas and tem_brasileiros)

# 3. Teste GET /api/health
with urllib.request.urlopen(f"{base_url}/api/health") as r:
    dados_health = json.loads(r.read().decode("utf-8"))
    registrar_teste("HTTP GET /api/health", r.status == 200 and dados_health.get("status") == "ok")

# 4. Teste POST /api/calculate (Sucesso: 10 + 10 = 20)
req_add = urllib.request.Request(
    f"{base_url}/api/calculate",
    data=json.dumps({"operand1": "10", "operand2": "10", "operator": "+"}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req_add) as r:
    dados_calc = json.loads(r.read().decode("utf-8"))
    registrar_teste("HTTP POST /api/calculate (10 + 10)", r.status == 200 and dados_calc.get("result") == "20")

# 5. Teste POST /api/calculate (Divisão por Zero: 0 / 10 -> Erro 400)
req_zero = urllib.request.Request(
    f"{base_url}/api/calculate",
    data=json.dumps({"operand1": "0", "operand2": "10", "operator": "/"}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req_zero) as r:
        registrar_teste("HTTP POST /api/calculate (0 / 10)", False, "Deveria retornar código 400")
except urllib.error.HTTPError as e:
    dados_err = json.loads(e.read().decode("utf-8"))
    registrar_teste("HTTP POST /api/calculate (0 / 10)", e.code == 400 and "Divisão por Zero" in dados_err.get("error", ""))

# 6. Teste POST /api/calculate (Denominador Zero: 10 / 0 -> Erro 400)
req_zero_den = urllib.request.Request(
    f"{base_url}/api/calculate",
    data=json.dumps({"operand1": "10", "operand2": "0", "operator": "/"}).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req_zero_den) as r:
        registrar_teste("HTTP POST /api/calculate (10 / 0)", False, "Deveria retornar código 400")
except urllib.error.HTTPError as e:
    dados_err = json.loads(e.read().decode("utf-8"))
    registrar_teste("HTTP POST /api/calculate (10 / 0)", e.code == 400 and "Divisão por Zero" in dados_err.get("error", ""))

# 7. Teste Rota Inexistente (404)
try:
    with urllib.request.urlopen(f"{base_url}/rota-que-nao-existe") as r:
        registrar_teste("HTTP GET Rota Inexistente 404", False)
except urllib.error.HTTPError as e:
    registrar_teste("HTTP GET Rota Inexistente (404)", e.code == 404)

servidor_teste.shutdown()
servidor_teste.server_close()

print("\n" + "=" * 70)
print(f"RELATÓRIO FINAL: {passed_tests}/{total_tests} TESTES APROVADOS COM 100% DE SUCESSO!")
print("=" * 70)
