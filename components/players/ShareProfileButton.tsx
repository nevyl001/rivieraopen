"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface ShareProfileButtonProps {
  playerId: string;
  playerName: string;
  rank: number | null;
}

function prefersNativeShare(): boolean {
  if (typeof window === "undefined") return false;

  const hasShare = typeof navigator.share === "function";
  const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return hasShare && (isMobileViewport || isCoarsePointer);
}

export function ShareProfileButton({
  playerId,
  playerName,
  rank,
}: ShareProfileButtonProps) {
  const { t } = useTranslation("rankings");
  const [copied, setCopied] = useState(false);
  const [useNativeShare, setUseNativeShare] = useState(false);

  useEffect(() => {
    setUseNativeShare(prefersNativeShare());
  }, []);

  const rankLabel = rank ? `#${rank}` : "—";

  const copyLink = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(t("profile.shareFallback"), url);
    }
  }, [t]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/players/${playerId}`;

    if (!useNativeShare) {
      await copyLink(url);
      return;
    }

    const text = t("profile.shareText", { name: playerName, rank: rankLabel });

    try {
      await navigator.share({
        title: `Riviera Open — ${playerName}`,
        text,
        url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      await copyLink(url);
    }
  }, [copyLink, playerId, playerName, rankLabel, t, useNativeShare]);

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
          {useNativeShare ? (
            <Share2 size={18} className="shrink-0" />
          ) : (
            <Copy size={18} className="shrink-0" />
          )}
          {useNativeShare
            ? t("profile.shareProfile")
            : t("profile.copyProfileLink")}
        </>
      )}
    </button>
  );
}
