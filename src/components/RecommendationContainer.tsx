import { useState } from 'react';
import RecommendationForm from '@/components/RecommendationForm';
import RecommendationList from '@/components/RecommendationList';
import { useRecommendations } from '@/hooks/useRecommendations';
import type { GameDescriptionCommand } from '@/types';

export default function RecommendationContainer() {
  const { recommendations, isLoading, error, getRecommendations } = useRecommendations();
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const handleSubmit = async (data: GameDescriptionCommand) => {
    setIsFormSubmitted(true);
    await getRecommendations(data);
  };

  return (
    <div className="space-y-4">
      {!isFormSubmitted || error ? (
        <RecommendationForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      ) : null}

      {(isLoading || recommendations || error) && (
        <RecommendationList 
          recommendations={recommendations}
          isLoading={isLoading}
          error={error}
        />
      )}

      {isFormSubmitted && recommendations && !isLoading && (
        <div className="w-full max-w-2xl mx-auto mt-4 text-center">
          <button
            onClick={() => setIsFormSubmitted(false)}
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Wróć do formularza
          </button>
        </div>
      )}
    </div>
  );
} 