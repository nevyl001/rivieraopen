import { DatabaseClient } from "../database-client";
import {
  DatabaseConnectionError,
  DataLayerError,
} from "../../repositories/interfaces";
import { Pool } from "pg";

// Mock the pg module
jest.mock("pg", () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe("DatabaseClient", () => {
  let client: DatabaseClient;
  let mockPool: any;

  beforeEach(() => {
    // Reset singleton and mocks
    DatabaseClient.reset();
    client = DatabaseClient.getInstance();

    // Get the mock pool instance
    mockPool = new Pool();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await client.close();
    DatabaseClient.reset();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = DatabaseClient.getInstance();
      const instance2 = DatabaseClient.getInstance();

      expect(instance1).toBe(instance2);
    });

    it("should create a new instance after reset", () => {
      const instance1 = DatabaseClient.getInstance();
      DatabaseClient.reset();
      const instance2 = DatabaseClient.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe("Connection Pool Creation", () => {
    it("should create a connection pool with default config", async () => {
      // Mock successful connection
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });

      await client.connect();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          connectionString: process.env.DATABASE_URL,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        })
      );
      expect(mockPool.connect).toHaveBeenCalled();
      expect(client.getIsConnected()).toBe(true);
    });

    it("should create a connection pool with custom config", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });

      const customConfig = {
        host: "localhost",
        port: 5432,
        database: "test_db",
        user: "test_user",
        password: "test_pass",
        max: 10,
      };

      await client.connect(customConfig);

      expect(Pool).toHaveBeenCalledWith(customConfig);
      expect(client.getIsConnected()).toBe(true);
    });

    it("should not reconnect if already connected", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });

      await client.connect();
      const firstCallCount = mockPool.connect.mock.calls.length;

      await client.connect();
      const secondCallCount = mockPool.connect.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    it("should throw DatabaseConnectionError on connection failure", async () => {
      mockPool.connect.mockRejectedValue(new Error("Connection refused"));

      await expect(client.connect()).rejects.toThrow(DatabaseConnectionError);
      expect(client.getIsConnected()).toBe(false);
    });
  });

  describe("Query Execution", () => {
    beforeEach(async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      await client.connect();
    });

    it("should execute a query successfully", async () => {
      const mockResult = { rows: [{ id: 1, name: "Test" }], rowCount: 1 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await client.query("SELECT * FROM users WHERE id = $1", [
        1,
      ]);

      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [1]
      );
      expect(result).toEqual(mockResult);
    });

    it("should execute a query without parameters", async () => {
      const mockResult = { rows: [], rowCount: 0 };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await client.query("SELECT * FROM users");

      expect(mockPool.query).toHaveBeenCalledWith(
        "SELECT * FROM users",
        undefined
      );
      expect(result).toEqual(mockResult);
    });

    it("should throw error if not connected", async () => {
      const disconnectedClient = DatabaseClient.getInstance();
      DatabaseClient.reset();
      const newClient = DatabaseClient.getInstance();

      await expect(newClient.query("SELECT * FROM users")).rejects.toThrow(
        DatabaseConnectionError
      );
    });
  });

  describe("Retry Logic", () => {
    beforeEach(async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      await client.connect();
    });

    it("should retry on connection failure and succeed", async () => {
      const mockResult = { rows: [{ id: 1 }], rowCount: 1 };

      // Fail twice, then succeed
      mockPool.query
        .mockRejectedValueOnce(new Error("ECONNREFUSED"))
        .mockRejectedValueOnce(new Error("ECONNRESET"))
        .mockResolvedValueOnce(mockResult);

      const result = await client.query("SELECT * FROM users");

      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockResult);
    });

    it("should throw DataLayerError after max retries", async () => {
      // Fail all attempts
      mockPool.query.mockRejectedValue(new Error("ECONNREFUSED"));

      await expect(client.query("SELECT * FROM users")).rejects.toThrow(
        DataLayerError
      );

      // Should try 4 times total (initial + 3 retries)
      expect(mockPool.query).toHaveBeenCalledTimes(4);
    });

    it("should not retry on non-retryable errors", async () => {
      mockPool.query.mockRejectedValue(new Error("Syntax error"));

      await expect(client.query("SELECT * FROM invalid")).rejects.toThrow(
        DataLayerError
      );

      // Should only try once
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it("should retry on connection terminated error", async () => {
      const mockResult = { rows: [], rowCount: 0 };

      mockPool.query
        .mockRejectedValueOnce(new Error("connection terminated"))
        .mockResolvedValueOnce(mockResult);

      const result = await client.query("SELECT 1");

      expect(mockPool.query).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
    });
  });

  describe("Client Acquisition for Transactions", () => {
    beforeEach(async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      await client.connect();
    });

    it("should acquire a client from the pool", async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const poolClient = await client.getClient();

      expect(poolClient).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalled();
    });

    it("should throw error if pool is not connected", async () => {
      DatabaseClient.reset();
      const newClient = DatabaseClient.getInstance();

      await expect(newClient.getClient()).rejects.toThrow(
        DatabaseConnectionError
      );
    });

    it("should throw error if client acquisition fails", async () => {
      mockPool.connect.mockRejectedValue(new Error("Pool exhausted"));

      await expect(client.getClient()).rejects.toThrow(DatabaseConnectionError);
    });
  });

  describe("Connection Cleanup", () => {
    it("should close the pool and cleanup resources", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      mockPool.end.mockResolvedValue(undefined);

      await client.connect();
      expect(client.getIsConnected()).toBe(true);

      await client.close();

      expect(mockPool.end).toHaveBeenCalled();
      expect(client.getIsConnected()).toBe(false);
    });

    it("should handle errors during close gracefully", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      mockPool.end.mockRejectedValue(new Error("Close failed"));

      await client.connect();

      // Should not throw
      await expect(client.close()).resolves.not.toThrow();
      expect(client.getIsConnected()).toBe(false);
    });

    it("should be safe to call close multiple times", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      mockPool.end.mockResolvedValue(undefined);

      await client.connect();
      await client.close();
      await client.close();

      // Should only call end once
      expect(mockPool.end).toHaveBeenCalledTimes(1);
    });
  });

  describe("Connection State", () => {
    it("should report not connected initially", () => {
      expect(client.getIsConnected()).toBe(false);
    });

    it("should report connected after successful connection", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });

      await client.connect();

      expect(client.getIsConnected()).toBe(true);
    });

    it("should report not connected after close", async () => {
      mockPool.connect.mockResolvedValue({
        release: jest.fn(),
      });
      mockPool.end.mockResolvedValue(undefined);

      await client.connect();
      await client.close();

      expect(client.getIsConnected()).toBe(false);
    });

    it("should report not connected after failed connection", async () => {
      mockPool.connect.mockRejectedValue(new Error("Connection failed"));

      try {
        await client.connect();
      } catch (error) {
        // Expected
      }

      expect(client.getIsConnected()).toBe(false);
    });
  });
});
