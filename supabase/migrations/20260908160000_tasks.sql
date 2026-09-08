-- Fase 04 — Tarefas.
--
-- A timeline registra o passado: o que já foi feito, quando. Falta o futuro —
-- a próxima ação, com data e responsável. É a diferença entre um sistema que
-- se consulta quando alguém lembra e um que a pessoa abre de manhã porque ele
-- diz o que fazer hoje.

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  -- Responsável, não dono. Todos veem todas as tarefas; alguém executa cada uma.
  owner_id uuid not null references public.profiles(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete cascade,
  business_id text references public.businesses(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  kind text not null default 'followup'
    check (kind in ('followup', 'ligacao', 'reuniao', 'proposta', 'outro')),
  due_at timestamptz not null,
  done_at timestamptz,
  -- Marca as que o sistema criou sozinho ao mover um negócio de etapa. Sem
  -- isso não há como saber se a agenda é do vendedor ou do automatismo.
  is_automatic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tasks is
  'Próximas ações do funil. O passado fica em deal_events.';

-- A consulta de todo dia é "o que está aberto e vence quando". O índice
-- parcial cobre só as abertas, que são poucas perto do histórico acumulado.
create index if not exists tasks_open_idx
  on public.tasks(due_at) where done_at is null;

create index if not exists tasks_owner_open_idx
  on public.tasks(owner_id, due_at) where done_at is null;

create index if not exists tasks_deal_idx on public.tasks(deal_id, due_at);

-- Um follow-up automático em aberto por negócio. Mover um card de etapa e
-- voltar não deve empilhar três lembretes da mesma coisa.
create unique index if not exists tasks_auto_open_idx
  on public.tasks(deal_id) where is_automatic and done_at is null;

alter table public.tasks enable row level security;

revoke all on table public.tasks from anon;
grant select, insert, update, delete on table public.tasks to authenticated;

drop policy if exists tasks_team on public.tasks;
create policy tasks_team on public.tasks
  for all to authenticated
  using (true)
  with check (true);
