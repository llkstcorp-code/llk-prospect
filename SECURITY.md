# Segurança

O LLK Prospect é um sistema interno e utiliza uma chave privilegiada do
Supabase somente no servidor.

## Publicação

- Nunca publique `.env.local` ou `SUPABASE_SECRET_KEY` no GitHub.
- Crie as contas pelo painel do Supabase. Não existe cadastro aberto.
- Use apenas HTTPS em produção. A Vercel fornece HTTPS automaticamente.
- Não use `SUPABASE_SECRET_KEY` para responder requisições do painel: ela ignora
  o RLS e devolveria os dados de todos os vendedores.
- Ao criar tabela nova, escreva a policy junto. RLS ligado sem policy bloqueia
  tudo; RLS com policy errada libera tudo.
- Restrinja as chaves do Geoapify e do Google conforme as opções oferecidas por
  cada provedor.

Se uma chave secreta for exposta, revogue-a no provedor, gere outra e atualize
as variáveis do ambiente publicado.
