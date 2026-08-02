/**
 * Rate limit persistence tests.
 *
 * Same class of bug as sessions: the in-memory RateLimitStore only works
 * within a single long-lived process. On serverless, two "instances" with
 * separate stores can't see each other's counters (limit effectively
 * resets per instance); a shared store enforces the limit correctly
 * across instances.
 */

import { describe, it, expect } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { InMemoryRateLimitStore } from "../rateLimitStore";
import { SupabaseRateLimitStore } from "../supabaseRateLimitStore";

const CONFIG = { windowMs: 60 * 60 * 1000, maxRequests: 3 };

describe("Rate limit persistence", () => {
  it("separate stores (pre-fix shape) do not share counters across instances", async () => {
    const storeA = new InMemoryRateLimitStore();
    const storeB = new InMemoryRateLimitStore();

    for (let i = 0; i < CONFIG.maxRequests; i++) {
      expect((await storeA.increment("session-1", CONFIG)).allowed).toBe(true);
    }
    // storeB never saw those requests, so it happily allows more even
    // though the logical limit for this identifier was already reached.
    expect((await storeB.increment("session-1", CONFIG)).allowed).toBe(true);
  });

  it("a shared store enforces the limit consistently across instances", async () => {
    const shared = new InMemoryRateLimitStore();

    for (let i = 0; i < CONFIG.maxRequests; i++) {
      expect((await shared.increment("session-1", CONFIG)).allowed).toBe(true);
    }
    // The (maxRequests + 1)-th request, routed through what represents a
    // different instance sharing the same store, must be rejected.
    const result = await shared.increment("session-1", CONFIG);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("reset() clears the counter for an identifier", async () => {
    const store = new InMemoryRateLimitStore();
    await store.increment("session-1", CONFIG);
    await store.reset("session-1");

    const result = await store.increment("session-1", CONFIG);
    expect(result.remaining).toBe(CONFIG.maxRequests - 1);
  });
});

describe("SupabaseRateLimitStore", () => {
  function mockSupabaseClient(existingRow: unknown = null) {
    const maybeSingle = jest
      .fn()
      .mockResolvedValue({ data: existingRow, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const upsert = jest.fn().mockResolvedValue({ data: null, error: null });
    const updateEq = jest.fn().mockResolvedValue({ data: null, error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    const from = jest.fn().mockReturnValue({ select, upsert, update });

    return { from, select, eq, maybeSingle, upsert, update, updateEq } as const;
  }

  it("creates a new counter when no row exists", async () => {
    const client = mockSupabaseClient(null);
    const store = new SupabaseRateLimitStore(client as unknown as SupabaseClient);

    const result = await store.increment("session-1", CONFIG);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(CONFIG.maxRequests - 1);
    expect(client.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: "session-1", count: 1 }),
    );
  });

  it("increments an existing, unexpired counter", async () => {
    const futureResetAt = new Date(Date.now() + 60_000).toISOString();
    const client = mockSupabaseClient({
      identifier: "session-1",
      count: 1,
      reset_at: futureResetAt,
    });
    const store = new SupabaseRateLimitStore(client as unknown as SupabaseClient);

    const result = await store.increment("session-1", CONFIG);

    expect(result.allowed).toBe(true);
    expect(client.update).toHaveBeenCalledWith({ count: 2 });
  });

  it("rejects once the counter reaches maxRequests", async () => {
    const futureResetAt = new Date(Date.now() + 60_000).toISOString();
    const client = mockSupabaseClient({
      identifier: "session-1",
      count: CONFIG.maxRequests,
      reset_at: futureResetAt,
    });
    const store = new SupabaseRateLimitStore(client as unknown as SupabaseClient);

    const result = await store.increment("session-1", CONFIG);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("treats an expired row as a fresh window", async () => {
    const pastResetAt = new Date(Date.now() - 1000).toISOString();
    const client = mockSupabaseClient({
      identifier: "session-1",
      count: CONFIG.maxRequests,
      reset_at: pastResetAt,
    });
    const store = new SupabaseRateLimitStore(client as unknown as SupabaseClient);

    const result = await store.increment("session-1", CONFIG);

    expect(result.allowed).toBe(true);
    expect(client.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: "session-1", count: 1 }),
    );
  });
});
