"use client";

import { useId, useMemo, useRef } from "react";
import type { RatingHistorialEntry } from "@/lib/types/player";
import {
  PROFILE_CHART_GRID,
  PROFILE_CHART_STROKE,
  PROFILE_CHART_STROKE_WIDTH,
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

const PROFILE_TEXT = "#F5F7FA";
const PROFILE_MUTED = "#A1AAB8";
const PROFILE_MOVE_UP = "#93C5FD";
const PROFILE_MOVE_DOWN = "#F87171";

function fiabilidadBadge(
  fiabilidad: number,
  partidosJugados: number
): string | null {
  if (partidosJugados === 0) return "INICIAL";
  if (fiabilidad >= 0.7) return "FIABLE";
  if (fiabilidad >= 0.4) return "MEDIA";
  return "CALIBRANDO";
}

/** Status pill stays quiet; calibration is not a chart accent */
function badgeAccent(badge: string): {
  color: string;
  borderColor: string;
  backgroundColor: string;
} {
  if (badge === "FIABLE") {
    return {
      color: PROFILE_TEXT,
      borderColor: "#2A2F38",
      backgroundColor: "transparent",
    };
  }
  return {
    color: PROFILE_MUTED,
    borderColor: "#2A2F38",
    backgroundColor: "transparent",
  };
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
    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L ${last.x} ${h - padY} L ${coords[0].x} ${h - padY} Z`;
    return { w, h, linePath, areaPath, first, last };
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
          <p className="m-0 text-[10px] font-medium uppercase tracking-[0.18em] text-[#A1AAB8]">
            Nivel
          </p>
          <p className="m-0 mt-1 font-[family-name:var(--font-stack-sans-headline)] text-[2.65rem] font-semibold leading-none tracking-tight text-[#F5F7FA] tabular-nums lg:text-[2.85rem]">
            {ratingLabel}
          </p>
        </div>
        {badge ? (
          <span
            className="rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
            style={badgeAccent(badge)}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mb-2.5 text-[0.78rem] text-[#A1AAB8]">
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
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.35, 0.7].map((step) => (
              <line
                key={step}
                x1={4}
                x2={evolutionSvg.w - 10}
                y1={4 + (evolutionSvg.h - 8) * step}
                y2={4 + (evolutionSvg.h - 8) * step}
                stroke={PROFILE_CHART_GRID}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
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
              stroke={PROFILE_CHART_STROKE}
              strokeWidth={PROFILE_CHART_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="profile-chart-start-dot"
            style={{
              left: `${(evolutionSvg.first.x / evolutionSvg.w) * 100}%`,
              top: `${(evolutionSvg.first.y / evolutionSvg.h) * 100}%`,
            }}
            aria-hidden
          />
          <span
            className="profile-chart-end-dot"
            style={{
              left: `${(evolutionSvg.last.x / evolutionSvg.w) * 100}%`,
              top: `${(evolutionSvg.last.y / evolutionSvg.h) * 100}%`,
            }}
            aria-hidden
          />
        </div>
      ) : !tienePartidosRating ? (
        <p className="mb-2.5 text-[0.8rem] italic leading-snug text-[#A1AAB8]">
          Juega tu primer partido competitivo para empezar a mover tu nivel
        </p>
      ) : null}

      {recentMoves.length > 0 ? (
        <div className="mt-auto">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#A1AAB8]">
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
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 rounded-md px-1.5 py-1 text-[0.78rem] text-[#F5F7FA]"
                >
                  <span
                    className="min-w-14 text-[0.82rem] font-semibold tabular-nums"
                    style={{ color: up ? PROFILE_MOVE_UP : PROFILE_MOVE_DOWN }}
                  >
                    {arrow} {deltaSign}
                    {item.delta.toFixed(2)}
                  </span>
                  <span className="text-[#A1AAB8]">
                    {modoJuegoLabel(item.modo_juego)}
                  </span>
                  <span className="text-[0.95rem] font-semibold tabular-nums text-[#F5F7FA]">
                    {item.rating_despues.toFixed(2)}
                  </span>
                  <span className="text-[0.72rem] text-[#A1AAB8]">
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
