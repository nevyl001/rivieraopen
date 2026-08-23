/**
 * @jest-environment node
 */

import { describe, it, expect } from "@jest/globals";
import { normalizeBracketSlots } from "../expressKnockoutService";

describe("normalizeBracketSlots", () => {
  it("returns legacy array as-is", () => {
    const slots = [{ type: "team", qualifier: { parejaId: "a" } }];
    expect(normalizeBracketSlots(slots)).toEqual(slots);
  });

  it("unwraps v2 envelope { v, slots }", () => {
    const inner = [{ type: "team", qualifier: { parejaId: "b" } }];
    expect(normalizeBracketSlots({ v: 2, slots: inner })).toEqual(inner);
  });

  it("returns empty array for null/undefined/object without slots", () => {
    expect(normalizeBracketSlots(null)).toEqual([]);
    expect(normalizeBracketSlots(undefined)).toEqual([]);
    expect(normalizeBracketSlots({ v: 2 })).toEqual([]);
    expect(normalizeBracketSlots("bad")).toEqual([]);
  });
});
