"use client";

import Link from "next/link";
import { Container, Card } from "@/components/ui";
import { Mail, Phone, Instagram, Facebook } from "lucide-react";
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
    t("card.benefit1"),
    t("card.benefit2"),
    t("card.benefit3"),
    t("card.benefit4"),
  ];

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("hero.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Commercial CTA card - first in DOM order so it's immediately
              visible on mobile without excessive scrolling; visually the
              right column on desktop. */}
          <Card
            className="order-1 lg:order-2 text-white p-8 md:p-12"
            style={{ backgroundColor: "#000000" }}
          >
            <p className="text-xs uppercase tracking-widest text-white/60 mb-4">
              {t("card.eyebrow")}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t("card.title")}
            </h2>
            <p className="text-white/80 text-lg mb-8">{t("card.description")}</p>

            <ul className="space-y-3 mb-10">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <span
                    className="mt-2.5 h-1.5 w-1.5 rounded-full bg-white/60 shrink-0"
                    aria-hidden
                  />
                  <span className="text-white/90">{benefit}</span>
                </li>
              ))}
            </ul>

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
                className="text-sm text-white/70 hover:text-white underline underline-offset-4 transition-colors"
              >
                {t("card.ctaSecondary")}
              </Link>
            </div>
          </Card>

          <div className="order-2 lg:order-1 space-y-6">
            <Card>
              <h2 className="font-heading text-2xl font-semibold text-black mb-6">
                {t("info.getInTouch")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <WhatsAppIcon size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {t("labels.whatsapp")}
                    </p>
                    <a
                      href={CONTACT_WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      {CONTACT_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <Mail size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {t("labels.email")}
                    </p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-accent/10 p-3 rounded-lg shrink-0">
                    <Phone size={24} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-black mb-1">
                      {t("labels.phone")}
                    </p>
                    <a
                      href={`tel:${CONTACT_PHONE_TEL}`}
                      className="text-text-secondary hover:text-accent transition-colors"
                    >
                      {CONTACT_PHONE_DISPLAY}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="font-semibold text-black mb-4">
                  {t("info.followUs")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://instagram.com/rivieraopen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                  >
                    <Instagram
                      size={20}
                      className="text-accent group-hover:text-white"
                    />
                    <span className="text-black group-hover:text-white">
                      Instagram
                    </span>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61585620090741"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                  >
                    <Facebook
                      size={20}
                      className="text-accent group-hover:text-white"
                    />
                    <span className="text-black group-hover:text-white">
                      Facebook
                    </span>
                  </a>
                  <a
                    href="https://tiktok.com/@rivieraopen"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-accent rounded-full transition-colors group"
                  >
                    <TikTokIcon
                      size={20}
                      className="text-accent group-hover:text-white"
                    />
                    <span className="text-black group-hover:text-white">
                      TikTok
                    </span>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-16 md:mt-20 text-center border-t border-gray-200 pt-12">
          <p className="text-xl md:text-2xl font-heading text-black mb-2">
            {t("banner.line1")}
          </p>
          <p className="text-lg text-gray-600">{t("banner.line2")}</p>
        </div>
      </Container>
    </div>
  );
}
