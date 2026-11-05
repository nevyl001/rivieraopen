"use client";

import { useMemo, useState } from "react";
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
import {
  groupPlayerHistory,
  HISTORY_MONTH_PAGE_SIZE,
  HISTORY_SPORT_TIME_ZONE,
  type HistoryMonthGroup,
} from "@/lib/playerHistoryGrouping";

interface PlayerHistorySectionProps {
  events: PassportHistoryEvent[];
  /** Logros ya calculados para todo el historial. Se omite si no llega. */
  achievementCount?: number;
  hideTitle?: boolean;
}

function EventTypeIcon({ tipo }: { tipo: string }) {
  const className = "shrink-0";
  switch (tipo) {
    case "torneo_express":
      return <Trophy size={15} className={className} />;
    case "liga":
      return <Flag size={15} className={className} />;
    case "reta":
      return <Zap size={15} className={className} />;
    case "americano":
      return <Users size={15} className={className} />;
    case "duelo":
    case "duelo_2v2":
    case "2vs2":
      return <Swords size={15} className={className} />;
    default:
      return <Trophy size={15} className={className} />;
  }
}

function placementLabel(posicion: number | null, t: (key: string) => string) {
  if (!posicion) return null;
  if (posicion === 1) return `🥇 ${t("profile.history.firstPlace")}`;
  if (posicion === 2) return `🥈 ${t("profile.history.secondPlace")}`;
  if (posicion === 3) return `🥉 ${t("profile.history.thirdPlace")}`;
  return `${posicion}°`;
}

function monthHeading(year: number, month: number, locale: string) {
  const label = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 15)));
  return `${label} ${year}`;
}

function HistoryEventCard({ event }: { event: PassportHistoryEvent }) {
  const [open, setOpen] = useState(false);
  const { t, formatDate, formatShortDate } = useTranslation("rankings");

  const placement = placementLabel(event.posicionFinal, t);
  const hasMatches = event.partidos.length > 0;
  const recordTotal =
    (event.partidosGanados ?? 0) +
    (event.partidosPerdidos ?? 0) +
    (event.partidosEmpatados ?? 0);
  const hasRecord = recordTotal > 0;
  const hasPartners = (event.partners?.length ?? 0) > 0;
  const canExpand = hasMatches || hasRecord || hasPartners;
  const allResultsUnknown =
    hasMatches && event.partidos.every((partido) => partido.score === "—");
  const clubName = event.sourceClubName ?? event.organizerName;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#2A2F38] bg-[#14171C]">
      <button
        type="button"
        onClick={() => canExpand && setOpen((prev) => !prev)}
        disabled={!canExpand}
        className={`w-full px-3 py-2.5 text-left lg:px-4 lg:py-3 ${
          canExpand ? "hover:bg-white/[0.02]" : "cursor-default"
        }`}
      >
        <div className="flex items-start gap-2.5 lg:items-center lg:gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] text-[#A1AAB8] lg:mt-0">
            <EventTypeIcon tipo={event.tipoEvento} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-medium leading-snug text-[#F5F7FA] lg:text-[15px]">
              {event.nombre}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#A1AAB8] lg:text-xs">
              {event.fecha && (
                <span>
                  {/^\d{4}-\d{2}-\d{2}$/.test(event.fecha.trim())
                    ? formatShortDate(event.fecha)
                    : formatDate(event.fecha, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: HISTORY_SPORT_TIME_ZONE,
                      })}
                </span>
              )}
              {event.fecha && <span className="text-[#2A2F38]">·</span>}
              <span>{eventTypeLabel(event.tipoEvento)}</span>
              {clubName && (
                <>
                  <span className="text-[#2A2F38]">·</span>
                  <span className="break-words">{clubName}</span>
                </>
              )}
              {event.categoria && (
                <>
                  <span className="text-[#2A2F38]">·</span>
                  <span>{event.categoria}</span>
                </>
              )}
              {event.organizerName && event.organizerName !== clubName && (
                <>
                  <span className="text-[#2A2F38]">·</span>
                  <span className="break-words">{event.organizerName}</span>
                </>
              )}
              {placement && (
                <>
                  <span className="text-[#2A2F38]">·</span>
                  <span>{placement}</span>
                </>
              )}
              {event.resultLabel && (
                <>
                  <span className="text-[#2A2F38]">·</span>
                  <span className="break-words">{event.resultLabel}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 lg:flex-row lg:items-center lg:gap-2">
            {event.puntosGanados > 0 && (
              <span className="text-xs font-semibold tabular-nums text-[#1D9E75] lg:text-sm">
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
                className={`text-[#A1AAB8] transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>
      </button>

      {open && canExpand && (
        <div className="border-t border-[#2A2F38] px-3 py-2.5 lg:px-4 lg:py-3">
          {hasPartners && (
            <p className="mb-2 break-words text-xs text-[#A1AAB8]">
              {t("passport.historyPartners")}: {event.partners?.join(" · ")}
            </p>
          )}
          {hasMatches ? (
            <div className="space-y-1.5">
              {event.partidos.map((partido) => (
                <div
                  key={partido.id}
                  className="flex items-start justify-between gap-2 rounded-lg bg-[#0a0a0a] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wide text-[#A1AAB8]">
                      {partido.round}
                    </p>
                    <p className="break-words text-sm text-[#F5F7FA]">
                      {t("profile.history.vs")} {partido.opponentLabel}
                    </p>
                    <p className="break-all text-xs tabular-nums text-[#A1AAB8]">
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
                            ? "bg-[#1a1a1a] text-[#A1AAB8]"
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
                <p className="pt-1 text-center text-xs text-[#A1AAB8]">
                  {t("profile.history.matchResultsNotSaved")}
                </p>
              )}
            </div>
          ) : hasRecord ? (
            <p className="break-words text-sm text-[#F5F7FA]">
              {t("profile.history.recordSummary", {
                wins: event.partidosGanados ?? 0,
                losses: event.partidosPerdidos ?? 0,
                draws: event.partidosEmpatados ?? 0,
              })}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function MonthEvents({ events }: { events: PassportHistoryEvent[] }) {
  const { t } = useTranslation("rankings");
  const [visible, setVisible] = useState(HISTORY_MONTH_PAGE_SIZE);
  const shown = events.slice(0, visible);
  const remaining = events.length - shown.length;

  return (
    <div className="space-y-1.5">
      {shown.map((event) => (
        <HistoryEventCard key={event.id} event={event} />
      ))}
      {remaining > 0 && (
        <button
          type="button"
          onClick={() => setVisible((count) => count + HISTORY_MONTH_PAGE_SIZE)}
          className="min-h-11 w-full rounded-[10px] border border-[#2A2F38] px-3 py-2.5 text-xs text-[#A1AAB8] hover:text-[#F5F7FA]"
        >
          {t("profile.history.showMoreMonth")} · {remaining}
        </button>
      )}
    </div>
  );
}

export function PlayerHistorySection({
  events,
  achievementCount,
  hideTitle = false,
}: PlayerHistorySectionProps) {
  const { t, locale } = useTranslation("rankings");
  const grouped = useMemo(() => groupPlayerHistory(events), [events]);
  const [year, setYear] = useState<number | null>(null);
  const [openMonths, setOpenMonths] = useState<string[] | null>(null);

  const activeYear = year ?? grouped.years[0] ?? null;
  const months =
    activeYear != null ? (grouped.monthsByYear.get(activeYear) ?? []) : [];
  const showUndated = grouped.undated.length > 0;
  const defaultOpenKey = months[0]?.key ?? (showUndated ? "undated" : null);

  function isMonthOpen(key: string) {
    if (openMonths == null) return key === defaultOpenKey;
    return openMonths.includes(key);
  }

  function toggleMonth(key: string) {
    setOpenMonths((current) => {
      const base = new Set(current ?? (defaultOpenKey ? [defaultOpenKey] : []));
      if (base.has(key)) base.delete(key);
      else base.add(key);
      return [...base];
    });
  }

  function selectYear(next: number) {
    setYear(next);
    setOpenMonths(null);
  }

  const activityLabel = (count: number) =>
    count === 1
      ? t("profile.history.activitiesOne")
      : t("profile.history.activitiesMany", { count: String(count) });

  const statColumns =
    1 +
    (grouped.distinctEventCount > 0 ? 1 : 0) +
    (achievementCount != null ? 1 : 0);
  const statGrid =
    statColumns >= 3
      ? "grid-cols-3"
      : statColumns === 2
        ? "grid-cols-2"
        : "grid-cols-1";

  return (
    <div className={hideTitle ? undefined : "border-t border-[#222] pt-3 lg:pt-6"}>
      {!hideTitle && (
        <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#A1AAB8] lg:mb-4">
          {t("profile.activityHistory")}
        </h2>
      )}

      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#A1AAB8] lg:py-8">
          {t("profile.noActivityYet")}
        </p>
      ) : (
        <>
          <div className={`mb-4 grid gap-2 ${statGrid}`}>
            <TrajectoryStat
              label={t("profile.history.participations")}
              value={grouped.participationCount}
            />
            {grouped.distinctEventCount > 0 && (
              <TrajectoryStat
                label={t("profile.history.eventsPlayed")}
                value={grouped.distinctEventCount}
              />
            )}
            {achievementCount != null && (
              <TrajectoryStat
                label={t("profile.history.achievements")}
                value={achievementCount}
              />
            )}
          </div>

          {grouped.years.length > 0 && (
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
              {grouped.years.map((item) => {
                const selected = item === activeYear;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => selectYear(item)}
                    className={`shrink-0 rounded-full border px-3.5 py-2 text-xs tabular-nums ${
                      selected
                        ? "border-[#F5F7FA] text-[#F5F7FA]"
                        : "border-[#2A2F38] text-[#A1AAB8]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}

          <div className="space-y-3">
            {months.map((month) => (
              <MonthBlock
                key={month.key}
                month={month}
                heading={monthHeading(month.year, month.month, locale)}
                countLabel={activityLabel(month.events.length)}
                open={isMonthOpen(month.key)}
                onToggle={() => toggleMonth(month.key)}
              />
            ))}
            {showUndated && (
              <MonthBlock
                month={{
                  key: "undated",
                  year: 0,
                  month: 0,
                  events: grouped.undated,
                }}
                heading={t("profile.history.undated")}
                countLabel={activityLabel(grouped.undated.length)}
                open={isMonthOpen("undated")}
                onToggle={() => toggleMonth("undated")}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TrajectoryStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-[10px] border border-[#2A2F38] bg-[#14171C] px-2.5 py-2 lg:px-3 lg:py-2.5">
      <p className="truncate text-[10px] uppercase tracking-[0.12em] text-[#A1AAB8]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums leading-none text-[#F5F7FA] lg:text-xl">
        {value}
      </p>
    </div>
  );
}

function MonthBlock({
  month,
  heading,
  countLabel,
  open,
  onToggle,
}: {
  month: HistoryMonthGroup;
  heading: string;
  countLabel: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F7FA]">
            {heading}
          </span>
          <span className="text-[11px] text-[#A1AAB8]">{countLabel}</span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#A1AAB8] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="mt-1.5">
          <MonthEvents key={month.key} events={month.events} />
        </div>
      )}
    </section>
  );
}
