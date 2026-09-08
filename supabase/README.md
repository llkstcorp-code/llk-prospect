# Banco de dados

## Criar o banco do zero

**A ordem importa:** rode as migrations antes de criar qualquer usuário. É a
segunda migration que instala o gatilho que cria o perfil de quem se cadastra —
um usuário criado antes dela fica sem perfil.

1. Crie um projeto no Supabase.
2. Abra o arquivo `migrations/20260817000000_initial_schema.sql` no editor de
   código e copie **todo o conteúdo** dele (Ctrl+A, Ctrl+C). O SQL Editor do
   Supabase executa comandos SQL — colar o caminho do arquivo devolve
   `syntax error at or near "migrations"`.
3. No Supabase, abra **SQL Editor → New query**, cole e clique em **Run**.
4. Repita com `migrations/20260908000000_auth_and_ownership.sql` em uma nova
   query.

As duas juntas criam as tabelas, os índices, os perfis, o gatilho de cadastro e
as policies de RLS.

## Configurar o acesso

5. Em **Authentication → Sign In / Providers → Email**, deixe o provedor de
   e-mail ligado e **desmarque "Allow new users to sign up"**. As contas são
   criadas pela LLK; não existe cadastro aberto.
6. Em **Authentication → Users → Add user → Create new user**, crie sua conta
   com e-mail e senha e marque **Auto Confirm User**. Sem isso, o login é
   recusado até o e-mail ser confirmado.
7. Volte ao **SQL Editor** e promova sua conta a administradora — só ela enxerga
   a carteira de todos os vendedores:

   ```sql
   update public.profiles set role = 'admin' where email = 'seu@email.com';
   ```

8. Em **Project Settings → API keys**, copie os valores para o `.env.local`:

   | Variável | Onde fica |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (a antiga `anon`) |
   | `SUPABASE_SECRET_KEY` | Secret key (a antiga `service_role`) |

## Conferir se o RLS está fazendo o trabalho

Sem sessão, nada deve abrir. Com a chave publicável e nenhum login, toda tabela
tem de responder `permission denied` — nunca uma lista vazia com `200`.

## Perfil faltando

Se um usuário foi criado antes das migrations, ele não tem perfil e o painel
abre sem nome. Para adotar quem ficou de fora:

```sql
insert into public.profiles (id, name, email)
select id, coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1)), email
from auth.users
on conflict (id) do nothing;
```

## Quem enxerga o quê

O funil é compartilhado: quem está logado vê e edita tudo. O que separa é
apenas a sessão — sem login, nada.

| Tabela | Regra |
| --- | --- |
| `leads`, `lead_events`, `lead_notes` | Da equipe. `owner_id` registra quem trouxe o lead, mas não restringe o acesso. |
| `searches`, `search_results` | Da equipe. |
| `businesses` | Da equipe. O id é o da fonte pública, então dois vendedores pesquisando a mesma cidade chegam na mesma linha. |
| `services` | Da equipe. É o catálogo da LLK, não de uma pessoa. |
| `profiles` | Só o próprio, mais os admins. |

Um lead por empresa vale para a equipe inteira: quem clicar em "Adicionar" numa
empresa que já está no funil recebe o lead existente, não um segundo card.
