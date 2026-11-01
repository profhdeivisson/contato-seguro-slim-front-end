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
- **Resultado obtido:** **Aprovado.** Modal fecha imediatamente após resposta HTTP 201 da API, notificação Ant Design exibida no canto superior direito e a listagem exibe o novo registro perfeitamente formatado via `formatCpf`.
- **Evidência visual:** `evidences/02-people-list.png`

---

### Cenário 1.2: Tentativa de cadastro com CPF duplicado
- **O que foi testado:** Tentativa de cadastrar uma nova pessoa utilizando um CPF que já existe no sistema.
- **Como foi testado:**
  1. Clicar no botão "Cadastrar Pessoa".
  2. Inserir o CPF de uma pessoa já cadastrada (`12345678901`).
  3. Preencher os demais campos e submeter.
- **Resultado esperado:** A API retorna HTTP 409 e o sistema exibe notificação amigável informando que o CPF já está em uso. O formulário não é limpo involuntariamente.
- **Resultado obtido:** **Aprovado.** A interceptação do erro `409 CONFLICT` capturou a resposta e disparou o aviso amigável em português ("Este CPF já está cadastrado no sistema."), mantendo os dados no modal para correção.
- **Evidência visual:** `evidences/04-people-duplicate-cpf-409.png`

---

### Cenário 1.3: Validação de campos obrigatórios e formato de CPF
- **O que foi testado:** Tentativa de submissão do formulário com campos em branco ou CPF com menos de 11 dígitos.
- **Como foi testado:**
  1. Abrir o modal de cadastro e tentar clicar diretamente em "Salvar".
  2. Inserir apenas 5 dígitos no campo CPF.
- **Resultado esperado:** O formulário exibe mensagens de erro de validação sob cada campo obrigatório e bloqueia a requisição.
- **Resultado obtido:** **Aprovado.** Validação do formulário com regras do Ant Design exibindo mensagens de erro abaixo dos campos ("Por favor, insira o nome", "CPF deve conter 11 dígitos") sem disparar requisições.
- **Evidência visual:** `evidences/03-people-validation-errors.png`

---

### Cenário 1.4: Edição e Exclusão de pessoa
- **O que foi testado:** Atualizar os dados cadastrais de uma pessoa e excluí-la do sistema.
- **Como foi testado:**
  1. Clicar em "Editar" na linha da pessoa, alterar dados e salvar.
  2. Clicar em "Excluir" e confirmar no Popconfirm.
- **Resultado esperado:** Dados atualizados na tabela e posterior remoção com notificação de confirmação.
- **Resultado obtido:** **Aprovado.** Operações executadas com sucesso e refletidas na interface.

---

## 2. Épico 2: Envolvimentos em Relatos

### Cenário 2.1: Relato sem relatante identificado (Cálculo de anonimato)
- **O que foi testado:** Verificação se um relato que não possui envolvido do tipo `whistleblower` é exibido como anônimo.
- **Como foi testado:**
  1. Acessar a listagem de Relatos.
  2. Criar um novo relato ou selecionar um relato sem envolvidos (ex.: Relato ID 2, com testemunha).
  3. Observar o indicador de anonimato na tabela e nos detalhes.
- **Resultado esperado:** O relato exibe a tag/badge indicando "Anônimo".
- **Resultado obtido:** **Aprovado.** A coluna Identificação exibe a tag "Anônimo" e o Drawer reflete o cabeçalho "Status: Anônimo".
- **Evidência visual:** `evidences/05-records-list.png`

---

### Cenário 2.2: Vínculo de pessoa como Relatante (whistleblower)
- **O que foi testado:** Adicionar um envolvido com o papel de Relatante e verificar a alteração do anonimato.
- **Como foi testado:**
  1. Abrir os envolvidos de um relato anônimo no Drawer lateral.
  2. Selecionar uma pessoa cadastrada e o papel "Relatante".
  3. Confirmar o vínculo.
- **Resultado esperado:** A pessoa é listada na tabela de envolvidos com o papel correto e o status do relato é atualizado para "Identificado".
- **Resultado obtido:** **Aprovado.** A pessoa foi inserida com a tag `Relatante` e o status do relato mudou para "Identificado" em tempo real.
- **Evidência visual:** `evidences/06-record-involvements-drawer.png`

---

### Cenário 2.3: Tentativa de vincular a mesma pessoa duas vezes ao mesmo relato
- **O que foi testado:** Tentar vincular uma pessoa que já participa daquele relato (mesmo que com outro papel).
- **Como foi testado:**
  1. No painel de envolvidos, tentar adicionar a mesma pessoa já vinculada.
  2. Confirmar a submissão.
- **Resultado esperado:** O sistema exibe notificação de erro informando que a pessoa já está vinculada ao relato (HTTP 409).
- **Resultado obtido:** **Aprovado.** A API retornou 409 e o sistema notificou "Esta pessoa já está vinculada a este relato." amigavelmente.

---

### Cenário 2.4: Remoção de envolvimento e recálculo de anonimato
- **O que foi testado:** Desvincular o único relatante do caso.
- **Como foi testado:**
  1. No painel de envolvidos, clicar no botão de remover/desvincular o relato do tipo Relatante.
  2. Confirmar a ação no alerta de confirmação.
- **Resultado esperado:** O envolvido é removido da lista e o relato volta a ser classificado como "Anônimo".
- **Resultado obtido:** **Aprovado.** Desvinculação executada e o status recalculou automaticamente para "Anônimo".

---

## 3. Melhorias de UX e Responsividade Mobile

### Cenário 3.1: Menu de Navegação Mobile
- **O que foi testado:** Barra superior fixa, botão hambúrguer alternando para "X" e abertura do menu em overlay (`Drawer`) sem empurrar o conteúdo.
- **Resultado obtido:** **Aprovado.** Drawer abre sobre o conteúdo e fecha automaticamente ao clicar em uma rota.
- **Evidências visuais:** `evidences/07-mobile-records-table.png`, `evidences/08-mobile-menu-overlay.png`

---

### Cenário 3.2: Ações nas Tabelas Mobile via Seleção de Linhas
- **O que foi testado:** Ocultação da coluna fixa de ações em telas móveis e exibição da barra de ações superior após seleção.
- **Resultado obtido:** **Aprovado.** Seleção de 1 linha habilita "Editar", "Envolvidos" e "Excluir". Seleção de múltiplas linhas desabilita "Editar" e "Envolvidos" e mantém "Excluir" habilitado para remoção em lote.
- **Evidências visuais:** `evidences/09-mobile-single-selection-actions.png`, `evidences/10-mobile-multi-selection-actions.png`

---

### Cenário 3.3: Dashboard Analítico (Desktop & Mobile)
- **Evidências visuais:** `evidences/01-dashboard.png`, `evidences/11-mobile-dashboard.png`

---

## 4. Suíte de Testes Automatizados

- **Vitest:** 25/25 testes aprovados.
- **TypeScript:** `tsc --noEmit` — 0 erros.
- **ESLint:** 0 erros e 0 avisos.
