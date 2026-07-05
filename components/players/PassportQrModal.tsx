"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PassportQrModalProps {
  url: string;
  playerName: string;
  onClose: () => void;
}

export function PassportQrModal({
  url,
  playerName,
  onClose,
}: PassportQrModalProps) {
  const { t } = useTranslation("rankings");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(url)}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#333] bg-[#111] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t("passport.qrTitle")}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#555]">
              {t("passport.qrTitle")}
            </p>
            <p className="mt-1 text-sm font-medium text-white">{playerName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            aria-label={t("passport.qrClose")}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-auto flex w-[240px] max-w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={t("passport.qrAlt", { name: playerName })}
            width={240}
            height={240}
            className="h-auto w-full"
          />
        </div>

        <p className="mt-4 break-all text-center text-xs text-[#666]">{url}</p>
      </div>
    </div>
  );
}
