import type { OfficialHistorialEntry } from "@/lib/officialPlayerProfileService";
import type { RatingHistorialEntry } from "@/lib/types/player";
import type {
  PlayerAchievement,
  PlayerCareerSummary,
  PlayerClubParticipation,
  PlayerPartnerStat,
  PassportHistoryEvent,
} from "@/lib/types/playerPassport";
import type { PlayerHistoryEvent } from "@/lib/types/playerHistory";

const DEFAULT_PHOTO = "/img/players/players-1.png";

const EVENT_TYPE_LABELS: Record<string, string> = {
  torneo_express: "Torneo",
  liga: "Liga",
  reta: "Reta",
  americano: "Americano",
  duelo: "Duelo",
  duelo_2v2: "Duelo 2 vs 2",
  "2vs2": "Duelo 2 vs 2",
};

function isDueloType(tipo: string): boolean {
  return tipo === "duelo" || tipo === "duelo_2v2" || tipo === "2vs2";
}

function countByType(events: PlayerHistoryEvent[], type: string): number {
  return events.filter((event) => event.tipoEvento === type).length;
}

function countDuelos(events: PlayerHistoryEvent[]): number {
  return events.filter((event) => isDueloType(event.tipoEvento)).length;
}

function compareEventDates(a: PlayerHistoryEvent, b: PlayerHistoryEvent): number {
  const dateA = a.fecha ?? "";
  const dateB = b.fecha ?? "";
  return dateB.localeCompare(dateA);
}

function extractPartnersFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): string[] {
  if (!metadata) return [];
  const partners: string[] = [];
  const rawPartner = metadata.pareja_con ?? metadata.companero ?? metadata.partner;
  if (typeof rawPartner === "string" && rawPartner.trim()) {
    partners.push(rawPartner.trim());
  }
  if (Array.isArray(metadata.companeros)) {
    for (const item of metadata.companeros) {
      if (typeof item === "string" && item.trim()) partners.push(item.trim());
    }
  }
  return partners;
}

function extractPartnersFromDueloMetadata(
  metadata: Record<string, unknown> | null | undefined,
  playerName: string
): string[] {
  if (!metadata) return [];
  const names = [
    metadata.pareja_companero_nombre,
    metadata.companero_nombre,
    metadata.pareja_a_j2_nombre,
    metadata.pareja_b_j2_nombre,
  ]
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .map((value) => value.trim());

  const normalizedPlayer = playerName.trim().toLowerCase();
  return names.filter((name) => name.toLowerCase() !== normalizedPlayer);
}

function buildResultLabel(event: PlayerHistoryEvent): string | null {
  if (event.posicionFinal === 1) return "Campeón";
  if (event.posicionFinal === 2) return "Subcampeón";
  if (event.posicionFinal === 3) return "Tercer lugar";

  const wins = event.partidosGanados ?? 0;
  const losses = event.partidosPerdidos ?? 0;
  const draws = event.partidosEmpatados ?? 0;
  const total = wins + losses + draws;

  if (total > 0) {
    return `${wins}G · ${losses}P${draws > 0 ? ` · ${draws}E` : ""}`;
  }

  if (event.partidos.length === 1) {
    const partido = event.partidos[0];
    if (partido.isDraw) return "Empate";
    if (partido.score !== "—") return partido.won ? "Victoria" : "Derrota";
  }

  return null;
}

function findRatingChangeForEvent(
  eventDate: string | null,
  ratingHistorial: RatingHistorialEntry[]
): { delta: number | null; after: number | null } {
  if (!eventDate?.trim() || !ratingHistorial.length) {
    return { delta: null, after: null };
  }

  const day = eventDate.slice(0, 10);
  const match = ratingHistorial.find(
    (entry) => entry.fecha.slice(0, 10) === day
  );
  if (!match) return { delta: null, after: null };
  return { delta: match.delta, after: match.rating_despues };
}

export function computeClubParticipation(
  events: PlayerHistoryEvent[],
  registrationClubName: string | null
): PlayerClubParticipation[] {
  const counts = new Map<string, number>();

  for (const event of events) {
    const club = event.sourceClubName?.trim();
    if (!club) continue;
    counts.set(club, (counts.get(club) ?? 0) + 1);
  }

  if (registrationClubName?.trim() && !counts.has(registrationClubName.trim())) {
    counts.set(registrationClubName.trim(), 0);
  }

  return [...counts.entries()]
    .map(([clubName, eventCount]) => ({ clubName, eventCount }))
    .sort((a, b) => b.eventCount - a.eventCount || a.clubName.localeCompare(b.clubName));
}

export function computeCareerSummary(
  events: PlayerHistoryEvent[],
  registrationClubName: string | null
): PlayerCareerSummary {
  const participatedClubs = computeClubParticipation(events, registrationClubName);

  return {
    registrationClubName,
    participatedClubs,
    totalClubs: participatedClubs.filter((club) => club.eventCount > 0).length,
    totalEvents: events.length,
    totalTorneos: countByType(events, "torneo_express"),
    totalRetas: countByType(events, "reta"),
    totalLigas: countByType(events, "liga"),
    totalAmericanos: countByType(events, "americano"),
    totalDuelos: countDuelos(events),
  };
}

export function computePartnerStats(
  events: PlayerHistoryEvent[],
  historial: OfficialHistorialEntry[],
  playerName: string
): PlayerPartnerStat[] {
  const entryById = new Map(
    historial.map((entry) => [entry.participacion_id, entry])
  );
  const stats = new Map<
    string,
    { matches: number; wins: number; losses: number }
  >();

  for (const event of events) {
    const entry = entryById.get(event.id);
    const metadata = (entry?.metadata ?? {}) as Record<string, unknown>;
    const partners = [
      ...extractPartnersFromMetadata(metadata),
      ...extractPartnersFromDueloMetadata(metadata, playerName),
    ];

    if (!partners.length) continue;

    const wins = event.partidosGanados ?? 0;
    const losses = event.partidosPerdidos ?? 0;
    const played = wins + losses + (event.partidosEmpatados ?? 0);
    const eventWon = played > 0 ? wins > losses : event.posicionFinal === 1;

    for (const partner of partners) {
      const key = partner.toLowerCase();
      const current = stats.get(key) ?? { matches: 0, wins: 0, losses: 0 };
      current.matches += 1;
      if (eventWon) current.wins += 1;
      else if (losses > wins) current.losses += 1;
      stats.set(key, current);
    }
  }

  return [...stats.entries()]
    .map(([key, value]) => ({
      id: null,
      nombre: historial
        .flatMap((entry) => extractPartnersFromMetadata(entry.metadata as Record<string, unknown>))
        .find((name) => name.toLowerCase() === key) ?? key,
      foto: null,
      matchesTogether: value.matches,
      winsTogether: value.wins,
      lossesTogether: value.losses,
    }))
    .sort(
      (a, b) =>
        b.matchesTogether - a.matchesTogether ||
        a.nombre.localeCompare(b.nombre)
    )
    .slice(0, 12);
}

export function computeAchievements(
  events: PlayerHistoryEvent[],
  totalMatches: number,
  totalPoints: number,
  totalClubs: number
): PlayerAchievement[] {
  const sortedAsc = [...events].sort(
    (a, b) => (a.fecha ?? "").localeCompare(b.fecha ?? "")
  );
  const achievements: PlayerAchievement[] = [];

  const firstTorneo = sortedAsc.find((e) => e.tipoEvento === "torneo_express");
  if (firstTorneo) {
    achievements.push({
      id: "first-tournament",
      labelKey: "passport.achievements.firstTournament",
      date: firstTorneo.fecha,
      context: firstTorneo.nombre,
    });
  }

  const firstWin = sortedAsc.find((event) => {
    if (event.posicionFinal === 1) return true;
    const wins = event.partidosGanados ?? 0;
    const losses = event.partidosPerdidos ?? 0;
    return wins > losses;
  });
  if (firstWin) {
    achievements.push({
      id: "first-win",
      labelKey: "passport.achievements.firstWin",
      date: firstWin.fecha,
      context: firstWin.nombre,
    });
  }

  const champion = sortedAsc.find((e) => e.posicionFinal === 1);
  if (champion) {
    achievements.push({
      id: "tournament-champion",
      labelKey: "passport.achievements.tournamentChampion",
      date: champion.fecha,
      context: champion.nombre,
    });
  }

  const thresholds: Array<{
    id: string;
    labelKey: string;
    check: () => boolean;
  }> = [
    {
      id: "matches-100",
      labelKey: "passport.achievements.matches100",
      check: () => totalMatches >= 100,
    },
    {
      id: "matches-250",
      labelKey: "passport.achievements.matches250",
      check: () => totalMatches >= 250,
    },
    {
      id: "points-500",
      labelKey: "passport.achievements.points500",
      check: () => totalPoints >= 500,
    },
    {
      id: "points-1000",
      labelKey: "passport.achievements.points1000",
      check: () => totalPoints >= 1000,
    },
    {
      id: "clubs-5",
      labelKey: "passport.achievements.clubs5",
      check: () => totalClubs >= 5,
    },
    {
      id: "tournaments-10",
      labelKey: "passport.achievements.tournaments10",
      check: () =>
        events.filter((e) => e.tipoEvento === "torneo_express").length >= 10,
    },
  ];

  for (const threshold of thresholds) {
    if (threshold.check()) {
      achievements.push({
        id: threshold.id,
        labelKey: threshold.labelKey,
        date: null,
      });
    }
  }

  return achievements;
}

export function enrichHistoryEventsForPassport(
  events: PlayerHistoryEvent[],
  historial: OfficialHistorialEntry[],
  organizerNames: Map<string, string>,
  ratingHistorial: RatingHistorialEntry[],
  playerName: string
): PassportHistoryEvent[] {
  const entryById = new Map(
    historial.map((entry) => [entry.participacion_id, entry])
  );

  const enriched = events.map((event) => {
    const entry = entryById.get(event.id);
    const metadata = (entry?.metadata ?? {}) as Record<string, unknown>;
    const organizerId =
      typeof metadata.organizador_id === "string"
        ? metadata.organizador_id
        : null;
    const organizerName =
      (organizerId ? organizerNames.get(organizerId) : null) ??
      event.sourceClubName ??
      null;

    const partners = [
      ...extractPartnersFromMetadata(metadata),
      ...extractPartnersFromDueloMetadata(metadata, playerName),
    ];

    const rivals = event.partidos
      .map((partido) => partido.opponentLabel)
      .filter((label) => label.trim() && label !== "Rival");

    const rating = findRatingChangeForEvent(event.fecha, ratingHistorial);

    return {
      ...event,
      organizerName,
      partners: [...new Set(partners)],
      rivals: [...new Set(rivals)],
      ratingChange: rating.delta,
      ratingAfter: rating.after,
      resultLabel: buildResultLabel(event),
    };
  });

  return enriched.sort(compareEventDates);
}

export function resolvePartnerPhoto(_partner: PlayerPartnerStat): string {
  return _partner.foto?.trim() || DEFAULT_PHOTO;
}

export function eventTypeLabel(tipo: string): string {
  return EVENT_TYPE_LABELS[tipo] ?? tipo.replace(/_/g, " ");
}
