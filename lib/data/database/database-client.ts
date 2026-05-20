import { Pool, PoolClient, PoolConfig, QueryResult, QueryResultRow } from "pg";
import {
  DatabaseConnectionError,
  DataLayerError,
} from "../repositories/interfaces";

/**
 * DatabaseClient - Singleton class for managing PostgreSQL connections
 *
 * Features:
 * - Connection pooling for efficient resource usage
 * - Automatic retry logic with exponential backoff
 * - Graceful error handling and connection lifecycle management
 * - Thread-safe singleton pattern
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export class DatabaseClient {
  private static instance: DatabaseClient | null = null;
  private pool: Pool | null = null;
  private isConnected: boolean = false;

  // Retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY_MS = 100;
  private readonly MAX_RETRY_DELAY_MS = 5000;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get the singleton instance of DatabaseClient
   */
  public static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  /**
   * Initialize the connection pool
   * Requirements: 6.1 - Connection pool creation
   */
  public async connect(config?: PoolConfig): Promise<void> {
    if (this.isConnected && this.pool) {
      return; // Already connected
    }

    const poolConfig: PoolConfig = config || {
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Timeout for acquiring a connection
    };

    try {
      this.pool = new Pool(poolConfig);

      // Test the connection
      const client = await this.pool.connect();
      client.release();

      this.isConnected = true;
    } catch (error) {
      this.pool = null;
      this.isConnected = false;
      throw new DatabaseConnectionError(
        "Failed to connect to database",
        error as Error
      );
    }
  }

  /**
   * Execute a query with automatic retry logic
   * Requirements: 6.2 - Query execution, 6.3 - Retry logic with exponential backoff
   */
  public async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[]
  ): Promise<QueryResult<T>> {
    if (!this.pool || !this.isConnected) {
      throw new DatabaseConnectionError(
        "Database not connected. Call connect() first."
      );
    }

    let lastError: Error | null = null;
    let retryDelay = this.INITIAL_RETRY_DELAY_MS;

    for (let attempt = 0; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const result = await this.pool.query<T>(text, params);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable (connection issues)
        const isRetryable = this.isRetryableError(error as Error);

        if (!isRetryable || attempt === this.MAX_RETRIES) {
          // Don't retry or max retries reached
          break;
        }

        // Wait before retrying with exponential backoff
        await this.sleep(retryDelay);
        retryDelay = Math.min(retryDelay * 2, this.MAX_RETRY_DELAY_MS);
      }
    }

    // All retries failed
    throw new DataLayerError(
      `Query failed after ${this.MAX_RETRIES + 1} attempts: ${
        lastError?.message
      }`,
      { query: text, params, cause: lastError }
    );
  }

  /**
   * Get a client from the pool for transaction management
   * Requirements: 6.2 - Support for transactions
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.pool || !this.isConnected) {
      throw new DatabaseConnectionError(
        "Database not connected. Call connect() first."
      );
    }

    try {
      return await this.pool.connect();
    } catch (error) {
      throw new DatabaseConnectionError(
        "Failed to acquire database client from pool",
        error as Error
      );
    }
  }

  /**
   * Close the connection pool and cleanup resources
   * Requirements: 6.5 - Connection lifecycle management
   */
  public async close(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (error) {
        console.error("Error closing database pool:", error);
      } finally {
        this.pool = null;
        this.isConnected = false;
      }
    }
  }

  /**
   * Check if the client is connected
   */
  public getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static reset(): void {
    if (DatabaseClient.instance) {
      DatabaseClient.instance.close();
      DatabaseClient.instance = null;
    }
  }

  /**
   * Determine if an error is retryable
   * Requirements: 6.3 - Retry logic
   */
  private isRetryableError(error: Error): boolean {
    const retryableMessages = [
      "ECONNREFUSED",
      "ECONNRESET",
      "ETIMEDOUT",
      "ENOTFOUND",
      "connection terminated",
      "Connection terminated",
      "server closed the connection",
    ];

    const errorMessage = error.message || "";
    return retryableMessages.some((msg) => errorMessage.includes(msg));
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
