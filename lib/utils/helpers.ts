import { Player, Tournament } from "@/lib/types";

/**
 * Sort players by points in descending order
 * @param players - Array of players
 * @returns Sorted array of players
 */
export function sortPlayersByPoints(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.points - a.points);
}

/**
 * Sort players by rank in ascending order
 * @param players - Array of players
 * @returns Sorted array of players
 */
export function sortPlayersByRank(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.rank - b.rank);
}

/**
 * Sort tournaments by date
 * @param tournaments - Array of tournaments
 * @param order - Sort order: 'asc' or 'desc'
 * @returns Sorted array of tournaments
 */
export function sortTournamentsByDate(
  tournaments: Tournament[],
  order: "asc" | "desc" = "desc"
): Tournament[] {
  return [...tournaments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter players by category
 * @param players - Array of players
 * @param category - Category to filter by
 * @returns Filtered array of players
 */
export function filterPlayersByCategory(
  players: Player[],
  category: Player["category"]
): Player[] {
  return players.filter((player) => player.category === category);
}

/**
 * Filter tournaments by status
 * @param tournaments - Array of tournaments
 * @param status - Status to filter by
 * @returns Filtered array of tournaments
 */
export function filterTournamentsByStatus(
  tournaments: Tournament[],
  status: Tournament["status"]
): Tournament[] {
  return tournaments.filter((tournament) => tournament.status === status);
}

/**
 * Get top N players from a list
 * @param players - Array of players
 * @param count - Number of players to return
 * @returns Top N players
 */
export function getTopPlayers(players: Player[], count: number): Player[] {
  return sortPlayersByPoints(players).slice(0, count);
}

/**
 * Get upcoming tournaments
 * @param tournaments - Array of tournaments
 * @param count - Number of tournaments to return (optional)
 * @returns Upcoming tournaments
 */
export function getUpcomingTournaments(
  tournaments: Tournament[],
  count?: number
): Tournament[] {
  const upcoming = filterTournamentsByStatus(tournaments, "upcoming");
  const sorted = sortTournamentsByDate(upcoming, "asc");
  return count ? sorted.slice(0, count) : sorted;
}

/**
 * Calculate win rate for a player
 * @param player - Player object
 * @returns Win rate as a percentage (0-100)
 */
export function calculateWinRate(player: Player): number {
  const totalTournaments = player.tournamentResults.length;
  if (totalTournaments === 0) return 0;

  const wins = player.tournamentResults.filter((r) => r.placement === 1).length;
  return Math.round((wins / totalTournaments) * 100);
}
