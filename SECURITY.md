# Segurança

O LLK Prospect é um sistema interno e utiliza uma chave privilegiada do
Supabase somente no servidor.

## Publicação

- Nunca publique `.env.local` ou `SUPABASE_SECRET_KEY` no GitHub.
- Defina `APP_ACCESS_PASSWORD` em todo ambiente de produção.
- Use apenas HTTPS em produção. A Vercel fornece HTTPS automaticamente.
- Não desative a proteção compartilhada antes de implementar autenticação real
  e políticas RLS por usuário.
- Restrinja as chaves do Geoapify e do Google conforme as opções oferecidas por
  cada provedor.

Se uma chave secreta for exposta, revogue-a no provedor, gere outra e atualize
as variáveis do ambiente publicado.
