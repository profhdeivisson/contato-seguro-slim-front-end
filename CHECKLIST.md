# Checklist de Execução & Entrega — Contato Seguro Slim ⚡️

Este checklist serve para acompanhar o progresso de ponta a ponta da entrega do teste técnico.

---

## 📋 Pré-Requisitos e Setup
- [x] Skills de apoio instaladas (`brainstorming`, `writing-plans`, `executing-plans`).
- [x] Documento de Plano de Design criado ([DESIGN_PLAN.md](DESIGN_PLAN.md)).
- [x] Documento de Plano de Implementação criado ([IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)).
- [x] Checklist de acompanhamento criado ([CHECKLIST.md](CHECKLIST.md)).
- [x] Subir containers (`docker compose up -d`).
- [x] Rodar migrations no backend (`composer run phinx:migrate`).
- [x] Rodar seeds no backend (`composer run phinx:seed`).
- [x] Verificar baseline de testes no frontend (`pnpm test`).

---

## 🚀 Épico 1: Gestão de Pessoas (`/people`)
- [x] **TDD**: Utilitário de CPF (`cpf.helper.test.ts` e `cpf.helper.ts`).
- [x] **TDD**: Services de API (`list-people`, `create-person`, `update-person`, `delete-person`).
- [x] **TDD**: Tratamento de erro 409 (CPF duplicado).
- [x] Criar tipagem `person.type.ts`.
- [x] Criar Contexto `People.context.tsx`.
- [x] Criar componente de formulário `PersonFields.tsx` (Nome, CPF, E-mail, Data de Nascimento).
- [x] Criar modal de criação `CreatePersonModal.tsx`.
- [x] Criar modal de edição `EditPersonModal.tsx`.
- [x] Criar célula de ações com confirmação `PeopleActionsCell.tsx`.
- [x] Criar página de listagem `People.page.tsx`.
- [x] Registrar rota `/people` no `router.tsx` e menu em `MainLayout.tsx`.

---

## 🤝 Épico 2: Envolvimentos em Relatos (`/records/{id}/involvements`)
- [ ] **TDD**: Services de Envolvimento (`list-involvements`, `create-involvement`, `delete-involvement`).
- [ ] **TDD**: Validação de erro 409 (mesma pessoa vinculada duas vezes ao mesmo relato).
- [ ] **TDD**: Validação da regra de anonimato (`is_anonymous`).
- [ ] Criar tipagem `involvement.type.ts`.
- [ ] Mapear papéis de envolvidos (`whistleblower`, `witness`, `victim`, `denounced`) com tags visuais.
- [ ] Criar componente de Drawer ou Modal para gerenciar envolvidos (`RecordInvolvementsDrawer.tsx`).
- [ ] Adicionar formulário de vínculo (Select de Pessoas + Select de Papel).
- [ ] Implementar ação de remoção/desvinculação de envolvido.
- [ ] Atualizar tabela de Relatos (`Records.page.tsx`) com indicador visual (Anônimo / Identificado).
- [ ] Adicionar ação "Envolvidos" na tabela de relatos (`RecordsActionsCell.tsx`).

---

## 🌟 Qualidade, UX e Bônus
- [ ] Filtro/busca por texto na listagem de pessoas.
- [ ] Máscaras amigáveis de CPF na digitação.
- [ ] Feedbacks de sucesso e erro via notificações Ant Design.
- [ ] Estados de carregamento (*spinners*) e vazios (*empty states*).
- [ ] Suíte completa de testes unitários passando (`pnpm test`).
- [ ] Linting sem erros (`pnpm lint` e `pnpm lint:tsc`).

---

## 📝 Documentação e Finalização
- [ ] Executar testes manuais de todos os fluxos.
- [ ] Registrar evidências e resultados no `EVIDENCES.md`.
- [ ] Capturar telas/evidências visuais.
- [ ] Preencher o formulário obrigatório de encerramento do processo seletivo.
