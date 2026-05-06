# Infraestrutura — Sistema de Gerenciamento de Serviços

Este documento contém todas as informações sobre plataformas, credenciais, banco de dados e como administrar o sistema.

---

## 🏗️ Visão Geral da Infraestrutura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Navegador  │────▶│    Vercel     │     │   Supabase   │
│  (React App) │     │  (Frontend)  │     │  (Backend)   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           │                    │                    │
                    ┌──────▼──────┐     ┌───────▼──────┐    ┌───────▼──────┐
                    │ PostgreSQL  │     │  Auth/Users   │    │   Storage    │
                    │  (Tabelas)  │     │  (Login)      │    │   (Fotos)    │
                    └─────────────┘     └──────────────┘    └──────────────┘
```

---

## 🔑 Credenciais e Acessos

### Supabase

| Item | Valor |
|---|---|
| **Dashboard** | `[URL_DO_DASHBOARD_SUPABASE]` |
| **Project URL** | `https://[SEU_PROJETO].supabase.co` |
| **Anon Key (pública)** | `[SUA_ANON_KEY_AQUI]` |
| **Service Key** | ⚠️ NÃO compartilhe. Acesse em: Dashboard → Settings → API → service_role |

> A **Anon Key** é segura para expor no frontend (RLS protege os dados).
> A **Service Key** tem acesso total — NUNCA coloque no código.

### Vercel

| Item | Valor |
|---|---|
| **Dashboard** | https://vercel.com/dashboard |
| **URL do site** | `[SUA_URL_VERCEL_AQUI]` |
| **Variáveis de ambiente** | Configuradas no painel: Settings → Environment Variables |

### GitHub

| Item | Valor |
|---|---|
| **Repositório** | `[URL_DO_SEU_REPOSITORIO]` |
| **Branch principal** | `main` |

---

## 👥 Como Cadastrar Novos Usuários (Técnicos)

Para adicionar um novo técnico que poderá fazer login no sistema:

### Passo 1 — Criar usuário no Supabase Auth

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** → **Users**
3. Clique **"Add User"** → **"Create New User"**
4. Preencha:
   - **Email:** `exemplo@empresa.com`
   - **Password:** Uma senha segura
   - Marque **"Auto Confirm User"** ✅
5. Clique **"Create User"**

### Passo 2 — Criar perfil do técnico

O perfil é criado **automaticamente** pelo trigger `handle_new_user` que instalamos no SQL. Mas se o nome não ficou correto, ajuste manualmente:

1. No Supabase, vá em **Table Editor** → tabela **`profiles`**
2. Encontre o novo usuário (pelo ID)
3. Edite o campo **`nome`** para o nome completo (ex: "Carlos Souza")
4. Edite o campo **`iniciais`** para as iniciais (ex: "CS")

### Passo 3 — Informar o técnico

Envie para o técnico:
- **URL do sistema:** `[SUA_URL_VERCEL_AQUI]`
- **E-mail:** o que você cadastrou
- **Senha:** a que você definiu

Pronto! O técnico já pode fazer login e usar o sistema.

---

## 🗄️ Banco de Dados — Tabelas

### Diagrama de Relacionamento

```
profiles ←─── auth.users
    │
    │ (usuario_id)
    │
    ▼
ordens_servico ──── empresas
    │                   │
    │                   │ (empresa_id)
    │                   │
    │               empresa_contatos
    │
    └── tipos_servico (referência para tipo de serviço)

relatorios ──── empresas (log de relatórios gerados)
```

### Tabela: `profiles`
Extensão do sistema de auth. Criada automaticamente ao cadastrar usuário.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK, FK→auth.users) | ID do usuário |
| `nome` | TEXT | Nome completo do técnico |
| `iniciais` | TEXT | Iniciais (ex: "JN") |
| `criado_em` | TIMESTAMPTZ | Data de criação |

### Tabela: `empresas`
Empresas contratantes que contratam os serviços.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `nome` | TEXT | Nome da empresa |
| `cnpj` | TEXT | CNPJ formatado |
| `endereco` | TEXT | Endereço |
| `cidade` | TEXT | Cidade |
| `estado` | TEXT | UF (2 letras) |
| `observacoes` | TEXT | Observações |
| `criado_em` | TIMESTAMPTZ | Data de criação |

### Tabela: `empresa_contatos`
Contatos de cada empresa (para envio de relatórios).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `empresa_id` | UUID (FK→empresas) | Empresa vinculada |
| `nome_contato` | TEXT | Nome da pessoa |
| `email` | TEXT | E-mail |

### Tabela: `ordens_servico`
Tabela central — cada linha é uma ordem de serviço.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `numero` | SERIAL | Número sequencial da OS |
| `empresa_id` | UUID (FK→empresas) | Empresa contratante |
| `usuario_id` | UUID (FK→auth.users) | Técnico que executou |
| `cliente` | TEXT | Nome do cliente final |
| `endereco` | TEXT | Rua |
| `numero_endereco` | TEXT | Número da casa |
| `cidade` | TEXT | Cidade |
| `data_hora` | TIMESTAMPTZ | Data/hora do serviço |
| `tipo_servico` | TEXT | Tipo (Instalação, Reparo, etc.) |
| `valor` | DECIMAL(10,2) | Valor em R$ |
| `quantidade` | INT | Quantidade de serviços |
| `status` | TEXT | `aberta`, `concluida`, `faturada` |
| `lat` / `lng` | DECIMAL | Coordenadas GPS |
| `gps_precisao` | DECIMAL | Precisão em metros |
| `gps_timestamp` | TIMESTAMPTZ | Hora da captura GPS |
| `observacoes` | TEXT | Obs da criação |
| `obs_execucao` | TEXT | Obs da execução/conclusão |
| `data_execucao` | TIMESTAMPTZ | Data real de execução |
| `foto_url` | TEXT | URL da foto no Storage |
| `criado_em` | TIMESTAMPTZ | Criação |
| `concluido_em` | TIMESTAMPTZ | Conclusão |

### Tabela: `tipos_servico`
Lista de tipos de serviço (gerenciável).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `nome` | TEXT | Nome do tipo (ex: "Instalação") |
| `ativo` | BOOLEAN | Se está ativo |
| `ordem` | INT | Ordem de exibição |

> **Nota:** Atualmente os tipos estão hardcoded em `src/lib/utils.js` (constante `TIPOS_SERVICO`). Para adicionar novos tipos, edite essa constante e faça push. No futuro, pode-se migrar para ler da tabela `tipos_servico` do banco.

### Tabela: `relatorios`
Log de relatórios gerados (para auditoria).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID (PK) | ID único |
| `empresa_id` | UUID (FK→empresas) | Empresa |
| `periodo_inicio` | DATE | Início do período |
| `periodo_fim` | DATE | Fim do período |
| `gerado_por` | UUID (FK→auth.users) | Quem gerou |
| `total_servicos` | INT | Quantidade de serviços |
| `total_valor` | DECIMAL | Valor total |
| `gerado_em` | TIMESTAMPTZ | Quando foi gerado |

---

## 📸 Storage (Fotos)

As fotos de evidência das OSs são armazenadas no **Supabase Storage**.

| Item | Valor |
|---|---|
| **Bucket** | `os-fotos` |
| **Estrutura de pastas** | `os-fotos/{os_id}/{timestamp}.jpg` |
| **Acesso** | Público (qualquer um com a URL pode ver a foto) |
| **Compressão** | Client-side: max 1200px largura, JPEG 75% quality |

Para ver/gerenciar fotos: Supabase Dashboard → **Storage** → **os-fotos**

---

## 🔒 Segurança (Row Level Security)

Todas as tabelas têm **RLS habilitado**. A política atual é simples:

```sql
-- Qualquer usuário autenticado pode fazer tudo
CREATE POLICY "Auth users full access" ON nome_da_tabela
  FOR ALL USING (auth.role() = 'authenticated');
```

Isso significa que qualquer técnico logado pode ver/editar todos os dados. Como a equipe é pequena (2-3 técnicos), isso é aceitável. No futuro, se precisar restringir (ex: técnico só vê suas próprias OSs), ajuste as policies no Supabase.

---

## 🔄 Fluxo de Atualizações

```
Código local → git push → GitHub → Vercel detecta → Build automático → Site atualizado
```

### Tempo de deploy: ~30 segundos após o push.

### Como reverter uma atualização problemática:

1. Na **Vercel Dashboard** → **Deployments**
2. Encontre o deploy anterior que estava funcionando
3. Clique nos **3 pontinhos** → **"Promote to Production"**

---

## 🆘 Troubleshooting

### "Login não funciona no site publicado"
- Verifique se as variáveis de ambiente estão configuradas na Vercel (Settings → Environment Variables)
- Verifique se a URL do site está cadastrada no Supabase (Authentication → URL Configuration → Site URL)

### "Dados não aparecem"
- Abra o DevTools (F12) → Console e veja se há erros de permissão
- Verifique se as policies RLS estão criadas corretamente no Supabase

### "Tela de loading infinita"
- Limpe os dados do site: DevTools (F12) → Application → Storage → Clear site data
- Verifique se o Supabase está no ar: https://status.supabase.com

### "Build falha na Vercel"
- Veja o log de build na Vercel Dashboard → Deployments → clique no deploy com erro
- Teste localmente: `npm run build` — se funcionar local, o problema é variável de ambiente
