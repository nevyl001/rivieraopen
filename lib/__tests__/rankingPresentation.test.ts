import {
  instagramHref,
  isClassicPodium,
  officialPortraitSrc,
  orderClassicPodium,
  playerInitials,
  ranksSharingPosition,
  rankingShareFileName,
  splitOfficialPodium,
} from "@/lib/rankingPresentation";

describe("official ranking presentation", () => {
  const fifth = [
    { id: "nevyl", rank: 1 },
    { id: "cuadra", rank: 2 },
    { id: "josue", rank: 3 },
    { id: "cesar", rank: 4 },
    { id: "edgardo", rank: 5 },
    { id: "paco", rank: 5 },
  ];

  it("keeps the official top positions and does not repeat them in the list", () => {
    const { featured, rest } = splitOfficialPodium(fifth);
    expect(featured.map((player) => player.id)).toEqual([
      "nevyl",
      "cuadra",
      "josue",
    ]);
    expect(rest.map((player) => player.id)).toEqual(["cesar", "edgardo", "paco"]);
  });

  it("keeps every tied player inside the featured positions", () => {
    const tied = [
      { id: "a", rank: 1 },
      { id: "b", rank: 2 },
      { id: "c", rank: 3 },
      { id: "d", rank: 3 },
    ];
    const { featured, rest } = splitOfficialPodium(tied);
    expect(featured.map((player) => player.id)).toEqual(["a", "b", "c", "d"]);
    expect(rest).toEqual([]);
    expect(isClassicPodium(featured)).toBe(false);
    expect(ranksSharingPosition(tied, 3)).toBe(true);
    expect(ranksSharingPosition(tied, 1)).toBe(false);
  });

  it("orders a clean podium as second, first, third", () => {
    const { featured } = splitOfficialPodium(fifth);
    expect(isClassicPodium(featured)).toBe(true);
    expect(orderClassicPodium(featured).map((player) => player.rank)).toEqual([
      2, 1, 3,
    ]);
  });

  it("does not invent a third card when a category has fewer players", () => {
    const { featured, rest } = splitOfficialPodium([
      { id: "one", rank: 1 },
      { id: "two", rank: 2 },
    ]);
    expect(featured).toHaveLength(2);
    expect(rest).toHaveLength(0);
    expect(isClassicPodium(featured)).toBe(false);
  });

  it("treats the stock portrait as a missing photo", () => {
    expect(officialPortraitSrc("/img/players/players-1.png")).toBeNull();
    expect(officialPortraitSrc("  ")).toBeNull();
    expect(officialPortraitSrc("https://cdn.example/player.jpg")).toBe(
      "https://cdn.example/player.jpg"
    );
  });

  it("accepts only a real Instagram link", () => {
    expect(instagramHref("https://instagram.com/riviera")).toBe(
      "https://instagram.com/riviera"
    );
    expect(instagramHref("https://evil.example/instagram")).toBeNull();
    expect(instagramHref("@riviera")).toBeNull();
  });

  it("builds initials and a share filename from the official name", () => {
    expect(playerInitials("Edgardo T")).toBe("ET");
    expect(rankingShareFileName("José Ángel", 12)).toBe(
      "riviera-ranking-jose-angel-12.png"
    );
  });
});
