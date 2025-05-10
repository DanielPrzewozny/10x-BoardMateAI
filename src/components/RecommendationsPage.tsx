import { useState, useEffect } from "react";
import RecommendationForm from "./RecommendationForm";
import RecommendationList from "./RecommendationList";
import { Toaster } from "./ui/sonner";
import { useRecommendations } from "@/hooks/useRecommendations";
import type { GameDescriptionCommand } from "@/types";

export default function RecommendationsPage() {
  const { recommendations, isLoading, error, getRecommendations } = useRecommendations();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  // Sprawdzenie, czy dane są prawidłowe
  const hasValidRecommendations =
    recommendations &&
    recommendations.recommendations &&
    Array.isArray(recommendations.recommendations) &&
    recommendations.recommendations.length > 0;

  const handleSubmit = async (data: GameDescriptionCommand) => {
    setIsFormSubmitted(true);
    await getRecommendations(data);
  };

  // Dodajemy efekt debugujący
  useEffect(() => {
    if (recommendations) {
      console.log("Otrzymane rekomendacje:", recommendations);
    }
  }, [recommendations]);

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Rekomendacje gier planszowych</h1>

        <div className="max-w-4xl mx-auto space-y-4" data-test-id="recommendations-container">
          {!isFormSubmitted || error ? <RecommendationForm onSubmit={handleSubmit} isLoading={isLoading} /> : null}

          {(isLoading || hasValidRecommendations || error) && (
            <RecommendationList recommendations={recommendations} isLoading={isLoading} error={error} />
          )}

          {isFormSubmitted && recommendations && !isLoading && (
            <div className="w-full max-w-2xl mx-auto mt-4 text-center">
              <button
                onClick={() => setIsFormSubmitted(false)}
                className="text-primary underline underline-offset-4 hover:text-primary/80"
                data-test-id="back-to-form-button"
              >
                Wróć do formularza
              </button>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
