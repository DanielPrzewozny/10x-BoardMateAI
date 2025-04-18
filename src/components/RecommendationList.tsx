import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SaveRecommendationButton from '@/components/SaveRecommendationButton';
import type { GameDescriptionResponseDto } from '@/types';

interface RecommendationListProps {
  recommendations: GameDescriptionResponseDto | null;
  isLoading: boolean;
  error: string | null;
}

export default function RecommendationList({ recommendations, isLoading, error }: RecommendationListProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
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
      <div className="w-full max-w-2xl mx-auto mt-8">
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

  if (!recommendations) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Twoje rekomendacje</CardTitle>
            <CardDescription>Na podstawie Twoich preferencji</CardDescription>
          </div>
          <SaveRecommendationButton recommendation={recommendations} />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/40 rounded-lg">
                <h3 className="text-sm font-medium">Liczba graczy</h3>
                <p className="text-2xl font-bold">{recommendations.players}</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <h3 className="text-sm font-medium">Czas gry</h3>
                <p className="text-2xl font-bold">{recommendations.duration} min</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <h3 className="text-sm font-medium">Poziom złożoności</h3>
                <p className="text-2xl font-bold">{recommendations.complexity}/5</p>
              </div>
              <div className="p-3 bg-muted/40 rounded-lg">
                <h3 className="text-sm font-medium">Typy gier</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {recommendations.types.map((type) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t mt-4">
              <h3 className="text-sm font-medium mb-2">Opis rekomendacji</h3>
              <div className="whitespace-pre-line text-sm p-3 bg-muted/20 rounded-lg">
                {recommendations.description}
              </div>
            </div>
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