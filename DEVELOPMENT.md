# Guia de Desenvolvimento — Sistema de Gerenciamento de Serviços

Este documento apresenta orientações práticas para contribuir no projeto, entender a organização do código e executar tarefas comuns ao desenvolver localmente.

---

## Estrutura do projeto (resumo)

app/
├── public/                # Arquivos estáticos
├── src/
│   ├── main.jsx           # Ponto de entrada
│   ├── App.jsx            # Rotas e providers
│   ├── index.css          # Design system (tokens e estilos globais)
│   ├── lib/               # Utilitários (supabase client, helpers)
│   ├── contexts/          # Auth, Theme, Data (Supabase)
│   ├── components/        # Componentes reutilizáveis (ui, layout, ordens, etc.)
│   └── pages/             # Páginas por rota
├── index.html
├── .env.example
└── package.json

(Consulte o código para a lista completa de arquivos; este resumo é suficiente para se orientar.)

---

## Executando localmente

Pré-requisitos:
- Node.js 20+
- Git

Passos rápidos:

1. Clone

```bash
git clone https://github.com/Yur1b01c4/Sistema-de-Gerenciamento-de-Servicos.git
cd Sistema-de-Gerenciamento-de-Servicos
```

2. Instale dependências

```bash
npm install
```

3. Copie variáveis de ambiente

```bash
cp .env.example .env.local
# preencha as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

4. Inicie em modo de desenvolvimento

```bash
npm run dev
```

---

## Arquitetura (resumo)

O frontend é uma PWA em React que consome Supabase (Postgres + Auth + Storage). O fluxo básico de dados é:

Usuário → UI (páginas) → Contexts → supabase client → banco de dados / storage

Estados compartilhados e operações com o backend são implementados via React Contexts (AuthContext, ThemeContext, DataContext).

---

## Boas práticas para desenvolvimento

- Mantenha commits pequenos e descritivos.
- Use branches por feature: `feat/nome-da-feature` ou `fix/descricao`.
- Adicione testes manuais e screenshots em PRs, quando relevante.
- Atualize `DEVELOPMENT.md` se adicionar convenções ou scripts novos.

---

## Como adicionar uma página ou rota (resumo)

1. Crie `src/pages/NovaPagina.jsx` com o layout da página.
2. Importe a página em `src/App.jsx` e registre a rota dentro do AppShell.
3. Adicione item de navegação em `src/components/layout/Sidebar.jsx` (opcional).

---

## Interagindo com Supabase

- Cliente Supabase: `src/lib/supabase.js`.
- Operações de leitura/escrita centralizadas em `src/contexts/DataContext.jsx`.
- Para adicionar tabelas, use `supabase_setup.sql` (já incluído no repositório) e, quando necessário, adicione as chamadas de CRUD no DataContext.

Observação: políticas de RLS (Row Level Security) são gerenciadas no Supabase; verifique as policies ao criar tabelas.

---

## Estilos

O projeto utiliza CSS vanilla com tokens (variáveis CSS) em `src/index.css`. Consulte esse arquivo para os tokens disponíveis e classes utilitárias.

---

## Comandos úteis

```bash
npm run dev     # desenvolvimento
npm run build   # build de produção
npm run preview # preview do build
```

---

## Regras de negócio (resumo)

- Empresa não pode ser removida se houver Ordens vinculadas.
- OSs seguem o ciclo: aberta → concluída → faturada (irreversível).
- Relatórios consideram somente OSs concluídas.

---

## Dependências principais

- react 19
- react-router-dom
- @supabase/supabase-js
- jspdf / jspdf-autotable
- xlsx (SheetJS)
- lucide-react

---

Se quiser, posso gerar exemplos adicionais (snippets de DataContext, testes de integração ou um checklist de PR) para facilitar contribuições.