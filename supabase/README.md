# Banco de dados

Para criar um novo banco do LLK Prospect:

1. Crie um projeto no Supabase.
2. Abra **SQL Editor → New query**.
3. Cole e execute o conteúdo de
   `migrations/20260817000000_initial_schema.sql`.
4. Configure a URL e as chaves do projeto nas variáveis do ambiente.

A migração cria as tabelas, índices e habilita RLS sem conceder acesso aos
papéis públicos. A aplicação acessa o banco apenas nas rotas do servidor com
`SUPABASE_SECRET_KEY`.

Quando a autenticação real for adicionada, substitua o acesso privilegiado por
políticas RLS associadas ao usuário.
