"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import {
  averageLuminanceFromImageData,
  formatFeaturedRank,
  overlayOpacityFromLuminance,
} from "@/lib/featuredPlayersContrast";
import { Player } from "@/lib/types";

interface FeaturedPlayersClientProps {
  players: Player[];
}

const FALLBACK_OVERLAY = overlayOpacityFromLuminance(0.55);
const SWIPE_THRESHOLD = 48;

function usePhotoOverlayOpacity(src: string): number {
  const [opacity, setOpacity] = useState(FALLBACK_OVERLAY);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const sampleW = 48;
        const sampleH = 28;
        canvas.width = sampleW;
        canvas.height = sampleH;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          if (!cancelled) setOpacity(FALLBACK_OVERLAY);
          return;
        }
        const sy = img.naturalHeight * 0.55;
        const sh = Math.max(1, img.naturalHeight * 0.45);
        ctx.drawImage(
          img,
          0,
          sy,
          img.naturalWidth,
          sh,
          0,
          0,
          sampleW,
          sampleH
        );
        const { data } = ctx.getImageData(0, 0, sampleW, sampleH);
        const L = averageLuminanceFromImageData(data);
        if (!cancelled) setOpacity(overlayOpacityFromLuminance(L));
      } catch {
        if (!cancelled) setOpacity(FALLBACK_OVERLAY);
      }
    };

    img.onerror = () => {
      if (!cancelled) setOpacity(FALLBACK_OVERLAY);
    };

    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return opacity;
}

function PlayerPortrait({
  player,
  categoryLabel,
  variant,
  onSelect,
}: {
  player: Player;
  categoryLabel: string;
  variant: "active" | "side";
  onSelect?: () => void;
}) {
  const overlay = usePhotoOverlayOpacity(player.photo);
  const isActive = variant === "active";
  const name = [player.firstName, player.lastName].filter(Boolean).join(" ");
  const href = buildPlayerProfilePath(player.id, player.rivieraId);

  const content = (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={player.photo}
          alt={name}
          fill
          className={`object-cover object-[center_18%] transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            isActive
              ? "scale-100 group-hover:scale-[1.02]"
              : "scale-[1.01] group-hover:scale-[1.02]"
          }`}
          sizes={
            isActive
              ? "(max-width: 768px) 88vw, 48vw"
              : "(max-width: 768px) 0px, 24vw"
          }
          priority={isActive}
        />
      </div>

      {/* Structural floor: always dark enough under text for AA */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 42%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden
      />

      {/* Dynamic veil from sampled luminance of the text zone */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] transition-[opacity] duration-500 motion-reduce:transition-none"
        style={{
          opacity: overlay,
          background:
            "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0) 100%)",
        }}
        aria-hidden
      />

      <div
        className={`absolute inset-x-0 bottom-0 z-10 flex flex-col ${
          isActive ? "p-5 md:p-7 lg:p-8" : "p-4 md:p-5"
        }`}
      >
        <span
          className={`font-[family-name:var(--font-fp-display)] leading-none tracking-tight text-white ${
            isActive
              ? "text-[4.5rem] md:text-[5.5rem] lg:text-[6.5rem]"
              : "text-4xl md:text-5xl text-white/90"
          }`}
        >
          {formatFeaturedRank(player.rank)}
        </span>
        <h3
          className={`mt-1 font-[family-name:var(--font-fp-display)] uppercase leading-[0.95] tracking-wide text-white ${
            isActive
              ? "text-3xl md:text-4xl lg:text-5xl"
              : "text-xl md:text-2xl text-white/90"
          }`}
        >
          {name}
        </h3>
        <p
          className={`mt-3 font-[family-name:var(--font-fp-sans)] uppercase tracking-[0.14em] text-white/85 ${
            isActive ? "text-[11px] md:text-xs" : "text-[10px] md:text-[11px]"
          }`}
        >
          <span>{categoryLabel}</span>
          <span className="mx-2.5 text-white/40" aria-hidden>
            ·
          </span>
          <span>{player.points.toLocaleString()} PTS</span>
        </p>
      </div>
    </>
  );

  const shellClass = `group relative block overflow-hidden bg-[#111111] transition-[transform,opacity] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
    isActive
      ? "h-[28rem] w-full md:h-[32rem] lg:h-[34rem]"
      : "hidden h-[24rem] md:block md:h-[26rem] lg:h-[28rem] opacity-70 hover:opacity-90"
  }`;

  if (onSelect && !isActive) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={`${shellClass} w-full cursor-pointer text-left`}
        aria-label={`Ver ${name}`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={shellClass}>
      {content}
    </Link>
  );
}

export function FeaturedPlayersClient({
  players: featuredPlayers,
}: FeaturedPlayersClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const { t } = useTranslation("home");
  const { t: tRankings } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");

  useEffect(() => {
    if (featuredPlayers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPlayers.length);
      setAnimKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredPlayers.length]);

  const goTo = useCallback(
    (index: number) => {
      if (featuredPlayers.length === 0) return;
      const next =
        ((index % featuredPlayers.length) + featuredPlayers.length) %
        featuredPlayers.length;
      setCurrentIndex(next);
      setAnimKey((k) => k + 1);
    },
    [featuredPlayers.length]
  );

  const goToPrevious = () => goTo(currentIndex - 1);
  const goToNext = () => goTo(currentIndex + 1);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNext();
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    if (dx < 0) goToNext();
    else goToPrevious();
  };

  const total = featuredPlayers.length;
  const active = total ? featuredPlayers[currentIndex] : null;
  const prevPlayer =
    total > 1
      ? featuredPlayers[(currentIndex - 1 + total) % total]
      : null;
  const nextPlayer =
    total > 1 ? featuredPlayers[(currentIndex + 1) % total] : null;
  const peekPlayer =
    total > 1 ? featuredPlayers[(currentIndex + 1) % total] : null;

  const indexLabel = `${formatFeaturedRank(currentIndex + 1)} / ${formatFeaturedRank(total || 0)}`;

  if (total === 0) {
    return (
      <section className="bg-[#0A0A0A] py-16 md:py-20">
        <Container>
          <p className="font-[family-name:var(--font-fp-sans)] text-sm text-[#8A8A8A]">
            No featured players available yet. Check back soon!
          </p>
        </Container>
      </section>
    );
  }

  return (
    <section
      className="bg-[#0A0A0A] py-12 md:py-14 lg:py-16"
      aria-roledescription="carousel"
      aria-label={t("sections.featuredPlayers")}
    >
      <Container className="max-w-[80rem]">
        <div className="mb-6 flex flex-col gap-5 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-10">
          <header className="max-w-xl">
            <p className="mb-2 font-[family-name:var(--font-fp-sans)] text-[10px] font-medium uppercase tracking-[0.2em] text-[#8A8A8A] md:text-[11px]">
              {t("sections.featuredPlayersKicker")}
            </p>
            <h2 className="font-[family-name:var(--font-fp-display)] text-[2.25rem] leading-[0.9] tracking-wide text-white sm:text-5xl md:text-[3.5rem] lg:text-[4rem]">
              <span className="block">{t("sections.featuredPlayersLine1")}</span>
              <span className="block">{t("sections.featuredPlayersLine2")}</span>
            </h2>
            <p className="mt-3 max-w-md font-[family-name:var(--font-fp-sans)] text-sm leading-relaxed text-[#8A8A8A] md:text-[15px]">
              {t("sections.featuredPlayersDescription")}
            </p>
          </header>

          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              type="button"
              onClick={goToPrevious}
              className="inline-flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={tCommon("buttons.previous")}
            >
              <ChevronLeft size={22} strokeWidth={1.5} />
            </button>
            <span
              className="min-w-[4.5rem] text-center font-[family-name:var(--font-fp-sans)] text-xs font-medium tabular-nums tracking-[0.12em] text-white"
              aria-live="polite"
            >
              {indexLabel}
            </span>
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label={tCommon("buttons.next")}
            >
              <ChevronRight size={22} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div
          className="relative"
          onKeyDown={onKeyDown}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          tabIndex={0}
          role="group"
          aria-label={`${t("sections.featuredPlayers")} — ${indexLabel}`}
        >
          <div
            key={animKey}
            className="fp-enter hidden items-end gap-4 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)_minmax(0,0.9fr)] md:gap-5 lg:gap-6"
          >
            {prevPlayer ? (
              <PlayerPortrait
                player={prevPlayer}
                variant="side"
                categoryLabel={tRankings(
                  getCategoryTranslationKey(prevPlayer.category)
                )}
                onSelect={() => goTo(currentIndex - 1)}
              />
            ) : (
              <div />
            )}

            {active && (
              <PlayerPortrait
                player={active}
                variant="active"
                categoryLabel={tRankings(
                  getCategoryTranslationKey(active.category)
                )}
              />
            )}

            {nextPlayer ? (
              <PlayerPortrait
                player={nextPlayer}
                variant="side"
                categoryLabel={tRankings(
                  getCategoryTranslationKey(nextPlayer.category)
                )}
                onSelect={() => goTo(currentIndex + 1)}
              />
            ) : (
              <div />
            )}
          </div>

          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                key={`m-${animKey}`}
                className="fp-enter flex gap-3"
                style={{ width: "112%" } as CSSProperties}
              >
                {active && (
                  <div className="w-[88%] shrink-0">
                    <PlayerPortrait
                      player={active}
                      variant="active"
                      categoryLabel={tRankings(
                        getCategoryTranslationKey(active.category)
                      )}
                    />
                  </div>
                )}
                {peekPlayer && (
                  <div className="pointer-events-none w-[12%] shrink-0 opacity-50">
                    <div className="relative h-[28rem] overflow-hidden bg-[#111]">
                      <Image
                        src={peekPlayer.photo}
                        alt=""
                        fill
                        className="object-cover object-[center_18%]"
                        sizes="12vw"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
