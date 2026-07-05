"use client";

import { useState } from "react";
import {
  ChevronDown,
  Flag,
  Swords,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { PassportHistoryEvent } from "@/lib/types/playerPassport";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { eventTypeLabel } from "@/lib/playerPassportAnalyticsService";

interface PlayerHistorySectionProps {
  events: PassportHistoryEvent[];
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

function MetaPill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex max-w-full break-words rounded-full border border-[#2a2a2a] px-2 py-0.5 text-[10px] text-[#999] lg:text-xs ${className}`}
    >
      {children}
    </span>
  );
}

function HistoryEventCard({ event }: { event: PassportHistoryEvent }) {
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
  const clubName = event.sourceClubName ?? event.organizerName;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#1f1f1f] bg-[#111]">
      <button
        type="button"
        onClick={() => canExpand && setOpen((prev) => !prev)}
        disabled={!canExpand}
        className={`w-full px-2.5 py-2.5 text-left transition-colors lg:px-4 lg:py-4 ${
          canExpand ? "hover:bg-[#151515]" : "cursor-default"
        }`}
      >
        <div className="flex items-start gap-2.5 lg:gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] text-[#8E9AAB] lg:h-9 lg:w-9">
            <Icon size={16} className="lg:h-[18px] lg:w-[18px]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-1 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-2 lg:gap-y-1">
              <p className="break-words text-[15px] font-medium leading-snug text-white lg:text-base">
                {event.nombre}
              </p>
              {event.fecha && (
                <span className="text-xs text-[#666]">
                  {formatShortDate(event.fecha)}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] text-[#777] lg:mt-1.5 lg:gap-2 lg:text-xs">
              <MetaPill>{eventTypeLabel(event.tipoEvento)}</MetaPill>
              {clubName && <MetaPill>{clubName}</MetaPill>}
              {event.categoria && (
                <MetaPill className="hidden sm:inline-flex">{event.categoria}</MetaPill>
              )}
              {event.organizerName &&
                event.organizerName !== clubName && (
                  <MetaPill className="hidden md:inline-flex">
                    {event.organizerName}
                  </MetaPill>
                )}
              {placement && (
                <span className="hidden break-words sm:inline">{placement}</span>
              )}
              {event.resultLabel && (
                <span className="hidden break-words text-[#999] sm:inline">
                  {event.resultLabel}
                </span>
              )}
              {event.partners && event.partners.length > 0 && (
                <span className="hidden break-words text-[#888] lg:inline">
                  {t("passport.historyPartners")}: {event.partners.join(" · ")}
                </span>
              )}
              {!open && event.partidos.length === 1 && (
                <span className="break-words text-[#888]">
                  {t("profile.history.vs")} {event.partidos[0].opponentLabel}
                  {event.partidos[0].score && event.partidos[0].score !== "—"
                    ? ` · ${event.partidos[0].score}`
                    : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5 lg:gap-2">
            {event.puntosGanados > 0 && (
              <span className="text-xs font-medium tabular-nums text-[#1D9E75] lg:text-sm">
                +{event.puntosGanados} pts
              </span>
            )}
            {event.ratingChange != null && event.ratingChange !== 0 && (
              <span
                className={`text-[10px] tabular-nums lg:text-xs ${
                  event.ratingChange > 0 ? "text-[#1D9E75]" : "text-[#E85D5D]"
                }`}
              >
                {event.ratingChange > 0 ? "+" : ""}
                {event.ratingChange.toFixed(2)} rating
              </span>
            )}
            {canExpand && (
              <ChevronDown
                size={16}
                className={`text-[#555] transition-transform duration-300 lg:h-[18px] lg:w-[18px] ${
                  open ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>
      </button>

      {canExpand && (
        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
          style={{ maxHeight: open ? "800px" : "0px" }}
        >
          <div className="border-t border-[#1f1f1f] px-3 py-2.5 lg:px-4 lg:py-3">
            {hasMatches ? (
              <div className="space-y-2">
                {event.partidos.map((partido) => (
                  <div
                    key={partido.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-[#0a0a0a] px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wide text-[#555]">
                        {partido.round}
                      </p>
                      <p className="break-words text-sm text-[#ccc]">
                        {t("profile.history.vs")} {partido.opponentLabel}
                      </p>
                      <p className="break-all text-xs tabular-nums text-[#666]">
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
                <p className="break-words text-sm text-[#ccc]">
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
    <div className="border-t border-[#222] pt-3 lg:pt-6">
      <h2 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
        {t("profile.activityHistory")}
      </h2>

      {events.length > 0 ? (
        <div className="space-y-1.5 lg:space-y-3">
          {events.map((event) => (
            <HistoryEventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-[#555] lg:py-8">
          {t("profile.noActivityYet")}
        </p>
      )}
    </div>
  );
}
