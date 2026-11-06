"use client";

import { useState } from "react";
import Image from "next/image";
import { playerInitials } from "@/lib/rankingPresentation";

interface RankingPortraitProps {
  src: string | null;
  name: string;
  className?: string;
  sizes: string;
  priority?: boolean;
  initialsClassName?: string;
  fit?: "cover" | "contain";
}

export function RankingPortrait({
  src,
  name,
  className = "",
  sizes,
  priority = false,
  initialsClassName = "text-3xl",
  fit = "cover",
}: RankingPortraitProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(src) && !failed;

  return (
    <div
      className={`relative overflow-hidden ${
        fit === "contain" ? "bg-transparent" : "bg-[#F1F1F1]"
      } ${className}`}
    >
      {showPhoto ? (
        <Image
          src={src as string}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className={
            fit === "contain"
              ? "object-contain object-center"
              : "object-cover object-[center_18%]"
          }
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#101010] font-[family-name:var(--font-fp-display)] tracking-wide text-[#F7F7F7]">
          <span className={`leading-none ${initialsClassName}`}>
            {playerInitials(name)}
          </span>
        </div>
      )}
    </div>
  );
}
