create extension if not exists pgcrypto;

create table if not exists public.businesses (
  id text primary key,
  data_source text not null check (data_source in ('geoapify', 'google', 'mock')),
  name text not null,
  category text not null,
  city text not null,
  state text not null,
  address text not null default '',
  phone text not null default '',
  rating numeric(2,1) not null default 0,
  reviews integer not null default 0,
  rating_available boolean not null default false,
  website text,
  instagram text,
  email text,
  score integer not null default 0 check (score between 0 and 100),
  problem text not null,
  recommended_service_id text,
  estimated_value numeric(12,2) not null default 0,
  latitude double precision,
  longitude double precision,
  found_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.searches (
  id uuid primary key default gen_random_uuid(),
  city text not null,
  state text not null,
  radius_km integer not null,
  category text not null,
  filters jsonb not null default '{}'::jsonb,
  results_count integer not null default 0,
  provider text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.search_results (
  search_id uuid not null references public.searches(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (search_id, business_id)
);

create table if not exists public.services (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric(12,2) not null default 0,
  price_model text not null check (price_model in ('unico', 'mensal')),
  type text not null,
  min_score integer not null default 0 check (min_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id text not null unique references public.businesses(id) on delete restrict,
  service_id text references public.services(id) on delete set null,
  service_name text not null,
  estimated_value numeric(12,2) not null default 0,
  status text not null default 'novo' check (
    status in ('novo', 'contatado', 'respondeu', 'reuniao', 'proposta', 'fechado', 'perdido')
  ),
  created_at timestamptz not null default now(),
  last_contact_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type text not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists businesses_score_idx on public.businesses(score desc);
create index if not exists businesses_city_state_idx on public.businesses(city, state);
create index if not exists businesses_category_idx on public.businesses(category);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists lead_events_lead_id_idx on public.lead_events(lead_id, created_at desc);
create index if not exists lead_notes_lead_id_idx on public.lead_notes(lead_id, created_at desc);

alter table public.businesses enable row level security;
alter table public.searches enable row level security;
alter table public.search_results enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;
alter table public.lead_notes enable row level security;

revoke all on table public.businesses from anon, authenticated;
revoke all on table public.searches from anon, authenticated;
revoke all on table public.search_results from anon, authenticated;
revoke all on table public.services from anon, authenticated;
revoke all on table public.leads from anon, authenticated;
revoke all on table public.lead_events from anon, authenticated;
revoke all on table public.lead_notes from anon, authenticated;

grant all on table public.businesses to service_role;
grant all on table public.searches to service_role;
grant all on table public.search_results to service_role;
grant all on table public.services to service_role;
grant all on table public.leads to service_role;
grant all on table public.lead_events to service_role;
grant all on table public.lead_notes to service_role;
