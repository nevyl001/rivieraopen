-- Historial público: el ledger de puntos no guarda rivales.
-- El perfil oficial debe completar partidos_detalle desde jugador_participaciones
-- para cualquier club (liga, reta, americano, duelo), sin reparar jugador por jugador.

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
          'source_club_name', COALESCE(
            NULLIF(row.source_club_name, ''),
            NULLIF(jp.metadata->>'club_name', ''),
            NULLIF(jp.metadata->>'source_club_name', '')
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
        FROM public.list_riviera_official_player_activity(p_jugador_id, 100) row
        LEFT JOIN public.jugador_participaciones jp
          ON jp.id = row.participacion_id
        UNION ALL
        SELECT jsonb_build_object(
          'participacion_id', jp.id,
          'event_type', jp.tipo_evento::text,
          'event_id', jp.evento_id,
          'event_name', jp.evento_nombre,
          'points', jp.puntos_obtenidos,
          'source_club_name', COALESCE(
            NULLIF(jp.metadata->>'club_name', ''),
            NULLIF(jp.metadata->>'source_club_name', '')
          ),
          'activity_at', COALESCE(jp.fecha::timestamptz, jp.created_at),
          'metadata', jp.metadata
        ) AS entry,
        COALESCE(jp.fecha::timestamptz, jp.created_at) AS sort_at
        FROM public.list_riviera_official_legacy_participaciones(p_jugador_id, 100) jp
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
