-- Lectura pública del rating de un jugador oficial.
-- Une el historial de todos los perfiles locales de la misma identidad
-- (club de origen y clubes donde se le concedió acceso). No escribe.

CREATE OR REPLACE FUNCTION public.get_public_jugador_rating_bundle(p_jugador_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ids uuid[];
  v_visible boolean;
BEGIN
  IF p_jugador_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    estado = 'activo'
    AND COALESCE(visible_publico, true)
    AND COALESCE(suma_ranking, true)
  INTO v_visible
  FROM public.riviera_jugadores
  WHERE id = p_jugador_id;

  IF NOT COALESCE(v_visible, false) THEN
    RETURN NULL;
  END IF;

  SELECT ARRAY_AGG(DISTINCT id)
  INTO v_ids
  FROM (
    SELECT p_jugador_id AS id
    UNION
    SELECT ids.riviera_jugador_id
    FROM public._riviera_official_jugador_ids_for_key(
      public.resolve_official_player_key_for_jugador(p_jugador_id)
    ) ids
    UNION
    SELECT opa.jugador_id
    FROM public.organizer_player_access opa
    WHERE opa.is_active = true
      AND (
        opa.jugador_id = p_jugador_id
        OR opa.local_jugador_id = p_jugador_id
      )
    UNION
    SELECT opa.local_jugador_id
    FROM public.organizer_player_access opa
    WHERE opa.is_active = true
      AND opa.local_jugador_id IS NOT NULL
      AND (
        opa.jugador_id = p_jugador_id
        OR opa.local_jugador_id = p_jugador_id
      )
  ) linked
  WHERE id IS NOT NULL;

  RETURN (
    WITH deduped AS (
      SELECT DISTINCT ON (COALESCE(rh.partido_ref, rh.id::text))
        rh.id,
        rh.fecha,
        rh.rating_antes,
        rh.rating_despues,
        rh.delta,
        rh.modo_juego,
        rh.descripcion,
        rh.jugador_id
      FROM public.rating_historial rh
      WHERE rh.jugador_id = ANY(v_ids)
      ORDER BY
        COALESCE(rh.partido_ref, rh.id::text),
        (rh.jugador_id = p_jugador_id) DESC,
        rh.fecha DESC
    ),
    canonical_tail AS (
      SELECT rating_despues
      FROM deduped
      WHERE jugador_id = p_jugador_id
      ORDER BY fecha DESC
      LIMIT 1
    )
    SELECT jsonb_build_object(
      'rated_matches', (SELECT COUNT(*) FROM deduped),
      'canonical_rating', (SELECT rating_despues FROM canonical_tail),
      'historial', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', d.id,
              'fecha', d.fecha,
              'rating_antes', d.rating_antes,
              'rating_despues', d.rating_despues,
              'delta', d.delta,
              'modo_juego', d.modo_juego,
              'descripcion', d.descripcion
            )
            ORDER BY d.fecha DESC
          )
          FROM deduped d
        ),
        '[]'::jsonb
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_public_jugador_rating_bundle(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_jugador_rating_bundle(uuid) TO anon, authenticated;

COMMENT ON FUNCTION public.get_public_jugador_rating_bundle(uuid) IS
  'Historial de rating público unido entre los perfiles locales de la misma identidad oficial. Solo lectura.';

NOTIFY pgrst, 'reload schema';
