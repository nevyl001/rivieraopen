export type SponsorTier = "gold" | "silver" | "bronze" | "partner";

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website: string;
  tier?: SponsorTier;
  description?: string;
  logoClassName?: string;
}
