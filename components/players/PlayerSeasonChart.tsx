"use client";

import { PlayerSeasonTimeline } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerSeasonChartProps {
  timeline: PlayerSeasonTimeline;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 88;
const PADDING = 8;
const CHART_ACCENT = "#9EC5E8";

function buildChartGeometry(points: PlayerSeasonTimeline["points"]) {
  if (points.length < 2) return null;

  const balances = points.map((point) => point.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const range = maxBalance - minBalance || 1;

  const innerWidth = CHART_WIDTH - PADDING * 2;
  const innerHeight = CHART_HEIGHT - PADDING * 2;

  const coords = points.map((point, index) => ({
    x: PADDING + (index / (points.length - 1)) * innerWidth,
    y:
      PADDING +
      innerHeight -
      ((point.balance - minBalance) / range) * innerHeight,
  }));

  const linePath = coords
    .map((coord, index) => `${index === 0 ? "M" : "L"} ${coord.x} ${coord.y}`)
    .join(" ");

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${
    CHART_HEIGHT - PADDING
  } L ${coords[0].x} ${CHART_HEIGHT - PADDING} Z`;

  return {
    linePath,
    areaPath,
    lastPoint: coords[coords.length - 1],
  };
}

export function PlayerSeasonChart({ timeline }: PlayerSeasonChartProps) {
  const { t } = useTranslation("rankings");
  const { points, season } = timeline;

  const lastPoint = points[points.length - 1];
  const geometry = buildChartGeometry(points);
  const hasData = points.length >= 2;

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#222] bg-[#111]">
      <div className="flex items-center justify-between border-b border-[#222] px-4 py-3">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-[#6B9AC0]">
          {t("profile.seasonTitle", { year: String(season) })}
        </h2>
        {hasData && lastPoint && (
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-wide">
            <span className="text-[#888]">
              {t("profile.seasonWins")}{" "}
              <span className="font-medium tabular-nums text-white">
                {lastPoint.wins}
              </span>
            </span>
            <span className="text-[#444]">·</span>
            <span className="text-[#888]">
              {t("profile.seasonLosses")}{" "}
              <span className="font-medium tabular-nums text-white">
                {lastPoint.losses}
              </span>
            </span>
            {lastPoint.draws > 0 && (
              <>
                <span className="text-[#444]">·</span>
                <span className="text-[#888]">
                  {t("profile.seasonDraws")}{" "}
                  <span className="font-medium tabular-nums text-white">
                    {lastPoint.draws}
                  </span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-2">
        {hasData && geometry ? (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="h-24 w-full"
            aria-hidden
          >
            <defs>
              <linearGradient id="season-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity="0.28" />
                <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={geometry.areaPath} fill="url(#season-area)" />
            <path
              d={geometry.linePath}
              fill="none"
              stroke={CHART_ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={geometry.lastPoint.x}
              cy={geometry.lastPoint.y}
              r="3.5"
              fill={CHART_ACCENT}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-center text-xs text-[#555]">
              {t("profile.seasonNoData", { year: String(season) })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
