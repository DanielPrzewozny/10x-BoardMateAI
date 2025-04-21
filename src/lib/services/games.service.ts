import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from '@/db/supabase.client';
import { z } from 'zod';
import type { GameRecommendation } from '@/types';

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

  async addGameFromRecommendation(game: GameRecommendation) {
    const {
      data: { user },
    } = await this.db.auth.getUser();

    if (!user) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    const { data: existingGame } = await this.db
      .from('board_games')
      .select('id')
      .eq('title', game.title)
      .single();

    if (existingGame) {
      return existingGame.id;
    }

    // Parsowanie i walidacja liczby graczy
    const [minPlayers, maxPlayersStr] = game.players.split('-');
    const min = parseInt(minPlayers);
    const max = maxPlayersStr ? parseInt(maxPlayersStr) : min;

    if (isNaN(min) || min <= 0) {
      throw new Error('Minimalna liczba graczy musi być większa od 0');
    }

    if (isNaN(max) || max < min) {
      throw new Error('Maksymalna liczba graczy nie może być mniejsza od minimalnej');
    }

    const { data: newGame, error: insertError } = await this.db
      .from('board_games')
      .insert({
        title: game.title,
        complexity: game.complexity,
        min_players: min,
        max_players: max,
        duration: parseInt(game.duration.split('-')[0]),
        description: game.description,
        created_by: user.id
      })
      .select('id')
      .single();

    if (insertError || !newGame) {
      throw new Error(`Błąd podczas dodawania gry: ${insertError?.message}`);
    }

    return newGame.id;
  }

  async addToFavorites(userId: string, gameId: string, notes: string = '') {
    const { error } = await this.db
      .from('favorite_games')
      .insert({
        user_id: userId,
        game_id: gameId,
        notes,
        added_at: new Date().toISOString(),
        created_by: userId
      });

    if (error) {
      throw new Error(`Błąd podczas dodawania do ulubionych: ${error.message}`);
    }

    return true;
  }

  async removeFromFavorites(userId: string, gameId: string) {
    const { error } = await this.db
      .from('favorite_games')
      .delete()
      .match({ user_id: userId, game_id: gameId });

    if (error) {
      throw new Error(`Błąd podczas usuwania z ulubionych: ${error.message}`);
    }

    return true;
  }

  async getGameByTitle(title: string) {
    const { data, error } = await this.db
      .from('board_games')
      .select('id')
      .eq('title', title)
      .single();

    if (error) {
      throw new Error(`Błąd podczas wyszukiwania gry: ${error.message}`);
    }

    if (!data) {
      throw new Error('Nie znaleziono gry');
    }

    return data;
  }

  async addGamesFromRecommendationsBatch(games: GameRecommendation[]) {
    if (!games.length) return [];

    const {
      data: { user },
    } = await this.db.auth.getUser();

    if (!user) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    // Pobierz tylko tytuły gier, które już istnieją w bazie
    const { data: existingTitles } = await this.db
      .from('board_games')
      .select('title')
      .in('title', games.map(g => g.title));

    const existingTitlesSet = new Set(existingTitles?.map(g => g.title) || []);
    
    // Filtruj tylko nowe gry, których jeszcze nie ma w bazie
    const newGames = games.filter(game => !existingTitlesSet.has(game.title));

    if (!newGames.length) return [];

    // Przygotuj dane do zbiorowego insertu z walidacją
    const gamesToInsert = newGames.map(game => {
      const [minPlayers, maxPlayersStr] = game.players.split('-');
      const min = parseInt(minPlayers);
      const max = maxPlayersStr ? parseInt(maxPlayersStr) : min;

      if (isNaN(min) || min <= 0) {
        throw new Error(`Gra "${game.title}": Minimalna liczba graczy musi być większa od 0`);
      }

      if (isNaN(max) || max < min) {
        throw new Error(`Gra "${game.title}": Maksymalna liczba graczy nie może być mniejsza od minimalnej`);
      }

      return {
        title: game.title,
        complexity: game.complexity,
        min_players: min,
        max_players: max,
        duration: parseInt(game.duration.split('-')[0]),
        description: game.description,
        created_by: user.id
      };
    });

    // Wykonaj zbiorowy insert
    const { data: insertedGames, error: insertError } = await this.db
      .from('board_games')
      .insert(gamesToInsert)
      .select('id, title');

    if (insertError) {
      throw new Error(`Błąd podczas zbiorowego dodawania gier: ${insertError.message}`);
    }

    return insertedGames || [];
  }
} 