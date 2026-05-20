import { z } from "zod";

// Player Category validation
export const playerCategorySchema = z.enum([
  "Open",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
]);

// Player Gender validation
export const playerGenderSchema = z.enum(["Male", "Female"]);

// Tournament Genre validation
export const tournamentGenreSchema = z.enum(["Open", "Women"]);

// Tournament Status validation
export const tournamentStatusSchema = z.enum([
  "upcoming",
  "in-progress",
  "completed",
]);

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Phone validation (flexible format, minimum 7 digits)
export const phoneSchema = z
  .string()
  .min(7, "Phone must be at least 7 characters")
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    "Phone must contain only numbers, spaces, dashes, plus signs, and parentheses",
  );

// URL validation
export const urlSchema = z.string().url("Invalid URL format");

// Player Contact schema
export const playerContactSchema = z.object({
  email: emailSchema,
  phone: phoneSchema,
});

// Player Socials schema (all optional)
export const playerSocialsSchema = z.object({
  instagram: z
    .string()
    .url("Invalid Instagram URL")
    .optional()
    .or(z.literal("")),
  facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal("")),
});

// Create Player schema
export const createPlayerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be less than 100 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must be less than 100 characters"),
  photo: z.string().min(1, "Photo URL is required"),
  category: playerCategorySchema,
  gender: playerGenderSchema,
  points: z
    .number()
    .int("Points must be an integer")
    .min(0, "Points must be non-negative"),
  contact: playerContactSchema,
  socials: playerSocialsSchema.optional(),
});

// Update Player schema (all fields optional except id)
export const updatePlayerSchema = createPlayerSchema.partial();

// Create Tournament schema
export const createTournamentSchema = z.object({
  name: z
    .string()
    .min(1, "Tournament name is required")
    .max(200, "Name must be less than 200 characters"),
  date: z.date(),
  club: z
    .string()
    .min(1, "Club name is required")
    .max(200, "Club name must be less than 200 characters"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(200, "Location must be less than 200 characters"),
  genre: tournamentGenreSchema,
  status: tournamentStatusSchema,
  registrationOpen: z.boolean(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});

// Update Tournament schema (all fields optional)
export const updateTournamentSchema = createTournamentSchema.partial();

// Category validation (for tournament categories)
export const categorySchema = z.enum(["Open", "1", "2", "3", "4", "5", "6"]);

// Winner placement validation
export const winnerPlacementSchema = z.union([z.literal(1), z.literal(2)]);

// Winner data schema
export const winnerDataSchema = z.object({
  playerId: z.string().uuid("Invalid player ID"),
  playerName: z.string().min(1, "Player name is required"),
  photo: z.string().min(1, "Photo URL is required"),
});

// Export types
export type PlayerCategory = z.infer<typeof playerCategorySchema>;
export type PlayerGender = z.infer<typeof playerGenderSchema>;
export type TournamentGenre = z.infer<typeof tournamentGenreSchema>;
export type TournamentStatus = z.infer<typeof tournamentStatusSchema>;
export type CreatePlayerData = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerData = z.infer<typeof updatePlayerSchema>;
export type CreateTournamentData = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentData = z.infer<typeof updateTournamentSchema>;
export type Category = z.infer<typeof categorySchema>;
export type WinnerPlacement = z.infer<typeof winnerPlacementSchema>;
export type WinnerData = z.infer<typeof winnerDataSchema>;
