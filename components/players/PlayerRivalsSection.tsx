"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayerRival } from "@/lib/types/playerHistory";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerRivalsSectionProps {
  rivals: PlayerRival[];
}

type RivalTab = "all" | "faced" | "pending";

function RivalCard({ rival }: { rival: PlayerRival }) {
  const { t } = useTranslation("rankings");

  const h2hAdvantage = rival.wins > rival.losses;
  const h2hDisadvantage = rival.losses > rival.wins;

  return (
    <Link
      href={`/players/${rival.id}`}
      className="flex items-center gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-4 py-3.5 transition-colors hover:border-[#333] hover:bg-[#151515]"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-[#2a2a2a]">
        <Image
          src={rival.foto}
          alt={rival.nombre}
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{rival.nombre}</p>
        <p className="text-xs text-[#666]">
          #{rival.rank} · {rival.points} pts
        </p>
      </div>

      <div className="shrink-0 text-right">
        {rival.hasFaced ? (
          <div>
            <p className="mb-1 text-[9px] uppercase tracking-wide text-[#555]">
              {t("profile.rivals.h2hLabel")}
            </p>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
                h2hAdvantage
                  ? "bg-[#0d2e20] text-[#1D9E75]"
                  : h2hDisadvantage
                    ? "bg-[#2e1010] text-[#E85D5D]"
                    : "bg-[#1a1a1a] text-[#aaa]"
              }`}
            >
              {t("profile.rivals.h2hScore", {
                wins: String(rival.wins),
                losses: String(rival.losses),
              })}
            </span>
          </div>
        ) : (
          <div>
            <span className="inline-flex rounded-full bg-[#1a1a1a] px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#666]">
              {t("profile.rivals.noDuelYet")}
            </span>
            <p className="mt-1 text-[10px] text-[#444]">
              {t("profile.rivals.nextTournament")}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

export function PlayerRivalsSection({ rivals }: PlayerRivalsSectionProps) {
  const { t } = useTranslation("rankings");
  const [tab, setTab] = useState<RivalTab>("all");

  const faced = useMemo(
    () => rivals.filter((rival) => rival.hasFaced),
    [rivals]
  );
  const pending = useMemo(
    () => rivals.filter((rival) => !rival.hasFaced),
    [rivals]
  );

  const showTabs = rivals.length > 3;

  const visible = useMemo(() => {
    if (!showTabs || tab === "all") return rivals;
    if (tab === "faced") return faced;
    return pending;
  }, [rivals, faced, pending, showTabs, tab]);

  if (!rivals.length) return null;

  return (
    <div className="border-t border-[#222] pt-6">
      <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.rivals.title")}
      </h2>
      <p className="mb-4 text-xs text-[#444]">
        {t("profile.rivals.subtitle")}
      </p>

      {showTabs && (
        <div className="mb-4 flex gap-2">
          {(
            [
              { id: "all", label: t("profile.rivals.tabAll") },
              { id: "faced", label: t("profile.rivals.tabFaced") },
              { id: "pending", label: t("profile.rivals.tabPending") },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === item.id
                  ? "bg-white text-black"
                  : "border border-[#333] text-[#888] hover:border-[#555]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {visible.map((rival) => (
          <RivalCard key={rival.id} rival={rival} />
        ))}
      </div>
    </div>
  );
}
