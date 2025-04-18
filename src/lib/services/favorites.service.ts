import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import { z } from 'zod';

export const favoriteGameSchema = z.object({
  gameId: z.string().uuid(),
  notes: z.string().optional()
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['addedAt', 'title']).default('addedAt')
});

export type FavoriteGameInput = z.infer<typeof favoriteGameSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;

export class FavoritesService {
  constructor(private readonly supabase: SupabaseClient = supabaseClient) {}

  async getFavorites(userId: string, { page, limit, sort }: PaginationParams) {
    const offset = (page - 1) * limit;

    const query = this.supabase
      .from('favorite_games')
      .select(`
        id,
        game_id,
        added_at,
        notes,
        game:board_games (
          id,
          title,
          complexity,
          min_players,
          max_players,
          duration,
          description,
          is_archived
        )
      `)
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);

    if (sort === 'title') {
      query.order('game(title)', { ascending: true });
    } else {
      query.order('added_at', { ascending: false });
    }

    const { data: items, error, count } = await query.returns<any>();

    if (error) {
      throw new Error(`Błąd podczas pobierania ulubionych gier: ${error.message}`);
    }

    return {
      items,
      total: count || 0,
      page,
      limit
    };
  }

  async addFavorite(userId: string, { gameId, notes }: FavoriteGameInput) {
    // Sprawdzenie czy gra istnieje i nie jest zarchiwizowana
    const { data: game, error: gameError } = await this.supabase
      .from('board_games')
      .select('is_archived')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      throw new Error('Nie znaleziono gry');
    }

    if (game.is_archived) {
      throw new Error('Nie można dodać zarchiwizowanej gry do ulubionych');
    }

    // Sprawdzenie czy gra nie jest już w ulubionych
    const { data: existing, error: existingError } = await this.supabase
      .from('favorite_games')
      .select('id')
      .eq('user_id', userId)
      .eq('game_id', gameId)
      .single();

    if (existing) {
      throw new Error('Gra jest już w ulubionych');
    }

    const { data, error } = await this.supabase
      .from('favorite_games')
      .insert({
        user_id: userId,
        game_id: gameId,
        notes,
        added_at: new Date().toISOString()
      })
      .select(`
        id,
        game_id,
        added_at,
        notes,
        game:board_games (
          id,
          title,
          complexity,
          min_players,
          max_players,
          duration,
          description,
          is_archived
        )
      `)
      .single();

    if (error) {
      throw new Error(`Błąd podczas dodawania gry do ulubionych: ${error.message}`);
    }

    return data;
  }

  async removeFavorite(userId: string, gameId: string) {
    const { error } = await this.supabase
      .from('favorite_games')
      .delete()
      .eq('user_id', userId)
      .eq('game_id', gameId);

    if (error) {
      throw new Error(`Błąd podczas usuwania gry z ulubionych: ${error.message}`);
    }
  }
} 