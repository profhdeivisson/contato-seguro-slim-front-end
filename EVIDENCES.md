# Relatório de Evidências e Testes Manuais — Contato Seguro Slim ⚡️

Este documento registra a execução dos testes manuais exigidos pelo processo seletivo, comprovando o cumprimento de todos os requisitos do [MINI_PRD.md](MINI_PRD.md).

---

## 1. Épico 1: Gestão de Pessoas

### Cenário 1.1: Cadastro de nova pessoa com sucesso
- **O que foi testado:** Cadastro de uma nova pessoa preenchendo todos os dados obrigatórios válidos.
- **Como foi testado:**
  1. Acessar o menu lateral "Pessoas".
  2. Clicar no botão "Cadastrar Pessoa".
  3. Preencher Nome Completo, CPF válido, E-mail e Data de Nascimento.
  4. Clicar em "Salvar".
- **Resultado esperado:** Modal é fechado, mensagem de sucesso é exibida e a nova pessoa aparece na tabela com CPF formatado.
- **Resultado obtido:** [A preencher durante validação]

---

### Cenário 1.2: Tentativa de cadastro com CPF duplicado
- **O que foi testado:** Tentativa de cadastrar uma nova pessoa utilizando um CPF que já existe no sistema.
- **Como foi testado:**
  1. Clicar no botão "Cadastrar Pessoa".
  2. Inserir o CPF de uma pessoa já cadastrada anteriormente.
  3. Preencher os demais campos e submeter.
- **Resultado esperado:** A API retorna HTTP 409 e o sistema exibe notificação amigável informando que o CPF já está em uso. O formulário não é limpo involuntariamente.
- **Resultado obtido:** [A preencher durante validação]

---

### Cenário 1.3: Validação de campos obrigatórios e formato de CPF
- **O que foi testado:** Tentativa de submissão do formulário com campos em branco ou CPF com menos de 11 dígitos.
- **Como foi testado:**
  1. Abrir o modal de cadastro e tentar clicar diretamente em "Salvar".
  2. Inserir apenas 5 dígitos no campo CPF.
- **Resultado esperado:** O formulário exibe mensagens de erro de validação sob cada campo obrigatório e bloqueia a requisição.
- **Resultado obtido:** [A preencher durante validação]

---

## 2. Épico 2: Envolvimentos em Relatos

### Cenário 2.1: Relato sem relatante identificado (Cálculo de anonimato)
- **O que foi testado:** Verificação se um relato que não possui envolvido do tipo `whistleblower` é exibido como anônimo.
- **Como foi testado:**
  1. Acessar a listagem de Relatos.
  2. Criar um novo relato ou selecionar um relato sem envolvidos.
  3. Observar o indicador de anonimato na tabela e nos detalhes.
- **Resultado esperado:** O relato exibe a tag/badge indicando "Anônimo".
- **Resultado obtido:** [A preencher durante validação]

---

### Cenário 2.2: Vínculo de pessoa como Relatante (whistleblower)
- **O que foi testado:** Adicionar um envolvido com o papel de Relatante e verificar a alteração do anonimato.
- **Como foi testado:**
  1. Abrir os envolvidos de um relato anônimo.
  2. Selecionar uma pessoa cadastrada e o papel "Relatante".
  3. Confirmar o vínculo.
- **Resultado esperado:** A pessoa é listada na tabela de envolvidos com o papel correto e o status do relato é atualizado para "Identificado".
- **Resultado obtido:** [A preencher durante validação]

---

### Cenário 2.3: Tentativa de vincular a mesma pessoa duas vezes ao mesmo relato
- **O que foi testado:** Tentar vincular uma pessoa que já participa daquele relato (mesmo que com outro papel).
- **Como foi testado:**
  1. No painel de envolvidos, tentar adicionar a mesma pessoa já vinculada.
  2. Confirmar a submissão.
- **Resultado esperado:** O sistema exibe notificação de erro informando que a pessoa já está vinculada ao relato (HTTP 409).
- **Resultado obtido:** [A preencher durante validação]

---

### Cenário 2.4: Remoção de envolvimento e recálculo de anonimato
- **O que foi testado:** Desvincular o único relatante do caso.
- **Como foi testado:**
  1. No painel de envolvidos, clicar no botão de remover/desvincular o relato do tipo Relatante.
  2. Confirmar a ação no alerta de confirmação.
- **Resultado esperado:** O envolvido é removido da lista e o relato volta a ser classificado como "Anônimo".
- **Resultado obtido:** [A preencher durante validação]
