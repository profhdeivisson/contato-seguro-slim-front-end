# Plano de Design — Contato Seguro Slim ⚡️

## 1. Visão Geral e Contexto

O **Contato Seguro Slim** é uma aplicação voltada para membros de comitê de ética e compliance, responsável pelo recebimento, triagem e investigação de relatos corporativos. 

Atualmente, o sistema já permite gerenciar **Empresas** e **Relatos**, porém os relatos não possuem vinculação com as pessoas envolvidas. Este plano detalha a solução front-end para implementar os dois épicos propostos no [MINI_PRD.md](MINI_PRD.md):
1. **Épico 1: Gestão de Pessoas (`/people`)**
2. **Épico 2: Gestão de Envolvimento em Relatos (`/records/{id}/involvements`)**

O backend correspondente já se encontra implementado e documentado em [API.md](API.md). Todas as alterações serão contidas exclusivamente no diretório `client/`.

---

## 2. Épico 1: Gestão de Pessoas

### 2.1. Problema & Objetivo
Centralizar o cadastro de pessoas no sistema de forma agnóstica a empresas. Permitir que comitês localizem e cadastrem indivíduos com garantia de unicidade por CPF.

### 2.2. Telas & Fluxo de Usuário
- **Navegação:** Adição do item **"Pessoas"** (ícone `UserOutlined`) no menu lateral principal (`MainLayout.tsx`) apontando para `/people`.
- **Listagem (`People.page.tsx`):**
  - Tabela com colunas: ID, Nome Completo, CPF (formatado com máscara `000.000.000-00`), E-mail, Data de Nascimento (`DD/MM/YYYY`) e Ações.
  - Botão de ação primária "Cadastrar Pessoa".
  - Filtro/busca textual rápida (Nome / CPF) para facilitar localização.
- **Formulário de Cadastro (`CreatePersonModal.tsx`):**
  - Campos: Nome completo, CPF, E-mail, Data de Nascimento (DatePicker).
  - Validação inline de campos obrigatórios.
  - Sanitização do CPF (remover caracteres não numéricos antes do envio, enviando exatamente 11 dígitos).
  - Feedback amigável para conflitos de CPF duplicado (HTTP 409).
- **Ações Adicionais (Edição / Exclusão):**
  - Modais para atualizar dados e confirmar exclusão de pessoas via endpoints existentes da API (`PUT /people/{id}` e `DELETE /people/{id}`).

---

## 3. Épico 2: Gestão de Envolvimento

### 3.1. Problema & Objetivo
Permitir vincular indivíduos a um relato específico sob papéis definidos (`whistleblower`, `witness`, `victim`, `denounced`), calculando e exibindo claramente o status de anonimato do caso.

### 3.2. Regras de Negócio e UX
1. **Anonimato do Relato:**
   - O backend calcula `is_anonymous: boolean`.
   - Se `is_anonymous === true`: exibir Tag/Badge visual `Anônimo` (cor padrão/laranja) na listagem de relatos e na visualização de detalhes.
   - Se `is_anonymous === false`: exibir Tag/Badge visual `Identificado` (cor verde).
2. **Unicidade de Vínculo:**
   - Uma pessoa só pode ser vinculada uma vez ao mesmo relato.
   - Tratamento de erro 409 com mensagem explicativa ("Esta pessoa já está vinculada a este relato").
3. **Papeis de Envolvimento:**
   - Relatante (`whistleblower`)
   - Testemunha (`witness`)
   - Vítima (`victim`)
   - Denunciado (`denounced`)
   - Mapeamento de labels amigáveis e cores de Tag distintas para rápida leitura visual.

### 3.3. Interface de Envolvimentos
- **Acesso:** Novo botão/ação "Envolvidos" na célula de ações de cada relato (`RecordsActionsCell.tsx`).
- **Visualização Detalhada (`RecordInvolvementsDrawer.tsx`):**
  - Drawer lateral contendo o cabeçalho do relato e o indicador de anonimato.
  - Lista/Tabela de pessoas envolvidas com: Papel (Tag colorida), Nome, CPF, E-mail e ação de desvincular (remover envolvimento com confirmação).
  - Formulário para adicionar envolvido:
    - Campo Select com busca de pessoas cadastradas no sistema.
    - Select de Papel / Tipo de Envolvimento.
    - Botão "Vincular".

---

## 4. Arquitetura Frontend & Padrões

O projeto segue arquitetura modular baseada em domínio dentro de `client/src/domain/`:

```
client/src/
├── domain/
│   ├── person/
│   │   ├── api/
│   │   │   ├── list-people.service.ts
│   │   │   ├── create-person.service.ts
│   │   │   ├── update-person.service.ts
│   │   │   └── delete-person.service.ts
│   │   ├── components/
│   │   │   ├── CreatePersonModal.tsx
│   │   │   ├── EditPersonModal.tsx
│   │   │   ├── PersonFields.tsx
│   │   │   └── PeopleActionsCell.tsx
│   │   ├── helper/
│   │   │   ├── cpf.helper.ts
│   │   │   └── cpf.helper.test.ts
│   │   ├── person.type.ts
│   │   └── People.context.tsx
│   ├── involvement/
│   │   ├── api/
│   │   │   ├── list-involvements.service.ts
│   │   │   ├── create-involvement.service.ts
│   │   │   └── delete-involvement.service.ts
│   │   ├── components/
│   │   │   ├── RecordInvolvementsDrawer.tsx
│   │   │   └── InvolvementForm.tsx
│   │   ├── involvement.type.ts
│   │   └── Involvements.context.tsx
│   └── record/
│       └── ... (atualização da coluna de anonimato e botão de envolvidos)
└── pages/
    ├── People.page.tsx
    └── Records.page.tsx (integração do drawer de envolvimentos)
```

---

## 5. Riscos e Decisões Técnicas

1. **Validação de CPF no Front vs Back:**
   - Decisão: O input aceitará CPF formatado para boa usabilidade, mas uma função utilitária sanitizará o valor para conter apenas 11 dígitos antes da requisição.
2. **Sincronização de Estado após Vínculo:**
   - Decisão: Ao adicionar ou remover um envolvido, o `is_anonymous` retornado pela API deve atualizar a lista de relatos em tempo real.
3. **Escrita em TDD:**
   - Helpers de formatação e validação de CPF, adaptadores de payload e serviços de chamada de API serão desenvolvidos iniciando pelos testes unitários no Vitest.
