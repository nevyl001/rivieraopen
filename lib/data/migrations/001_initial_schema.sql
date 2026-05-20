-- Riviera Open Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for players, tournaments, and related data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- PLAYERS TABLES
-- ============================================================================

-- Main players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  photo VARCHAR(500) NOT NULL,
  category VARCHAR(10) NOT NULL CHECK (category IN ('Open', '1', '2', '3', '4', '5', '6')),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  rank INTEGER NOT NULL DEFAULT 0 CHECK (rank >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Player contacts (1:1 relationship)
CREATE TABLE IF NOT EXISTS player_contacts (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL
);

-- Player socials (1:1 relationship)
CREATE TABLE IF NOT EXISTS player_socials (
  player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  twitter VARCHAR(255)
);

-- ============================================================================
-- TOURNAMENTS TABLES
-- ============================================================================

-- Main tournaments table (represents the tournament event)
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  club VARCHAR(200) NOT NULL,
  location VARCHAR(200) NOT NULL,
  genre VARCHAR(10) NOT NULL CHECK (genre IN ('Open', 'Women')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('upcoming', 'in-progress', 'completed')),
  registration_open BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournament categories (represents each skill category within a tournament)
-- A tournament can have multiple categories (e.g., Open, Category 1, Category 2)
CREATE TABLE IF NOT EXISTS tournament_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  category VARCHAR(10) NOT NULL CHECK (category IN ('Open', '1', '2', '3', '4', '5', '6')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tournament_id, category)
);

-- Tournament category winners (stores first and second place per category)
CREATE TABLE IF NOT EXISTS tournament_category_winners (
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL CHECK (placement IN (1, 2)),
  player_id UUID NOT NULL,
  player_name VARCHAR(200) NOT NULL,
  photo VARCHAR(500) NOT NULL,
  PRIMARY KEY (category_id, placement)
);

-- Tournament photos (1:many relationship - shared across all categories)
CREATE TABLE IF NOT EXISTS tournament_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);

-- Tournament results for players (many:many relationship)
-- This links players to their tournament category placements
CREATE TABLE IF NOT EXISTS tournament_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES tournament_categories(id) ON DELETE CASCADE,
  placement INTEGER NOT NULL CHECK (placement IN (1, 2)),
  date DATE NOT NULL,
  club VARCHAR(200) NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE (player_id, category_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Player indexes
CREATE INDEX IF NOT EXISTS idx_players_category ON players(category);
CREATE INDEX IF NOT EXISTS idx_players_category_rank ON players(category, rank);
CREATE INDEX IF NOT EXISTS idx_players_gender ON players(gender);
CREATE INDEX IF NOT EXISTS idx_players_category_gender ON players(category, gender);
CREATE INDEX IF NOT EXISTS idx_players_points ON players(points DESC);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_genre ON tournaments(genre);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status_date ON tournaments(status, date);
CREATE INDEX IF NOT EXISTS idx_tournaments_genre_status ON tournaments(genre, status);

-- Tournament category indexes
CREATE INDEX IF NOT EXISTS idx_tournament_categories_tournament ON tournament_categories(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_categories_category ON tournament_categories(category);

-- Tournament results indexes
CREATE INDEX IF NOT EXISTS idx_tournament_results_player ON tournament_results(player_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_category ON tournament_results(category_id);

-- Tournament photos index
CREATE INDEX IF NOT EXISTS idx_tournament_photos_tournament ON tournament_photos(tournament_id, display_order);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to players table
DROP TRIGGER IF EXISTS update_players_updated_at ON players;
CREATE TRIGGER update_players_updated_at 
  BEFORE UPDATE ON players
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Apply updated_at trigger to tournaments table
DROP TRIGGER IF EXISTS update_tournaments_updated_at ON tournaments;
CREATE TRIGGER update_tournaments_updated_at 
  BEFORE UPDATE ON tournaments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE players IS 'Main table storing player information';
COMMENT ON TABLE player_contacts IS 'Player contact information (email, phone)';
COMMENT ON TABLE player_socials IS 'Player social media links';
COMMENT ON TABLE tournaments IS 'Main table storing tournament events';
COMMENT ON TABLE tournament_categories IS 'Skill categories within each tournament (e.g., Open, Category 1, Category 2)';
COMMENT ON TABLE tournament_category_winners IS 'Winners for each tournament category (first and second place)';
COMMENT ON TABLE tournament_photos IS 'Photos associated with tournaments (shared across categories)';
COMMENT ON TABLE tournament_results IS 'Player results in tournament categories';

COMMENT ON COLUMN players.category IS 'Player skill category: Open, 1, 2, 3, 4, 5, or 6';
COMMENT ON COLUMN players.gender IS 'Player gender: Male or Female';
COMMENT ON COLUMN players.points IS 'Total points accumulated by player';
COMMENT ON COLUMN players.rank IS 'Current ranking within their category (1 = highest)';
COMMENT ON COLUMN tournaments.genre IS 'Tournament genre: Open (all genders) or Women (females only)';
COMMENT ON COLUMN tournaments.status IS 'Tournament status: upcoming, in-progress, or completed';
COMMENT ON COLUMN tournaments.registration_open IS 'Whether registration is currently open';
COMMENT ON COLUMN tournament_categories.category IS 'Skill category: Open, 1, 2, 3, 4, 5, or 6';
COMMENT ON COLUMN tournament_category_winners.placement IS 'Winner placement: 1 (first) or 2 (second)';
COMMENT ON COLUMN tournament_results.photos IS 'Array of photo URLs for this tournament result';
