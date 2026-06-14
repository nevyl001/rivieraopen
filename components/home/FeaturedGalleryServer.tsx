import { getFeaturedGalleryPhotos } from "@/lib/galeriaService";
import { FeaturedGallery } from "./FeaturedGallery";

export async function FeaturedGalleryServer() {
  try {
    const photos = await getFeaturedGalleryPhotos(3);
    return <FeaturedGallery photos={photos} />;
  } catch (error) {
    console.error("FeaturedGalleryServer:", error);
    return <FeaturedGallery photos={[]} />;
  }
}
