-- Historial público: el ledger de puntos no guarda rivales.
-- El perfil oficial debe completar partidos_detalle desde jugador_participaciones
-- para cualquier club (liga, reta, americano, duelo), sin reparar jugador por jugador.
-- El tope anterior (100, con máximo interno de 500) cortaba carreras largas.

CREATE OR REPLACE FUNCTION public.list_riviera_official_player_activity(
  p_riviera_jugador_id uuid,
  p_limit integer DEFAULT 5000
)
RETURNS TABLE(
  ledger_id uuid,
  participacion_id uuid,
  official_player_key uuid,
  source_organizador_id uuid,
  source_club_name text,
  event_type text,
  event_id uuid,
  event_name text,
  points integer,
  activity_at timestamp with time zone,
  metadata jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    l.id AS ledger_id,
    l.participacion_id,
    l.official_player_key,
    l.source_organizer_id,
    l.source_club_name,
    l.event_type,
    l.event_id,
    l.event_name,
    l.points,
    l.created_at AS activity_at,
    l.metadata
  FROM public.riviera_official_points_ledger l
  WHERE l.official_player_key = public.resolve_official_player_key_for_jugador(p_riviera_jugador_id)
    AND l.points > 0
  ORDER BY l.created_at DESC, l.id DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5000), 5000));
$function$;

CREATE OR REPLACE FUNCTION public.list_riviera_official_legacy_participaciones(
  p_riviera_jugador_id uuid,
  p_limit integer DEFAULT 5000
)
RETURNS SETOF jugador_participaciones
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT jp.*
  FROM public.jugador_participaciones jp
  WHERE jp.jugador_id IN (
    SELECT ids.riviera_jugador_id
    FROM public._riviera_official_jugador_ids_for_key(
      public.resolve_official_player_key_for_jugador(p_riviera_jugador_id)
    ) ids
  )
    AND COALESCE(jp.metadata->>'subtipo', '') <> 'ajuste_manual'
    AND NOT EXISTS (
      SELECT 1
      FROM public.riviera_official_points_ledger l
      WHERE l.participacion_id = jp.id
    )
  ORDER BY jp.fecha DESC, jp.created_at DESC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5000), 5000));
$function$;

-- «Club» es el placeholder de getOrganizerDisplayNameSync cuando el nombre
-- aún no estaba en caché. No es un club. Se sustituye por el nombre real.
CREATE OR REPLACE FUNCTION public.riviera_public_club_label(
  p_names text[],
  p_organizer_id text
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_org uuid;
BEGIN
  SELECT btrim(candidate)
  INTO v_name
  FROM unnest(COALESCE(p_names, ARRAY[]::text[])) AS candidate
  WHERE btrim(COALESCE(candidate, '')) <> ''
    AND lower(btrim(candidate)) <> 'club'
  LIMIT 1;

  IF v_name IS NOT NULL THEN
    RETURN v_name;
  END IF;

  BEGIN
    v_org := NULLIF(btrim(COALESCE(p_organizer_id, '')), '')::uuid;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_org := NULL;
  END;

  IF v_org IS NULL THEN
    RETURN NULL;
  END IF;

  v_name := NULLIF(btrim(public.get_organizador_display_name(v_org)), '');
  IF v_name IS NULL OR lower(v_name) = 'club' THEN
    RETURN NULL;
  END IF;

  RETURN v_name;
END;
$$;

REVOKE ALL ON FUNCTION public.riviera_public_club_label(text[], text) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.get_riviera_oficial_jugador_public_profile(p_jugador_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_jugador record;
  v_puntos integer;
  v_pos integer;
  v_historial jsonb;
BEGIN
  IF p_jugador_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT public.is_jugador_visible_sitio_oficial(p_jugador_id) THEN
    RETURN NULL;
  END IF;

  SELECT rj.*
  INTO v_jugador
  FROM public.riviera_jugadores rj
  WHERE rj.id = p_jugador_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_puntos := public.riviera_official_display_puntos_for_jugador(p_jugador_id);
  v_pos := public.riviera_official_ranking_posicion_for_jugador(
    p_jugador_id,
    v_jugador.organizador_id,
    v_jugador.categoria,
    COALESCE(v_jugador.genero, 'M')
  );

  SELECT COALESCE(
    (
      SELECT jsonb_agg(entry ORDER BY sort_at DESC)
      FROM (
        SELECT jsonb_build_object(
          'participacion_id', row.participacion_id,
          'event_type', row.event_type,
          'event_id', row.event_id,
          'event_name', row.event_name,
          'points', row.points,
          'source_club_name', public.riviera_public_club_label(
            ARRAY[
              row.source_club_name,
              jp.metadata->>'club_name',
              jp.metadata->>'source_club_name'
            ],
            COALESCE(
              row.source_organizador_id::text,
              jp.metadata->>'organizador_id'
            )
          ),
          'activity_at', row.activity_at,
          'metadata', CASE
            WHEN jp.metadata IS NULL THEN row.metadata
            ELSE (
              COALESCE(jp.metadata, '{}'::jsonb)
              || COALESCE(row.metadata, '{}'::jsonb)
            ) || CASE
              WHEN jsonb_typeof(jp.metadata->'partidos_detalle') = 'array'
               AND jsonb_array_length(jp.metadata->'partidos_detalle') > 0
               AND (
                 jsonb_typeof(COALESCE(row.metadata->'partidos_detalle', 'null'::jsonb))
                   IS DISTINCT FROM 'array'
                 OR jsonb_array_length(
                   COALESCE(row.metadata->'partidos_detalle', '[]'::jsonb)
                 ) = 0
               )
              THEN jsonb_build_object(
                'partidos_detalle',
                jp.metadata->'partidos_detalle'
              )
              ELSE '{}'::jsonb
            END
          END
        ) AS entry,
        row.activity_at AS sort_at
        FROM public.list_riviera_official_player_activity(p_jugador_id, 5000) row
        LEFT JOIN public.jugador_participaciones jp
          ON jp.id = row.participacion_id
        UNION ALL
        SELECT jsonb_build_object(
          'participacion_id', jp.id,
          'event_type', jp.tipo_evento::text,
          'event_id', jp.evento_id,
          'event_name', jp.evento_nombre,
          'points', jp.puntos_obtenidos,
          'source_club_name', public.riviera_public_club_label(
            ARRAY[
              jp.metadata->>'club_name',
              jp.metadata->>'source_club_name'
            ],
            COALESCE(
              jp.metadata->>'organizador_id',
              (
                SELECT rj.organizador_id::text
                FROM public.riviera_jugadores rj
                WHERE rj.id = jp.jugador_id
              )
            )
          ),
          'activity_at', COALESCE(jp.fecha::timestamptz, jp.created_at),
          'metadata', jp.metadata
        ) AS entry,
        COALESCE(jp.fecha::timestamptz, jp.created_at) AS sort_at
        FROM public.list_riviera_official_legacy_participaciones(p_jugador_id, 5000) jp
      ) combined
    ),
    '[]'::jsonb
  )
  INTO v_historial;

  RETURN jsonb_build_object(
    'jugador_id', p_jugador_id,
    'organizador_id', v_jugador.organizador_id,
    'puntos_totales', v_puntos,
    'ranking_posicion', v_pos,
    'historial', v_historial
  );
END;
$function$;

COMMENT ON FUNCTION public.get_riviera_oficial_jugador_public_profile(uuid) IS
  'Perfil público oficial. El ledger aporta puntos; los rivales salen de jugador_participaciones.partidos_detalle en cualquier club.';
