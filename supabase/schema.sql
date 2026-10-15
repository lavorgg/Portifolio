-- Rode este script uma vez no SQL Editor do Supabase.

-- Todo o conteúdo do site fica num único documento JSON.
create table if not exists public.site_content (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Só o servidor do site (com a service role key) acessa a tabela.
alter table public.site_content enable row level security;

-- Bucket público para prints e vídeos.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;
