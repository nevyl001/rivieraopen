import type { Metadata } from "next";
import { Inter, Stack_Sans_Headline } from "next/font/google";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const stackSansHeadline = Stack_Sans_Headline({
  variable: "--font-stack-sans-headline",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://www.rivieraopen.com";
const SITE_TITLE = "Riviera Open — Juega como élite. Construye tu historia.";
const SITE_DESCRIPTION =
  "Cada partido suma a tu ranking, tu historial y tu progreso dentro de un circuito de pádel conectado por tecnología propia. Resultados, estadísticas y evolución en tiempo real.";
const TWITTER_DESCRIPTION =
  "Cada partido suma a tu ranking, tu historial y tu progreso dentro de un circuito de pádel conectado por tecnología propia.";
/** Place the final 1200×630 asset at public/og-riviera-open.jpg */
const OG_IMAGE_PATH = "/og-riviera-open.jpg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Riviera Open",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "pádel",
    "circuito",
    "Ciudad de México",
    "CDMX",
    "México",
    "torneos",
    "rankings",
    "historial",
    "estadísticas",
    "competición",
    "deporte",
    "riviera open",
    "torneos pádel",
  ],
  authors: [{ name: "Riviera Open" }],
  creator: "Riviera Open",
  publisher: "Riviera Open",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Riviera Open",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Riviera Open — Juega como élite. Construye tu historia.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: TWITTER_DESCRIPTION,
    images: [OG_IMAGE_PATH],
    creator: "@rivieraopen",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${stackSansHeadline.variable} antialiased`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
