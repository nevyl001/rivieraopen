import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { GalleryPageClient } from "./GalleryPageClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery - Riviera Open",
  description:
    "Browse photos from Riviera Open padel tournaments and events. Relive the best moments.",
  keywords: [
    "padel gallery",
    "tournament photos",
    "riviera open",
    "padel events",
  ],
  openGraph: {
    title: "Gallery - Riviera Open",
    description:
      "Browse photos from Riviera Open padel tournaments and events. Relive the best moments.",
  },
};

export default async function GalleryPage() {
  // Fetch tournaments on the server
  const tournamentRepository =
    await RepositoryFactory.getTournamentRepository();
  const tournaments = await tournamentRepository.getAll();

  return <GalleryPageClient tournaments={tournaments} />;
}
