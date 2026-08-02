-- RIVIERA — Sesiones administrativas y rate limiting persistentes.
-- Ejecutar en Supabase SQL Editor (staging -> prod).
--
-- Motivo: AdminAuthProvider y rateLimit.ts guardaban sesiones y contadores
-- en un Map en memoria de proceso. En Vercel (serverless), cada invocación
-- puede aterrizar en una instancia distinta sin memoria compartida, por lo
-- que una sesión creada en /api/admin/auth/login podía no ser reconocida
-- por la siguiente petición -> 401 intermitentes en todo el panel admin.
--
-- Estas tablas solo son accesibles vía el service role key (RLS activado,
-- sin políticas para anon/authenticated). El cliente anónimo nunca debe
-- poder leer ni escribir aquí.

create table if not exists admin_sessions (
  id text primary key,
  user_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists admin_sessions_expires_at_idx
  on admin_sessions (expires_at);

alter table admin_sessions enable row level security;
-- Sin políticas: solo el service role (que ignora RLS) puede acceder.

create table if not exists admin_rate_limits (
  identifier text primary key,
  count integer not null,
  reset_at timestamptz not null
);

create index if not exists admin_rate_limits_reset_at_idx
  on admin_rate_limits (reset_at);

alter table admin_rate_limits enable row level security;
-- Sin políticas: solo el service role puede acceder.

NOTIFY pgrst, 'reload schema';
