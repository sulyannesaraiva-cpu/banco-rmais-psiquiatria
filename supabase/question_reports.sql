-- Reportes de erro nas questões, enviados pelos usuários (botão "Reportar erro" na questão).
-- Cada pessoa logada pode enviar e ver os próprios reportes; a administração (public.is_admin())
-- vê todos e marca como resolvido.
--
-- Como aplicar: Supabase > SQL Editor > New query > colar este arquivo > Run. Basta uma vez.

create table if not exists public.question_reports (
  id bigint generated always as identity primary key,
  question_id text not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  author_name text,
  reason text not null,
  details text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid
);

create index if not exists question_reports_open_idx on public.question_reports (question_id) where resolved_at is null;

alter table public.question_reports enable row level security;

drop policy if exists "reports insert own" on public.question_reports;
create policy "reports insert own" on public.question_reports
  for insert to authenticated
  with check (user_id = auth.uid() and resolved_at is null);

drop policy if exists "reports read own or admin" on public.question_reports;
create policy "reports read own or admin" on public.question_reports
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "reports admin update" on public.question_reports;
create policy "reports admin update" on public.question_reports
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "reports admin delete" on public.question_reports;
create policy "reports admin delete" on public.question_reports
  for delete to authenticated
  using (public.is_admin());

grant select, insert, update, delete on public.question_reports to authenticated;
