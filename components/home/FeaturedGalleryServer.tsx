import { getEventos } from "@/lib/galeriaService";
import { FeaturedGallery } from "./FeaturedGallery";

export async function FeaturedGalleryServer() {
  try {
    const eventos = await getEventos();
    return <FeaturedGallery eventos={eventos} />;
  } catch (error) {
    console.error("FeaturedGalleryServer:", error);
    return <FeaturedGallery eventos={[]} />;
  }
}
