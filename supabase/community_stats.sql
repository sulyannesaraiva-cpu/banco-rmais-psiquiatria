-- Totais anônimos para comparar o desempenho com o dos outros usuários.
-- Só números agregados; questões ou provas com poucas pessoas não aparecem (mínimo de 5),
-- para que ninguém consiga deduzir a resposta de alguém.
-- Qualquer pessoa logada pode consultar.
--
-- Como aplicar: Supabase > SQL Editor > New query > colar este arquivo > Run. Basta uma vez.

-- Por questão: quantas pessoas responderam e quantas erraram (na primeira vez que responderam).
create or replace function public.question_difficulty()
returns table (question_id text, users bigint, users_wrong bigint)
language sql
stable
security definer
set search_path = public
as $$
  with first_attempt as (
    select distinct on (a.user_id, a.question_id)
      a.user_id, a.question_id::text as question_id, a.is_correct
    from public.question_attempts a
    order by a.user_id, a.question_id, a.answered_at
  )
  select f.question_id,
         count(*) as users,
         count(*) filter (where f.is_correct = false) as users_wrong
  from first_attempt f
  group by f.question_id
  having count(*) >= 5
$$;

-- Por prova: média da nota no simulado (primeira tentativa de cada pessoa), a partir do histórico
-- de simulados guardado nas configurações da conta.
create or replace function public.exam_simulation_stats()
returns table (exam_id text, users bigint, average_score numeric)
language sql
stable
security definer
set search_path = public
as $$
  with attempts as (
    select s.user_id,
           entry->>'examId' as exam_id,
           (entry->>'score')::numeric as score,
           (entry->>'finishedAt')::bigint as finished_at
    from public.user_settings s,
         jsonb_array_elements(coalesce((s.settings::jsonb)->'simulationHistory', '[]'::jsonb)) as entry
    where entry->>'examId' is not null and entry->>'examId' not like 'custom-%'
  ),
  first_try as (
    select distinct on (user_id, exam_id) user_id, exam_id, score
    from attempts
    order by user_id, exam_id, finished_at
  )
  select exam_id, count(*) as users, round(avg(score), 1) as average_score
  from first_try
  group by exam_id
  having count(*) >= 5
$$;

revoke all on function public.question_difficulty() from public, anon;
revoke all on function public.exam_simulation_stats() from public, anon;
grant execute on function public.question_difficulty() to authenticated;
grant execute on function public.exam_simulation_stats() to authenticated;
