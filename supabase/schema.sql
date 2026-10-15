-- Rode este script no SQL Editor do Supabase. Pode rodar de novo sem perder dados.

-- Todo o conteúdo do site fica num único documento JSON.
create table if not exists public.site_content (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- Só o servidor do site (com a service role key) acessa a tabela.
alter table public.site_content enable row level security;

-- Bucket público para prints e vídeos, com limite de tamanho e de tipo de arquivo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800, -- 50 MB, o máximo do plano grátis
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
        'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Tentativas de login por IP (limite contra quem tenta adivinhar a senha).
create table if not exists public.login_attempts (
  key text primary key,
  attempts int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.login_attempts enable row level security;

-- Conta a tentativa e responde se ela está dentro do limite, numa operação só
-- (requisições em paralelo não conseguem furar o limite).
create or replace function public.register_login_attempt(p_key text, p_max int, p_window_seconds int)
returns table (allowed boolean, retry_after int)
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.login_attempts;
  win interval := make_interval(secs => p_window_seconds);
begin
  insert into public.login_attempts as la (key, attempts, window_start)
  values (p_key, 1, now())
  on conflict (key) do update set
    attempts     = case when la.window_start <= now() - win then 1     else la.attempts + 1 end,
    window_start = case when la.window_start <= now() - win then now() else la.window_start end
  returning * into r;

  delete from public.login_attempts where window_start < now() - interval '1 day';

  return query select
    r.attempts <= p_max,
    greatest(0, ceil(extract(epoch from (r.window_start + win - now()))))::int;
end;
$$;

-- Só o servidor pode chamar a função (por padrão, qualquer um com a chave pública poderia).
revoke execute on function public.register_login_attempt(text, int, int) from public, anon, authenticated;
grant execute on function public.register_login_attempt(text, int, int) to service_role;
