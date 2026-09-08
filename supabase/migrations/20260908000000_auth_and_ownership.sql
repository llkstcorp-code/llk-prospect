-- Fase 01 — Identidade e propriedade dos dados.
--
-- Até aqui o sistema tinha um único usuário (Basic Auth) e todo acesso ao banco
-- passava pela chave de serviço, ignorando o RLS. Esta migration troca isso por
-- autenticação real do Supabase e escreve as policies que faltavam.
--
-- Decisão de modelagem: nem tudo é do vendedor.
--
--   businesses  → compartilhada. O id é o place_id da fonte pública, então dois
--                 vendedores pesquisando a mesma cidade chegam na mesma linha.
--                 Dar dono a essa tabela criaria conflito de chave primária.
--   services    → compartilhada. É o catálogo da LLK, não de uma pessoa.
--   searches    → do vendedor. É o histórico de trabalho dele.
--   leads       → do vendedor. É a carteira dele, e é o que o RLS protege.
--
-- Eventos e notas herdam o dono do lead; resultados de busca herdam o da busca.

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  email text not null default '',
  company text not null default 'LLK',
  role_title text not null default 'Comercial',
  role text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  -- Preferências de prospecção (cidade padrão, raio, categorias favoritas).
  -- Ficavam em memória no servidor, o que com dois usuários faria um
  -- sobrescrever o outro.
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Dados de aplicação do usuário autenticado, espelhando auth.users.';

-- Todo usuário criado no Auth ganha um perfil automaticamente. Sem isso, a
-- primeira consulta depois do cadastro devolveria vazio e a interface abriria
-- sem nome nenhum.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- `security definer` porque a policy de profiles precisa consultar profiles:
-- ler a tabela direto dentro da própria policy entra em recursão infinita.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Dono nas tabelas de trabalho
-- ---------------------------------------------------------------------------

alter table public.leads
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

alter table public.searches
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

-- Adoção dos dados que já existem: tudo passa para o primeiro perfil criado.
-- Em um banco novo não há o que adotar e o update não afeta nenhuma linha.
do $$
declare
  first_profile uuid;
begin
  select id into first_profile from public.profiles order by created_at limit 1;
  if first_profile is not null then
    update public.leads set owner_id = first_profile where owner_id is null;
    update public.searches set owner_id = first_profile where owner_id is null;
  end if;
end;
$$;

create index if not exists leads_owner_idx on public.leads(owner_id, created_at desc);
create index if not exists searches_owner_idx on public.searches(owner_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Permissões: o papel `authenticated` passa a acessar o banco diretamente,
-- filtrado pelas policies abaixo. A migration anterior revogava tudo dele
-- porque só a chave de serviço entrava.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Tabela nova em `public` nasce com privilégio para `anon`. Sem revogar, o
-- acesso anônimo é barrado só pela policy e responde 200 com lista vazia, em vez
-- do `permission denied` que as outras tabelas devolvem. Mesma proteção, leitura
-- mais difícil — e é na diferença que passa despercebido um erro de policy.
revoke all on table public.profiles from anon;

grant select, insert, update, delete on table public.leads to authenticated;
grant select, insert, update, delete on table public.lead_events to authenticated;
grant select, insert, update, delete on table public.lead_notes to authenticated;
grant select, insert, update, delete on table public.searches to authenticated;
grant select, insert, update, delete on table public.search_results to authenticated;
grant select, insert, update, delete on table public.businesses to authenticated;
grant select, insert, update, delete on table public.services to authenticated;
grant select, update on table public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_write on public.profiles;
create policy profiles_write on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Catálogo e base de empresas são da equipe: quem está autenticado enxerga e
-- mantém. O que separa um vendedor do outro é a carteira, não a fonte.
drop policy if exists services_team on public.services;
create policy services_team on public.services
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists businesses_team on public.businesses;
create policy businesses_team on public.businesses
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists searches_own on public.searches;
create policy searches_own on public.searches
  for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid());

drop policy if exists search_results_own on public.search_results;
create policy search_results_own on public.search_results
  for all to authenticated
  using (
    exists (
      select 1 from public.searches s
      where s.id = search_id
        and (s.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.searches s
      where s.id = search_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists leads_own on public.leads;
create policy leads_own on public.leads
  for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid());

drop policy if exists lead_events_own on public.lead_events;
create policy lead_events_own on public.lead_events
  for all to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = lead_id and l.owner_id = auth.uid()
    )
  );

drop policy if exists lead_notes_own on public.lead_notes;
create policy lead_notes_own on public.lead_notes
  for all to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_id
        and (l.owner_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.leads l
      where l.id = lead_id and l.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Um lead por empresa deixa de ser global e passa a ser por vendedor. Sem isso,
-- dois vendedores nunca poderiam trabalhar a mesma empresa — e essa restrição
-- some de vez na fase 03, quando `leads` vira `deals`.
-- ---------------------------------------------------------------------------

alter table public.leads drop constraint if exists leads_business_id_key;
create unique index if not exists leads_owner_business_idx
  on public.leads(owner_id, business_id);
