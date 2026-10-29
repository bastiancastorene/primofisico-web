do $migration$
declare
  target regprocedure;
  definition text;
begin
  foreach target in array array[
    'public.is_site_post_target(text)'::regprocedure,
    'public.is_site_interaction_target(text)'::regprocedure,
    'public.is_site_comment_target(text)'::regprocedure
  ]
  loop
    definition := pg_get_functiondef(target);
    if position('''saber-vih''' in definition) = 0 then
      if position('select p_id in (' in definition) = 0 then
        raise exception 'Unexpected allowlist definition for %', target;
      end if;
      execute replace(
        definition,
        'select p_id in (',
        'select p_id in (''saber-vih'','
      );
    end if;
  end loop;
end
$migration$;
