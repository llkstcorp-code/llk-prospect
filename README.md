# LLK Prospect

**Encontre empresas. Encontre oportunidades. Venda mais.**

Sistema interno de prospecção comercial da LLK. Pesquisa empresas por região,
calcula potencial comercial e organiza oportunidades, leads e negociações.

## Estado atual

- Busca real de empresas pelo Geoapify.
- Cidade padrão: Passos, Minas Gerais.
- Persistência de empresas, buscas, leads, CRM, timeline, notas e serviços no
  Supabase.
- Dashboard calculado somente com dados reais.
- Autenticação por usuário com Supabase Auth. Funil compartilhado pela equipe.
- Análise comercial e abordagem geradas por templates locais.
- WhatsApp simulado: o contato é registrado, mas a mensagem não é enviada.
- Perfil e preferências pessoais salvos no perfil do usuário.

## Stack

- Next.js 16 com App Router
- React 19 e TypeScript
- Tailwind CSS 4
- shadcn/ui e Radix UI
- Lucide Icons
- Supabase/PostgreSQL
- Geoapify

## Requisitos

- Node.js 20.9 ou superior
- npm
- Projeto no Supabase
- Chave do Geoapify

## Instalação local

```bash
npm ci
cp .env.example .env.local
npm run dev
```

No Windows, copie `.env.example` manualmente para `.env.local`.

A aplicação abre em `http://localhost:3000`.

## Variáveis de ambiente

```env
BUSINESSES_PROVIDER=geoapify
GEOAPIFY_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

GOOGLE_MAPS_API_KEY=
```

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `BUSINESSES_PROVIDER` | Sim | Use `geoapify` na V1. |
| `GEOAPIFY_API_KEY` | Sim | Busca empresas; utilizada somente no servidor. |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL pública do projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave do login e das consultas do usuário, filtradas por RLS. |
| `SUPABASE_SECRET_KEY` | Sim | Ignora o RLS. Só para tarefas administrativas no servidor. Nunca exponha. |
| `GOOGLE_MAPS_API_KEY` | Não | Alternativa futura ao Geoapify. |

## Acesso

O acesso é por conta individual do Supabase Auth. Não há cadastro aberto: crie os
usuários no painel do Supabase, em **Authentication → Users**. O perfil em
`public.profiles` é criado automaticamente por trigger.

O funil é compartilhado: quem está logado vê e edita todos os leads, buscas e
notas. Cada lead guarda em `owner_id` quem o trouxe, para atribuição — não para
restringir acesso. O que o RLS protege é a fronteira do login: sem sessão, o
banco não devolve nada.

## Banco de dados

Para criar as tabelas em um novo Supabase:

1. Abra **SQL Editor → New query**.
2. Execute [a migração inicial](supabase/migrations/20260817000000_initial_schema.sql).
3. Copie a URL e as chaves do projeto para o ambiente da aplicação.

A migração habilita RLS e não libera as tabelas para os papéis públicos. Nesta
V1, somente as rotas do servidor acessam o banco com a chave secreta.

## Verificações

```bash
npm run lint
npm run typecheck
npm run build
```

Para executar todas:

```bash
npm run check
```

O workflow em `.github/workflows/quality.yml` repete essas verificações em cada
push para `main` e em pull requests.

## Publicar no GitHub

Crie um repositório **privado** no GitHub e execute na pasta do projeto:

```bash
git init
git add .
git commit -m "feat: LLK Prospect V1"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

O `.env.local`, `node_modules`, `.next` e arquivos temporários já estão no
`.gitignore`. Confirme que `.env.local` não aparece no commit antes do push.

## Publicar na Vercel

1. Acesse o painel da Vercel e selecione **Add New → Project**.
2. Importe o repositório privado do GitHub.
3. Mantenha o preset **Next.js** e os comandos automáticos.
4. Em **Environment Variables**, cadastre todas as variáveis obrigatórias.
5. Aplique as variáveis a **Production** e **Preview**.
6. Clique em **Deploy**.
7. Abra a URL e entre com uma conta criada no Supabase Auth.

Para cada alteração enviada à branch `main`, a Vercel fará um novo deploy.

## Segurança da publicação

Este sistema manipula dados comerciais. Duas regras não devem ser afrouxadas:

- `SUPABASE_SECRET_KEY` ignora o RLS. Use apenas em tarefas sem usuário; nunca
  para responder uma requisição do painel.
- `proxy.ts` renova a sessão e redireciona quem não está logado, mas é uma
  checagem otimista. A autorização real está nas policies de RLS e em
  `lib/auth/session.ts`.

Consulte também [SECURITY.md](SECURITY.md).

## Estrutura principal

```text
app/                  Páginas e rotas HTTP
components/           Componentes de interface
data/                 Catálogo padrão e mocks isolados
lib/                  Regras, formatação e cliente Supabase do servidor
services/             Integrações e repositórios
store/                Cache e sincronização da interface
supabase/migrations/  Estrutura versionada do banco
types/                Tipos de domínio
```

## Fluxo dos dados

```text
Geoapify → rota de busca → score → Supabase
                                      ↓
Dashboard ← oportunidades ← empresas encontradas
                                      ↓
                         Leads → CRM → histórico
```

## Limitações conhecidas da V1

- Não existe conta individual por usuário.
- A proteção publicada usa um único usuário e senha compartilhados.
- A sugestão de abordagem ainda não utiliza Gemini.
- O botão de WhatsApp não envia mensagens reais.
- O Geoapify não oferece nota e quantidade de avaliações como o Google Places.
