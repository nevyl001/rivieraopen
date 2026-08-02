/**
 * Session persistence tests.
 *
 * Context: AdminAuthProvider used to store sessions in a process-memory
 * Map. On Vercel, each serverless invocation can land on a different
 * instance with its own memory, so a session created by one invocation
 * (e.g. login) could be invisible to another (e.g. the next admin API
 * call) -> intermittent 401s. AdminAuthProvider now delegates to a
 * pluggable AdminSessionStore; these tests prove:
 *   1. Login creates a session.
 *   2. A shared store lets a second "instance" see a session the first
 *      one created (the fix), while separate stores can't (the bug).
 *   3. Invalid/expired sessions are rejected.
 *   4. Logout invalidates the session everywhere the store is shared.
 */

import { describe, it, expect } from "@jest/globals";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AdminAuthProvider } from "../AdminAuthProvider";
import { InMemoryAdminSessionStore } from "../sessionStore";
import { SupabaseAdminSessionStore } from "../supabaseSessionStore";

const CREDENTIALS = { username: "admin", password: "admin123" };

function withEnv() {
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "admin123";
}

describe("Session persistence", () => {
  describe("1. Login", () => {
    it("creates a session with a future expiration", async () => {
      withEnv();
      const provider = new AdminAuthProvider(new InMemoryAdminSessionStore());

      const session = await provider.login(CREDENTIALS);

      expect(session.id).toBeTruthy();
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("3. Invalid or expired sessions", () => {
    it("rejects a session id that was never issued", async () => {
      const provider = new AdminAuthProvider(new InMemoryAdminSessionStore());

      expect(await provider.validateSession("never-issued")).toBe(false);
    });

    it("rejects a session past its expiresAt", async () => {
      withEnv();
      const store = new InMemoryAdminSessionStore();
      const provider = new AdminAuthProvider(store);

      const session = await provider.login(CREDENTIALS);
      await store.set({ ...session, expiresAt: new Date(Date.now() - 1000) });

      expect(await provider.validateSession(session.id)).toBe(false);
    });
  });

  describe("4. Separate serverless instances vs a shared store", () => {
    it("BUG (pre-fix shape): a session created on one instance is invisible to another with its own store", async () => {
      withEnv();
      const instanceA = new AdminAuthProvider(new InMemoryAdminSessionStore());
      const instanceB = new AdminAuthProvider(new InMemoryAdminSessionStore());

      const session = await instanceA.login(CREDENTIALS);

      // Simulates the exact failure mode reported: login lands on one
      // Lambda instance, the next request lands on a different one that
      // never saw the write.
      expect(await instanceB.validateSession(session.id)).toBe(false);
    });

    it("FIX: two instances sharing one store both recognize the session", async () => {
      withEnv();
      const sharedStore = new InMemoryAdminSessionStore();
      const instanceA = new AdminAuthProvider(sharedStore);
      const instanceB = new AdminAuthProvider(sharedStore);

      const session = await instanceA.login(CREDENTIALS);

      expect(await instanceB.validateSession(session.id)).toBe(true);
      expect((await instanceB.getCurrentUser(session.id))?.username).toBe(
        "admin",
      );
    });
  });

  describe("5. Logout", () => {
    it("invalidates the session for every instance sharing the store", async () => {
      withEnv();
      const sharedStore = new InMemoryAdminSessionStore();
      const instanceA = new AdminAuthProvider(sharedStore);
      const instanceB = new AdminAuthProvider(sharedStore);

      const session = await instanceA.login(CREDENTIALS);
      expect(await instanceB.validateSession(session.id)).toBe(true);

      // Logout happens via instance B (e.g. the request landed on a
      // different Lambda than the one that created the session).
      await instanceB.logout(session.id);

      expect(await instanceA.validateSession(session.id)).toBe(false);
      expect(await instanceB.validateSession(session.id)).toBe(false);
    });
  });
});

describe("SupabaseAdminSessionStore", () => {
  function mockSupabaseClient(overrides: {
    maybeSingle?: jest.Mock;
  } = {}) {
    const maybeSingle =
      overrides.maybeSingle ?? jest.fn().mockResolvedValue({ data: null, error: null });
    const eq = jest.fn().mockReturnValue({ maybeSingle });
    const select = jest.fn().mockReturnValue({ eq });
    const upsert = jest.fn().mockResolvedValue({ data: null, error: null });
    const deleteEq = jest.fn().mockResolvedValue({ data: null, error: null });
    const del = jest.fn().mockReturnValue({ eq: deleteEq, lt: deleteEq });
    const from = jest.fn().mockReturnValue({ select, upsert, delete: del });

    return { from, select, eq, maybeSingle, upsert, delete: del, deleteEq } as const;
  }

  it("set() upserts the session row", async () => {
    const client = mockSupabaseClient();
    const store = new SupabaseAdminSessionStore(client as unknown as SupabaseClient);

    const session = {
      id: "session-1",
      userId: "user-1",
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    await store.set(session);

    expect(client.from).toHaveBeenCalledWith("admin_sessions");
    expect(client.upsert).toHaveBeenCalledWith({
      id: "session-1",
      user_id: "user-1",
      expires_at: "2026-01-01T00:00:00.000Z",
    });
  });

  it("get() returns null when Supabase has no matching row", async () => {
    const client = mockSupabaseClient();
    const store = new SupabaseAdminSessionStore(client as unknown as SupabaseClient);

    expect(await store.get("missing")).toBeNull();
  });

  it("get() maps a found row back into an AdminSession", async () => {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: {
        id: "session-1",
        user_id: "user-1",
        expires_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
    const client = mockSupabaseClient({ maybeSingle });
    const store = new SupabaseAdminSessionStore(client as unknown as SupabaseClient);

    const session = await store.get("session-1");

    expect(session).toEqual({
      id: "session-1",
      userId: "user-1",
      expiresAt: new Date("2026-01-01T00:00:00.000Z"),
    });
  });

  it("delete() removes the row by id", async () => {
    const client = mockSupabaseClient();
    const store = new SupabaseAdminSessionStore(client as unknown as SupabaseClient);

    await store.delete("session-1");

    expect(client.from).toHaveBeenCalledWith("admin_sessions");
    expect(client.deleteEq).toHaveBeenCalledWith("id", "session-1");
  });
});
