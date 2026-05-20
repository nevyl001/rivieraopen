import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.rivieraopen.com"),
  title: {
    default: "Riviera Open — Juega como élite.",
    template: "%s | Riviera Open",
  },
  description:
    "Una experiencia de padel exclusiva en CDMX, dentro y fuera de la cancha.",
  keywords: [
    "pádel",
    "circuito",
    "Ciudad de México",
    "CDMX",
    "México",
    "torneos",
    "rankings",
    "competición",
    "deporte",
    "riviera open",
    "torneos pádel",
  ],
  authors: [{ name: "Riviera Open" }],
  creator: "Riviera Open",
  publisher: "Riviera Open",
  openGraph: {
    title: "Riviera Open — Juega como élite.",
    description:
      "Una experiencia de padel exclusiva en CDMX, dentro y fuera de la cancha.",
    url: "https://www.rivieraopen.com",
    siteName: "Riviera Open",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: "https://www.rivieraopen.com/img/meta.jpg",
        width: 1200,
        height: 630,
        alt: "Riviera Open Circuito de Pádel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Riviera Open — Juega como élite.",
    description:
      "Una experiencia de padel exclusiva en CDMX, dentro y fuera de la cancha.",
    images: ["/img/meta.jpg"],
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
