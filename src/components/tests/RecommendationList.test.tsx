import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationList from '../RecommendationList';
import type { GameRecommendation, GameRecommendationsResponseDto } from '@/types';

describe('RecommendationList', () => {
  const mockRecommendations: GameRecommendationsResponseDto = {
    recommendations: [
      {
        title: "Catan",
        players: "3-4",
        duration: "60-120",
        complexity: 3,
        types: ['strategy', 'family'],
        description: 'Testowy opis rekomendacji dla gry planszowej.',
        imageUrl: ""
      },
      {
        title: "Ticket to Ride",
        players: "2-5",
        duration: "30-60",
        complexity: 2,
        types: ['family', 'railway'],
        description: 'Druga testowa rekomendacja gry planszowej.',
        imageUrl: ""
      },
      {
        title: "Scythe",
        players: "1-5",
        duration: "90-120",
        complexity: 4,
        types: ['strategy', 'war'],
        description: 'Trzecia testowa rekomendacja gry planszowej.',
        imageUrl: ""
      }
    ]
  };

  it('renderuje stan ładowania', () => {
    render(<RecommendationList recommendations={null} isLoading={true} error={null} />);
    
    expect(screen.getByText('Generowanie rekomendacji...')).toBeInTheDocument();
    expect(screen.getByText('To może potrwać kilka sekund')).toBeInTheDocument();
  });

  it('renderuje stan błędu', () => {
    const errorMessage = 'Wystąpił błąd podczas generowania rekomendacji';
    render(<RecommendationList recommendations={null} isLoading={false} error={errorMessage} />);
    
    expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renderuje rekomendacje gdy dane są dostępne', () => {
    render(<RecommendationList recommendations={mockRecommendations} isLoading={false} error={null} />);
    
    expect(screen.getByText('Twoje rekomendacje')).toBeInTheDocument();
    
    // Sprawdź, czy wyświetlone są tytuły wszystkich gier
    mockRecommendations.recommendations.forEach(recommendation => {
      expect(screen.getByText(recommendation.title)).toBeInTheDocument();
    });
    
    // Sprawdź elementy pierwszej rekomendacji
    expect(screen.getByText('Catan')).toBeInTheDocument();
    expect(screen.getByText('3-4')).toBeInTheDocument(); // players
    
    // Sprawdź, czy każda rekomendacja ma przycisk do zapisania
    expect(screen.getAllByRole('button', { name: /Zapisz rekomendację/i })).toHaveLength(mockRecommendations.recommendations.length);
  });

  it('nie renderuje niczego gdy nie ma rekomendacji, nie ma błędu i nie ładuje', () => {
    const { container } = render(<RecommendationList recommendations={null} isLoading={false} error={null} />);
    
    // Container powinien być pusty (poza divem renderującym komponent)
    expect(container.firstChild).toBeNull();
  });
}); 