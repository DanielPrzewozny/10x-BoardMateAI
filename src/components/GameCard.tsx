import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, BarChart3, Heart, Loader2 } from "lucide-react";
import type { BoardGameDTO } from "@/types";
import { supabaseClient } from "@/db/supabase.client";
import { useToast } from "@/components/ui/use-toast";

interface GameCardProps {
  game: BoardGameDTO;
  isLoggedIn: boolean;
}

export default function GameCard({ game, isLoggedIn }: GameCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    <Card
      className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg group"
      data-testid={`game-card-${game.id}`}
    >
      <a href={`/games/${game.id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-muted flex items-center justify-center">
          <span className="text-muted-foreground">Podgląd gry</span>
        </div>

        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold line-clamp-2 mb-2" data-testid="game-title">
            {game.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{game.description || "Brak opisu"}</p>
        </CardContent>
      </a>

      <CardFooter className="border-t pt-3 pb-4 flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1" title="Liczba graczy" data-testid="player-count">
          <Users className="h-4 w-4" />
          <span>
            {game.min_players}-{game.max_players}
          </span>
        </div>

        <div className="flex items-center gap-1" title="Czas rozgrywki" data-testid="game-duration">
          <Clock className="h-4 w-4" />
          <span>{game.duration} min</span>
        </div>

        <div className="flex items-center gap-1" title="Poziom złożoności" data-testid="game-complexity">
          <BarChart3 className="h-4 w-4" />
          <span>{game.complexity || "?"}</span>
        </div>
      </CardFooter>

      <CardFooter className="pt-0 pb-4 flex gap-2">
        <Button asChild variant="outline" className="flex-1" data-testid="game-details-button">
          <a href={`/games/${game.id}`}>Zobacz szczegóły</a>
        </Button>

        <Button
          variant="secondary"
          size="icon"
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          onClick={handleAddToFavorites}
          disabled={isLoading}
          title="Dodaj do ulubionych"
          data-testid="add-to-favorites-button"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
