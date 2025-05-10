import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SaveRecommendationButton from "@/components/SaveRecommendationButton";
import type { GameRecommendationItem, GameRecommendationsResponseDto } from "@/types";

interface RecommendationListProps {
  recommendations: GameRecommendationsResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

export default function RecommendationList({ recommendations, isLoading, error }: RecommendationListProps) {
  // Logowanie do debugowania
  console.log("RecommendationList - props:", { hasRecommendations: !!recommendations, isLoading, error });
  if (recommendations) {
    console.log(
      "Struktura recommendations:",
      recommendations.recommendations
        ? `Tablica długości ${recommendations.recommendations.length}`
        : "Brak tablicy recommendations"
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-lg font-medium">Generowanie rekomendacji...</p>
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
            <CardTitle className="text-destructive">Wystąpił błąd</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sprawdzenie czy recommendations i recommendations.recommendations istnieją
  if (
    !recommendations ||
    !recommendations.recommendations ||
    !Array.isArray(recommendations.recommendations) ||
    recommendations.recommendations.length === 0
  ) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Brak rekomendacji</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">Nie znaleziono rekomendacji pasujących do podanych kryteriów.</p>
            <p className="text-center text-sm text-muted-foreground mt-2">Spróbuj zmienić parametry wyszukiwania.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Twoje rekomendacje</CardTitle>
          <CardDescription>Na podstawie Twoich preferencji</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-test-id="recommendations-grid">
            {recommendations.recommendations.map((recommendation, index) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Rekomendacje są generowane na podstawie Twoich preferencji i mogą się zmieniać w czasie.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: GameRecommendationItem;
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <Card className="h-full flex flex-col" data-test-id={`recommendation-card-${recommendation.title}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl" data-test-id="recommendation-title">
          {recommendation.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-muted/40 rounded-lg">
              <h3 className="text-xs font-medium">Liczba graczy</h3>
              <p className="text-base font-bold">{recommendation.players}</p>
            </div>
            <div className="p-2 bg-muted/40 rounded-lg">
              <h3 className="text-xs font-medium">Czas gry</h3>
              <p className="text-base font-bold">{recommendation.duration} min</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium mb-1">Złożoność</h3>
            <div className="flex items-center">
              <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(recommendation.complexity / 5) * 100}%` }}
                />
              </div>
              <span className="ml-2 text-xs font-medium">{recommendation.complexity}/5</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium mb-1">Typy gier</h3>
            <div className="flex flex-wrap gap-1">
              {recommendation.types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium mb-1">Opis</h3>
            <div className="text-xs p-2 bg-muted/20 rounded-lg max-h-36 overflow-y-auto">
              {recommendation.description}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-end">
        <SaveRecommendationButton recommendation={recommendation} />
      </CardFooter>
    </Card>
  );
}
