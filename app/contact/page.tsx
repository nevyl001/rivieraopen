"use client";

import Link from "next/link";
import { Container } from "@/components/ui";
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  TrendingUp,
  History,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_WHATSAPP_URL,
  CONTACT_WHATSAPP_PARTNERSHIP_URL,
} from "@/lib/constants/contact";

export default function ContactPage() {
  const { t } = useTranslation("contact");

  const benefits = [
    { icon: TrendingUp, label: t("card.benefit1") },
    { icon: History, label: t("card.benefit2") },
    { icon: ShieldCheck, label: t("card.benefit3") },
    { icon: Handshake, label: t("card.benefit4") },
  ];

  const channels = [
    {
      icon: WhatsAppIcon,
      label: t("labels.whatsapp"),
      value: CONTACT_PHONE_DISPLAY,
      href: CONTACT_WHATSAPP_URL,
      external: true,
    },
    {
      icon: Mail,
      label: t("labels.email"),
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
      external: false,
    },
    {
      icon: Phone,
      label: t("labels.phone"),
      value: CONTACT_PHONE_DISPLAY,
      href: `tel:${CONTACT_PHONE_TEL}`,
      external: false,
    },
  ];

  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/rivieraopen" },
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61585620090741",
    },
    { icon: TikTokIcon, label: "TikTok", href: "https://tiktok.com/@rivieraopen" },
  ];

  return (
    <div className="pt-32 pb-20 bg-gray-50">
      <Container>
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>
        </div>

        <div
          className="max-w-[1400px] mx-auto rounded-[32px] bg-[#0B0B0B] shadow-2xl shadow-black/10 p-8 sm:p-12 lg:p-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-14 lg:gap-20">
            {/* Left: the pitch */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50 mb-5">
                {t("card.eyebrow")}
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {t("card.title")}
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
                {t("card.description")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mb-12">
                {benefits.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="border border-white/15 rounded-lg p-2 shrink-0">
                      <Icon size={18} className="text-white/80" strokeWidth={1.5} />
                    </div>
                    <span className="text-white/85 pt-1.5">{label}</span>
                  </div>
                ))}
              </div>

              <a
                href={CONTACT_WHATSAPP_PARTNERSHIP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-100 transition-all duration-300"
              >
                <WhatsAppIcon size={22} />
                {t("card.ctaPrimary")}
              </a>

              <div className="mt-5">
                <Link
                  href="/rankings"
                  className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
                >
                  {t("card.ctaSecondary")}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            {/* Right: channels */}
            <div className="lg:border-l lg:border-white/10 lg:pl-16">
              <h3 className="font-heading text-xl font-semibold text-white mb-6">
                {t("card.channelsTitle")}
              </h3>

              <div className="space-y-5 mb-10">
                {channels.map(({ icon: Icon, label, value, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 group"
                  >
                    <Icon size={20} className="text-white/50 shrink-0" />
                    <span>
                      <span className="block text-xs text-white/50">{label}</span>
                      <span className="text-white/90 group-hover:text-white transition-colors">
                        {value}
                      </span>
                    </span>
                  </a>
                ))}
              </div>

              <div className="border-t border-white/10 pt-8">
                <h3 className="font-heading text-xl font-semibold text-white mb-5">
                  {t("card.followUsTitle")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {socials.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-white/15 rounded-full hover:bg-white hover:text-black text-white/85 transition-colors group"
                    >
                      <Icon size={16} className="group-hover:text-black" />
                      <span className="text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-20 text-center">
          <p className="text-xl md:text-2xl font-heading text-black mb-2">
            {t("banner.line1")}
          </p>
          <p className="text-sm text-gray-500">{t("banner.line2")}</p>
        </div>
      </Container>
    </div>
  );
}
