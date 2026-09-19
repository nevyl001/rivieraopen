"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
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

      <AnimatedSection
        animation="fade-in"
        rootMargin="0px"
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <AnimatedSection animation="slide-up" delay={0} rootMargin="0px">
          <div className="mb-5 md:mb-7">
            <Logo
              variant="badge"
              width={280}
              height={320}
              className="mx-auto h-auto w-[200px] md:w-[240px] lg:w-[280px] object-contain"
              priority
            />
            <h1 className="sr-only">{t("hero.title")}</h1>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="slide-up" delay={200} rootMargin="0px">
          <p className="font-heading text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 md:mb-4 leading-tight">
            {t("hero.subtitle")}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="slide-up" delay={400} rootMargin="0px">
          <p className="text-base md:text-xl text-white/80 mb-6 md:mb-10 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>
        </AnimatedSection>

        <AnimatedSection animation="slide-up" delay={600} rootMargin="0px">
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
        </AnimatedSection>
      </AnimatedSection>
    </section>
  );
}
