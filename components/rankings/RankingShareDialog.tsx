"use client";

import { useEffect, useId, useState } from "react";
import { Check, Download, Share2, X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import {
  officialPortraitSrc,
  playerDisplayName,
  rankingShareFileName,
} from "@/lib/rankingPresentation";
import {
  RANKING_SHARE_HEIGHT,
  RANKING_SHARE_WIDTH,
  renderRankingShareCard,
  shareRankingImage,
} from "@/lib/rankingShareCard";
import type { Player } from "@/lib/types";

interface RankingShareDialogProps {
  player: Player | null;
  genderLabel: string;
  onClose: () => void;
}

function cssFamily(name: string): string {
  if (typeof document === "undefined") return "sans-serif";
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw.replace(/^["']|["']$/g, "") || "sans-serif";
}

export function RankingShareDialog({
  player,
  genderLabel,
  onClose,
}: RankingShareDialogProps) {
  const { t, formatNumber } = useTranslation("rankings");
  const titleId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canShareFile, setCanShareFile] = useState(false);
  const [shareNote, setShareNote] = useState(false);

  useEffect(() => {
    if (!player) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, player]);

  useEffect(() => {
    if (!player) return;
    let cancelled = false;
    const created = { url: "" };

    async function build() {
      if (!player) return;
      setPreviewUrl(null);
      setFile(null);
      setError(false);
      setCopied(false);
      setShareNote(false);
      setCanShareFile(false);

      const path = buildPlayerProfilePath(player.id, player.rivieraId);
      const url = `${window.location.origin}${path}`;
      setProfileUrl(url);
      const name = playerDisplayName(player);

      try {
        const root = document.querySelector("[data-ranking-root]");
        const source = root instanceof HTMLElement ? root : document.documentElement;
        const displayFont =
          getComputedStyle(source).getPropertyValue("--font-fp-display").trim() ||
          cssFamily("--font-fp-display");
        const textFont =
          getComputedStyle(source).getPropertyValue("--font-fp-sans").trim() ||
          cssFamily("--font-fp-sans");

        const blob = await renderRankingShareCard({
          name,
          rank: player.rank,
          pointsLabel: formatNumber(player.points),
          categoryLabel: t(getCategoryTranslationKey(player.category)),
          genderLabel,
          rivieraId: player.rivieraId?.trim() || null,
          photoUrl: officialPortraitSrc(player.photo),
          displayFont,
          textFont,
        });
        if (cancelled) return;

        created.url = URL.createObjectURL(blob);
        const nextFile = new File([blob], rankingShareFileName(name, player.rank), {
          type: "image/png",
        });
        setPreviewUrl(created.url);
        setFile(nextFile);
        setCanShareFile(
          typeof navigator.canShare === "function" &&
            navigator.canShare({ files: [nextFile] })
        );
      } catch (err) {
        console.error("RankingShareDialog:", err);
        if (!cancelled) setError(true);
      }
    }

    void build();
    return () => {
      cancelled = true;
      if (created.url) URL.revokeObjectURL(created.url);
    };
  }, [formatNumber, genderLabel, player, t]);

  if (!player) return null;

  const download = () => {
    if (!previewUrl || !file) return;
    const anchor = document.createElement("a");
    anchor.href = previewUrl;
    anchor.download = file.name;
    anchor.click();
  };

  const share = async () => {
    if (!file) return;
    const result = await shareRankingImage(file, profileUrl);
    if (result === "unavailable") setShareNote(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt(t("share.copyLink"), profileUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#101010]/50 p-3 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E7E7E7] bg-white p-4 shadow-none md:p-5"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="font-[family-name:var(--font-fp-sans)] text-base font-semibold text-[#101010]"
          >
            {t("share.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("share.close")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#101010] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl bg-[#101010]">
          {previewUrl ? (
            // The preview is a generated PNG, not a content image from the CMS.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt=""
              width={RANKING_SHARE_WIDTH}
              height={RANKING_SHARE_HEIGHT}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center px-6 text-center font-[family-name:var(--font-fp-sans)] text-sm text-[#A3A3A3]">
              {error ? t("share.failed") : t("share.preparing")}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={download}
            disabled={!file}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#101010] px-4 font-[family-name:var(--font-fp-sans)] text-sm font-medium text-white transition-colors duration-150 hover:bg-[#1A1A1A] disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
          >
            <Download size={16} aria-hidden />
            {t("share.download")}
          </button>
          {canShareFile && (
            <button
              type="button"
              onClick={() => void share()}
              className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#E7E7E7] px-4 font-[family-name:var(--font-fp-sans)] text-sm font-medium text-[#101010] transition-colors duration-150 hover:bg-[#F7F7F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
            >
              <Share2 size={16} aria-hidden />
              {t("share.shareFile")}
            </button>
          )}
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#E7E7E7] px-4 font-[family-name:var(--font-fp-sans)] text-sm font-medium text-[#101010] transition-colors duration-150 hover:bg-[#F7F7F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
          >
            {copied ? <Check size={16} aria-hidden /> : null}
            {copied ? t("share.copied") : t("share.copyLink")}
          </button>
        </div>
        {(!canShareFile || shareNote) && (
          <p className="mt-3 font-[family-name:var(--font-fp-sans)] text-xs leading-relaxed text-[#737373]">
            {t("share.unavailable")}
          </p>
        )}
      </div>
    </div>
  );
}
