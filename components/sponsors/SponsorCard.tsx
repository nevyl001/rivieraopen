import { Card, Badge } from "@/components/ui";
import { Sponsor } from "@/lib/types";
import { ExternalLink } from "lucide-react";

interface SponsorCardProps {
  sponsor: Sponsor;
}

export function SponsorCard({ sponsor }: SponsorCardProps) {
  const getTierVariant = (tier?: Sponsor["tier"]) => {
    switch (tier) {
      case "gold":
        return "warning";
      case "silver":
        return "default";
      case "bronze":
        return "default";
      case "partner":
        return "success";
      default:
        return "default";
    }
  };

  const getTierLabel = (tier?: Sponsor["tier"]) => {
    if (!tier) return null;
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card
        hover
        className="h-full flex flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:scale-105"
      >
        {/* Tier Badge */}
        {sponsor.tier && (
          <div className="mb-4">
            <Badge variant={getTierVariant(sponsor.tier)}>
              {getTierLabel(sponsor.tier)}
            </Badge>
          </div>
        )}

        {/* Logo Placeholder */}
        <div className="w-full aspect-video bg-linear-to-br from-primary to-primary-light rounded-lg flex items-center justify-center mb-4">
          <span className="text-accent text-4xl font-heading font-bold">
            {sponsor.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 3)}
          </span>
        </div>

        {/* Sponsor Name */}
        <h3 className="font-heading text-xl font-semibold text-primary mb-2">
          {sponsor.name}
        </h3>

        {/* Description */}
        {sponsor.description && (
          <p className="text-sm text-text-secondary mb-4 line-clamp-2">
            {sponsor.description}
          </p>
        )}

        {/* External Link Icon */}
        <div className="flex items-center gap-2 text-accent text-sm font-medium">
          <span>Visit Website</span>
          <ExternalLink size={16} />
        </div>
      </Card>
    </a>
  );
}
