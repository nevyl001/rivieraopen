# Implementation Plan: Environment-Based Data Layer

## Overview

This implementation plan breaks down the environment-based data layer feature into discrete, incremental coding tasks. The approach follows a phased migration strategy: first creating the new structure without breaking existing code, then gradually migrating components, and finally adding SQL support. Each task builds on previous work and includes validation through tests.

## Tasks

- [x] 1. Set up project structure and environment configuration

  - Create new directory structure under `lib/data/`
  - Move existing mock data files to `lib/data/mock/`
  - Implement environment configuration module with validation
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x]\* 1.1 Write unit tests for environment configuration

  - Test dev environment selection
  - Test prod environment selection with DATABASE_URL
  - Test configuration error when prod missing DATABASE_URL
  - _Requirements: 1.1, 1.2, 1.3_

- [x]\* 1.2 Write property test for invalid configuration rejection

  - **Property 12: Invalid Configuration Rejection**
  - **Validates: Requirements 1.5**

- [x] 2. Implement repository interfaces and error classes

  - Define IPlayerRepository and ITournamentRepository interfaces
  - Implement error hierarchy (NotFoundError, ValidationError, etc.)
  - Create repository factory skeleton
  - _Requirements: 2.1, 9.1, 9.2, 9.3, 9.4_

- [x]\* 2.1 Write unit tests for error classes

  - Test error message formatting
  - Test error context inclusion
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x]\* 2.2 Write property test for error context completeness

  - **Property 11: Error Context Completeness**
  - **Validates: Requirements 9.1, 9.4**

- [x]\* 2.3 Write property test for validation error descriptiveness

  - **Property 10: Validation Error Descriptiveness**
  - **Validates: Requirements 8.5, 9.3**

- [x] 3. Implement MockPlayerRepository

  - Implement all IPlayerRepository methods using in-memory data
  - Implement deep cloning to prevent mutations
  - Implement ranking recalculation logic
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x]\* 3.1 Write unit tests for MockPlayerRepository

  - Test getAll returns all players
  - Test getById with valid and invalid IDs
  - Test getByLevel filtering
  - Test create operation
  - Test update operation
  - Test updatePoints and ranking recalculation
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.8_

- [x]\* 3.2 Write property test for repository filtering correctness

  - **Property 2: Repository Filtering Correctness**
  - **Validates: Requirements 3.3**

- [x]\* 3.3 Write property test for create-retrieve round trip

  - **Property 3: Create-Retrieve Round Trip**
  - **Validates: Requirements 3.4**

- [x]\* 3.4 Write property test for update idempotence

  - **Property 4: Update Idempotence**
  - **Validates: Requirements 3.5**

- [x]\* 3.5 Write property test for points update triggers ranking

  - **Property 5: Points Update Triggers Ranking Recalculation**
  - **Validates: Requirements 3.6**

- [x]\* 3.6 Write property test for data completeness

  - **Property 6: Data Completeness**
  - **Validates: Requirements 3.7**

- [x]\* 3.7 Write property test for not-found error specificity

  - **Property 7: Not-Found Error Specificity**
  - **Validates: Requirements 3.8, 9.2**

- [x] 4. Implement MockTournamentRepository

  - Implement all ITournamentRepository methods using in-memory data
  - Implement filtering by status and level
  - Handle tournament results updates
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x]\* 4.1 Write unit tests for MockTournamentRepository

  - Test getAll returns all tournaments
  - Test getById with valid and invalid IDs
  - Test getByStatus filtering
  - Test getByLevel filtering
  - Test create operation
  - Test update operation
  - Test updateResults operation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x]\* 4.2 Write property tests for tournament repository

  - Test filtering correctness (Property 2 for tournaments)
  - Test create-retrieve round trip (Property 3 for tournaments)
  - Test update idempotence (Property 4 for tournaments)
  - Test data completeness (Property 6 for tournaments)
  - **Validates: Requirements 4.3, 4.4, 4.5, 4.6, 4.8**

- [x] 5. Implement repository factory with environment switching

  - Complete RepositoryFactory implementation
  - Add singleton pattern for repository instances
  - Wire up environment config to select mock implementations
  - Add reset method for testing
  - _Requirements: 1.1, 1.2, 2.3, 2.5_

- [x]\* 5.1 Write unit tests for repository factory

  - Test factory returns mock repositories in dev environment
  - Test factory returns same instance on multiple calls (singleton)
  - Test reset method clears instances
  - _Requirements: 1.1, 2.3_

- [x] 6. Checkpoint - Ensure all tests pass

  - Run all unit tests and property tests
  - Verify mock implementations work correctly
  - Ask the user if questions arise

- [x] 7. Create database schema and migration scripts

  - Write SQL migration script for initial schema (001_initial_schema.sql)
  - Include all tables: players, player_contacts, player_socials, tournaments, tournament_winners, tournament_photos, tournament_results
  - Add indexes for performance
  - Add updated_at triggers
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

- [x] 7.1 Create data seeding script

  - Write TypeScript script to seed database with mock data (002_seed_data.ts)
  - Transform mock data format to database format
  - Use transactions for data integrity
  - _Requirements: 7.2, 7.3_

- [x]\* 7.2 Write unit test for migration idempotence

  - **Property 8: Migration Idempotence**
  - **Validates: Requirements 7.5**

- [x] 8. Implement database client with connection pooling

  - Implement DatabaseClient singleton class
  - Set up PostgreSQL connection pool using pg library
  - Implement retry logic with exponential backoff
  - Implement query method with error handling
  - Add connection lifecycle management
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x]\* 8.1 Write unit tests for database client

  - Test connection pool creation
  - Test query method
  - Test retry logic on connection failure
  - Test error throwing after max retries
  - Test connection cleanup on close
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 9. Implement SQLPlayerRepository

  - Implement all IPlayerRepository methods using PostgreSQL
  - Implement row-to-object hydration (hydratePlayer method)
  - Use transactions for multi-table operations
  - Implement ranking recalculation with SQL
  - Handle foreign key relationships (contacts, socials, tournament results)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ]\* 9.1 Write integration tests for SQLPlayerRepository

  - Test all CRUD operations against test database
  - Test transaction rollback on errors
  - Test data hydration includes all nested data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ]\* 9.2 Write property test for data transformation consistency

  - **Property 9: Data Transformation Consistency**
  - **Validates: Requirements 8.2, 8.3**

- [x] 10. Implement SQLTournamentRepository

  - Implement all ITournamentRepository methods using PostgreSQL
  - Implement row-to-object hydration for tournaments
  - Use transactions for multi-table operations
  - Handle tournament results and photos relationships
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ]\* 10.1 Write integration tests for SQLTournamentRepository

  - Test all CRUD operations against test database
  - Test filtering by status and level
  - Test tournament results updates
  - Test data hydration includes all nested data
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 11. Wire SQL repositories into factory

  - Update RepositoryFactory to create SQL repositories in prod environment
  - Pass database client to SQL repository constructors
  - Test environment switching between mock and SQL
  - _Requirements: 1.2, 2.3_

- [ ]\* 11.1 Write property test for implementation equivalence

  - **Property 1: Implementation Equivalence**
  - **Validates: Requirements 2.3**

- [x] 12. Checkpoint - Ensure all tests pass

  - Run all unit tests, property tests, and integration tests
  - Verify SQL implementations work correctly
  - Verify environment switching works
  - Ask the user if questions arise

- [x] 13. Set up test database infrastructure

  - Create docker-compose.test.yml for test database
  - Add test database setup scripts
  - Update package.json with test database commands
  - Document test database setup in README
  - _Requirements: 10.4_

- [ ] 14. Create property-based test generators

  - Implement fast-check arbitraries for Player and Tournament types
  - Implement generators for Level and TournamentStatus enums
  - Create helper functions for test data generation
  - _Requirements: 10.3_

- [x] 15. Migrate one component to use repositories (proof of concept)

  - Choose a simple component (e.g., player list page)
  - Update to use RepositoryFactory instead of direct imports
  - Test thoroughly in dev environment
  - Document migration pattern for other components
  - _Requirements: 2.5_

- [ ]\* 15.1 Write integration test for migrated component

  - Test component works with mock repository
  - Test component behavior matches original
  - _Requirements: 2.5_

- [x] 16. Create migration guide documentation

  - Document step-by-step migration process for remaining components
  - Include code examples for common patterns
  - Document environment variable setup
  - Add troubleshooting section
  - _Requirements: 2.5_

- [x] 17. Final checkpoint - End-to-end validation
  - Run complete test suite
  - Test dev environment with mock data
  - Test prod environment with SQL database (if available)
  - Verify all correctness properties pass
  - Ask the user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate SQL implementations against real database
- The implementation follows a phased approach to minimize risk
- Components can be migrated gradually without breaking existing functionality
