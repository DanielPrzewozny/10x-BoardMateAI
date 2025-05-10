import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGameRecommendations } from "@/hooks/useGameRecommendations";
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  BrainCircuit as BrainIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
  CheckIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { GameRecommendationDTO } from "@/types";

export default function SavedRecommendations() {
  const { recommendations, isLoading, error, getRecommendations } = useGameRecommendations();

  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg font-medium">Wczytywanie zapisanych rekomendacji...</p>
              <p className="text-sm text-muted-foreground mt-2">To może potrwać chwilę</p>
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
            <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Twoje zapisane rekomendacje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-lg font-medium">Nie masz jeszcze zapisanych rekomendacji</p>
              <p className="text-sm text-muted-foreground mt-2">
                Wygeneruj nowe rekomendacje i zapisz te, które Cię zainteresują
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Twoje zapisane rekomendacje</CardTitle>
          <CardDescription>Lista gier, które Cię zainteresowały</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {recommendations.map((recommendation) => (
              <SavedRecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Możesz używać zapisanych rekomendacji jako listy gier do sprawdzenia w przyszłości.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

interface SavedRecommendationCardProps {
  recommendation: GameRecommendationDTO & {
    game?: {
      id?: string;
      title?: string;
      complexity?: number;
      min_players?: number;
      max_players?: number;
      duration?: number;
    };
    complexity?: number;
    players?: string;
    duration?: string;
    types?: string[];
  };
}

function SavedRecommendationCard({ recommendation }: SavedRecommendationCardProps) {
  const { removeRecommendation } = useGameRecommendations();
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const gameDetails = recommendation.game || {};
  const title = recommendation.title || gameDetails.title || "Nieznana gra";

  // Ustalamy priorytet dla wartości - najpierw z rekomendacji, potem z powiązanej gry
  const complexity =
    recommendation.complexity !== undefined && recommendation.complexity !== null
      ? recommendation.complexity
      : gameDetails.complexity;

  const players =
    recommendation.players ||
    (gameDetails.min_players && gameDetails.max_players
      ? gameDetails.min_players === gameDetails.max_players
        ? `${gameDetails.min_players}`
        : `${gameDetails.min_players}-${gameDetails.max_players}`
      : undefined);

  const duration = recommendation.duration || (gameDetails.duration ? `${gameDetails.duration}` : undefined);

  const handleDelete = async () => {
    if (!isDeleting) {
      setIsDeleting(true);
      return;
    }

    try {
      setLoading(true);
      console.log("Próbuję usunąć rekomendację:", recommendation.id);
      const success = await removeRecommendation(recommendation.id);

      if (success) {
        setDeleted(true);
        toast.success("Rekomendacja usunięta", {
          description: "Rekomendacja została pomyślnie usunięta.",
        });
      } else {
        setIsDeleting(false);
        toast.error("Błąd podczas usuwania", {
          description: "Nie udało się usunąć rekomendacji. Spróbuj ponownie później.",
        });
      }
    } catch (error) {
      console.error("Błąd podczas usuwania rekomendacji:", error);
      setIsDeleting(false);
      toast.error("Błąd podczas usuwania", {
        description: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
  };

  // Jeśli rekomendacja została usunięta, nie renderujemy jej wcale
  if (deleted) {
    return null;
  }

  return (
    <Card className="hover:bg-muted/20 transition-colors">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{title}</h3>

              <div className="flex space-x-1">
                {isDeleting ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      disabled={loading}
                      onClick={handleDelete}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" disabled={loading} onClick={cancelDelete}>
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={handleDelete}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {recommendation.notes && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recommendation.notes}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-2">
              {complexity && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BrainIcon className="h-3 w-3" />
                  Złożoność: {complexity}/5
                </Badge>
              )}

              {players && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <UsersIcon className="h-3 w-3" />
                  {players} graczy
                </Badge>
              )}

              {duration && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <ClockIcon className="h-3 w-3" />
                  {duration} min
                </Badge>
              )}

              {Array.isArray(recommendation.types) && recommendation.types.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  {recommendation.types.slice(0, 2).join(", ")}
                  {recommendation.types.length > 2 ? "..." : ""}
                </Badge>
              )}

              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Zapisano: {recommendation.played_at ? formatDate(recommendation.played_at) : ""}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
