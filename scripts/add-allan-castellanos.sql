-- Add Allan Castellanos to the database
-- This player will ONLY exist in the database, not in mock data
-- Use this to verify you're seeing database data!

BEGIN;

-- Insert player
INSERT INTO players (
  id,
  first_name,
  last_name,
  photo,
  category,
  gender,
  points,
  rank
) VALUES (
  gen_random_uuid(),
  'Allan',
  'Castellanos',
  '/img/players/players-1.png',  -- Using mock photo
  'Open',
  'Male',
  3000,  -- High points to appear near top
  1      -- Will be recalculated
) RETURNING id;

-- Get the player ID (will be shown in output)
WITH new_player AS (
  SELECT id FROM players WHERE first_name = 'Allan' AND last_name = 'Castellanos'
)
-- Insert contact info
INSERT INTO player_contacts (player_id, email, phone)
SELECT id, 'allan.castellanos@email.com', '+1 (555) 999-0001'
FROM new_player;

-- Insert social media (optional)
WITH new_player AS (
  SELECT id FROM players WHERE first_name = 'Allan' AND last_name = 'Castellanos'
)
INSERT INTO player_socials (player_id, instagram, facebook, twitter)
SELECT id, 'https://instagram.com/allancastellanos', NULL, NULL
FROM new_player;

COMMIT;

-- Verify the player was added
SELECT 
  id,
  first_name,
  last_name,
  category,
  gender,
  points,
  rank
FROM players 
WHERE first_name = 'Allan' AND last_name = 'Castellanos';

-- Show total player count
SELECT COUNT(*) as total_players FROM players;
