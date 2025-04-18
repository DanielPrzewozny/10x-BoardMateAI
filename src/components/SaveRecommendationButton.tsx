import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BookmarkIcon } from "lucide-react";
import { toast } from "sonner";
import { useGameHistory } from '@/hooks/useGameHistory';
import type { GameDescriptionResponseDto } from '@/types';

interface SaveRecommendationButtonProps {
  recommendation: GameDescriptionResponseDto;
}

export default function SaveRecommendationButton({ recommendation }: SaveRecommendationButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const { saveToHistory, isLoading, error } = useGameHistory();

  const handleSave = async () => {
    if (isSaved) return;
    
    const success = await saveToHistory(recommendation);
    
    if (success) {
      setIsSaved(true);
      toast.success("Zapisano rekomendację", {
        description: "Rekomendacja została zapisana w Twojej historii.",
      });
    } else {
      toast.error("Błąd podczas zapisywania", {
        description: error || "Nie udało się zapisać rekomendacji. Spróbuj ponownie później.",
      });
    }
  };

  return (
    <Button
      variant={isSaved ? "outline" : "default"}
      size="sm"
      onClick={handleSave}
      disabled={isLoading || isSaved}
      className="gap-2"
    >
      <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-primary' : ''}`} />
      {isLoading ? 'Zapisywanie...' : isSaved ? 'Zapisano' : 'Zapisz rekomendację'}
    </Button>
  );
} 