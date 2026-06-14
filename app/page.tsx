import { Hero } from "@/components/home/Hero";
import { UpcomingTournamentsServer } from "@/components/home/UpcomingTournamentsServer";
import { FeaturedPlayersServer } from "@/components/home/FeaturedPlayersServer";
import { FeaturedGalleryServer } from "@/components/home/FeaturedGalleryServer";
import { FeaturedSponsors } from "@/components/home/FeaturedSponsors";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <UpcomingTournamentsServer />
      <FeaturedPlayersServer />
      <FeaturedGalleryServer />
      <FeaturedSponsors />
    </>
  );
}
