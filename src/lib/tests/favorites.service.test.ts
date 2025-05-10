import { describe, it, expect, vi, beforeEach } from "vitest";
import { FavoritesService, type FavoriteGameInput, type PaginationParams } from "../services/favorites.service";
import { z } from "zod";

// Mock supabaseClient
vi.mock("@/db/supabase.client", () => {
  const mockSupabaseClient = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    returns: vi.fn(),
    single: vi.fn(),
  };

  return {
    supabaseClient: mockSupabaseClient,
    DEFAULT_USER_ID: "default-user-id",
  };
});

// Dane testowe
const userId = "test-user-id";
const gameId = "12345678-1234-1234-1234-123456789012";
const notes = "Testowe notatki do ulubionej gry";

describe("FavoritesService", () => {
  let favoritesService: FavoritesService;
  let mockSupabase: any;

  beforeEach(() => {
    // Resetowanie mocków przed każdym testem
    vi.clearAllMocks();

    // Tworzenie mocka dla Supabase
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      returns: vi.fn(),
      single: vi.fn(),
    };

    // Inicjalizacja serwisu z mockiem
    favoritesService = new FavoritesService(mockSupabase as any);
  });

  describe("getFavorites", () => {
    const paginationParams: PaginationParams = {
      page: 1,
      limit: 10,
      sort: "added_at",
    };

    it("powinno zwrócić listę ulubionych gier z poprawną paginacją", async () => {
      // Arrange
      const mockItems = [
        { id: "1", game_id: gameId, notes: "Test 1", game: { title: "Gra 1" } },
        { id: "2", game_id: gameId, notes: "Test 2", game: { title: "Gra 2" } },
      ];

      mockSupabase.returns.mockResolvedValue({
        data: mockItems,
        count: 2,
        error: null,
      });

      // Act
      const result = await favoritesService.getFavorites(userId, paginationParams);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("favorite_games");
      expect(mockSupabase.select).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
      expect(mockSupabase.order).toHaveBeenCalledWith("added_at", { ascending: false });
      expect(result).toEqual({
        items: mockItems,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it("powinno obsłużyć sortowanie po tytule", async () => {
      // Arrange
      const params = { ...paginationParams, sort: "title" as const };
      mockSupabase.returns.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      // Act
      await favoritesService.getFavorites(userId, params);

      // Assert
      expect(mockSupabase.order).toHaveBeenCalledWith("game(title)", { ascending: true });
    });

    it("powinno obsłużyć drugą stronę paginacji", async () => {
      // Arrange
      const params = { ...paginationParams, page: 2 };
      mockSupabase.returns.mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      });

      // Act
      await favoritesService.getFavorites(userId, params);

      // Assert
      expect(mockSupabase.range).toHaveBeenCalledWith(10, 19);
    });

    it("powinno rzucić wyjątek przy błędzie bazy danych", async () => {
      // Arrange
      mockSupabase.returns.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      // Act & Assert
      await expect(favoritesService.getFavorites(userId, paginationParams)).rejects.toThrow(
        "Błąd podczas pobierania ulubionych gier: Database error"
      );
    });
  });

  describe("addFavorite", () => {
    const favoriteGameInput: FavoriteGameInput = {
      gameId,
      notes,
    };

    it("powinno dodać grę do ulubionych", async () => {
      // Arrange
      const mockGame = { is_archived: false };
      const mockInsertedData = {
        id: "1",
        game_id: gameId,
        added_at: "2023-01-01T00:00:00Z",
        notes,
        game: {
          id: gameId,
          title: "Test Game",
          complexity: 3,
          min_players: 2,
          max_players: 4,
          duration: 60,
          description: "Test description",
          is_archived: false,
        },
      };

      // Mockowanie zapytań dla istniejącej gry
      mockSupabase.single.mockImplementation(function (this: any) {
        // Sprawdzamy, jakiego zapytania dotyczy ten mock
        const fromCalls = mockSupabase.from.mock.calls;
        const lastFrom = fromCalls[fromCalls.length - 1][0];

        if (lastFrom === "board_games") {
          return Promise.resolve({ data: mockGame, error: null });
        } else if (lastFrom === "favorite_games" && mockSupabase.select.mock.calls.length === 2) {
          // Sprawdzenie czy gra jest już w ulubionych
          return Promise.resolve({ data: null, error: null });
        } else {
          // Insert zwraca dane
          return Promise.resolve({ data: mockInsertedData, error: null });
        }
      });

      // Act
      const result = await favoritesService.addFavorite(userId, favoriteGameInput);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("board_games");
      expect(mockSupabase.from).toHaveBeenCalledWith("favorite_games");
      expect(mockSupabase.eq).toHaveBeenCalledWith("id", gameId);
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        game_id: gameId,
        notes,
        added_at: expect.any(String),
      });
      expect(result).toEqual(mockInsertedData);
    });

    it("powinno rzucić wyjątek jeśli gra nie istnieje", async () => {
      // Arrange
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Not found" },
      });

      // Act & Assert
      await expect(favoritesService.addFavorite(userId, favoriteGameInput)).rejects.toThrow("Nie znaleziono gry");
    });

    it("powinno rzucić wyjątek jeśli gra jest zarchiwizowana", async () => {
      // Arrange
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_archived: true },
        error: null,
      });

      // Act & Assert
      await expect(favoritesService.addFavorite(userId, favoriteGameInput)).rejects.toThrow(
        "Nie można dodać zarchiwizowanej gry do ulubionych"
      );
    });

    it("powinno rzucić wyjątek jeśli gra jest już w ulubionych", async () => {
      // Arrange
      // Pierwsze zapytanie - sprawdzenie czy gra istnieje
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_archived: false },
        error: null,
      });

      // Drugie zapytanie - sprawdzenie czy gra jest już w ulubionych
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: "1" },
        error: null,
      });

      // Act & Assert
      await expect(favoritesService.addFavorite(userId, favoriteGameInput)).rejects.toThrow(
        "Gra jest już w ulubionych"
      );
    });

    it("powinno rzucić wyjątek przy błędzie wstawiania do bazy danych", async () => {
      // Arrange
      // Pierwsze zapytanie - sprawdzenie czy gra istnieje
      mockSupabase.single.mockResolvedValueOnce({
        data: { is_archived: false },
        error: null,
      });

      // Drugie zapytanie - sprawdzenie czy gra jest już w ulubionych
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Trzecie zapytanie - wstawianie rekordu
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { message: "Insert error" },
      });

      // Act & Assert
      await expect(favoritesService.addFavorite(userId, favoriteGameInput)).rejects.toThrow(
        "Błąd podczas dodawania gry do ulubionych: Insert error"
      );
    });
  });

  describe("removeFavorite", () => {
    it("powinno usunąć grę z ulubionych", async () => {
      // Arrange
      mockSupabase.delete.mockReturnThis();
      mockSupabase.eq.mockReturnThis();

      // Act
      await favoritesService.removeFavorite(userId, gameId);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("favorite_games");
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase.eq).toHaveBeenCalledWith("game_id", gameId);
    });

    it("powinno rzucić wyjątek przy błędzie usuwania z bazy danych", async () => {
      // Arrange
      mockSupabase.delete.mockReturnThis();
      mockSupabase.eq.mockReturnThis();

      // Zamiast mockowania metody eq, mockujemy ostateczny wynik
      const mockDeleteResult = { error: { message: "Delete error" } };
      // Po wywołaniu eq drugi raz, zwracamy wynik z błędem
      let eqCallCount = 0;
      mockSupabase.eq.mockImplementation(() => {
        eqCallCount++;
        if (eqCallCount >= 2) {
          return mockDeleteResult;
        }
        return mockSupabase;
      });

      // Act & Assert
      await expect(favoritesService.removeFavorite(userId, gameId)).rejects.toThrow(
        "Błąd podczas usuwania gry z ulubionych: Delete error"
      );
    });
  });
});
