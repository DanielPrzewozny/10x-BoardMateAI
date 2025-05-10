"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationButton,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FavoriteGame {
  id: string;
  game_id: string;
  added_at: string;
  notes: string;
  game: {
    id: string;
    title: string;
    complexity: number;
    min_players: number;
    max_players: number;
    duration: number;
    description: string;
    is_archived: boolean;
  };
}

interface PaginatedFavorites {
  items: FavoriteGame[];
  total: number;
  page: number;
  limit: number;
}

export default function FavoriteGames() {
  const [favorites, setFavorites] = useState<PaginatedFavorites | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const limit = 9; // Liczba gier na stronę

  const fetchFavorites = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites?page=${page}&limit=${limit}&sort=added_at`);

      if (response.status === 401) {
        // Przekieruj do strony logowania, gdy użytkownik nie jest zalogowany
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`Błąd ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nieznany błąd podczas pobierania ulubionych gier");
      toast({
        variant: "destructive",
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nieznany błąd podczas pobierania ulubionych gier",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (gameId: string) => {
    try {
      const response = await fetch(`/api/favorites/${gameId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        // Przekieruj do strony logowania, gdy użytkownik nie jest zalogowany
        window.location.href = "/auth/login";
        return;
      }

      if (!response.ok) {
        throw new Error(`Błąd ${response.status}: ${response.statusText}`);
      }

      toast({
        title: "Usunięto z ulubionych",
        description: "Gra została usunięta z Twoich ulubionych",
      });

      // Odświeżamy listę
      fetchFavorites(currentPage);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: err instanceof Error ? err.message : "Nieznany błąd podczas usuwania gry z ulubionych",
      });
    }
  };

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage]);

  const getPaginationRange = () => {
    if (!favorites) return [];

    const totalPages = Math.ceil(favorites.total / limit);
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Skomplikowana paginacja dla większej liczby stron
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" data-testid="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-red-600 mb-4">Wystąpił błąd podczas pobierania ulubionych gier</p>
        <p className="text-gray-600">{error}</p>
        <Button onClick={() => fetchFavorites(currentPage)} className="mt-4">
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!favorites || favorites.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl font-semibold mb-4" data-testid="no-favorites-message">
          Nie masz jeszcze żadnych ulubionych gier
        </p>
        <p className="text-gray-600 mb-6">Dodaj gry do ulubionych, aby mieć do nich szybki dostęp</p>
        <Button asChild>
          <a href="/games">Przeglądaj katalog gier</a>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Twoje ulubione gry</h2>
        <p className="text-gray-600">Lista wszystkich gier, które dodałeś do ulubionych</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="favorite-games-list">
        {favorites.items.map((item) => (
          <Card key={item.id} className="overflow-hidden flex flex-col" data-testid={`favorite-game-${item.game_id}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl truncate" title={item.game.title} data-testid="favorite-game-title">
                {item.game.title}
              </CardTitle>
              <CardDescription data-testid="favorite-game-details">
                {item.game.min_players === item.game.max_players
                  ? `${item.game.min_players} graczy`
                  : `${item.game.min_players}-${item.game.max_players} graczy`}
                {" • "}
                {item.game.duration} min
              </CardDescription>
            </CardHeader>

            <CardContent className="py-2 flex-grow">
              <p className="line-clamp-3 text-sm text-gray-600" data-testid="favorite-game-description">
                {item.game.description}
              </p>
              {item.notes && (
                <div className="mt-3 pt-3 border-t border-gray-100" data-testid="favorite-game-notes">
                  <p className="text-xs text-gray-500 mb-1">Twoje notatki:</p>
                  <p className="text-sm italic">{item.notes}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between pt-2">
              <Button variant="outline" asChild data-testid="game-details-button">
                <a href={`/games/${item.game_id}`}>Szczegóły</a>
              </Button>
              <Button
                variant="ghost"
                onClick={() => handleRemoveFromFavorites(item.game_id)}
                className="hover:text-red-600 hover:bg-red-50"
                data-testid="remove-from-favorites-button"
              >
                Usuń z ulubionych
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Paginacja */}
      {favorites.total > limit && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {getPaginationRange().map((pageNum, index) => (
              <PaginationItem key={index}>
                {pageNum === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationButton
                    onClick={(e) => {
                      e.preventDefault();
                      if (typeof pageNum === "number") {
                        setCurrentPage(pageNum);
                      }
                    }}
                    isActive={currentPage === pageNum}
                    size="sm"
                  >
                    {pageNum}
                  </PaginationButton>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  const totalPages = Math.ceil((favorites?.total || 0) / limit);
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage >= Math.ceil((favorites?.total || 0) / limit) ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
