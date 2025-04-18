import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import { z } from 'zod';

export const gameFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['title', 'complexity', 'duration']).default('title'),
  complexity: z.coerce.number().int().min(1).max(5).optional(),
  players: z.coerce.number().int().min(1).optional(),
  duration: z.coerce.number().int().min(1).optional(),
  types: z.array(z.string().uuid()).optional()
});

export type GameFilters = z.infer<typeof gameFiltersSchema>;

export class GamesService {
  constructor(private readonly db: SupabaseClient = supabaseClient) {}

  async getGames(filters: GameFilters) {
    const { page, limit, sort, complexity, players, duration, types } = filters;
    const offset = (page - 1) * limit;

    let query = this.db
      .from('board_games')
      .select(`
        *,
        types:board_game_types (
          id,
          type
        )
      `)
      .eq('is_archived', false)
      .range(offset, offset + limit - 1);

    if (complexity) {
      query = query.eq('complexity', complexity);
    }

    if (players) {
      query = query.lte('max_players', players).gte('min_players', players);
    }

    if (duration) {
      query = query.lte('duration', duration);
    }

    if (types && types.length > 0) {
      query = query.contains('types', types);
    }

    const { data: items, error, count } = await query.returns<any>();

    if (error) {
      throw new Error(`Błąd podczas pobierania gier: ${error.message}`);
    }

    return {
      items,
      total: count || 0,
      page,
      limit
    };
  }

  async getGameById(id: string) {
    const { data, error } = await this.db
      .from('board_games')
      .select(`
        *,
        types:board_game_types (
          id,
          type
        )
      `)
      .eq('id', id)
      .eq('is_archived', false)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania gry: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nie znaleziono gry');
    }

    return data;
  }
} 