"use client";

import { useEffect, type DependencyList, type RefObject } from "react";

/**
 * One-shot stroke draw for profile charts. Sets dash length then animates via CSS.
 * No-ops when prefers-reduced-motion is set.
 */
export function useProfileChartDraw(
  pathRef: RefObject<SVGPathElement | null>,
  areaRef: RefObject<SVGPathElement | null>,
  deps: DependencyList
) {
  useEffect(() => {
    const path = pathRef.current;
    const area = areaRef.current;
    if (!path) return;

    // Skip hidden duplicate trees (mobile/desktop forks) so they don't stick mid-draw.
    const box = path.ownerSVGElement?.getBoundingClientRect();
    if (!box || box.width < 2 || box.height < 2) {
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      if (area) area.style.opacity = "1";
      return;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    path.classList.remove("profile-chart-line--draw");
    area?.classList.remove("profile-chart-area--fade");

    if (reduced) {
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      if (area) area.style.opacity = "1";
      return;
    }

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    if (area) area.style.opacity = "0";

    // Double rAF: ensure initial dash paints before the draw class starts.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        path.classList.add("profile-chart-line--draw");
        area?.classList.add("profile-chart-area--fade");
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}
