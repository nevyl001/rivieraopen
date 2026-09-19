"use client";

import { useId, useMemo, useRef } from "react";
import type { RatingHistorialEntry } from "@/lib/types/player";
import {
  PROFILE_CHART_STROKE_SOFT,
  PROFILE_CHART_STROKE_WIDTH,
  PROFILE_DELTA_DOWN,
  PROFILE_DELTA_UP,
} from "@/components/players/PlayerSeasonChart";
import { useProfileChartDraw } from "@/components/players/useProfileChartDraw";

const MODO_JUEGO_LABELS: Record<string, string> = {
  reta_rr: "Round Robin",
  americano: "Americano",
  equipos: "Reta Equipos",
  duelo_2v2: "Duelo 2 vs 2",
  torneo: "Torneo",
};

function modoJuegoLabel(modo: string): string {
  return MODO_JUEGO_LABELS[modo] ?? modo.replace(/_/g, " ");
}

/** Nivel + FIABLE — fluorescent lime (pre-mono accent that read well) */
const PROFILE_NIVEL_COLOR = "#a3e635";

function fiabilidadBadge(
  fiabilidad: number,
  partidosJugados: number
): string | null {
  if (partidosJugados === 0) return "INICIAL";
  if (fiabilidad >= 0.7) return "FIABLE";
  if (fiabilidad >= 0.4) return "MEDIA";
  return "CALIBRANDO";
}

/** Badge accent — FIABLE uses the same fluorescent lime as Nivel */
function badgeAccent(badge: string): {
  color: string;
  borderColor: string;
  backgroundColor: string;
} {
  switch (badge) {
    case "FIABLE":
      return {
        color: PROFILE_NIVEL_COLOR,
        borderColor: `${PROFILE_NIVEL_COLOR}66`,
        backgroundColor: `${PROFILE_NIVEL_COLOR}1A`,
      };
    case "MEDIA":
      return {
        color: "#C4A574",
        borderColor: "rgba(196, 165, 116, 0.4)",
        backgroundColor: "rgba(196, 165, 116, 0.1)",
      };
    case "CALIBRANDO":
      return {
        color: "#D98888",
        borderColor: "rgba(217, 136, 136, 0.4)",
        backgroundColor: "rgba(217, 136, 136, 0.1)",
      };
    default:
      return {
        color: "#aaa",
        borderColor: "rgba(255, 255, 255, 0.14)",
        backgroundColor: "transparent",
      };
  }
}

function formatFechaCorta(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

interface RatingNivelProps {
  rating: number;
  fiabilidad: number;
  partidosJugados: number;
  historial?: RatingHistorialEntry[];
  className?: string;
}

export function RatingNivel({
  rating,
  fiabilidad,
  partidosJugados,
  historial = [],
  className = "",
}: RatingNivelProps) {
  const badge = fiabilidadBadge(fiabilidad, partidosJugados);
  const ratingLabel = rating.toFixed(2);
  const fiabPct = Math.round(fiabilidad * 100);
  const tienePartidosRating =
    partidosJugados > 0 || historial.length > 0;
  const gradId = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  const evolutionPoints = useMemo(() => {
    if (historial.length === 0) return [];
    return [...historial].reverse().map((h) => h.rating_despues);
  }, [historial]);

  const evolutionSvg = useMemo(() => {
    if (evolutionPoints.length < 2) return null;
    const w = 280;
    const h = 48;
    const padL = 4;
    const padR = 10;
    const padY = 4;
    const min = Math.min(...evolutionPoints) - 0.05;
    const max = Math.max(...evolutionPoints) + 0.05;
    const span = max - min || 0.1;
    const coords = evolutionPoints.map((val, i) => {
      const x = padL + (i / (evolutionPoints.length - 1)) * (w - padL - padR);
      const y = h - padY - ((val - min) / span) * (h - padY * 2);
      return { x, y };
    });
    const linePath = coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
      .join(" ");
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L ${last.x} ${h - padY} L ${coords[0].x} ${h - padY} Z`;
    return { w, h, linePath, areaPath, last };
  }, [evolutionPoints]);

  useProfileChartDraw(pathRef, areaRef, [evolutionSvg?.linePath]);

  const recentMoves = useMemo(() => historial.slice(0, 4), [historial]);

  return (
    <section
      className={`flex w-full flex-col px-4 py-3.5 ${className}`.trim()}
      aria-label="Nivel de juego"
    >
      <div className="mb-1.5 flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[#555]">
            Nivel
          </p>
          <p
            className="m-0 mt-1 font-[family-name:var(--font-stack-sans-headline)] text-[2.15rem] font-normal leading-none tracking-wide tabular-nums"
            style={{ color: PROFILE_NIVEL_COLOR }}
          >
            {ratingLabel}
          </p>
        </div>
        {badge ? (
          <span
            className="rounded-full border px-3 py-1 text-xs font-semibold tracking-wide"
            style={badgeAccent(badge)}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mb-2.5 text-[0.78rem] text-[#888]">
        {!tienePartidosRating
          ? "Nivel base 3.00 · aún sin partidos de rating"
          : `Fiabilidad del nivel: ${fiabPct}% · ${partidosJugados || historial.length} partido${
              (partidosJugados || historial.length) === 1 ? "" : "s"
            }`}
      </p>

      {evolutionSvg ? (
        <div
          className="relative mb-2.5 w-full overflow-visible"
          style={{ height: evolutionSvg.h }}
        >
          <svg
            width="100%"
            height={evolutionSvg.h}
            viewBox={`0 0 ${evolutionSvg.w} ${evolutionSvg.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 block h-full w-full"
            aria-hidden
          >
            <defs>
              <linearGradient
                id={`nivel-area-${gradId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              ref={areaRef}
              d={evolutionSvg.areaPath}
              fill={`url(#nivel-area-${gradId})`}
              style={{ opacity: 0 }}
            />
            <path
              ref={pathRef}
              d={evolutionSvg.linePath}
              fill="none"
              stroke={PROFILE_CHART_STROKE_SOFT}
              strokeWidth={PROFILE_CHART_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="profile-chart-end-dot profile-chart-end-dot--pulse"
            style={{
              left: `${(evolutionSvg.last.x / evolutionSvg.w) * 100}%`,
              top: `${(evolutionSvg.last.y / evolutionSvg.h) * 100}%`,
            }}
            aria-hidden
          />
        </div>
      ) : !tienePartidosRating ? (
        <p className="mb-2.5 text-[0.8rem] italic leading-snug text-[#555]">
          Juega tu primer partido competitivo para empezar a mover tu nivel
        </p>
      ) : null}

      {recentMoves.length > 0 ? (
        <div className="mt-auto">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#555]">
            Últimos movimientos
          </p>
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {recentMoves.map((item) => {
              const up = item.delta >= 0;
              const arrow = up ? "▲" : "▼";
              const deltaSign = up ? "+" : "";
              return (
                <li
                  key={item.id}
                  className="group grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md px-1.5 py-1.5 text-[0.78rem] text-white/[0.82] transition-colors duration-150 hover:bg-white/[0.03]"
                >
                  <span
                    className="min-w-14 text-[0.82rem] font-semibold tabular-nums"
                    style={{
                      color: up ? PROFILE_DELTA_UP : PROFILE_DELTA_DOWN,
                    }}
                  >
                    {arrow} {deltaSign}
                    {item.delta.toFixed(2)}
                  </span>
                  <span className="text-[#888]">
                    {modoJuegoLabel(item.modo_juego)}
                  </span>
                  <span className="text-[0.9rem] font-semibold tabular-nums text-white">
                    {item.rating_despues.toFixed(2)}
                  </span>
                  <span className="text-[0.72rem] text-[#555]">
                    {formatFechaCorta(item.fecha)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
