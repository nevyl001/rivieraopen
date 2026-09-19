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
/** Chart strokes — white with opacity hierarchy, not brand color */
export const PROFILE_CHART_STROKE = "rgba(255, 255, 255, 0.93)";
export const PROFILE_CHART_STROKE_SOFT = "rgba(255, 255, 255, 0.82)";
export const PROFILE_CHART_STROKE_WIDTH = 2;
export const PROFILE_CHART_DOT_R = 3;

/** Muted data accents — readable up/down without neon traffic-light */
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
        <h2 className="text-[10px] uppercase tracking-[0.22em] text-[#555]">
          {t("profile.seasonTitle", { year: String(season) })}
        </h2>
        {hasData && lastPoint && (
          <div className="flex items-center gap-3 text-[12px] uppercase tracking-wide">
            <span className="text-[#777]">
              {t("profile.seasonWins")}{" "}
              <span className="text-[13px] font-semibold tabular-nums text-white">
                {lastPoint.wins}
              </span>
            </span>
            <span className="text-[#444]">·</span>
            <span className="text-[#777]">
              {t("profile.seasonLosses")}{" "}
              <span className="text-[13px] font-semibold tabular-nums text-white">
                {lastPoint.losses}
              </span>
            </span>
            {lastPoint.draws > 0 && (
              <>
                <span className="text-[#444]">·</span>
                <span className="text-[#777]">
                  {t("profile.seasonDraws")}{" "}
                  <span className="text-[13px] font-semibold tabular-nums text-white">
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
                  <stop
                    offset="0%"
                    stopColor="#ffffff"
                    stopOpacity="0.15"
                  />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
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
              className="profile-chart-end-dot profile-chart-end-dot--pulse"
              style={{
                left: `${(geometry.lastPoint.x / CHART_WIDTH) * 100}%`,
                top: `${(geometry.lastPoint.y / CHART_HEIGHT) * 100}%`,
              }}
              aria-hidden
            />
          </div>
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
