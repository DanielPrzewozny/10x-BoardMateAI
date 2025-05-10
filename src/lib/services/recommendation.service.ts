import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";
import { z } from "zod";

export const recommendationFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["played_at"]).default("played_at"),
  interactionType: z.enum(["played", "abandoned", "recommended"]).optional(),
});

export const createRecommendationSchema = z.object({
  game_id: z.string().uuid(),
  duration_played: z.number().int().min(1),
  interaction_type: z.enum(["played", "abandoned", "recommended"]),
  session_duration: z.number().int().min(1),
  score: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export type RecommendationFilters = z.infer<typeof recommendationFiltersSchema>;
export type CreateRecommendationInput = z.infer<typeof createRecommendationSchema>;

export class RecommendationService {
  constructor(private readonly db: SupabaseClient = supabaseClient) {}

  async getRecommendations(userId: string, filters: RecommendationFilters) {
    const { page, limit, sort, interactionType } = filters;
    const offset = (page - 1) * limit;

    let query = this.db
      .from("game_recommendations")
      .select(
        `
        *,
        game:board_games (
          id,
          title,
          complexity
        )
      `
      )
      .eq("user_id", userId)
      .range(offset, offset + limit - 1)
      .order(sort, { ascending: false });

    if (interactionType) {
      query = query.eq("interaction_type", interactionType);
    }

    const { data: items, error, count } = await query.returns<any>();

    if (error) {
      throw new Error(`Błąd podczas pobierania rekomendacji: ${error.message}`);
    }

    return {
      items,
      total: count || 0,
      page,
      limit,
    };
  }

  async createRecommendation(userId: string, input: CreateRecommendationInput) {
    // Sprawdzenie czy gra istnieje i nie jest zarchiwizowana
    const { data: game, error: gameError } = await this.db
      .from("board_games")
      .select("is_archived")
      .eq("id", input.game_id)
      .single();

    if (gameError || !game) {
      throw new Error("Nie znaleziono gry");
    }

    if (game.is_archived) {
      throw new Error("Nie można dodać wpisu dla zarchiwizowanej gry");
    }

    const { data, error } = await this.db
      .from("game_recommendations")
      .insert({
        user_id: userId,
        ...input,
        played_at: new Date().toISOString(),
      })
      .select(
        `
        *,
        game:board_games (
          id,
          title,
          complexity
        )
      `
      )
      .single();

    if (error) {
      throw new Error(`Błąd podczas dodawania rekomendacji: ${error.message}`);
    }

    return data;
  }
}
