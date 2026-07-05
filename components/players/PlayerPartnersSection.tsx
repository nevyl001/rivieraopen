"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerPartnerStat } from "@/lib/types/playerPassport";

interface PlayerPartnersSectionProps {
  partners: PlayerPartnerStat[];
}

export function PlayerPartnersSection({ partners }: PlayerPartnersSectionProps) {
  const { t } = useTranslation("rankings");

  if (!partners.length) return null;

  return (
    <div className="border-t border-[#222] pt-4 lg:pt-6">
      <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("passport.partnersTitle")}
      </h2>
      <p className="mb-3 text-xs text-[#444] lg:mb-4">
        {t("passport.partnersSubtitle")}
      </p>

      <div className="space-y-2">
        {partners.map((partner) => (
          <div
            key={partner.nombre}
            className="flex w-full flex-col gap-2 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-3 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-4"
          >
            <div className="min-w-0 flex-1">
              <p className="break-words font-medium text-white">{partner.nombre}</p>
              <p className="text-xs text-[#666]">
                {t("passport.partnerMatches", {
                  count: String(partner.matchesTogether),
                })}
              </p>
            </div>
            <span className="self-start rounded-full bg-[#0a0a0a] px-2.5 py-1 text-xs tabular-nums text-[#aaa] sm:self-auto">
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
