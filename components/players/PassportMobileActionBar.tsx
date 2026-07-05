"use client";

import { useCallback, useState } from "react";
import { Check, Copy, QrCode, Share2 } from "lucide-react";
import type { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PassportQrModal } from "@/components/players/PassportQrModal";

interface PassportMobileActionBarProps {
  player: PlayerProfileDetail;
}

function shouldUseNativeShare(): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.share !== "function") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua);
}

export function PassportMobileActionBar({ player }: PassportMobileActionBarProps) {
  const { t } = useTranslation("rankings");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const rivieraId = player.passport?.rivieraId ?? null;
  const shareUrl =
    player.shareProfileUrl ??
    (typeof window !== "undefined"
      ? `${window.location.origin}/players/${player.id}`
      : `/players/${player.id}`);

  const copyText = useCallback(async (text: string, kind: "id" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === "id") {
        setCopiedId(true);
        window.setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedLink(true);
        window.setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      window.prompt(t("profile.shareFallback"), text);
    }
  }, [t]);

  const handleShare = useCallback(async () => {
    if (shouldUseNativeShare()) {
      try {
        await navigator.share({
          title: `Riviera Open — ${playerName}`,
          text: t("profile.shareText", {
            name: playerName,
            rank: player.rank ? `#${player.rank}` : "—",
          }),
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    await copyText(shareUrl, "link");
  }, [copyText, player.rank, playerName, shareUrl, t]);

  if (!rivieraId && !shareUrl) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#222] bg-[#0a0a0a]/95 px-3 py-2.5 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2">
          {rivieraId && (
            <button
              type="button"
              onClick={() => copyText(rivieraId, "id")}
              className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#333] bg-[#111] px-2 py-2.5 text-xs font-medium text-white"
            >
              {copiedId ? (
                <Check size={15} className="shrink-0 text-emerald-400" />
              ) : (
                <Copy size={15} className="shrink-0" />
              )}
              <span className="truncate">
                {copiedId ? t("passport.idCopied") : t("passport.copyId")}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#333] bg-[#111] px-2 py-2.5 text-xs font-medium text-white"
          >
            {copiedLink ? (
              <Check size={15} className="shrink-0 text-emerald-400" />
            ) : (
              <Share2 size={15} className="shrink-0" />
            )}
            <span>{copiedLink ? t("profile.linkCopied") : t("passport.share")}</span>
          </button>
          <button
            type="button"
            onClick={() => setQrOpen(true)}
            className="flex shrink-0 items-center justify-center rounded-lg border border-[#333] bg-[#111] p-2.5 text-white"
            aria-label={t("passport.qrTitle")}
          >
            <QrCode size={18} />
          </button>
        </div>
      </div>

      {qrOpen && (
        <PassportQrModal
          url={shareUrl}
          playerName={playerName}
          onClose={() => setQrOpen(false)}
        />
      )}
    </>
  );
}
