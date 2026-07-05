"use client";

import { useCallback, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import { countryCodeToFlag } from "@/components/ui/CountryFlag";
import { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { PlayerSocialIcons, playerHasSocials } from "@/components/rankings/PlayerSocialIcons";
import { ShareProfileButton } from "@/components/players/ShareProfileButton";
import { PassportQrModal } from "@/components/players/PassportQrModal";

interface PlayerProfileProps {
  player: PlayerProfileDetail;
}

function formatLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PlayerPhotoFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const frameClass =
    "size-[280px] shrink-0 overflow-hidden rounded-2xl bg-[#111] ring-1 ring-[#2a2a2a] sm:size-[300px] lg:size-[320px]";

  return (
    <div className={frameClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-full w-full object-cover object-[50%_22%]"
      />
    </div>
  );
}

function StatusBadge({
  status,
  label,
  compact = false,
}: {
  status: "LOCAL" | "OFICIAL_RIVIERA";
  label: string;
  compact?: boolean;
}) {
  const isOfficial = status === "OFICIAL_RIVIERA";
  return (
    <span
      className={`inline-flex rounded-full font-medium tracking-wide ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      } ${
        isOfficial
          ? "border border-[#1D9E75]/30 bg-[#0d2e20] text-[#1D9E75]"
          : "border border-[#444] bg-[#151515] text-[#aaa]"
      }`}
    >
      {label}
    </span>
  );
}

function RivieraIdCopyButton({
  rivieraId,
  compact = false,
  centered = false,
  onDark = false,
}: {
  rivieraId: string;
  compact?: boolean;
  centered?: boolean;
  onDark?: boolean;
}) {
  const { t } = useTranslation("rankings");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(rivieraId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("profile.shareFallback"), rivieraId);
    }
  }, [rivieraId, t]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group flex w-full min-w-0 items-center gap-2 ${
        centered
          ? "justify-center"
          : compact
            ? "justify-start"
            : "justify-center lg:justify-start"
      }`}
      aria-label={t("passport.copyId")}
    >
      <span
        className={`min-w-0 break-all font-mono font-medium tracking-[0.12em] text-[#1D9E75] ${
          compact
            ? "text-sm leading-snug"
            : "text-base tracking-[0.16em] sm:text-lg lg:text-lg"
        }`}
      >
        {rivieraId}
      </span>
      <span
        className={`shrink-0 transition-colors ${
          onDark
            ? "text-white/55 group-hover:text-white"
            : "text-[#555] group-hover:text-[#1D9E75]"
        }`}
      >
        {copied ? (
          <Check size={compact ? 14 : 16} className="text-emerald-400" />
        ) : (
          <Copy size={compact ? 14 : 16} />
        )}
      </span>
    </button>
  );
}

function HeaderStatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="hidden overflow-hidden rounded-[10px] bg-[#111] lg:block">
      <div className="grid grid-cols-2">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`px-4 py-4 ${
              index % 2 === 0 ? "border-r border-[#222]" : ""
            } ${index < 2 ? "border-b border-[#222]" : ""}`}
          >
            <p className="mb-2 text-[10px] uppercase tracking-wide text-[#555]">
              {stat.label}
            </p>
            <p className="text-[26px] font-medium tabular-nums leading-none text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileMetricGrid({
  stats,
  overlay = false,
}: {
  stats: Array<{ label: string; value: string }>;
  overlay?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={
            overlay
              ? "rounded-lg bg-black/50 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-md"
              : "rounded-lg border border-[#222] bg-[#111] px-2.5 py-2"
          }
        >
          <p
            className={`text-[8px] uppercase tracking-wide ${
              overlay ? "text-white/60" : "text-[#555]"
            }`}
          >
            {stat.label}
          </p>
          <p className="mt-0.5 text-base font-medium tabular-nums leading-none text-white">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function MobilePassportHeroCard({
  photo,
  photoAlt,
  playerName,
  mobileMetrics,
  fuerzaLabel,
  genderLabel,
  passport,
  statusLabel,
  registrationLine,
}: {
  photo: string;
  photoAlt: string;
  playerName: string;
  mobileMetrics: Array<{ label: string; value: string }>;
  fuerzaLabel: string;
  genderLabel: string;
  passport: PlayerProfileDetail["passport"];
  statusLabel: string;
  registrationLine: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#1f1f1f] shadow-[0_16px_48px_rgba(0,0,0,0.45)] lg:hidden">
      <div className="relative aspect-[3/4] min-h-[360px] w-full max-h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt={photoAlt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_18%]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/92" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="text-[9px] uppercase tracking-[0.18em] text-white/75">
            Riviera Player Passport
          </span>
          {passport?.status && (
            <StatusBadge
              status={passport.status}
              label={statusLabel}
              compact
            />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3.5 pt-10 text-center">
          <h1 className="break-words text-[24px] font-medium leading-tight text-white drop-shadow-sm">
            {playerName}
          </h1>

          {passport?.rivieraId && (
            <div className="mt-2">
              <RivieraIdCopyButton
                rivieraId={passport.rivieraId}
                compact
                centered
                onDark
              />
            </div>
          )}

          <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
            <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
              {fuerzaLabel}
            </span>
            <span className="rounded-full border border-white/15 bg-black/40 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
              {genderLabel}
            </span>
          </div>

          <div className="mt-3">
            <MobileMetricGrid stats={mobileMetrics} overlay />
          </div>

          {registrationLine && (
            <div className="mt-2.5 text-[10px] leading-relaxed text-white/65">
              {registrationLine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");
  const { formatNumber, formatShortDate } = useTranslation();
  const [qrOpen, setQrOpen] = useState(false);

  const fuerzaLabel = t(getCategoryTranslationKey(player.category));
  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const passport = player.passport;
  const statusLabel =
    passport?.status === "OFICIAL_RIVIERA"
      ? t("passport.statusOfficial")
      : t("passport.statusLocal");

  const ratingLabel =
    player.rating != null && Number.isFinite(player.rating)
      ? player.rating.toFixed(2)
      : "—";

  const mobileMetrics = [
    {
      label: t("labels.currentRank"),
      value: `#${player.rank || "—"}`,
    },
    {
      label: t("labels.totalPoints"),
      value: formatNumber(player.points),
    },
    {
      label: t("passport.level"),
      value: ratingLabel,
    },
    {
      label: t("profile.wins"),
      value: String(player.stats.victorias),
    },
  ];

  const desktopStats = [
    mobileMetrics[0],
    mobileMetrics[1],
    mobileMetrics[3],
    {
      label: t("profile.winRate"),
      value: `${player.stats.pctVictorias}%`,
    },
  ];

  const shareUrl =
    player.shareProfileUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/players/${player.id}`
      : `/players/${player.id}`);

  const registrationBlock =
    passport?.registrationClubName ||
    passport?.debutDate ||
    passport?.debutSeason ? (
      <div className="hidden rounded-[10px] border border-[#1f1f1f] bg-[#111] px-4 py-3 text-left lg:grid lg:grid-cols-2 lg:gap-2">
        {passport.registrationClubName && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.registrationClub")}
            </p>
            <p className="mt-1 break-words text-sm text-white">
              {passport.registrationClubName}
            </p>
          </div>
        )}
        {passport.debutDate && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.debutRiviera")}
            </p>
            <p className="mt-1 text-sm text-white">
              {formatShortDate(passport.debutDate)}
            </p>
          </div>
        )}
        {passport.debutSeason && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.debutSeason")}
            </p>
            <p className="mt-1 text-sm text-white">{passport.debutSeason}</p>
          </div>
        )}
      </div>
    ) : null;

  const compactRegistrationLine =
    passport?.registrationClubName || passport?.debutDate ? (
      <>
        {passport.registrationClubName && (
          <>
            <span className="text-white/50">{t("passport.registrationClub")}: </span>
            <span>{passport.registrationClubName}</span>
          </>
        )}
        {passport.registrationClubName && passport.debutDate && (
          <span className="text-white/35"> · </span>
        )}
        {passport.debutDate && (
          <>
            <span className="text-white/50">{t("passport.debutShort")}: </span>
            <span>{formatShortDate(passport.debutDate)}</span>
          </>
        )}
      </>
    ) : null;

  return (
    <div className="space-y-2 lg:space-y-4">
      <div className="hidden items-center justify-between px-0.5 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
          Riviera Player Passport
        </span>
        {passport?.status && (
          <StatusBadge status={passport.status} label={statusLabel} />
        )}
      </div>

      <MobilePassportHeroCard
        photo={player.photo}
        photoAlt={playerName}
        playerName={playerName}
        mobileMetrics={mobileMetrics}
        fuerzaLabel={fuerzaLabel}
        genderLabel={
          player.gender === "Female"
            ? t("genders.femenil")
            : t("genders.varonil")
        }
        passport={passport}
        statusLabel={statusLabel}
        registrationLine={compactRegistrationLine}
      />

      <div className="hidden gap-2 sm:flex lg:hidden">
        <ShareProfileButton
          playerId={player.id}
          playerName={playerName}
          rank={player.rank}
          shareUrl={player.shareProfileUrl}
          canonicalUrl={passport?.canonicalProfileUrl}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setQrOpen(true)}
          className="flex shrink-0 items-center justify-center rounded-lg border border-[#333] bg-[#111] px-3 py-3 text-white"
          aria-label={t("passport.qrTitle")}
        >
          <QrCode size={18} />
        </button>
      </div>

      {/* Desktop passport header */}
      <div className="hidden flex-col items-center text-center lg:flex lg:flex-row lg:items-center lg:gap-8 lg:text-left">
        <div className="flex shrink-0 flex-col items-center">
          <PlayerPhotoFrame src={player.photo} alt={playerName} priority />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:gap-4">
          <div className="w-full">
            <h1 className="break-words text-[32px] font-medium leading-tight text-white">
              {playerName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {fuerzaLabel}
              </span>
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {player.gender === "Female"
                  ? t("genders.femenil")
                  : t("genders.varonil")}
              </span>
            </div>
          </div>

          {passport?.rivieraId && (
            <div className="rounded-[10px] border border-[#1f1f1f] bg-[#111] px-4 py-3 text-left">
              <p className="text-[10px] uppercase tracking-wide text-[#555]">
                {t("passport.rivieraId")}
              </p>
              <div className="mt-1">
                <RivieraIdCopyButton rivieraId={passport.rivieraId} />
              </div>
            </div>
          )}

          {registrationBlock}

          <HeaderStatGrid stats={desktopStats} />

          <ShareProfileButton
            playerId={player.id}
            playerName={playerName}
            rank={player.rank}
            shareUrl={player.shareProfileUrl}
            canonicalUrl={passport?.canonicalProfileUrl}
          />

          {playerHasSocials(player.socials) && (
            <div className="flex items-center gap-4">
              <PlayerSocialIcons
                socials={player.socials}
                size="sm"
                tone="poster"
                className="gap-2"
              />
            </div>
          )}
        </div>
      </div>

      {qrOpen && (
        <PassportQrModal
          url={shareUrl}
          playerName={playerName}
          onClose={() => setQrOpen(false)}
        />
      )}
    </div>
  );
}

export function PlayerPersonalInfo({
  player,
  hideTitle = false,
}: PlayerProfileProps & { hideTitle?: boolean }) {
  const { t } = useTranslation("rankings");

  const hasCountry = Boolean(player.paisCodigo?.trim());

  const personalItems = [
    player.age && {
      key: "age",
      label: t("profile.age"),
      content: (
        <p className="font-medium text-white">
          {player.age} {t("profile.years")}
        </p>
      ),
    },
    player.manoDominante && {
      key: "hand",
      label: t("profile.dominantHand"),
      content: (
        <p className="font-medium text-white">
          {formatLabel(player.manoDominante)}
        </p>
      ),
    },
    player.enCancha && {
      key: "position",
      label: t("profile.courtPosition"),
      content: (
        <p className="font-medium text-white">
          {formatLabel(player.enCancha)}
        </p>
      ),
    },
    hasCountry && {
      key: "country",
      label: t("profile.country"),
      content: (
        <span className="text-2xl leading-none lg:text-3xl" aria-hidden>
          {countryCodeToFlag(player.paisCodigo!)}
        </span>
      ),
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    content: React.ReactNode;
  }>;

  if (personalItems.length === 0) return null;

  return (
    <div className="lg:border-t-0 lg:pt-0">
      {!hideTitle && (
        <h2 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
          {t("profile.personalInfo")}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-5">
        {personalItems.map((item) => (
          <div key={item.key}>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-[#555]">
              {item.label}
            </p>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
