import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FavoriteGames from "../FavoriteGames";
import { act } from "react-dom/test-utils";

// Mock dla fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock dla window.location
const mockLocation = {
  href: "",
};
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

// Mock dla useToast
vi.mock("@/components/ui/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("FavoriteGames", () => {
  const mockFavorites = {
    items: [
      {
        id: "1",
        game_id: "game1",
        added_at: "2024-01-01",
        notes: "Test note",
        game: {
          id: "game1",
          title: "Test Game 1",
          complexity: 2,
          min_players: 2,
          max_players: 4,
          duration: 60,
          description: "Test description 1",
          is_archived: false,
        },
      },
      {
        id: "2",
        game_id: "game2",
        added_at: "2024-01-02",
        notes: "",
        game: {
          id: "game2",
          title: "Test Game 2",
          complexity: 3,
          min_players: 3,
          max_players: 3,
          duration: 90,
          description: "Test description 2",
          is_archived: false,
        },
      },
    ],
    total: 2,
    page: 1,
    limit: 9,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "";
    mockFetch.mockReset();
  });

  it("powinno wyrenderować stan ładowania", async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  it("powinno wyrenderować komunikat o braku ulubionych gier", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: [], total: 0, page: 1, limit: 9 }),
    });

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByTestId("no-favorites-message")).toBeInTheDocument();
    });
    expect(screen.getByText("Przeglądaj katalog gier")).toBeInTheDocument();
  });

  it("powinno wyrenderować listę ulubionych gier", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockFavorites,
    });

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByTestId("favorite-games-list")).toBeInTheDocument();
    });

    expect(screen.getByText("Test Game 1")).toBeInTheDocument();
    expect(screen.getByText("Test Game 2")).toBeInTheDocument();
    expect(screen.getByText("2-4 graczy • 60 min")).toBeInTheDocument();
    expect(screen.getByText("3 graczy • 90 min")).toBeInTheDocument();
  });

  it("powinno obsłużyć błąd podczas ładowania", async () => {
    const errorMessage = "Test error";
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByText(/Wystąpił błąd podczas pobierania ulubionych gier/)).toBeInTheDocument();
    });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("powinno przekierować do logowania przy błędzie 401", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(window.location.href).toBe("/auth/login");
    });
  });

  it("powinno usunąć grę z ulubionych", async () => {
    // Pierwsze wywołanie fetch - pobranie listy
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockFavorites,
    });

    // Drugie wywołanie fetch - usunięcie gry
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    // Trzecie wywołanie fetch - odświeżenie listy
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockFavorites,
        items: mockFavorites.items.slice(1),
        total: 1,
      }),
    });

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByTestId("favorite-games-list")).toBeInTheDocument();
    });

    const removeButton = screen.getAllByTestId("remove-from-favorites-button")[0];
    await act(async () => {
      fireEvent.click(removeButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/favorites/game1", {
        method: "DELETE",
      });
    });
  });

  it("powinno obsłużyć paginację", async () => {
    // Pierwsze wywołanie fetch - strona 1
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockFavorites,
        total: 20, // Więcej stron
      }),
    });

    render(<FavoriteGames />);

    await waitFor(() => {
      expect(screen.getByTestId("favorite-games-list")).toBeInTheDocument();
    });

    // Przygotuj mock dla drugiej strony
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ...mockFavorites,
        items: [
          {
            id: "3",
            game_id: "game3",
            added_at: "2024-01-03",
            notes: "",
            game: {
              id: "game3",
              title: "Test Game 3",
              complexity: 1,
              min_players: 2,
              max_players: 6,
              duration: 45,
              description: "Test description 3",
              is_archived: false,
            },
          },
        ],
        page: 2,
        total: 20,
      }),
    });

    // Kliknij przycisk następnej strony
    const nextButton = screen.getByLabelText("Przejdź do następnej strony");
    await act(async () => {
      fireEvent.click(nextButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });
  });
});
