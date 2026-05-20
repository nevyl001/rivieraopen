"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { Navigation } from "./Navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Logo } from "@/components/ui/Logo";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation("common");

  // Define white-themed pages that should always have black header
  const whiteThemedPages = [
    "/tournaments",
    "/rankings",
    "/gallery",
    "/contact",
    "/players",
    "/privacy",
    "/terms",
  ];

  // Check if current page should have black header
  const shouldHaveBlackHeader = whiteThemedPages.some((page) =>
    pathname.startsWith(page),
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerStyles =
    shouldHaveBlackHeader || isScrolled || isMobileMenuOpen
      ? "bg-background shadow-md"
      : "bg-transparent";

  const textStyles = "text-white";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerStyles}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Logo className="w-40 h-10 text-white" />
            </Link>

            {/* Desktop Navigation */}
            <div className={`hidden lg:flex items-center gap-8 ${textStyles}`}>
              <Navigation />
            </div>

            {/* Social Icons & Language Toggle - Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://instagram.com/rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className={`${textStyles} transition-colors`}
                aria-label={t("aria.instagram")}
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585620090741"
                target="_blank"
                rel="noopener noreferrer"
                className={`${textStyles} transition-colors`}
                aria-label={t("aria.facebook")}
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://tiktok.com/@rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className={`${textStyles} transition-colors`}
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
              <div className="w-px h-5 bg-white/30 mx-1"></div>
              <LanguageToggle variant="header" />
            </div>

            {/* Mobile Menu Button */}
            <button
              className={`lg:hidden p-2 ${textStyles}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={t("aria.toggleMenu")}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Full Screen */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Full Screen Black Background */}
        <div
          className={`absolute inset-0 bg-black transform transition-transform duration-300 ${
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          {/* Content Container */}
          <div className="pt-24 px-6 h-full flex flex-col">
            {/* Navigation */}
            <div className="flex-1">
              <Navigation
                mobile
                onLinkClick={() => setIsMobileMenuOpen(false)}
              />
            </div>

            {/* Language Toggle - Mobile */}
            <div className="pb-4 flex justify-center">
              <LanguageToggle variant="header" />
            </div>

            {/* Social Icons - Mobile */}
            <div className="flex items-center justify-center gap-6 pb-8">
              <a
                href="https://instagram.com/rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label={t("aria.instagram")}
              >
                <Instagram size={28} />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61585620090741"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label={t("aria.facebook")}
              >
                <Facebook size={28} />
              </a>
              <a
                href="https://tiktok.com/@rivieraopen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={28} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
