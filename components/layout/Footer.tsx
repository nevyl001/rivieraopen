"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Footer() {
  const { t } = useTranslation("common");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">
              {t("footer.about.title")}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t("footer.about.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">
              {t("footer.quickLinks.title")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/tournaments"
                  className="text-gray-300 hover:opacity-70 transition-opacity text-sm"
                >
                  {t("navigation.tournaments")}
                </Link>
              </li>
              <li>
                <Link
                  href="/rankings"
                  className="text-gray-300 hover:opacity-70 transition-opacity text-sm"
                >
                  {t("navigation.rankings")}
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-gray-300 hover:opacity-70 transition-opacity text-sm"
                >
                  {t("navigation.gallery")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">
              {t("footer.contact.title")}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <Mail size={16} className="mt-0.5 shrink-0" />
                <a
                  href="mailto:info@rivieraopen.com"
                  className="hover:opacity-70 transition-opacity"
                >
                  info@rivieraopen.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <Phone size={16} className="mt-0.5 shrink-0" />
                <a
                  href="tel:+525519540472"
                  className="hover:opacity-70 transition-opacity"
                >
                  +52 (55) 1954-0472
                </a>
              </li>
              <li className="flex items-start gap-2 text-gray-300 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Ciudad de México, CDMX</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-heading text-xl font-semibold mb-4">
              {t("footer.social.title")}
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              {t("footer.social.description")}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:opacity-70 transition-opacity"
                aria-label={t("aria.instagram")}
              >
                <Instagram size={24} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585620090741"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:opacity-70 transition-opacity"
                aria-label={t("aria.facebook")}
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://tiktok.com/@rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:opacity-70 transition-opacity"
                aria-label="TikTok"
              >
                <TikTokIcon size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-light">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Riviera Open. {t("footer.copyright")}
            </p>
            <div className="flex items-center gap-6">
              <LanguageToggle variant="footer" />
              <Link
                href="/privacy"
                className="text-gray-400 hover:opacity-70 transition-opacity text-sm"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:opacity-70 transition-opacity text-sm"
              >
                {t("footer.termsOfService")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
