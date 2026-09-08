-- Funil compartilhado.
--
-- A fase 01 deu carteira individual a cada vendedor. Na prática a LLK trabalha
-- um funil só: todos veem e mexem em tudo. Esta migration troca as policies de
-- dono por policies de equipe.
--
-- `owner_id` continua sendo gravado e não some. Ele deixa de decidir quem vê o
-- quê e passa a ser apenas atribuição: quem trouxe este lead. É o que permite
-- voltar atrás sem perder informação.

-- ---------------------------------------------------------------------------
-- Leads, histórico e notas: da equipe
-- ---------------------------------------------------------------------------

drop policy if exists leads_own on public.leads;
create policy leads_team on public.leads
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists lead_events_own on public.lead_events;
create policy lead_events_team on public.lead_events
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists lead_notes_own on public.lead_notes;
create policy lead_notes_team on public.lead_notes
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists searches_own on public.searches;
create policy searches_team on public.searches
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists search_results_own on public.search_results;
create policy search_results_team on public.search_results
  for all to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Um lead por empresa volta a valer para a equipe inteira.
--
-- Com carteira individual, dois vendedores podiam trabalhar a mesma empresa em
-- paralelo. Num funil compartilhado isso vira duplicata: dois cards da mesma
-- empresa, cada um com metade do histórico.
-- ---------------------------------------------------------------------------

drop index if exists public.leads_owner_business_idx;

create unique index if not exists leads_business_idx
  on public.leads(business_id);

-- ---------------------------------------------------------------------------
-- Perfis continuam privados: cada um vê e edita o próprio.
--
-- E a revogação do acesso anônimo, que ficou pendente da fase 01. Sem ela o
-- acesso sem sessão responde 200 com lista vazia em vez de `permission denied`,
-- e a diferença é onde um erro de policy passa despercebido.
-- ---------------------------------------------------------------------------

revoke all on table public.profiles from anon;
