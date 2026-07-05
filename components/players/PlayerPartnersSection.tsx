"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerPartnerStat } from "@/lib/types/playerPassport";

interface PlayerPartnersSectionProps {
  partners: PlayerPartnerStat[];
  hideTitle?: boolean;
}

export function PlayerPartnersSection({
  partners,
  hideTitle = false,
}: PlayerPartnersSectionProps) {
  const { t } = useTranslation("rankings");

  if (!partners.length) return null;

  return (
    <div>
      {!hideTitle && (
        <>
          <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("passport.partnersTitle")}
          </h2>
          <p className="mb-3 text-xs text-[#444] lg:mb-4">
            {t("passport.partnersSubtitle")}
          </p>
        </>
      )}

      <div className="space-y-1.5 lg:space-y-2">
        {partners.map((partner) => (
          <div
            key={partner.nombre}
            className="flex w-full flex-col gap-1.5 rounded-lg border border-[#1f1f1f] bg-[#111] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between lg:gap-2 lg:rounded-[10px] lg:px-4 lg:py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium text-white lg:text-base">
                {partner.nombre}
              </p>
              <p className="text-[11px] text-[#666] lg:text-xs">
                {t("passport.partnerMatches", {
                  count: String(partner.matchesTogether),
                })}
              </p>
            </div>
            <span className="self-start rounded-full bg-[#0a0a0a] px-2.5 py-0.5 text-[11px] tabular-nums text-[#aaa] sm:self-auto lg:py-1 lg:text-xs">
              {t("passport.partnerRecord", {
                wins: String(partner.winsTogether),
                losses: String(partner.lossesTogether),
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
