# Sistema de Gerenciamento de Serviços

> **PWA de gestão para técnicos autônomos.**
> Controle de Ordens de Serviço, empresas contratantes e geração de relatórios PDF/XLSX.

![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000?logo=vercel)

---

## 🔗 Links Rápidos

| Recurso | URL |
|---|---|
| **App Demo** | `[URL do App em Produção]` |
| **Repositório GitHub** | `[URL do seu Repositório]` |

---

## 📋 Sobre o Projeto

**Sistema de Gerenciamento de Serviços** é uma aplicação para técnicos autônomos que prestam serviços de instalação, manutenção e reparo de redes. Antes usavam uma planilha Excel para controlar os serviços. Este sistema substitui essa planilha por um app web profissional.

### Funcionalidades

- **Login** com autenticação real (Supabase Auth)
- **Dashboard** com KPIs (OS do mês, faturamento, OS hoje, OS abertas)
- **Empresas** — CRUD de empresas contratantes com contatos para relatório
- **Ordens de Serviço** — Ciclo completo: Aberta → Concluída → Faturada
  - Captura de foto de evidência (upload para Supabase Storage)
  - Captura de GPS via navegador
- **Relatórios** — Filtro por empresa/período/técnico, exportação PDF e XLSX
- **Dark/Light Mode**
- **Responsivo** (mobile-first, otimizado para celular de campo)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Frontend** | React (JavaScript) | 19.x |
| **Bundler** | Vite | 8.x |
| **Roteamento** | React Router DOM | 7.x |
| **Estilos** | Vanilla CSS (design system com tokens) | — |
| **Backend/Auth** | Supabase (PostgreSQL + Auth + Storage) | — |
| **PDF** | jsPDF + jsPDF-AutoTable | 2.5 / 3.8 |
| **XLSX** | SheetJS (xlsx) | 0.18 |
| **Ícones** | Lucide React | — |
| **Hospedagem** | Vercel | — |
| **Fontes** | Google Fonts (Inter + Barlow) | — |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- **Node.js** v20+ ([download](https://nodejs.org))
- **Git** ([download](https://git-scm.com))

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/Yur1b01c4/sistema-gestao-servicos.git
cd sistema-gestao-servicos

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
# Copie o .env.example para .env.local e preencha com suas chaves
cp .env.example .env.local

# Rodar em modo desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173/`

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL = Supabase_URL_aqui
VITE_SUPABASE_ANON_KEY = Anon_key_aqui
```

> ⚠️ O `.env.local` está no `.gitignore` — NUNCA suba chaves para o GitHub.

---

## 📦 Como Fazer Deploy (Atualizar o Site)

Sempre que alterar o código e quiser atualizar o site:

```bash
git add .
git commit -m "Descreva o que mudou"
git push
```

A Vercel detecta automaticamente e faz o redeploy em ~30 segundos.

---

## 📚 Documentação Adicional

| Documento | Conteúdo |
|---|---|
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Guia de desenvolvimento: como adicionar funcionalidades, estrutura de pastas, padrões de código |
| [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) | Infraestrutura: Supabase, Vercel, credenciais, como cadastrar usuários, banco de dados |
| [supabase_setup.sql](../supabase_setup.sql) | Script SQL para criação das tabelas do banco |

---

## 🎨 Design System

- **Paleta principal:** Azul naval `#0A1B3D` + Laranja `#F47B20`
- **Tipografia:** Barlow (títulos) + Inter (corpo)
- **Modo escuro/claro** com variáveis CSS
- **Tokens CSS** definidos em `src/index.css`

---

## 📝 Licença

Desenvolvido para portfólio.
