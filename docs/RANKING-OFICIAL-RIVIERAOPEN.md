# Ranking oficial ↔ sitio www.rivieraopen.com

La **app Riviera** (`retas-new-main` / `appriviera.rivieraopen.com`) y el **sitio oficial** (`www.rivieraopen.com`, este repo) comparten el **mismo proyecto Supabase**.

El admin maestro en la app **ya escribe** los flags en la BD. Este sitio **solo lee** la vista y la RPC — no duplica toggles en `app/admin/players` (ese admin usa datos mock locales).

---

## Dos sitios, una base de datos

| Sitio | Repo | Ranking | Perfil |
|-------|------|---------|--------|
| App Riviera | `retas-new-main` | `/ranking/o/{organizador_id}` | ficha en app |
| Sitio oficial | `riviera-open-web` | `/rankings` | `/players/{riviera_jugadores.id}` |

---

## Reglas de visibilidad (4 condiciones)

Un jugador aparece en **rivieraopen.com** solo si **todas** se cumplen:

| # | Tabla | Columna | Valor | Toggle admin (app Riviera) |
|---|-------|---------|-------|----------------------------|
| 1 | `organizador_game_modes` | `visible_ranking_oficial` | `true` | «Publicar club en www.rivieraopen.com» |
| 2 | `riviera_jugadores` | `suma_ranking` | `true` | **Ranking** |
| 3 | `riviera_jugadores` | `visible_publico` | `true` | **Público** |
| 4 | `riviera_jugadores` | `estado` | `'activo'` | no archivado |

**Multi-organizador:** no usar `NEXT_PUBLIC_RANKING_ORGANIZADOR_ID` en listados públicos. Varios clubs pueden estar publicados a la vez.

---

## Implementación en este repo

| Función | Archivo | Fuente |
|---------|---------|--------|
| Listado ranking | `lib/rankingService.ts` → `getRankingPublico()` | Vista `riviera_jugadores_sitio_oficial` |
| Perfil jugador | `lib/playerService.ts` → `getJugadorPublico()` | RPC `is_jugador_visible_sitio_oficial` + `riviera_jugadores` |
| Validación | `lib/officialRankingVisibility.ts` | RPC + constante de vista |
| Rating / historial | `lib/playerRatingService.ts` | Tras validar visibilidad (mismas tablas) |

### `getRankingPublico()`

```ts
await supabase
  .from("riviera_jugadores_sitio_oficial")
  .select("id, nombre, foto_url, categoria, genero, puntos_totales, ...")
  .eq("categoria", dbCategory);
```

Sin `.eq("organizador_id", ...)`.

### `getJugadorPublico()`

```ts
const visible = await isJugadorVisibleSitioOficial(id);
if (!visible) return null; // → notFound() en la página

// Luego riviera_jugadores por id (sin filtro de organizador)
// Rating e historial solo después de pasar la validación
```

El ranking del perfil y rivales usan la misma vista oficial. Historial y stats usan `organizador_id` del jugador cargado.

---

## SQL en Supabase (ejecutar una vez)

Orden en el repo `retas-new-main`:

1. `supabase/admin-master-controls.sql`
2. `supabase/ranking-oficial-sitio-web.sql`

Objetos:

- Vista `riviera_jugadores_sitio_oficial`
- RPC `is_jugador_visible_sitio_oficial(p_jugador_id)`
- RPC `is_organizador_ranking_publico(p_org_id)`

---

## Admin: dónde se controla

**No** en `app/admin/players` de este repo (mock).

Fuente de verdad: app Riviera → `AccountControlsPanel.tsx`

- Por organizador: `visible_ranking_oficial`
- Por jugador: `suma_ranking`, `visible_publico`

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

`NEXT_PUBLIC_RANKING_ORGANIZADOR_ID` ya **no** se usa en rankings/perfiles públicos (opcional solo para scripts de debug).

---

## Checklist

1. Club con `visible_ranking_oficial = false` → jugadores no en `/rankings`.
2. Jugador con `suma_ranking = false` → no en ranking ni perfil.
3. Jugador con `visible_publico = false` → no en ranking ni perfil.
4. Dos clubs publicados → ambos en ranking global (orden por puntos).
5. Cambio en admin app → efecto al recargar el sitio (sin redeploy).
