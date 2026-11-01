# Plano de Implementação — Contato Seguro Slim ⚡️

Este documento orienta a execução técnica do projeto através de fases lógicas, adotando **TDD (Test-Driven Development)** nos serviços, utilitários e regras de negócio antes de codificar a camada de interface.

---

## Metodologia TDD adotada

Para cada funcionalidade lógica ou integração:
1. **Red**: Criar o arquivo de teste `*.test.ts` descrevendo o comportamento esperado (validação, formato, chamada da API, erro 409, etc.). O teste falhará inicialmente.
2. **Green**: Implementar o código mínimo necessário em `*.ts` para que o teste passe.
3. **Refactor**: Ajustar tipagens, imports e estruturas garantindo que os testes continuem verdes.
4. **UI Integration**: Conectar aos componentes React (Ant Design).

---

## Fases de Execução

### Fase 1: Setup e Infraestrutura Base
- [ ] Inicializar ambiente Docker (`docker compose up -d`).
- [ ] Executar migrations e seeds no container da API (`composer run phinx:migrate`, `phinx:seed`).
- [ ] Executar suíte de testes existente no front-end (`pnpm test`) para garantir baseline verde.
- [ ] Configurar rotas base e placeholders no menu de navegação.

### Fase 2: Épico 1 — Domínio Pessoa (`/people`)
- **Passo 2.1 (TDD)**: Utilitário de sanitização e máscara de CPF (`cpf.helper.test.ts` -> `cpf.helper.ts`).
  - Teste: Formatação de 11 dígitos para `000.000.000-00`.
  - Teste: Sanitização removendo pontos, traços e espaços.
  - Teste: Validação básica de tamanho (exatamente 11 dígitos numéricos).
- **Passo 2.2 (TDD)**: Contratos e Services de API de Pessoa (`person.type.ts` e `*.service.test.ts`).
  - `list-people.service.ts` (`GET /people`)
  - `create-person.service.ts` (`POST /people`)
  - `update-person.service.ts` (`PUT /people/{id}`)
  - `delete-person.service.ts` (`DELETE /people/{id}`)
  - Teste: Tratamento do erro 409 (CPF duplicado).
- **Passo 2.3**: Criação do Contexto `People.context.tsx`.
- **Passo 2.4**: Componentes de UI:
  - `PersonFields.tsx` (Formulário com validações de obrigatoriedade e data de nascimento).
  - `CreatePersonModal.tsx` & `EditPersonModal.tsx`.
  - `PeopleActionsCell.tsx` (ações de editar e excluir com Popconfirm).
  - `People.page.tsx` (Tabela de listagem).
- **Passo 2.5**: Integração de Rota `/people` no `router.tsx` e `MainLayout.tsx`.

### Fase 3: Épico 2 — Domínio Envolvimento (`/records/{id}/involvements`)
- **Passo 3.1 (TDD)**: Tipos e Services de API de Envolvimento (`involvement.type.ts` e `*.service.test.ts`).
  - `list-involvements.service.ts` (`GET /records/{record_id}/involvements`).
  - `create-involvement.service.ts` (`POST /records/{record_id}/involvements`).
  - `delete-involvement.service.ts` (`DELETE /records/{record_id}/involvements/{id}`).
  - Teste: Validação do payload (person_id, type).
  - Teste: Tratamento de erro 409 (pessoa já vinculada ao relato).
  - Teste: Verificação do cálculo de `is_anonymous` retornado.
- **Passo 3.2**: Componentes de UI para Envolvimento:
  - Mapeamento de tags de status dos papéis (`whistleblower`, `witness`, `victim`, `denounced`).
  - `RecordInvolvementsDrawer.tsx`: Drawer lateral exibindo a lista de pessoas envolvidas no relato selecionado e o indicador de anonimato.
  - Formulário para vincular nova pessoa existente com papel definido.
  - Ação de exclusão/desvinculação do envolvimento.
- **Passo 3.3**: Atualização da tela de Relatos (`Records.page.tsx` & `RecordsActionsCell.tsx`):
  - Inclusão da coluna de Anonimato (Tag `Anônimo` / `Identificado`).
  - Botão de ação "Envolvidos" para abrir o Drawer.

### Fase 4: Bônus de UX e Refinamentos
- [ ] Busca / Filtro rápido de pessoas e relatos.
- [ ] Confirmações de exclusão com `Popconfirm` do Ant Design.
- [ ] Máscaras de entrada em tempo real no campo de CPF.
- [ ] Loading states e empty states intuitivos.

### Fase 5: Validação e Testes Manuais
- [ ] Executar todos os testes unitários (`pnpm test`).
- [ ] Validar cenários do PRD na interface:
  - Cadastro de pessoa normal.
  - Tentativa de cadastro com CPF duplicado (verificar toast/alerta amigável).
  - Vincular pessoa como `witness` (relato continua anônimo).
  - Vincular pessoa como `whistleblower` (relato passa a identificado).
  - Tentar vincular a mesma pessoa novamente no mesmo relato (verificar validação 409).
  - Desvincular o `whistleblower` (relato volta a ser anônimo).
- [ ] Registrar evidências detalhadas no arquivo `EVIDENCES.md`.
