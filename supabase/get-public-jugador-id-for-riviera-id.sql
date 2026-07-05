-- RIVIERA 2.1.3B (complemento) — Resolver jugador público por Riviera ID
-- Ejecutar en Supabase SQL Editor (staging → prod).
-- Par de get_public_riviera_id_for_jugador(uuid) para rutas /player/RIV-*

CREATE OR REPLACE FUNCTION public.get_public_jugador_id_for_riviera_id(p_riviera_id text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rj.id
  FROM public.riviera_official_player_identity i
  JOIN public.riviera_jugadores rj
    ON rj.id = i.canonical_riviera_jugador_id
  WHERE upper(trim(i.riviera_id)) = upper(trim(p_riviera_id))
    AND rj.estado = 'activo'
    AND rj.visible_publico IS TRUE
    AND COALESCE(rj.suma_ranking, true) = true
  LIMIT 1;
$$;

COMMENT ON FUNCTION public.get_public_jugador_id_for_riviera_id(text) IS
  'Sprint 2.1.3B — Devuelve riviera_jugadores.id para perfiles públicos por Riviera ID.';

GRANT EXECUTE ON FUNCTION public.get_public_jugador_id_for_riviera_id(text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
