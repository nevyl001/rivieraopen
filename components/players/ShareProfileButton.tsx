"use client";

import { useCallback, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface ShareProfileButtonProps {
  playerId: string;
  playerName: string;
  rank: number | null;
}

export function ShareProfileButton({
  playerId,
  playerName,
  rank,
}: ShareProfileButtonProps) {
  const { t } = useTranslation("rankings");
  const [copied, setCopied] = useState(false);

  const rankLabel = rank ? `#${rank}` : "—";

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/players/${playerId}`;
    const text = t("profile.shareText", { name: playerName, rank: rankLabel });

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Riviera Open — ${playerName}`,
          text,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("profile.shareFallback"), url);
    }
  }, [playerId, playerName, rankLabel, t]);

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#1a1a1a] sm:w-auto sm:self-start"
    >
      {copied ? (
        <>
          <Check size={18} className="shrink-0 text-emerald-400" />
          {t("profile.linkCopied")}
        </>
      ) : (
        <>
          <Share2 size={18} className="shrink-0" />
          {t("profile.shareProfile")}
        </>
      )}
    </button>
  );
}
