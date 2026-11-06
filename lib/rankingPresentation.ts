import { formatFeaturedRank } from "@/lib/featuredPlayersContrast";

export const RANKING_STOCK_PHOTO = "/img/players/players-1.png";

export function playerDisplayName(player: {
  firstName: string;
  lastName: string;
}): string {
  return [player.firstName, player.lastName].filter(Boolean).join(" ").trim();
}

export function playerInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "RO";
  const first = parts[0]?.[0] ?? "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function officialPortraitSrc(
  photo: string | null | undefined
): string | null {
  const value = photo?.trim();
  if (!value || value === RANKING_STOCK_PHOTO) return null;
  return value;
}

export function instagramHref(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "instagram.com" && !host.endsWith(".instagram.com")) return null;
  return url.toString();
}

export function ranksSharingPosition(
  players: { rank: number }[],
  rank: number
): boolean {
  return players.filter((player) => player.rank === rank).length > 1;
}

export function splitOfficialPodium<T extends { id: string; rank: number }>(
  players: T[]
): { featured: T[]; rest: T[] } {
  const featured = players.filter((player) => player.rank > 0 && player.rank <= 3);
  const featuredIds = new Set(featured.map((player) => player.id));
  return {
    featured,
    rest: players.filter((player) => !featuredIds.has(player.id)),
  };
}

export function isClassicPodium<T extends { rank: number }>(
  featured: T[]
): boolean {
  if (featured.length !== 3) return false;
  const ranks = featured.map((player) => player.rank).sort((a, b) => a - b);
  return ranks[0] === 1 && ranks[1] === 2 && ranks[2] === 3;
}

export function orderClassicPodium<T extends { rank: number }>(
  featured: T[]
): T[] {
  const second = featured.find((player) => player.rank === 2);
  const first = featured.find((player) => player.rank === 1);
  const third = featured.find((player) => player.rank === 3);
  if (!second || !first || !third) return featured;
  return [second, first, third];
}

export function rankingShareFileName(name: string, rank: number): string {
  const slug =
    name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "jugador";
  return `riviera-ranking-${slug}-${formatFeaturedRank(rank)}.png`;
}
