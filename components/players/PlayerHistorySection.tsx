"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Flag,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { PlayerHistoryEvent } from "@/lib/types/playerHistory";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerHistorySectionProps {
  events: PlayerHistoryEvent[];
}

function eventIcon(tipo: string) {
  switch (tipo) {
    case "torneo_express":
      return Trophy;
    case "liga":
      return Flag;
    case "reta":
      return Zap;
    case "americano":
      return Users;
    case "duelo":
    case "duelo_2v2":
    case "2vs2":
      return Swords;
    default:
      return Trophy;
  }
}

function placementLabel(posicion: number | null, t: (key: string) => string) {
  if (!posicion) return null;
  if (posicion === 1) return `🥇 ${t("profile.history.firstPlace")}`;
  if (posicion === 2) return `🥈 ${t("profile.history.secondPlace")}`;
  if (posicion === 3) return `🥉 ${t("profile.history.thirdPlace")}`;
  return `${posicion}°`;
}

function HistoryEventCard({ event }: { event: PlayerHistoryEvent }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation("rankings");
  const { formatShortDate } = useTranslation();

  const Icon = eventIcon(event.tipoEvento);
  const placement = placementLabel(event.posicionFinal, t);
  const hasMatches = event.partidos.length > 0;
  const recordTotal =
    (event.partidosGanados ?? 0) +
    (event.partidosPerdidos ?? 0) +
    (event.partidosEmpatados ?? 0);
  const hasRecord = recordTotal > 0;
  const canExpand = hasMatches || hasRecord;
  const allResultsUnknown =
    hasMatches && event.partidos.every((partido) => partido.score === "—");

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#1f1f1f] bg-[#111]">
      <button
        type="button"
        onClick={() => canExpand && setOpen((prev) => !prev)}
        disabled={!canExpand}
        className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors ${
          canExpand ? "hover:bg-[#151515]" : "cursor-default"
        }`}
      >
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] text-[#8E9AAB]">
          <Icon size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="font-medium text-white">{event.nombre}</p>
            {event.fecha && (
              <span className="text-xs text-[#666]">
                {formatShortDate(event.fecha)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#777]">
            {event.categoria && (
              <span className="rounded-full border border-[#2a2a2a] px-2 py-0.5">
                {event.categoria}
              </span>
            )}
            {event.sourceClubName && (
              <span className="rounded-full border border-[#2a2a2a] px-2 py-0.5 text-[#999]">
                {event.sourceClubName}
              </span>
            )}
            {placement && <span>{placement}</span>}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {event.puntosGanados > 0 && (
            <span className="text-sm font-medium tabular-nums text-[#1D9E75]">
              +{event.puntosGanados} pts
            </span>
          )}
          {canExpand && (
          <ChevronDown
            size={18}
            className={`text-[#555] transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
          )}
        </div>
      </button>

      {canExpand && (
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: open ? "800px" : "0px" }}
      >
        <div className="border-t border-[#1f1f1f] px-4 py-3">
          {hasMatches ? (
            <div className="space-y-2">
              {event.partidos.map((partido) => (
                <div
                  key={partido.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-[#0a0a0a] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-[#555]">
                      {partido.round}
                    </p>
                    <p className="truncate text-sm text-[#ccc]">
                      {t("profile.history.vs")} {partido.opponentLabel}
                    </p>
                    <p className="text-xs tabular-nums text-[#666]">
                      {partido.score}
                    </p>
                  </div>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      partido.isDraw
                        ? "bg-[#2a2410] text-[#D4A72C]"
                        : partido.won
                          ? "bg-[#0d2e20] text-[#1D9E75]"
                          : partido.score === "—"
                            ? "bg-[#1a1a1a] text-[#666]"
                            : "bg-[#2e1010] text-[#E85D5D]"
                    }`}
                  >
                    {partido.isDraw
                      ? "E"
                      : partido.score === "—"
                        ? "·"
                        : partido.won
                          ? "G"
                          : "P"}
                  </span>
                </div>
              ))}
              {allResultsUnknown && (
                <p className="pt-1 text-center text-xs text-[#555]">
                  {t("profile.history.matchResultsNotSaved")}
                </p>
              )}
            </div>
          ) : hasRecord ? (
            <div className="rounded-lg bg-[#0a0a0a] px-3 py-3 text-center">
              <p className="text-sm text-[#ccc]">
                {t("profile.history.recordSummary", {
                  wins: event.partidosGanados ?? 0,
                  losses: event.partidosPerdidos ?? 0,
                  draws: event.partidosEmpatados ?? 0,
                })}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      )}
    </div>
  );
}

export function PlayerHistorySection({ events }: PlayerHistorySectionProps) {
  const { t } = useTranslation("rankings");

  return (
    <div className="border-t border-[#222] pt-6">
      <h2 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.activityHistory")}
      </h2>

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <HistoryEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[#555]">
          {t("profile.noActivityYet")}
        </p>
      )}
    </div>
  );
}
