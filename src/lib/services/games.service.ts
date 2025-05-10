import { supabaseClient, DEFAULT_USER_ID, type SupabaseClient } from "@/db/supabase.client";
import { z } from "zod";
import type { GameRecommendationItem } from "@/types";

export const gameFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(["title", "complexity", "duration"]).default("title"),
  complexity: z.coerce.number().int().min(1).max(5).optional(),
  players: z.coerce.number().int().min(1).optional(),
  duration: z.coerce.number().int().min(1).optional(),
  types: z.array(z.string().uuid()).optional(),
});

export type GameFilters = z.infer<typeof gameFiltersSchema>;

export class GamesService {
  constructor(private readonly db: SupabaseClient = supabaseClient) {}

  async getGames(filters: GameFilters) {
    const { page, limit, sort, complexity, players, duration, types } = filters;
    const offset = (page - 1) * limit;

    let query = this.db
      .from("board_games")
      .select(
        `
        *,
        types:board_game_types (
          id,
          type
        )
      `
      )
      .eq("is_archived", false)
      .range(offset, offset + limit - 1);

    if (complexity) {
      query = query.eq("complexity", complexity);
    }

    if (players) {
      query = query.lte("max_players", players).gte("min_players", players);
    }

    if (duration) {
      query = query.lte("duration", duration);
    }

    if (types && types.length > 0) {
      query = query.contains("types", types);
    }

    const { data: items, error, count } = await query.returns<any>();

    if (error) {
      throw new Error(`Błąd podczas pobierania gier: ${error.message}`);
    }

    return {
      items,
      total: count || 0,
      page,
      limit,
    };
  }

  async getGameById(id: string) {
    const { data, error } = await this.db
      .from("board_games")
      .select(
        `
        *,
        types:board_game_types (
          id,
          type
        )
      `
      )
      .eq("id", id)
      .eq("is_archived", false)
      .single();

    if (error) {
      throw new Error(`Błąd podczas pobierania gry: ${error.message}`);
    }

    if (!data) {
      throw new Error("Nie znaleziono gry");
    }

    return data;
  }

  async addGameFromRecommendation(game: GameRecommendationItem) {
    const {
      data: { user },
    } = await this.db.auth.getUser();

    if (!user) {
      throw new Error("Użytkownik nie jest zalogowany");
    }

    const { data: existingGame } = await this.db.from("board_games").select("id").eq("title", game.title).single();

    if (existingGame) {
      return existingGame.id;
    }

    // Parsowanie i walidacja liczby graczy
    const playersStr = game.players || "2-4";
    const [minPlayersStr, maxPlayersStr] = playersStr.split("-");
    const min = parseInt(minPlayersStr);
    const max = maxPlayersStr ? parseInt(maxPlayersStr) : min;

    if (isNaN(min) || min <= 0) {
      throw new Error(`Minimalna liczba graczy musi być większa od 0, otrzymano: ${playersStr}`);
    }

    if (isNaN(max) || max < min) {
      throw new Error(`Maksymalna liczba graczy nie może być mniejsza od minimalnej, otrzymano: ${playersStr}`);
    }

    // Parsowanie czasu gry - bierzemy tylko pierwszą liczbę z zakresu (np. "30-60" -> 30)
    const durationStr = game.duration || "60";
    const durationMatch = durationStr.match(/^(\d+)(?:-\d+)?/);
    if (!durationMatch) {
      throw new Error(`Nieprawidłowy format czasu gry: ${durationStr}`);
    }
    const duration = parseInt(durationMatch[1]);

    if (isNaN(duration) || duration <= 0) {
      throw new Error(`Czas gry musi być większy od 0, otrzymano: ${durationStr}`);
    }

    // Sprawdzenie złożoności
    const complexity = typeof game.complexity === "number" ? game.complexity : 1;
    if (complexity < 1 || complexity > 5) {
      throw new Error(`Złożoność musi być w zakresie 1-5, otrzymano: ${complexity}`);
    }

    const { data: newGame, error: insertError } = await this.db
      .from("board_games")
      .insert({
        title: game.title,
        complexity: Math.max(1, Math.min(5, complexity)), // Upewnij się, że complexity jest w zakresie 1-5
        min_players: min,
        max_players: max,
        duration: duration,
        description: game.description || "",
        created_by: user.id,
      })
      .select("id")
      .single();

    if (insertError || !newGame) {
      throw new Error(`Błąd podczas dodawania gry: ${insertError?.message}`);
    }

    return newGame.id;
  }

  async addToFavorites(userId: string, gameId: string, notes = "") {
    const { error } = await this.db.from("favorite_games").insert({
      user_id: userId,
      game_id: gameId,
      notes,
      added_at: new Date().toISOString(),
      created_by: userId,
    });

    if (error) {
      throw new Error(`Błąd podczas dodawania do ulubionych: ${error.message}`);
    }

    return true;
  }

  async removeFromFavorites(userId: string, gameId: string) {
    const { error } = await this.db.from("favorite_games").delete().match({ user_id: userId, game_id: gameId });

    if (error) {
      throw new Error(`Błąd podczas usuwania z ulubionych: ${error.message}`);
    }

    return true;
  }

  async getGameByTitle(title: string) {
    const { data, error } = await this.db.from("board_games").select("id").eq("title", title).single();

    if (error) {
      throw new Error(`Błąd podczas wyszukiwania gry: ${error.message}`);
    }

    if (!data) {
      throw new Error("Nie znaleziono gry");
    }

    return data;
  }

  async addGamesFromRecommendationsBatch(games: GameRecommendationItem[]) {
    if (!games.length) return [];

    const {
      data: { user },
    } = await this.db.auth.getUser();

    if (!user) {
      throw new Error("Użytkownik nie jest zalogowany");
    }

    // Pobierz tylko tytuły gier, które już istnieją w bazie
    const { data: existingTitles } = await this.db
      .from("board_games")
      .select("title")
      .in(
        "title",
        games.map((g) => g.title)
      );

    const existingTitlesSet = new Set(existingTitles?.map((g) => g.title) || []);

    // Filtruj tylko nowe gry, których jeszcze nie ma w bazie
    const newGames = games.filter((game) => !existingTitlesSet.has(game.title));

    if (!newGames.length) return [];

    // Przygotuj dane do zbiorowego insertu z walidacją
    const gamesToInsert = [];
    const invalidGames = [];

    for (const game of newGames) {
      try {
        // Parsowanie i walidacja liczby graczy
        const playersStr = game.players || "2-4";
        const [minPlayersStr, maxPlayersStr] = playersStr.split("-");
        const min = parseInt(minPlayersStr);
        const max = maxPlayersStr ? parseInt(maxPlayersStr) : min;

        // Upewnij się, że liczby są prawidłowe i min_players > 0
        if (isNaN(min) || min <= 0) {
          invalidGames.push({
            title: game.title,
            reason: `Minimalna liczba graczy musi być większa od 0, otrzymano: ${playersStr}`,
          });
          continue;
        }

        // WAŻNA ZMIANA: Constraint w bazie wymaga max_players >= min_players, a nie max_players > min_players
        if (isNaN(max) || max < min) {
          invalidGames.push({
            title: game.title,
            reason: `Maksymalna liczba graczy nie może być mniejsza od minimalnej, otrzymano: ${playersStr}`,
          });
          continue;
        }

        // Parsowanie czasu gry - bierzemy tylko pierwszą liczbę z zakresu (np. "30-60" -> 30)
        const durationStr = game.duration || "60";
        const durationMatch = durationStr.match(/^(\d+)(?:-\d+)?/);
        if (!durationMatch) {
          invalidGames.push({ title: game.title, reason: `Nieprawidłowy format czasu gry: ${durationStr}` });
          continue;
        }
        const duration = parseInt(durationMatch[1]);

        if (isNaN(duration) || duration <= 0) {
          invalidGames.push({ title: game.title, reason: `Czas gry musi być większy od 0, otrzymano: ${durationStr}` });
          continue;
        }

        // Sprawdzenie złożoności
        const complexity = typeof game.complexity === "number" ? game.complexity : 1;
        if (complexity < 1 || complexity > 5) {
          invalidGames.push({
            title: game.title,
            reason: `Złożoność musi być w zakresie 1-5, otrzymano: ${complexity}`,
          });
          continue;
        }

        // Walidacja przeszła pomyślnie
        gamesToInsert.push({
          title: game.title,
          complexity: Math.max(1, Math.min(5, complexity)), // Upewnij się, że complexity jest w zakresie 1-5
          min_players: min,
          max_players: max,
          duration: duration,
          description: game.description || "",
          created_by: user.id,
        });
      } catch (error) {
        invalidGames.push({
          title: game.title || "Nieznana gra",
          reason: `Błąd przetwarzania: ${error instanceof Error ? error.message : "Nieznany błąd"}`,
        });
      }
    }

    // Jeśli nie ma prawidłowych gier do dodania
    if (gamesToInsert.length === 0) {
      if (invalidGames.length > 0) {
        console.warn(`Nie można dodać żadnej gry. Problemy: ${JSON.stringify(invalidGames)}`);
        return [];
      }
      return [];
    }

    // Logowanie informacji dla celów debugowania
    console.log(
      `Dodawanie ${gamesToInsert.length} gier do bazy danych. Pominięto ${invalidGames.length} gier z powodu błędów walidacji.`
    );
    if (invalidGames.length > 0) {
      console.warn("Pominięte gry:", invalidGames);
    }

    try {
      // Wykonaj zbiorowy insert z obsługą błędów
      const { data: insertedGames, error: insertError } = await this.db
        .from("board_games")
        .insert(gamesToInsert)
        .select("id, title");

      if (insertError) {
        console.error("Błąd podczas zbiorowego dodawania gier:", insertError.message);
        console.error("Problematyczne dane:", JSON.stringify(gamesToInsert, null, 2));

        // Wykonaj insert pojedynczo, aby znaleźć problematyczne rekordy
        let successfulInserts: { id: string; title: string }[] = [];
        for (const game of gamesToInsert) {
          try {
            const { data: singleInsert, error: singleError } = await this.db
              .from("board_games")
              .insert(game)
              .select("id, title");

            if (singleInsert) {
              successfulInserts = [...successfulInserts, ...singleInsert];
            } else if (singleError) {
              console.error(`Błąd dodawania gry "${game.title}":`, singleError.message);
            }
          } catch (err) {
            console.error(`Wyjątek podczas dodawania gry "${game.title}":`, err);
          }
        }

        return successfulInserts;
      }

      return insertedGames || [];
    } catch (error) {
      console.error("Szczegóły błędu podczas dodawania gier:", error);
      return [];
    }
  }
}
