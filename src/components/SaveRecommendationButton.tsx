import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { useGameRecommendations } from "@/hooks/useGameRecommendations";
import { useAuth } from "@/hooks/useAuth";
import type { GameRecommendationItem } from "@/types";

interface SaveRecommendationButtonProps {
  recommendation: GameRecommendationItem;
}

export default function SaveRecommendationButton({ recommendation }: SaveRecommendationButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { addRecommendation, isLoading, error } = useGameRecommendations();
  const { isAuthenticated } = useAuth();

  const handleSave = async () => {
    if (isSaved) return;

    if (!isAuthenticated) {
      toast.error("Wymagane logowanie", {
        description: "Musisz być zalogowany, aby zapisać rekomendację.",
      });
      return;
    }

    try {
      // Sprawdzamy czy recommendation ma wymagane pola
      if (!recommendation.title) {
        throw new Error("Brak tytułu gry");
      }

      //if (!(recommendation.game_id || recommendation.id)) {
      //  throw new Error("Brak identyfikatora gry");
      //}

      console.log("Próba zapisania rekomendacji:", {
        title: recommendation.title,
        id: recommendation.id,
        game_id: recommendation.game_id,
        complexity: recommendation.complexity,
        players: recommendation.players,
        duration: recommendation.duration,
        types: recommendation.types,
      });

      // Upewnij się, że dane mają odpowiedni format
      const validatedRecommendation: GameRecommendationItem = {
        ...recommendation,
        id: recommendation.id || "",
        game_id: recommendation.game_id || recommendation.id || "",
        complexity: recommendation.complexity || 3,
        types: Array.isArray(recommendation.types) ? recommendation.types : [],
        players: recommendation.players || "2-4",
        duration: recommendation.duration || "60",
        description: recommendation.description || "",
        imageUrl: recommendation.imageUrl || "",
      };

      // Przekazujemy cały obiekt rekomendacji
      const success = await addRecommendation(validatedRecommendation);

      if (success) {
        setIsSaved(true);
        toast.success("Zapisano rekomendację", {
          description: "Rekomendacja została zapisana. Możesz ją znaleźć w zakładce 'Zapisane rekomendacje'.",
        });
      } else {
        toast.error("Błąd podczas zapisywania", {
          description: error || "Nie udało się zapisać rekomendacji. Spróbuj ponownie później.",
        });
      }
    } catch (err) {
      console.error("Błąd podczas przygotowania rekomendacji:", err);
      toast.error("Błąd rekomendacji", {
        description:
          err instanceof Error ? err.message : "Rekomendacja nie zawiera wymaganych danych. Spróbuj ponownie.",
      });
    }
  };

  // Nie renderuj przycisku jeśli użytkownik nie jest zalogowany
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      variant={isSaved ? "outline" : "default"}
      size="sm"
      onClick={handleSave}
      disabled={isLoading || isSaved}
      className="gap-2"
    >
      <BookmarkIcon className={`h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
      {isLoading ? "Zapisywanie..." : isSaved ? "Zapisano" : "Zapisz rekomendację"}
    </Button>
  );
}
