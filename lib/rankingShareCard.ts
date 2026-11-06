import { formatFeaturedRank } from "@/lib/featuredPlayersContrast";
import { playerInitials } from "@/lib/rankingPresentation";

export const RANKING_SHARE_WIDTH = 1080;
export const RANKING_SHARE_HEIGHT = 1350;

export interface RankingShareCardInput {
  name: string;
  rank: number;
  pointsLabel: string;
  categoryLabel: string;
  genderLabel: string;
  rivieraId: string | null;
  photoUrl: string | null;
  displayFont: string;
  textFont: string;
}

function primaryFontFamily(value: string): string {
  const first = value.split(",")[0]?.trim().replace(/['"]/g, "") ?? "";
  return first || "sans-serif";
}

function loadImage(src: string, sameOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    if (!sameOrigin) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

function optimizedSrc(src: string): string {
  const params = new URLSearchParams({ url: src, w: "1200", q: "85" });
  return `/_next/image?${params.toString()}`;
}

async function loadDrawable(src: string): Promise<HTMLImageElement | null> {
  const local = src.startsWith("/") && !src.startsWith("//");
  const candidates = local ? [src] : [optimizedSrc(src), src];
  for (const [index, candidate] of candidates.entries()) {
    try {
      return await loadImage(candidate, local || index === 0);
    } catch {
      continue;
    }
  }
  return null;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.width, height / image.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.width - sourceWidth) / 2;
  const sourceY = Math.max(0, (image.height - sourceHeight) * 0.12);
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height
  );
}

function wrapLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    } else {
      current = next;
    }
  }

  if (current && lines.length < maxLines) lines.push(current);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

export async function renderRankingShareCard(
  input: RankingShareCardInput
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = RANKING_SHARE_WIDTH;
  canvas.height = RANKING_SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  const display = primaryFontFamily(input.displayFont);
  const text = primaryFontFamily(input.textFont);
  try {
    await document.fonts.load(`400 160px ${display}`);
    await document.fonts.load(`600 46px ${text}`);
  } catch {
    // The page font is already loaded; canvas falls back to the family string.
  }

  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, RANKING_SHARE_WIDTH, RANKING_SHARE_HEIGHT);

  const logo = await loadDrawable("/img/logo-badge.png");
  if (logo) {
    ctx.drawImage(logo, 72, 64, 72, 72);
  }

  ctx.fillStyle = "#A3A3A3";
  ctx.font = `600 22px ${text}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("RANKING OFICIAL", RANKING_SHARE_WIDTH - 72, 100);

  const photoW = 612;
  const photoH = 816;
  const photoX = (RANKING_SHARE_WIDTH - photoW) / 2;
  const photoY = 168;
  const portrait = input.photoUrl ? await loadDrawable(input.photoUrl) : null;

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 28);
  ctx.clip();
  if (portrait) {
    drawCover(ctx, portrait, photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = "#1A1A1A";
    ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.fillStyle = "#F5F5F5";
    ctx.font = `400 160px ${display}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      playerInitials(input.name),
      photoX + photoW / 2,
      photoY + photoH / 2
    );
  }
  const veil = ctx.createLinearGradient(0, photoY + photoH - 240, 0, photoY + photoH);
  veil.addColorStop(0, "rgba(16,16,16,0)");
  veil.addColorStop(1, "rgba(16,16,16,0.9)");
  ctx.fillStyle = veil;
  ctx.fillRect(photoX, photoY + photoH - 240, photoW, 240);
  ctx.restore();

  ctx.fillStyle = "#F7F7F7";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `400 132px ${display}`;
  ctx.fillText(`#${formatFeaturedRank(input.rank)}`, photoX + 28, photoY + photoH - 36);

  ctx.font = `600 46px ${text}`;
  const nameLines = wrapLine(ctx, input.name.toUpperCase(), 500, 2);
  nameLines.forEach((line, index) => {
    ctx.fillText(line, 72, 1076 + index * 54);
  });

  ctx.fillStyle = "#A3A3A3";
  ctx.font = `500 22px ${text}`;
  const meta = [input.categoryLabel, input.genderLabel]
    .filter(Boolean)
    .join("  ·  ");
  ctx.fillText(meta.toUpperCase(), 72, nameLines.length > 1 ? 1208 : 1154);

  ctx.fillStyle = "#F7F7F7";
  ctx.textAlign = "right";
  ctx.font = `400 84px ${display}`;
  ctx.fillText(input.pointsLabel, RANKING_SHARE_WIDTH - 72, 1096);
  ctx.fillStyle = "#A3A3A3";
  ctx.font = `600 18px ${text}`;
  ctx.fillText("PTS", RANKING_SHARE_WIDTH - 72, 1132);
  ctx.font = `500 22px ${text}`;
  if (input.rivieraId) {
    ctx.fillText(input.rivieraId, RANKING_SHARE_WIDTH - 72, 1224);
  }
  ctx.fillText("rivieraopen.com", RANKING_SHARE_WIDTH - 72, 1268);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), "image/png");
  });
  if (!blob) throw new Error("png");
  return blob;
}

export async function shareRankingImage(file: File, url: string): Promise<"shared" | "aborted" | "unavailable"> {
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") {
    return "unavailable";
  }
  if (!navigator.canShare({ files: [file] })) return "unavailable";

  try {
    await navigator.share({
      files: [file],
      title: "Riviera Open",
      text: file.name,
      url,
    });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "aborted";
    return "unavailable";
  }
}
