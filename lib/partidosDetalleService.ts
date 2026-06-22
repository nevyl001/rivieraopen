import {
  labelRetaRonda,
  labelRetaRondasForPartidos,
  RetaRoundLabelMetadata,
} from "@/lib/retaRoundLabel";
import {
  PartidoDetalle,
  PartidoDetalleResultado,
  ParticipacionMetadataWithDetalle,
} from "@/lib/types/partidosDetalle";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

const CIERRE_SUBTIPOS = new Set([
  "reta_cierre",
  "americano_cierre",
  "liga_jornada",
  "liga_jornada_cierre",
  "duelo_2v2_cierre",
]);

export function hasPartidosDetalle(
  metadata: ParticipacionMetadataWithDetalle | null | undefined
): boolean {
  return (
    Array.isArray(metadata?.partidos_detalle) &&
    metadata.partidos_detalle.length > 0
  );
}

function outcomeFromGames(
  gamesFavor: number,
  gamesContra: number
): PartidoDetalleResultado {
  if (gamesFavor > gamesContra) return "win";
  if (gamesFavor < gamesContra) return "loss";
  return "draw";
}

export function extractPartidosDetalle(
  metadata: ParticipacionMetadataWithDetalle | null | undefined
): PartidoDetalle[] {
  if (!metadata) return [];
  const raw = metadata.partidos_detalle;
  if (!Array.isArray(raw) || !raw.length) return [];

  return raw
    .map((row) => ({
      id: typeof row.id === "string" ? row.id : undefined,
      ronda: Number(row.ronda ?? 0),
      fase: typeof row.fase === "string" ? row.fase.trim() : undefined,
      rival: String(row.rival ?? "Rival").trim() || "Rival",
      games_favor: Number(row.games_favor ?? 0),
      games_contra: Number(row.games_contra ?? 0),
      resultado:
        row.resultado === "win" ||
        row.resultado === "loss" ||
        row.resultado === "draw"
          ? row.resultado
          : outcomeFromGames(
              Number(row.games_favor ?? 0),
              Number(row.games_contra ?? 0)
            ),
      fecha: typeof row.fecha === "string" ? row.fecha : undefined,
    }))
    .filter((row) => row.ronda > 0 || Boolean(row.fase));
}

function resolveRoundLabels(
  rows: PartidoDetalle[],
  metadata: ParticipacionMetadataWithDetalle
): string[] {
  const needsGenerated = rows.some((row) => !row.fase?.trim());
  if (!needsGenerated) {
    return rows.map((row) => row.fase!.trim());
  }

  const generated = labelRetaRondasForPartidos(
    rows.map((row) => ({ ronda: row.ronda, fecha: row.fecha })),
    metadata as RetaRoundLabelMetadata
  );

  return rows.map((row, index) => row.fase?.trim() || generated[index]);
}

export function partidosDetalleToPlayerHistory(
  metadata: ParticipacionMetadataWithDetalle | null | undefined,
  eventDate: string | null
): PlayerHistoryMatch[] {
  const rows = extractPartidosDetalle(metadata);
  if (!rows.length) return [];

  const sorted = [...rows].sort(
    (a, b) =>
      a.ronda - b.ronda ||
      (a.fecha ?? "").localeCompare(b.fecha ?? "") ||
      a.rival.localeCompare(b.rival)
  );

  const labels = resolveRoundLabels(sorted, metadata ?? {});

  return sorted.map((row, index) => ({
    id: row.id ?? `detalle-${row.ronda}-${index}`,
    round: labels[index],
    opponentLabel: row.rival,
    score: `${row.games_favor}-${row.games_contra}`,
    won: row.resultado === "win",
    isDraw: row.resultado === "draw",
    sortDate: row.fecha ?? eventDate ?? "",
  }));
}

export function canUsePartidosDetalle(
  metadata: ParticipacionMetadataWithDetalle | null | undefined
): boolean {
  if (!hasPartidosDetalle(metadata)) return false;
  const subtipo = metadata?.subtipo?.trim();
  if (subtipo && CIERRE_SUBTIPOS.has(subtipo)) return true;
  return hasPartidosDetalle(metadata);
}

/** Etiqueta suelta (p. ej. reta desde matches en vivo). */
export function resolvePartidoFaseLabel(
  ronda: number,
  fase: string | undefined,
  metadata: RetaRoundLabelMetadata
): string {
  if (fase?.trim()) return fase.trim();
  return labelRetaRonda(ronda, metadata);
}
