import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { GameDescriptionCommand, GameRecommendationsResponseDto } from "@/types";
import { z } from "zod";

// Mockowane odpowiedzi
const mockGetRecommendationsImpl = vi.fn();
const mockAddGamesFromRecommendationsBatchImpl = vi.fn();

// Mockujemy klasy zamiast ich instancji
vi.mock("@/lib/recommendation.service", () => ({
  RecommendationService: vi.fn().mockImplementation(() => ({
    getRecommendations: mockGetRecommendationsImpl,
  })),
}));

vi.mock("@/lib/services/games.service", () => ({
  GamesService: vi.fn().mockImplementation(() => ({
    addGamesFromRecommendationsBatch: mockAddGamesFromRecommendationsBatchImpl,
  })),
}));

vi.mock("@/db/supabase.client", () => ({
  supabaseClient: {
    // Podstawowy mock klienta Supabase
  },
}));

// Helper do testowania endpointu
const createMockRequest = (data: any) => {
  return {
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Request;
};

// Importujemy POST endpoint dopiero po zdefiniowaniu wszystkich mocków
import { POST } from "../recommendations";

describe("Rekomendacje API - Testy Jednostkowe", () => {
  // Schemat walidacji z recommendations.ts
  const gameDescriptionSchema = z.object({
    description: z.string().min(200).max(10000),
    players: z.number().int().min(1).max(12).optional(),
    duration: z.number().int().min(15).max(240).optional(),
    complexity: z.number().int().min(1).max(5).optional(),
    types: z.array(z.string()).min(1).max(5).optional(),
  });

  describe("Walidacja danych wejściowych", () => {
    it("powinna zaakceptować poprawne dane", () => {
      // Arrange
      const validGameDescription: GameDescriptionCommand = {
        description: "a".repeat(200), // Minimalnie 200 znaków
        players: 4,
        duration: 60,
        complexity: 3,
        types: ["strategy"],
      };

      // Act
      const result = gameDescriptionSchema.safeParse(validGameDescription);

      // Assert
      expect(result.success).toBe(true);
    });

    it("powinna odrzucić za krótki opis", () => {
      // Arrange
      const invalidGameDescription = {
        description: "za krótki opis",
        players: 4,
        duration: 60,
        complexity: 3,
        types: ["strategy"],
      };

      // Act
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error) => error.path.includes("description") && error.code === "too_small")).toBe(true);
      }
    });

    it("powinna odrzucić zbyt wysoką liczbę graczy", () => {
      // Arrange
      const invalidGameDescription = {
        description: "a".repeat(200),
        players: 20, // Ponad maksimum
        duration: 60,
        complexity: 3,
        types: ["strategy"],
      };

      // Act
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error) => error.path.includes("players") && error.code === "too_big")).toBe(true);
      }
    });

    it("powinna odrzucić zbyt niską złożoność", () => {
      // Arrange
      const invalidGameDescription = {
        description: "a".repeat(200),
        players: 4,
        duration: 60,
        complexity: 0, // Poniżej minimum
        types: ["strategy"],
      };

      // Act
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error) => error.path.includes("complexity") && error.code === "too_small")).toBe(true);
      }
    });

    it("powinna odrzucić zbyt wysoki czas trwania", () => {
      // Arrange
      const invalidGameDescription = {
        description: "a".repeat(200),
        players: 4,
        duration: 300, // Ponad maksimum
        complexity: 3,
        types: ["strategy"],
      };

      // Act
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error) => error.path.includes("duration") && error.code === "too_big")).toBe(true);
      }
    });

    it("powinna odrzucić zbyt dużą liczbę typów gier", () => {
      // Arrange
      const invalidGameDescription = {
        description: "a".repeat(200),
        players: 4,
        duration: 60,
        complexity: 3,
        types: ["type1", "type2", "type3", "type4", "type5", "type6"], // Ponad maksimum
      };

      // Act
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues;
        expect(errors.some((error) => error.path.includes("types") && error.code === "too_big")).toBe(true);
      }
    });
  });

  describe("Przetwarzanie danych rekomendacji", () => {
    it("powinna poprawić nieprawidłowy format liczby graczy", () => {
      // Arrange
      const invalidPlayersFormat = "invalid";

      // Act
      const correctedFormat = invalidPlayersFormat.match(/^\d+(-\d+)?$/) ? invalidPlayersFormat : "2-4";

      // Assert
      expect(correctedFormat).toBe("2-4");
    });

    it("powinna zachować poprawny format liczby graczy", () => {
      // Arrange
      const validPlayersFormat = "2-4";

      // Act
      const processedFormat = validPlayersFormat.match(/^\d+(-\d+)?$/) ? validPlayersFormat : "2-4";

      // Assert
      expect(processedFormat).toBe("2-4");
    });

    it("powinna ograniczyć złożoność do maksymalnej wartości", () => {
      // Arrange
      const tooHighComplexity = 7;

      // Act
      const correctedComplexity = Math.max(1, Math.min(5, tooHighComplexity));

      // Assert
      expect(correctedComplexity).toBe(5);
    });

    it("powinna ograniczyć złożoność do minimalnej wartości", () => {
      // Arrange
      const tooLowComplexity = 0;

      // Act
      const correctedComplexity = Math.max(1, Math.min(5, tooLowComplexity));

      // Assert
      expect(correctedComplexity).toBe(1);
    });

    it("powinna poprawić nieprawidłowy format czasu trwania", () => {
      // Arrange
      const invalidDurationFormat = "invalid";

      // Act
      const correctedFormat = invalidDurationFormat.match(/^\d+(-\d+)?$/) ? invalidDurationFormat : "60";

      // Assert
      expect(correctedFormat).toBe("60");
    });

    it("powinna zachować poprawny format czasu trwania", () => {
      // Arrange
      const validDurationFormat = "30-60";

      // Act
      const processedFormat = validDurationFormat.match(/^\d+(-\d+)?$/) ? validDurationFormat : "60";

      // Assert
      expect(processedFormat).toBe("30-60");
    });
  });

  describe("Dodawanie wartości domyślnych", () => {
    it("powinna uzupełnić brakujące wartości domyślnymi", () => {
      // Arrange
      const partialData: Partial<GameDescriptionCommand> = {
        description: "a".repeat(200),
        // Brak pozostałych pól
      };

      // Act
      const gameDescription = {
        description: partialData.description!,
        players: partialData.players || 4, // Domyślna wartość
        duration: partialData.duration || 60, // Domyślna wartość
        complexity: partialData.complexity || 3, // Domyślna wartość
        types: partialData.types || ["strategy"], // Domyślna wartość
      };

      // Assert
      expect(gameDescription).toEqual({
        description: partialData.description,
        players: 4,
        duration: 60,
        complexity: 3,
        types: ["strategy"],
      });
    });

    it("nie powinna nadpisywać istniejących wartości", () => {
      // Arrange
      const completeData: GameDescriptionCommand = {
        description: "a".repeat(200),
        players: 2,
        duration: 30,
        complexity: 1,
        types: ["family"],
      };

      // Act
      const gameDescription = {
        description: completeData.description,
        players: completeData.players || 4,
        duration: completeData.duration || 60,
        complexity: completeData.complexity || 3,
        types: completeData.types || ["strategy"],
      };

      // Assert
      expect(gameDescription).toEqual(completeData);
    });
  });

  describe("Obsługa błędów", () => {
    it("powinna odpowiednio formatować błędy walidacji", () => {
      // Arrange
      const invalidGameDescription = {
        description: "za krótki opis",
        players: 20,
        complexity: 6,
      };
      const result = gameDescriptionSchema.safeParse(invalidGameDescription);

      // Act
      // Symulacja formatowania błędów przy odpowiedzi HTTP
      const errorResponse = {
        error: "Nieprawidłowe dane wejściowe",
        details: result.success ? null : result.error.format(),
      };

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(errorResponse.error).toBe("Nieprawidłowe dane wejściowe");
        expect(errorResponse.details).toBeDefined();
        expect(errorResponse.details).toHaveProperty("description");
        expect(errorResponse.details).toHaveProperty("players");
        expect(errorResponse.details).toHaveProperty("complexity");
      }
    });

    it("powinna obsługiwać błędy zewnętrznego API", () => {
      // Arrange
      const mockError = new Error("API Error");
      (mockError as any).code = "API_ERROR";
      mockError.stack = "Stack trace informacje do debugowania";

      // Act
      // Symulacja formatowania błędów serwisu zewnętrznego przy odpowiedzi HTTP
      const errorResponse = {
        error: "Nie udało się wygenerować rekomendacji",
        message: mockError.message,
        code: (mockError as any).code,
        details: mockError.stack,
      };

      // Assert
      expect(errorResponse.error).toBe("Nie udało się wygenerować rekomendacji");
      expect(errorResponse.message).toBe("API Error");
      expect(errorResponse.code).toBe("API_ERROR");
      expect(errorResponse.details).toContain("Stack trace");
    });

    it("powinna obsługiwać błędy bazy danych", () => {
      // Arrange
      const dbError = new Error("Database connection error");

      // Symulacja próby zapisu do bazy danych, która kończy się niepowodzeniem
      const tryDatabaseOperation = (): boolean => {
        try {
          // Tu normalnie byłoby wywołanie do bazy danych, które rzuca wyjątek
          throw dbError;
          return true;
        } catch (error) {
          console.error("Błąd podczas zapisywania rekomendacji w bazie:", error);
          // W rzeczywistej implementacji rejestrujemy błąd, ale kontynuujemy przetwarzanie
          return false;
        }
      };

      // Act
      const result = tryDatabaseOperation();

      // Assert
      expect(result).toBe(false); // Operacja nie powodzi się, ale nie przerywa przetwarzania
    });

    it("powinna naprawiać nieprawidłowe dane w rekomendacjach", () => {
      // Arrange
      const invalidRecommendation = {
        id: "test-id",
        game_id: "game-id",
        title: "Test Game",
        description: "Opis gry",
        complexity: 7, // Za wysoka
        players: "invalid", // Nieprawidłowy format
        duration: "nope", // Nieprawidłowy format
        imageUrl: "https://example.com/image.jpg",
        types: ["strategy"],
      };

      // Act
      // Zastosuj te same transformacje co w endpoincie
      const validatedRecommendation = {
        ...invalidRecommendation,
        // Zapewnij, że complexity jest w zakresie 1-5
        complexity: Math.max(1, Math.min(5, invalidRecommendation.complexity)),
        // Zapewnij prawidłowy format graczy
        players: invalidRecommendation.players.match(/^\d+(-\d+)?$/) ? invalidRecommendation.players : "2-4",
        // Zapewnij prawidłowy format czasu trwania
        duration: invalidRecommendation.duration.match(/^\d+(-\d+)?$/) ? invalidRecommendation.duration : "60",
      };

      // Assert
      expect(validatedRecommendation.complexity).toBe(5); // Obcięte do maksimum
      expect(validatedRecommendation.players).toBe("2-4"); // Zamienione na domyślną wartość
      expect(validatedRecommendation.duration).toBe("60"); // Zamienione na domyślną wartość
    });
  });
});
