import { Hero } from "@/components/home/Hero";
import { UpcomingTournamentsServer } from "@/components/home/UpcomingTournamentsServer";
import { FeaturedPlayersServer } from "@/components/home/FeaturedPlayersServer";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { FeaturedSponsors } from "@/components/home/FeaturedSponsors";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <UpcomingTournamentsServer />
      <FeaturedPlayersServer />
      <FeaturedGallery />
      <FeaturedSponsors />
    </>
  );
}
