import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationList from '../RecommendationList';
import type { GameDescriptionResponseDto } from '@/types';

describe('RecommendationList', () => {
  const mockRecommendations: GameDescriptionResponseDto = {
    players: 4,
    duration: 60,
    complexity: 3,
    types: ['strategy', 'family'],
    description: 'Testowy opis rekomendacji dla gry planszowej.'
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
    expect(screen.getByText('Liczba graczy')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument(); // players
    expect(screen.getByText('60 min')).toBeInTheDocument(); // duration
    expect(screen.getByText('3/5')).toBeInTheDocument(); // complexity
    expect(screen.getByText('Typy gier')).toBeInTheDocument();
    
    // Sprawdź, czy wszystkie typy są wyświetlone jako odznaki
    mockRecommendations.types.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
    
    // Sprawdź, czy opis jest wyświetlony
    expect(screen.getByText(mockRecommendations.description)).toBeInTheDocument();
  });

  it('zawiera przycisk do zapisania rekomendacji', () => {
    render(<RecommendationList recommendations={mockRecommendations} isLoading={false} error={null} />);
    
    expect(screen.getByRole('button', { name: /Zapisz rekomendację/i })).toBeInTheDocument();
  });

  it('nie renderuje niczego gdy nie ma rekomendacji, nie ma błędu i nie ładuje', () => {
    const { container } = render(<RecommendationList recommendations={null} isLoading={false} error={null} />);
    
    // Container powinien być pusty (poza divem renderującym komponent)
    expect(container.firstChild).toBeNull();
  });
}); 