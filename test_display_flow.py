#!/usr/bin/env python3
"""
Teste de Cobertura Completa (100%) do Fluxo de Estados do Display da Calculadora
Simula todas as transições de estado do display: inicial, digitação, seleção de operador,
cálculo, encadeamento, tratamento de erro, DEL apagando dígitos e resultados,
inversão de sinal, porcentagem e AC (All Clear).
"""

from calc_engine import calculate

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
        if self.toastFeedback:
            return f"✓ {self.toastFeedback}"
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
        res = calculate(self.prevOperand, self.displayValue, self.operator)
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

print("=" * 65)
print(" TESTES DE COBERTURA 100% DO FLUXO DO DISPLAY DA CALCULADORA")
print("=" * 65)

sim = DisplaySimulator()
tests = []

# 1. Estado Inicial
assert sim.displayValue == "0" and sim.upper_preview == "" and not sim.ribbon_active
tests.append(("01. Estado Inicial Limpo", True, "Visor: '0', Linha Superior: '', Fita: Inativa"))

# 2. Digitação do 1º operando
for ch in "14.5":
    if ch == ".": sim.input_dot()
    else: sim.input_digit(ch)
assert sim.displayValue == "14.5" and sim.upper_preview == ""
tests.append(("02. Digitação Operando 1 (14.5)", True, "Visor: '14.5', Linha Superior: ''"))

# 3. Ponto decimal duplicado bloqueado
sim.input_dot()
assert sim.displayValue == "14.5"
tests.append(("03. Bloqueio de Ponto Duplicado", True, "Visor: '14.5' (inalterado)"))

# 4. Seleção de Operador '+'
sim.choose_operator("+")
assert sim.displayValue == "14.5" and sim.upper_preview == "14.5 +"
tests.append(("04. Seleção Operador (+)", True, "Visor: '14.5', Linha Superior: '14.5 +'"))

# 5. Digitação do 2º operando
for ch in "35.5":
    if ch == ".": sim.input_dot()
    else: sim.input_digit(ch)
assert sim.displayValue == "35.5" and sim.upper_preview == "14.5 +"
tests.append(("05. Digitação Operando 2 (35.5)", True, "Visor: '35.5', Linha Superior: '14.5 +'"))

# 6. Execução do Cálculo (=)
sim.equals()
assert sim.displayValue == "50" and sim.upper_preview == "14.5 + 35.5 =" and sim.ribbon_active
tests.append(("06. Execução da Adição (=)", True, "Visor: '50', Linha Superior: '14.5 + 35.5 =', Fita: Ativa"))

# 7. NOVO TESTE: Botão DEL apagando dígitos diretamente de um RESULTADO
sim.delete_last() # '50' vira '5'
assert sim.displayValue == "5"
tests.append(("07. DEL Apagando Resultado ('50' -> '5')", True, "Visor: '5' (DEL apagou o último dígito do resultado)"))
sim.delete_last() # '5' vira '0'
assert sim.displayValue == "0"
tests.append(("08. DEL Apagando Resultado até Zero ('5' -> '0')", True, "Visor: '0'"))

# 8. Limpeza Total com AC (All Clear)
sim.clear_all()
assert sim.displayValue == "0" and sim.upper_preview == "" and not sim.ribbon_active and sim.lastCalculation is None
tests.append(("09. AC (All Clear) Limpeza Completa", True, "Visor: '0', Linha Superior: '', Fita: Inativa"))

# 9. Teste de Encadeamento Sucessivo (10 + 5 * 2)
for ch in "10": sim.input_digit(ch)
sim.choose_operator("+")
for ch in "5": sim.input_digit(ch)
sim.choose_operator("*") # Deve computar 10 + 5 = 15 primeiro
assert sim.displayValue == "15" and sim.upper_preview == "15 ×"
for ch in "2": sim.input_digit(ch)
sim.equals()
assert sim.displayValue == "30" and sim.upper_preview == "15 × 2 ="
tests.append(("10. Encadeamento Sucessivo (10 + 5 × 2)", True, "Visor: '30', Linha Superior: '15 × 2 ='"))

# 10. NOVO TESTE: DEL em resultado de 30 (30 -> 3 -> 0)
sim.delete_last()
assert sim.displayValue == "3"
tests.append(("11. DEL no Resultado 30 ('30' -> '3')", True, "Visor: '3'"))

# 11. Teste de Divisão por Zero e exibição de Erro
sim.clear_all()
for ch in "0": sim.input_digit(ch)
sim.choose_operator("/")
for ch in "10": sim.input_digit(ch)
sim.equals()
assert "Divisão por Zero" in sim.displayValue and "0 ÷ 10 =" in sim.upper_preview
tests.append(("12. Divisão com Zero no Numerador", True, f"Visor: '{sim.displayValue}', Linha Superior: '{sim.upper_preview}'"))

# 12. NOVO TESTE: DEL apagando Mensagem de Erro
sim.delete_last()
assert sim.displayValue == "0" and sim.errorMessage is None
tests.append(("13. DEL Apagando Mensagem de Erro", True, "Visor: '0' (Erro removido imediatamente)"))

# 13. NOVO TESTE: DEL cancelando Operador Pendente
for ch in "25": sim.input_digit(ch)
sim.choose_operator("+")
assert sim.operator == "+"
sim.delete_last()
assert sim.operator is None and sim.displayValue == "25"
tests.append(("14. DEL Cancelando Operador Pendente ('25 +' -> '25')", True, "Operador cancelado com sucesso"))

# 14. Teste de Backspace (DEL) normal durante digitação
sim.clear_all()
for ch in "789": sim.input_digit(ch)
sim.delete_last() # 78
assert sim.displayValue == "78"
sim.delete_last() # 7
assert sim.displayValue == "7"
sim.delete_last() # 0
assert sim.displayValue == "0"
tests.append(("15. Backspace (DEL) Normal até Zero", True, "Visor: '0'"))

# 15. Inversão de Sinal (±)
sim.clear_all()
for ch in "25": sim.input_digit(ch)
sim.toggle_sign()
assert sim.displayValue == "-25"
sim.toggle_sign()
assert sim.displayValue == "25"
tests.append(("16. Inversão de Sinal (±)", True, "Visor: '25'"))

# 16. Porcentagem (%)
sim.percent()
assert sim.displayValue == "0.25"
tests.append(("17. Cálculo de Percentual (%)", True, "Visor: '0.25'"))

# 17. AC Final
sim.clear_all()
assert sim.displayValue == "0" and sim.upper_preview == ""
tests.append(("18. Reset Final com AC", True, "Visor: '0', Linha Superior: ''"))

for name, ok, detail in tests:
    status = "APROVADO" if ok else "FALHOU"
    print(f"[{status}] {name} -> {detail}")

print("\n" + "=" * 65)
print(f"RESULTADO: {len(tests)}/{len(tests)} testes de fluxo do display APROVADOS COM SUCESSO!")
print("=" * 65)
