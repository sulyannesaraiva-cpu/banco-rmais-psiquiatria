-- Totais de erro por questão, somando todos os usuários (só números, sem dados pessoais).
-- Usado pela Administração para ordenar a fila "Sem comentário" pelo que mais se erra.
-- Só administradores recebem linhas: a função confere public.is_admin() (a mesma usada pelo site).
--
-- Como aplicar: Supabase > SQL Editor > New query > colar este arquivo > Run. Basta uma vez.

create or replace function public.question_error_stats()
returns table (question_id text, users bigint, users_wrong bigint, attempts bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    a.question_id::text,
    count(distinct a.user_id) as users,
    count(distinct a.user_id) filter (where a.is_correct = false) as users_wrong,
    count(*) as attempts
  from public.question_attempts a
  where public.is_admin()
  group by a.question_id
$$;

revoke all on function public.question_error_stats() from public, anon;
grant execute on function public.question_error_stats() to authenticated;
