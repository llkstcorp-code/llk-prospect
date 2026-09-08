-- Fase 02 — Contatos.
--
-- Até aqui a ficha da empresa tinha um telefone e mais nada. Um CRM funciona
-- por pessoa: quem atende, quem decide, quem assina. Sem isso, a abordagem sai
-- endereçada a uma razão social.
--
-- Duas decisões que encurtam esta fase, herdadas das anteriores:
--
--   Não existe tabela `accounts`. `businesses` já é a empresa — ganha apenas a
--   marca de quem virou cliente.
--
--   Contato não tem dono. O funil é compartilhado desde a migration anterior,
--   e uma pessoa de contato pertence à empresa, não a quem a cadastrou.

alter table public.businesses
  add column if not exists is_client boolean not null default false;

comment on column public.businesses.is_client is
  'Verdadeiro depois que a empresa fecha o primeiro negócio.';

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  name text not null,
  -- Cargo ou papel: "dono", "gerente", "responsável pelo marketing".
  role text not null default '',
  email text,
  phone text,
  whatsapp text,
  is_primary boolean not null default false,
  notes text not null default '',
  -- Registra quem cadastrou, para atribuição. Não restringe acesso.
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_business_idx
  on public.contacts(business_id, created_at);

-- No máximo um contato principal por empresa. O índice parcial deixa o banco
-- garantir isso, em vez de depender de a aplicação lembrar de desmarcar o
-- anterior.
create unique index if not exists contacts_primary_idx
  on public.contacts(business_id) where is_primary;

alter table public.contacts enable row level security;

revoke all on table public.contacts from anon;
grant select, insert, update, delete on table public.contacts to authenticated;

drop policy if exists contacts_team on public.contacts;
create policy contacts_team on public.contacts
  for all to authenticated
  using (true)
  with check (true);
