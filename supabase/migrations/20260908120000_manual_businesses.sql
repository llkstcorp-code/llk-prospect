-- Cadastro manual de empresas.
--
-- Nem toda empresa aparece nas fontes públicas: a indicação de um cliente, o
-- comércio visto na rua, o contato trocado num evento. Sem uma origem própria,
-- esses cadastros teriam de mentir sobre de onde vieram — e a interface perderia
-- a distinção entre o que foi apurado por uma fonte e o que foi digitado por uma
-- pessoa.

alter table public.businesses
  drop constraint if exists businesses_data_source_check;

alter table public.businesses
  add constraint businesses_data_source_check
  check (data_source in ('geoapify', 'google', 'mock', 'manual'));
