# Guia de Desenvolvimento — Sistema de Gerenciamento de Serviços

Este documento explica como o código está organizado e como adicionar novas funcionalidades.

---

## 📁 Estrutura de Pastas

```
app/
├── public/                          # Arquivos estáticos
├── src/
│   ├── main.jsx                     # Entry point (não mexer)
│   ├── App.jsx                      # Rotas + Providers
│   ├── index.css                    # TODO o CSS (design system + componentes)
│   │
│   ├── lib/                         # Utilitários e configurações
│   │   ├── supabase.js              # Cliente Supabase (conexão com o banco)
│   │   └── utils.js                 # Funções auxiliares (formatarCNPJ, parseMoeda, etc.)
│   │
│   ├── contexts/                    # Estado global (React Context)
│   │   ├── AuthContext.jsx          # Login/Logout/Sessão (Supabase Auth)
│   │   ├── ThemeContext.jsx         # Dark/Light mode
│   │   └── DataContext.jsx          # CRUD de empresas e ordens (Supabase Database)
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── ui/                      # Componentes genéricos (usados em várias páginas)
│   │   │   ├── Badge.jsx            # Badge de status (Aberta/Concluída/Faturada)
│   │   │   ├── Modal.jsx            # Modal genérico + ConfirmModal
│   │   │   └── Toast.jsx            # Notificações temporárias
│   │   │
│   │   ├── layout/                  # Estrutura do app
│   │   │   ├── AppShell.jsx         # Layout geral (Topbar + Sidebar + conteúdo)
│   │   │   ├── Topbar.jsx           # Barra superior (logo, sync, tema, usuário)
│   │   │   └── Sidebar.jsx          # Menu lateral de navegação
│   │   │
│   │   ├── ordens/                  # Componentes específicos de OS
│   │   │   ├── OSForm.jsx           # Formulário de criar/editar OS
│   │   │   ├── OSConcluirForm.jsx   # Modal de conclusão (foto + GPS)
│   │   │   └── OSDetalhe.jsx        # Modal de detalhes de uma OS
│   │   │
│   │   ├── empresas/                # (reservado para componentes de empresas)
│   │   └── relatorios/              # (reservado para componentes de relatórios)
│   │
│   └── pages/                       # Páginas (uma por rota)
│       ├── LoginPage.jsx            # /login
│       ├── DashboardPage.jsx        # /dashboard
│       ├── EmpresasPage.jsx         # /empresas
│       ├── OrdensPage.jsx           # /os
│       └── RelatoriosPage.jsx       # /relatorios
│
├── index.html                       # HTML base (fontes + scripts CDN)
├── .env.local                       # Variáveis de ambiente (NÃO sobe pro GitHub)
├── .env.example                     # Exemplo de variáveis (sobe pro GitHub)
├── vercel.json                      # Config de deploy (rewrites para SPA)
├── vite.config.js                   # Config do Vite
└── package.json                     # Dependências
```

---

## 🧩 Arquitetura

### Fluxo de dados

```
Usuário → Página → Context → Supabase → Banco de Dados
                      ↑
                      └── State (React) ← dados carregados do banco
```

### Contexts (Estado Global)

O app usa 3 contexts que envolvem toda a aplicação:

| Context | Arquivo | Responsabilidade |
|---|---|---|
| **AuthContext** | `contexts/AuthContext.jsx` | Login, logout, sessão do usuário, dados do perfil |
| **ThemeContext** | `contexts/ThemeContext.jsx` | Alternância dark/light mode |
| **DataContext** | `contexts/DataContext.jsx` | CRUD de empresas e ordens, comunicação com Supabase |

### Como usar um Context em qualquer componente:

```jsx
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../components/ui/Toast'

function MeuComponente() {
  const { user, logout } = useAuth()
  const { empresas, ordens, criarOS } = useData()
  const { theme, toggleTheme } = useTheme()
  const showToast = useToast()

  // usar...
}
```

---

## ➕ Como Adicionar Uma Nova Página

### 1. Criar o arquivo da página

Crie `src/pages/MinhaNovaPage.jsx`:

```jsx
export default function MinhaNovaPage() {
  return (
    <div className="page active" style={{ display: 'block' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Título da Página</h1>
          <p className="page-subtitle">Descrição</p>
        </div>
      </div>
      {/* conteúdo aqui */}
    </div>
  )
}
```

### 2. Registrar a rota

Em `src/App.jsx`, adicione a rota dentro do `<Route element={...AppShell...}>`:

```jsx
import MinhaNovaPage from './pages/MinhaNovaPage'

// Dentro das Routes:
<Route path="/minha-pagina" element={<MinhaNovaPage />} />
```

### 3. Adicionar no menu lateral

Em `src/components/layout/Sidebar.jsx`, adicione no array `NAV_ITEMS`:

```jsx
{ path: '/minha-pagina', label: 'Minha Página', icon: 'dashboard' },
```

E adicione o ícone SVG correspondente no objeto `ICONS`.

---

## ➕ Como Adicionar Uma Nova Função ao Supabase

### 1. Criar a tabela no Supabase

No Supabase Dashboard → SQL Editor, execute:

```sql
CREATE TABLE IF NOT EXISTS minha_tabela (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campo1 TEXT NOT NULL,
  campo2 INT DEFAULT 0,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE minha_tabela ENABLE ROW LEVEL SECURITY;

-- Policy de acesso
CREATE POLICY "Auth users full access" ON minha_tabela
  FOR ALL USING (auth.role() = 'authenticated');
```

### 2. Adicionar operações no DataContext

Em `src/contexts/DataContext.jsx`:

```jsx
// Adicionar state
const [meusDados, setMeusDados] = useState([])

// Adicionar no loadData()
const { data: meusData } = await supabase
  .from('minha_tabela')
  .select('*')
  .order('criado_em', { ascending: false })
setMeusDados(meusData || [])

// Adicionar funções de CRUD
const criarDado = useCallback(async (data) => {
  await supabase.from('minha_tabela').insert(data)
  await loadData()
}, [])

// Expor no Provider
<DataContext.Provider value={{ ...existente, meusDados, criarDado }}>
```

### 3. Usar na página

```jsx
const { meusDados, criarDado } = useData()
```

---

## 🎨 Como Estilizar

### O CSS fica todo em `src/index.css`

**NÃO usamos Tailwind CSS**. Usamos vanilla CSS com variáveis (tokens).

### Variáveis disponíveis (exemplos):

```css
/* Cores */
var(--color-bg)           /* fundo da página */
var(--color-surface)      /* fundo de cards */
var(--color-accent)       /* laranja da marca */
var(--color-primary)      /* azul naval */
var(--color-success)      /* verde */
var(--color-error)        /* vermelho */
var(--color-text)         /* texto principal */
var(--color-text-muted)   /* texto secundário */

/* Espaçamento */
var(--space-1) a var(--space-10)

/* Tipografia */
var(--text-xs) a var(--text-2xl)

/* Bordas */
var(--radius-md), var(--radius-lg)
```

### Classes CSS prontas:

| Classe | Uso |
|---|---|
| `.btn`, `.btn-primary` | Botões |
| `.btn-ghost`, `.btn-danger`, `.btn-save` | Variantes de botão |
| `.form-input` | Inputs e selects |
| `.form-label` | Labels |
| `.form-group` | Container de campo |
| `.badge`, `.badge-success`, `.badge-warning` | Badges |
| `.modal-backdrop`, `.modal` | Modais |
| `.table-card`, `.table-header` | Cards de tabela |
| `.kpi-card`, `.kpi-grid` | Cards do dashboard |
| `.page`, `.page-header`, `.page-title` | Layout de página |
| `.empresa-card`, `.empresa-card-header` | Cards de empresa |

---

## 🔧 Comandos Úteis

```bash
# Rodar em desenvolvimento (hot reload)
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Atualizar o site (após alterações)
git add .
git commit -m "Descrição da alteração"
git push
```

---

## 📐 Regras de Negócio Implementadas

1. **Empresa** — Não pode ser excluída se tiver OSs vinculadas
2. **OS** — Só pode ser excluída se status for "Aberta" (Concluída e Faturada são protegidas)
3. **Relatórios** — Mostram **somente** OSs com status "Concluída" (não abertas, não faturadas)
4. **Conclusão de OS** — Pode incluir foto de evidência e coordenadas GPS
5. **Ciclo de vida da OS:** Aberta → Concluída → Faturada (irreversível)
6. **Tipos de serviço** — Lista fixa no código (`utils.js`), gerenciável via tabela `tipos_servico` no Supabase
7. **Dashboard** — Mostra as últimas 10 OSs

---

## 📝 Dependências do Projeto

```json
{
  "react": "^19.x",
  "react-dom": "^19.x",
  "react-router-dom": "^7.x",
  "@supabase/supabase-js": "^2.x",
  "jspdf": "^2.5.x",
  "jspdf-autotable": "^3.8.x",
  "xlsx": "^0.18.x",
  "lucide-react": "^0.4x"
}
```

> **Nota:** jsPDF e SheetJS também são carregados via CDN no `index.html` para compatibilidade com exports globais (`window.jspdf`, `XLSX`).
