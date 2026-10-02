# Sistema de Gerenciamento de Serviços

PWA para técnicos autônomos: controle de Ordens de Serviço (OS), gerenciamento de empresas contratantes e geração de relatórios (PDF / XLSX).

[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel)](https://vercel.com/)

---

## Links rápidos

- Repositório: https://github.com/Yur1b01c4/Sistema-de-Gerenciamento-de-Servicos

---

## Visão geral

O Sistema de Gerenciamento de Serviços é uma aplicação progressiva (PWA) desenvolvida para facilitar o dia a dia de técnicos autônomos que atuam com instalação, manutenção e reparo de redes. A aplicação substitui processos baseados em planilhas, centralizando o fluxo de Ordens de Serviço, controle de clientes/empresas e geração de relatórios exportáveis.

Principais objetivos:
- Agilizar a rotina de campo.
- Registrar evidências (fotos, localização).
- Gerar relatórios com filtros por empresa, período e técnico.
- Facilitar faturamento e acompanhamento de OS.

---

## Funcionalidades

- Autenticação (Supabase Auth)
- Dashboard com KPIs (OS do mês, faturamento, OS abertas, OS do dia)
- Cadastro e gerenciamento de empresas contratantes (CRUD)
- Ciclo de Ordens de Serviço: Aberta → Concluída → Faturada
  - Upload de fotos para evidência (Supabase Storage)
  - Captura de GPS via navegador (quando permitido)
- Relatórios filtráveis e exportação em PDF e XLSX
- Modo escuro/ claro
- Design responsivo (mobile-first)

---

## Arquitetura e stack

- Frontend: React 19 (JavaScript)
- Bundler: Vite 8
- Roteamento: React Router DOM
- Estilos: CSS com design tokens (src/index.css)
- Backend/Auth: Supabase (Postgres, Auth, Storage)
- Geração de PDF: jsPDF + jsPDF-AutoTable
- Exportação XLSX: SheetJS (xlsx)
- Ícones: Lucide React
- Hospedagem: Vercel
- Fontes: Google Fonts (Inter, Barlow)

---

## Requisitos

- Node.js >= 20
- Git
- Conta Supabase (para o backend, Auth e Storage)

---

## Rodando localmente

1. Clone o repositório
   ```bash
   git clone https://github.com/Yur1b01c4/Sistema-de-Gerenciamento-de-Servicos.git
   cd Sistema-de-Gerenciamento-de-Servicos
   ```

2. Instale dependências
   ```bash
   npm install
   ```

3. Crie o arquivo de ambiente
   ```bash
   cp .env.example .env.local
   # preencha .env.local com as chaves do Supabase
   ```

4. Execute em desenvolvimento
   ```bash
   npm run dev
   ```

O app ficará disponível em: http://localhost:5173

---

## Variáveis de ambiente

Crie `.env.local` na raiz com as chaves do seu projeto Supabase:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Atenção: o arquivo `.env.local` está no `.gitignore`. Nunca versionar chaves.

---

## Como fazer deploy

1. Commit e push das alterações:
   ```bash
   git add .
   git commit -m "Descrição das mudanças"
   git push
   ```
2. O deploy automático pelo Vercel será acionado após o push (configurar projeto no Vercel apontando para este repositório).

---

## Banco de dados / Infraestrutura

- Arquivo com script de criação das tabelas: `supabase_setup.sql`
- Configurações e instruções de infraestrutura estão em: `INFRASTRUCTURE.md`
- Guia de desenvolvimento: `DEVELOPMENT.md`

---

## Design

- Paleta principal: Azul naval `#0A1B3D` e Laranja `#F47B20`
- Tipografia: Barlow (títulos) e Inter (corpo)
- Tokens CSS e tema dark/light definidos em `src/index.css`

Sugestão: incluir capturas de tela do dashboard e formulários nesta seção para facilitar a visualização.

---

## Boas práticas e contribuições

- Siga as convenções descritas em `DEVELOPMENT.md`
- Abra issues para bugs ou features; use PRs com descrição clara e screenshots quando aplicável
- Escreva mensagens de commit objetivas (tipo: feat/, fix/, chore/)

---

## Licença

Projeto para portfólio — use conforme acordado com o autor.
