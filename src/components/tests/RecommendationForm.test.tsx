import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import RecommendationForm from '../RecommendationForm';
import type { GameDescriptionCommand } from '@/types';

describe('RecommendationForm', () => {
  const mockOnSubmit = vi.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renderuje formularz poprawnie', () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    expect(screen.getByText('Znajdź idealną grę planszową')).toBeInTheDocument();
    expect(screen.getByLabelText(/Opis sytuacji/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Liczba graczy/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferowany czas gry/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Poziom złożoności/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Typy gier/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generuj rekomendacje/i })).toBeInTheDocument();
  });

  it('pokazuje błąd walidacji gdy opis jest za krótki', async () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    const submitButton = screen.getByRole('button', { name: /Generuj rekomendacje/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Opis musi mieć co najmniej 200 znaków/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('pokazuje przycisk ładowania podczas przesyłania formularza', () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    expect(screen.getByRole('button', { name: /Generowanie rekomendacji/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generowanie rekomendacji/i })).toBeDisabled();
  });

  it('wysyła formularz z poprawnymi danymi po walidacji', async () => {
    const user = userEvent.setup();
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);
    
    // Wprowadź wystarczająco długi opis
    const descriptionInput = screen.getByLabelText(/Opis sytuacji/i);
    await user.type(descriptionInput, 'a'.repeat(200));
    
    // Wybierz typy gier
    const typeSelector = screen.getByLabelText(/Typy gier/i);
    await user.click(typeSelector);
    
    // Kliknij przycisk submit
    const submitButton = screen.getByRole('button', { name: /Generuj rekomendacje/i });
    await user.click(submitButton);
    
    // Sprawdź, czy onSubmit został wywołany z poprawnymi danymi
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submitData = mockOnSubmit.mock.calls[0][0] as GameDescriptionCommand;
      expect(submitData.description.length).toBeGreaterThanOrEqual(200);
      expect(submitData.players).toBeDefined();
      expect(submitData.duration).toBeDefined();
      expect(submitData.complexity).toBeDefined();
      expect(submitData.types).toBeDefined();
    });
  });
}); 