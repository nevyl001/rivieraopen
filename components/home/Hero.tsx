"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { useTranslation } from "@/lib/hooks/useTranslation";

export function Hero() {
  const { t } = useTranslation("home");

  return (
    <section className="relative top-0 h-[700px] md:h-[800px] flex items-center justify-center overflow-hidden pt-20 pb-20 md:pt-0 md:pb-0">
      <div className="absolute inset-0">
        <Image
          src="/img/header-bg-mobile.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-center md:hidden"
        />
        <Image
          src="/img/header-bg.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="hidden object-cover object-center md:block"
        />
      </div>

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <Logo
            variant="badge"
            width={200}
            height={200}
            className="mx-auto h-[180px] w-[180px] md:h-[200px] md:w-[200px] object-contain"
            priority
          />
        </div>

        <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
          {t("hero.title")}
        </h1>

        <p className="text-lg md:text-2xl text-white/90 mb-3 md:mb-4 font-light">
          {t("hero.subtitle")}
        </p>

        <p className="text-base md:text-xl text-white/80 mb-6 md:mb-10 max-w-2xl mx-auto">
          {t("hero.description")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4 md:mt-6">
          <Link href="/rankings">
            <Button
              variant="primary"
              className="w-full sm:w-auto min-w-[200px]"
            >
              {t("hero.cta.viewRankings")}
            </Button>
          </Link>
          <Link href="/tournaments">
            <Button
              variant="secondary"
              className="w-full sm:w-auto min-w-[200px]"
            >
              {t("hero.cta.upcomingTournaments")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
