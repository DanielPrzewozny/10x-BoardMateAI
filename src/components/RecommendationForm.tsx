import { useState } from 'react';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import GameTypeSelector from '@/components/GameTypeSelector';
import type { GameDescriptionCommand } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "sonner";

interface RecommendationFormProps {
  onSubmit: (data: GameDescriptionCommand) => void;
  isLoading: boolean;
}

// Schemat walidacji zgodny z API
const gameDescriptionSchema = z.object({
  description: z.string()
    .min(200, 'Opis musi mieć co najmniej 200 znaków')
    .max(10000, 'Opis nie może przekraczać 10000 znaków'),
  players: z.number().int().min(1).max(12).optional(),
  duration: z.number().int().min(15).max(240).optional(),
  complexity: z.number().int().min(1).max(5).optional(),
  types: z.array(z.string()).min(1, 'Wybierz co najmniej jeden typ gry').max(5, 'Możesz wybrać maksymalnie 5 typów gier').optional(),
});

export default function RecommendationForm({ onSubmit, isLoading }: RecommendationFormProps) {
  const [formData, setFormData] = useState<GameDescriptionCommand>({
    description: '',
    players: 4,
    duration: 60,
    complexity: 3,
    types: ['strategy', 'family']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { isAuthenticated } = useAuth();

  // Obsługa zmiany pól formularza
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | number[] | string[],
    field: keyof GameDescriptionCommand
  ) => {
    if (!isAuthenticated) {
      toast.error("Wymagane logowanie", {
        description: "Musisz być zalogowany, aby korzystać z generatora rekomendacji.",
      });
      return;
    }

    if (Array.isArray(e)) {
      if (typeof e[0] === 'number') {
        setFormData(prev => ({ ...prev, [field]: e[0] }));
      } else {
        setFormData(prev => ({ ...prev, [field]: e }));
      }
    } else {
      const value = e.target.value;
      setFormData(prev => ({ 
        ...prev, 
        [field]: field === 'players' || field === 'duration' || field === 'complexity'
          ? Number(value)
          : value
      }));
    }

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Walidacja formularza przed wysłaniem
  const validateForm = () => {
    try {
      gameDescriptionSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Obsługa wysłania formularza
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Wymagane logowanie", {
        description: "Musisz być zalogowany, aby korzystać z generatora rekomendacji.",
      });
      return;
    }

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Znajdź idealną grę planszową</CardTitle>
        <CardDescription>
          {isAuthenticated 
            ? "Opisz swoją grupę i preferencje, a my zaproponujemy gry dopasowane do Twoich potrzeb."
            : "Zaloguj się, aby korzystać z generatora rekomendacji gier planszowych."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Opis sytuacji</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange(e, 'description')}
              placeholder="Opisz swoją grupę, okazję, preferencje dotyczące gier, tematy które was interesują..."
              className="min-h-32"
              disabled={!isAuthenticated}
            />
            {errors.description && (
              <p className="text-sm font-medium text-destructive">{errors.description}</p>
            )}
            <div className="text-xs text-muted-foreground">
              {formData.description.length} znaków (minimum 200)
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="players">Liczba graczy: {formData.players}</Label>
              <Slider
                id="players"
                value={[formData.players ?? 4]}
                min={1}
                max={12}
                step={1}
                onValueChange={(value) => handleChange(value, 'players')}
                disabled={!isAuthenticated}
              />
              {errors.players && (
                <p className="text-sm font-medium text-destructive">{errors.players}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complexity">Poziom złożoności: {formData.complexity}/5</Label>
              <Slider
                id="complexity"
                value={[formData.complexity ?? 3]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => handleChange(value, 'complexity')}
                disabled={!isAuthenticated}
              />
              {errors.complexity && (
                <p className="text-sm font-medium text-destructive">{errors.complexity}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Preferowany czas gry: {formData.duration} minut</Label>
            <Slider
              id="duration"
              value={[formData.duration ?? 60]}
              min={15}
              max={240}
              step={15}
              onValueChange={(value) => handleChange(value, 'duration')}
              disabled={!isAuthenticated}
            />
            {errors.duration && (
              <p className="text-sm font-medium text-destructive">{errors.duration}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="types">Typy gier</Label>
            <GameTypeSelector 
              value={formData.types || []}
              onChange={(value) => handleChange(value, 'types')}
              error={errors.types}
              disabled={!isAuthenticated}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading || !isAuthenticated}
          className="w-full"
        >
          {!isAuthenticated 
            ? 'Zaloguj się, aby generować rekomendacje' 
            : isLoading 
              ? 'Generowanie rekomendacji...' 
              : 'Generuj rekomendacje'}
        </Button>
      </CardFooter>
    </Card>
  );
} 