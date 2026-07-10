"use client";

import { useMemo } from "react";
import type { RatingHistorialEntry } from "@/lib/types/player";

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

function fiabilidadBadge(
  fiabilidad: number,
  partidosJugados: number
): { label: string; color: string } | null {
  if (partidosJugados === 0) {
    return { label: "INICIAL", color: "rgba(255, 255, 255, 0.55)" };
  }
  if (fiabilidad >= 0.7) return { label: "FIABLE", color: "#34d399" };
  if (fiabilidad >= 0.4) return { label: "MEDIA", color: "#fbbf24" };
  return { label: "CALIBRANDO", color: "#fbbf24" };
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

  const evolutionPoints = useMemo(() => {
    if (historial.length === 0) return [];
    return [...historial].reverse().map((h) => h.rating_despues);
  }, [historial]);

  const evolutionSvg = useMemo(() => {
    if (evolutionPoints.length < 2) return null;
    const w = 280;
    const h = 48;
    const pad = 4;
    const min = Math.min(...evolutionPoints) - 0.05;
    const max = Math.max(...evolutionPoints) + 0.05;
    const span = max - min || 0.1;
    const coords = evolutionPoints.map((val, i) => {
      const x = pad + (i / (evolutionPoints.length - 1)) * (w - pad * 2);
      const y = h - pad - ((val - min) / span) * (h - pad * 2);
      return `${x},${y}`;
    });
    return { w, h, polyline: coords.join(" ") };
  }, [evolutionPoints]);

  return (
    <section
      className={`w-full rounded-[10px] border border-[#222] bg-[#111] px-4 py-4 ${className}`.trim()}
      aria-label="Nivel de juego"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/45">
            Nivel
          </p>
          <p className="m-0 mt-0.5 text-[1.75rem] font-extrabold leading-none text-[#a3e635] tabular-nums">
            {ratingLabel}
          </p>
        </div>
        {badge ? (
          <span
            className="rounded-full border px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.08em]"
            style={{
              color: badge.color,
              borderColor: `${badge.color}55`,
              backgroundColor: `${badge.color}18`,
            }}
          >
            {badge.label}
          </span>
        ) : null}
      </div>

      <p className="mb-3 text-[0.78rem] text-white/55">
        {!tienePartidosRating
          ? "Nivel base 3.00 · aún sin partidos de rating"
          : `Fiabilidad del nivel: ${fiabPct}% · ${partidosJugados || historial.length} partido${
              (partidosJugados || historial.length) === 1 ? "" : "s"
            }`}
      </p>

      {evolutionSvg ? (
        <svg
          width="100%"
          height={evolutionSvg.h}
          viewBox={`0 0 ${evolutionSvg.w} ${evolutionSvg.h}`}
          className="mb-3.5 block"
          aria-hidden
        >
          <polyline
            fill="none"
            stroke="#a3e635"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={evolutionSvg.polyline}
          />
        </svg>
      ) : !tienePartidosRating ? (
        <p className="mb-3.5 text-[0.8rem] italic leading-snug text-white/42">
          Juega tu primer partido competitivo para empezar a mover tu nivel
        </p>
      ) : null}

      {historial.length > 0 ? (
        <div>
          <p className="mb-2 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/40">
            Últimos movimientos
          </p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {historial.map((item) => {
              const up = item.delta >= 0;
              const deltaColor = up ? "#34d399" : "#f87171";
              const arrow = up ? "▲" : "▼";
              const deltaSign = up ? "+" : "";
              return (
                <li
                  key={item.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 text-[0.78rem] text-white/[0.82]"
                >
                  <span
                    className="min-w-14 font-bold"
                    style={{ color: deltaColor }}
                  >
                    {arrow} {deltaSign}
                    {item.delta.toFixed(2)}
                  </span>
                  <span className="text-white/65">
                    {modoJuegoLabel(item.modo_juego)}
                  </span>
                  <span className="font-semibold tabular-nums text-[#a3e635]">
                    {item.rating_despues.toFixed(2)}
                  </span>
                  <span className="text-[0.72rem] text-white/40">
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
