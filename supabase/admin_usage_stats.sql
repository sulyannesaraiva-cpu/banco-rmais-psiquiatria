-- Números de uso do site para o painel da Administração: contas, pessoas que estudaram,
-- questões respondidas, atividade dos últimos 30 dias e temas mais estudados.
-- Só administradores recebem o resultado (os demais recebem nulo). Nenhum dado pessoal sai:
-- apenas contagens.
--
-- Como aplicar: Supabase > SQL Editor > New query > colar este arquivo > Run. Basta uma vez.

create or replace function public.admin_usage_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    return null;
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from auth.users),
    'new_users_30d', (select count(*) from auth.users where created_at >= now() - interval '30 days'),
    'users_with_attempts', (select count(distinct user_id) from public.question_attempts),
    'active_7d', (select count(distinct user_id) from public.question_attempts where answered_at >= now() - interval '7 days'),
    'active_30d', (select count(distinct user_id) from public.question_attempts where answered_at >= now() - interval '30 days'),
    'attempts_total', (select count(*) from public.question_attempts),
    'attempts_7d', (select count(*) from public.question_attempts where answered_at >= now() - interval '7 days'),
    'daily', (
      select coalesce(jsonb_agg(day_row order by day_row->>'day'), '[]'::jsonb)
      from (
        select jsonb_build_object(
          'day', to_char(date_trunc('day', answered_at), 'YYYY-MM-DD'),
          'users', count(distinct user_id),
          'attempts', count(*)
        ) as day_row
        from public.question_attempts
        where answered_at >= now() - interval '30 days'
        group by date_trunc('day', answered_at)
      ) days
    ),
    'top_temas', (
      select coalesce(jsonb_agg(theme_row order by (theme_row->>'attempts')::int desc), '[]'::jsonb)
      from (
        select jsonb_build_object('tema', coalesce(nullif(tema, ''), '(sem tema)'), 'attempts', count(*)) as theme_row
        from public.question_attempts
        where answered_at >= now() - interval '30 days'
        group by coalesce(nullif(tema, ''), '(sem tema)')
        order by count(*) desc
        limit 10
      ) themes
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.admin_usage_stats() from public, anon;
grant execute on function public.admin_usage_stats() to authenticated;
