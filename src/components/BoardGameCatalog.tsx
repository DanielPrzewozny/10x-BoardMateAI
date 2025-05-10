import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaginationSimple } from "@/components/ui/pagination";
import type { BoardGameDTO, BoardGameListDTO } from "@/types";
import { Heart, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "./ui/use-toast";
import { supabaseClient } from "@/db/supabase.client";

export default function BoardGameCatalog() {
  const [games, setGames] = useState<BoardGameDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    perPage: 9,
    totalPages: 0,
  });
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const fetchWithRetry = async () => {
      await fetchGames(pagination.page);
    };

    fetchWithRetry();

    // Sprawdź, czy użytkownik jest zalogowany
    const checkAuth = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        setIsLoggedIn(!!data.session);
      } catch (err) {
        console.error("Błąd podczas sprawdzania sesji:", err);
      }
    };

    checkAuth();
  }, [pagination.page]);

  const fetchGames = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Dodanie parametru cache-busting do URL, żeby uniknąć problemów z cachem
      const cacheBuster = new Date().getTime();
      const response = await fetch(`/api/board-games?page=${page}&perPage=${pagination.perPage}&_=${cacheBuster}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache, no-store",
        },
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania danych: ${response.status} ${response.statusText}`);
      }

      const data: BoardGameListDTO = await response.json();
      setGames(data.games);
      setPagination({
        total: data.pagination.total,
        page: data.pagination.page,
        perPage: pagination.perPage,
        totalPages: Math.ceil(data.pagination.total / pagination.perPage),
      });
      // Zresetuj licznik prób po udanym żądaniu
      setRetryCount(0);
    } catch (err) {
      console.error("Błąd podczas pobierania gier:", err);

      // Logika ponowienia próby w przypadku błędu Failed to fetch
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd";

      if (errorMessage.includes("Failed to fetch") && retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
        // Opóźnienie przed ponowną próbą
        setTimeout(
          () => {
            fetchGames(page);
          },
          1000 * (retryCount + 1)
        ); // Zwiększamy czas oczekiwania z każdą próbą
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchGames(pagination.page);
  };

  if (isLoading && games.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg font-medium">Wczytywanie gier...</p>
              <p className="text-sm text-muted-foreground mt-2">To może potrwać kilka sekund</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Wystąpił błąd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleRetry}>
              Spróbuj ponownie
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Card data-testid="game-catalog">
        <CardHeader>
          <CardTitle>Katalog gier planszowych</CardTitle>
          <CardDescription>Przeglądaj dostępne gry planszowe</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && games.length > 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {games.length > 0 ? (
              games.map((game) => (
                <BoardGameCard
                  key={game.id}
                  game={game}
                  isLoggedIn={true} //TODO: zmienić na isLoggedIn
                  data-testid={`game-card-${game.id}`}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">Brak gier do wyświetlenia</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {pagination.totalPages > 1 && (
            <PaginationSimple
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

interface BoardGameCardProps {
  game: BoardGameDTO;
  isLoggedIn: boolean;
}

function BoardGameCard({ game, isLoggedIn }: BoardGameCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Sprawdź, czy gra jest w ulubionych
    if (isLoggedIn) {
      checkIfFavorite();
    }
  }, [isLoggedIn, game.id]);

  const checkIfFavorite = async () => {
    try {
      const response = await fetch(`/api/favorites/check?gameId=${game.id}`);

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error("Błąd podczas sprawdzania statusu ulubionej gry:", error);
    }
  };

  const handleAddToFavorites = async (e: React.MouseEvent) => {
    e.preventDefault(); // Powstrzymaj nawigację do strony szczegółów
    e.stopPropagation(); // Upewnij się, że zdarzenie nie propaguje dalej

    if (!isLoggedIn) {
      // Przekieruj do strony logowania
      window.location.href = "/auth/login";
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: game.id,
          notes: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Wystąpił błąd podczas dodawania do ulubionych");
      }

      setIsFavorite(true);

      toast({
        title: "Dodano do ulubionych",
        description: `Gra "${game.title}" została dodana do ulubionych.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nieznany błąd podczas dodawania do ulubionych",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col" data-testid={`game-card-${game.id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl" data-testid="game-title">
          {game.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-muted/40 rounded-lg">
              <h3 className="text-xs font-medium">Liczba graczy</h3>
              <p className="text-base font-bold">
                {game.min_players}
                {game.max_players && game.min_players !== game.max_players ? `-${game.max_players}` : ""}
              </p>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg">
              <h3 className="text-xs font-medium">Czas gry</h3>
              <p className="text-base font-bold">{game.duration} min</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium mb-1">Złożoność</h3>
            <div className="flex items-center">
              <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${((game.complexity || 1) / 5) * 100}%` }}
                />
              </div>
              <span className="ml-2 text-xs font-medium">{game.complexity || "?"}/5</span>
            </div>
          </div>

          {game.description && (
            <div>
              <h3 className="text-xs font-medium mb-1">Opis</h3>
              <div className="text-xs p-2 bg-muted/20 rounded-lg max-h-36 overflow-y-auto">{game.description}</div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <a href={`/games/${game.id}`} className="text-primary text-sm hover:underline">
          Zobacz szczegóły
        </a>

        <Button
          variant="secondary"
          size="icon"
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          onClick={handleAddToFavorites}
          disabled={isLoading}
          title={isFavorite ? "W ulubionych" : "Dodaj do ulubionych"}
          data-testid="add-to-favorites-button"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isFavorite ? (
            <Heart className="h-4 w-4 fill-current" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
