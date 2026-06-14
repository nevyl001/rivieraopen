/**
 * Ranking de competición estándar (1224):
 * jugadores empatados comparten posición; la siguiente salta
 * (ej. tres en 1° → el siguiente es 4°).
 */
export function getCompetitionRankAtIndex<T>(
  sortedItems: T[],
  index: number,
  getPoints: (item: T) => number
): number {
  if (index === 0) return 1;
  const points = getPoints(sortedItems[index]);
  if (points === getPoints(sortedItems[index - 1])) {
    return getCompetitionRankAtIndex(sortedItems, index - 1, getPoints);
  }
  return index + 1;
}

export function findCompetitionRank<T>(
  sortedItems: T[],
  match: (item: T) => boolean,
  getPoints: (item: T) => number
): number {
  const index = sortedItems.findIndex(match);
  if (index < 0) return 0;
  return getCompetitionRankAtIndex(sortedItems, index, getPoints);
}
