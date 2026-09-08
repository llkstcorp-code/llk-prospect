-- Fase 03 — Negócios.
--
-- `leads` guardava uma linha por empresa, para sempre. Isso impede renovação,
-- upsell e segundo projeto: o cliente que fechou um site e volta seis meses
-- depois querendo SEO não tinha onde ser registrado.
--
-- A tabela é renomeada em vez de recriada. Ids, histórico e notas seguem
-- intactos, e nenhum dado precisa ser copiado de um lugar para outro.

alter table public.leads rename to deals;
alter table public.lead_events rename to deal_events;
alter table public.deal_events rename column lead_id to deal_id;
alter table public.lead_notes rename to deal_notes;
alter table public.deal_notes rename column lead_id to deal_id;

-- ---------------------------------------------------------------------------
-- O que um negócio passa a ter além do que o lead tinha
-- ---------------------------------------------------------------------------

alter table public.deals
  -- Como a equipe chama este negócio. Dois negócios da mesma empresa precisam
  -- se distinguir por algo que não seja o nome do cliente.
  add column if not exists title text not null default '',
  -- Com quem se fala neste negócio. Pode ser diferente do contato principal da
  -- empresa: quem decide o site nem sempre é quem decide a manutenção.
  add column if not exists contact_id uuid
    references public.contacts(id) on delete set null,
  -- Quando fechou ou se perdeu. Sem isso não há ciclo de venda para medir.
  add column if not exists closed_at timestamptz,
  add column if not exists lost_reason text;

-- Negócios que já nasceram fechados ou perdidos antes desta coluna existir
-- recebem a data da última atualização como data de encerramento. É uma
-- aproximação, e é melhor que nulo em um relatório.
update public.deals
set closed_at = updated_at
where closed_at is null and status in ('fechado', 'perdido');

-- Título para os negócios que vieram da época dos leads.
update public.deals set title = service_name where title = '';

-- ---------------------------------------------------------------------------
-- Cai a restrição de um negócio por empresa
-- ---------------------------------------------------------------------------

drop index if exists public.leads_business_idx;
drop index if exists public.leads_owner_business_idx;
drop index if exists public.leads_status_idx;
drop index if exists public.leads_owner_idx;

create index if not exists deals_business_idx
  on public.deals(business_id, created_at desc);
create index if not exists deals_status_idx on public.deals(status);
create index if not exists deals_owner_idx
  on public.deals(owner_id, created_at desc);
create index if not exists deals_open_idx on public.deals(created_at desc)
  where status not in ('fechado', 'perdido');

alter index if exists lead_events_lead_id_idx rename to deal_events_deal_id_idx;
alter index if exists lead_notes_lead_id_idx rename to deal_notes_deal_id_idx;

-- ---------------------------------------------------------------------------
-- Empresa vira cliente quando fecha o primeiro negócio
-- ---------------------------------------------------------------------------

create or replace function public.mark_business_as_client()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'fechado' then
    update public.businesses set is_client = true where id = new.business_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_deal_won on public.deals;
create trigger on_deal_won
  after insert or update of status on public.deals
  for each row execute function public.mark_business_as_client();

update public.businesses b set is_client = true
where exists (
  select 1 from public.deals d
  where d.business_id = b.id and d.status = 'fechado'
);

-- ---------------------------------------------------------------------------
-- Policies acompanham os nomes novos
-- ---------------------------------------------------------------------------

drop policy if exists leads_team on public.deals;
create policy deals_team on public.deals
  for all to authenticated using (true) with check (true);

drop policy if exists lead_events_team on public.deal_events;
create policy deal_events_team on public.deal_events
  for all to authenticated using (true) with check (true);

drop policy if exists lead_notes_team on public.deal_notes;
create policy deal_notes_team on public.deal_notes
  for all to authenticated using (true) with check (true);
