"use client";

import { useId, useRef } from "react";
import { PlayerSeasonTimeline } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useProfileChartDraw } from "@/components/players/useProfileChartDraw";

interface PlayerSeasonChartProps {
  timeline: PlayerSeasonTimeline;
  className?: string;
}

const CHART_WIDTH = 320;
const CHART_HEIGHT = 88;
/** Extra right pad so end-dot + halo aren't clipped at the edge */
const PADDING = 8;
const PADDING_RIGHT = 14;
/** Evolution strokes — sports blue, shared by season and rating charts */
export const PROFILE_CHART_STROKE = "#60A5FA";
export const PROFILE_CHART_STROKE_SOFT = "#93C5FD";
export const PROFILE_CHART_STROKE_WIDTH = 2.5;
export const PROFILE_CHART_DOT_R = 3;
export const PROFILE_CHART_GRID = "rgba(42, 47, 56, 0.9)";

/** Functional up/down accents used outside the evolution charts */
export const PROFILE_DELTA_UP = "#8FCB9B";
export const PROFILE_DELTA_DOWN = "#D98888";

function buildChartGeometry(points: PlayerSeasonTimeline["points"]) {
  if (points.length < 2) return null;

  const balances = points.map((point) => point.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const range = maxBalance - minBalance || 1;

  const innerWidth = CHART_WIDTH - PADDING - PADDING_RIGHT;
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

export function PlayerSeasonChart({
  timeline,
  className = "",
}: PlayerSeasonChartProps) {
  const { t } = useTranslation("rankings");
  const { points, season } = timeline;
  const gradId = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);

  const lastPoint = points[points.length - 1];
  const geometry = buildChartGeometry(points);
  const hasData = points.length >= 2;

  useProfileChartDraw(pathRef, areaRef, [geometry?.linePath]);

  return (
    <div className={className.trim()}>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-[#A1AAB8]">
          {t("profile.seasonTitle", { year: String(season) })}
        </h2>
        {hasData && lastPoint && (
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-[#A1AAB8]">
            <span>
              {t("profile.seasonWins")}{" "}
              <span className="text-[15px] font-semibold tabular-nums text-[#F5F7FA]">
                {lastPoint.wins}
              </span>
            </span>
            <span className="text-[#2A2F38]">·</span>
            <span>
              {t("profile.seasonLosses")}{" "}
              <span className="text-[15px] font-semibold tabular-nums text-[#F87171]">
                {lastPoint.losses}
              </span>
            </span>
            {lastPoint.draws > 0 && (
              <>
                <span className="text-[#2A2F38]">·</span>
                <span>
                  {t("profile.seasonDraws")}{" "}
                  <span className="text-[15px] font-semibold tabular-nums text-[#A1AAB8]">
                    {lastPoint.draws}
                  </span>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="px-3 pb-3 pt-1">
        {hasData && geometry ? (
          <div className="relative h-24 w-full overflow-visible">
            <svg
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden
            >
              <defs>
                <linearGradient
                  id={`season-area-${gradId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((step) => (
                <line
                  key={step}
                  x1={PADDING}
                  x2={CHART_WIDTH - PADDING_RIGHT}
                  y1={PADDING + (CHART_HEIGHT - PADDING * 2) * step}
                  y2={PADDING + (CHART_HEIGHT - PADDING * 2) * step}
                  stroke={PROFILE_CHART_GRID}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                ref={areaRef}
                d={geometry.areaPath}
                fill={`url(#season-area-${gradId})`}
                style={{ opacity: 0 }}
              />
              <path
                ref={pathRef}
                d={geometry.linePath}
                fill="none"
                stroke={PROFILE_CHART_STROKE}
                strokeWidth={PROFILE_CHART_STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* HTML end-dot avoids oval smear from preserveAspectRatio=none */}
            <span
              className="profile-chart-end-dot"
              style={{
                left: `${(geometry.lastPoint.x / CHART_WIDTH) * 100}%`,
                top: `${(geometry.lastPoint.y / CHART_HEIGHT) * 100}%`,
              }}
              aria-hidden
            />
          </div>
        ) : (
          <div className="flex h-24 items-center justify-center">
            <p className="text-center text-xs text-[#A1AAB8]">
              {t("profile.seasonNoData", { year: String(season) })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
