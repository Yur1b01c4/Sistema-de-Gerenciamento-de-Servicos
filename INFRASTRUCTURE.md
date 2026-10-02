# Infraestrutura — Sistema de Gerenciamento de Serviços

Resumo sucinto das dependências e instruções essenciais para replicar ou manter a infraestrutura do projeto.

---

## Arquitetura (resumida)

- Frontend: PWA em React hospedada no Vercel.
- Backend: Supabase (Postgres + Auth + Storage).
- Fluxo: Browser ↔ Vercel (servido estático) ↔ Supabase (API/Storage).

---

## Variáveis de ambiente essenciais

Defina as variáveis abaixo no `.env.local` (local) e no painel do Vercel (produção):

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Observação: não versionar chaves. A `VITE_SUPABASE_ANON_KEY` é a chave pública utilizada no frontend; a Service Role Key (service_role) é sensível e NÃO deve ser exposta no cliente.

---

## Supabase — notas importantes

- A maioria das operações do app assume que as tabelas e triggers definidas em `supabase_setup.sql` estejam criadas.
- Row Level Security (RLS) está habilitado. Ajuste policies conforme necessidade do projeto.
- Buckets: fotos das OSs são salvas no bucket `os-fotos` (estrutura: `os-fotos/{os_id}/{timestamp}.jpg`).

Para administração rápida (usuários, storage, policies) utilize o Supabase Dashboard do projeto.

---

## Provisionamento e deploy

- Deploy do frontend é feito pelo Vercel (conecte o repositório e configure as env vars).
- Fluxo típico: push para `main` → Vercel build automático → site atualizado.
- Para reverter um deploy use a interface do Vercel (Promote ou rollback nas Deployments).

---

## Criar/Adicionar usuários (técnicos)

A forma recomendada em produção é permitir que técnicos se cadastrem via fluxo de autenticação (e-mail). Caso precise criar manualmente:

1. No Supabase Dashboard → Authentication → Users → Add user
2. Defina e-mail e senha, marque "Auto confirm" se necessário
3. Verifique a tabela `profiles` (um registro é criado por trigger) e ajuste nome/iniciais quando necessário

---

## Banco de dados — referência rápida

As principais tabelas do sistema (descrição reduzida):

- profiles — extensão do usuário (nome, iniciais)
- empresas — clientes/contratantes
- empresa_contatos — contatos para envio de relatórios
- ordens_servico — registro das Ordens de Serviço (GPS, foto, status, valor)
- tipos_servico — catálogo de tipos de serviço
- relatorios — logs de relatórios gerados

Para o esquema completo e scripts use `supabase_setup.sql`.

---

## Segurança

- Nunca exponha a service_role key.
- A anon key pode ser usada no frontend, desde que as policies RLS protejam dados sensíveis.

---

## Troubleshooting rápido

- Login falha: verifique env vars no Vercel e a configuração de Site URL no Supabase (Authentication → URL Configuration).
- Dados ausentes: verifique policies RLS e permissões das tabelas no Supabase.
- Erro no build: confira variáveis de ambiente e execute `npm run build` localmente para reproduzir o erro.

---

Se desejar, posso também:
- extrair e publicar um checklist de deploy automatizado;
- adicionar um script de seed para dados de exemplo;
- criar instruções para backup/restore do banco (pg_dump / Supabase backups).
