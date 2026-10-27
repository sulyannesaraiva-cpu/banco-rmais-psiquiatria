-- Distribuição das respostas por questão (primeira tentativa de cada pessoa), para a
-- administração achar gabaritos suspeitos: questões em que quase todos erram, ou em que a
-- maioria marca a mesma alternativa "errada". Só administradores recebem linhas; questões com
-- menos de 5 pessoas não aparecem.
--
-- Como aplicar: Supabase > SQL Editor > New query > colar este arquivo > Run. Basta uma vez.

create or replace function public.question_answer_stats()
returns table (question_id text, users bigint, answers jsonb)
language sql
stable
security definer
set search_path = public
as $$
  with first_attempt as (
    select distinct on (a.user_id, a.question_id)
      a.user_id, a.question_id::text as question_id, upper(a.selected_answer) as answer
    from public.question_attempts a
    where public.is_admin() and a.selected_answer is not null and a.selected_answer <> ''
    order by a.user_id, a.question_id, a.answered_at
  ),
  per_answer as (
    select question_id, answer, count(*) as n
    from first_attempt
    group by question_id, answer
  )
  select p.question_id, sum(p.n)::bigint as users, jsonb_object_agg(p.answer, p.n) as answers
  from per_answer p
  group by p.question_id
  having sum(p.n) >= 5
$$;

revoke all on function public.question_answer_stats() from public, anon;
grant execute on function public.question_answer_stats() to authenticated;
