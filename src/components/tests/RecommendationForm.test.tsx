import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import RecommendationForm from "../RecommendationForm";
import type { GameDescriptionCommand } from "@/types";
import { useState } from "react";

// Mock dla hooka useAuth
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

// Mock dla komponentu GameTypeSelector
vi.mock("@/components/GameTypeSelector", () => ({
  default: ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button onClick={() => setIsOpen(!isOpen)} role="combobox" aria-expanded={isOpen}>
          {value.length > 0
            ? `Wybrano ${value.length} ${value.length === 1 ? "typ" : value.length < 5 ? "typy" : "typów"}`
            : "Wybierz typy gier"}
        </button>
        {isOpen && (
          <div role="listbox">
            <div role="option" aria-selected={value.includes("strategy")} onClick={() => onChange(["strategy"])}>
              Strategiczna
            </div>
          </div>
        )}
      </div>
    );
  },
}));

describe("RecommendationForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renderuje formularz poprawnie", () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);

    expect(screen.getByText("Znajdź idealną grę planszową")).toBeInTheDocument();
    expect(screen.getByLabelText(/Opis sytuacji/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generuj rekomendacje/i })).toBeInTheDocument();
  });

  it("pokazuje błąd walidacji gdy opis jest za krótki", async () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Wprowadź zbyt krótki opis (mniej niż 200 znaków)
    const descriptionInput = screen.getByLabelText(/Opis sytuacji/i);
    await userEvent.type(descriptionInput, "To jest zbyt krótki opis.");

    const submitButton = screen.getByRole("button", { name: /Generuj rekomendacje/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Opis musi mieć co najmniej 200 znaków/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("pokazuje przycisk ładowania podczas przesyłania formularza", () => {
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByRole("button", { name: /Generowanie rekomendacji/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generowanie rekomendacji/i })).toBeDisabled();
  });

  it("wysyła formularz z poprawnymi danymi po walidacji", async () => {
    const user = userEvent.setup();
    render(<RecommendationForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Wprowadź wystarczająco długi opis
    const descriptionInput = screen.getByLabelText(/Opis sytuacji/i);
    await user.type(descriptionInput, "a".repeat(200));

    // Wybierz typy gier
    const typeSelector = screen.getByRole("combobox");
    await user.click(typeSelector);

    // Wybierz typ gry
    const strategyOption = screen.getByText("Strategiczna");
    await user.click(strategyOption);

    // Wyślij formularz
    const form = screen.getByRole("form");
    await user.type(form, "{Enter}");

    // Sprawdź, czy onSubmit został wywołany z poprawnymi danymi
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const submitData = mockOnSubmit.mock.calls[0][0] as GameDescriptionCommand;
      expect(submitData.description.length).toBeGreaterThanOrEqual(200);
      expect(submitData.players).toBeDefined();
      expect(submitData.duration).toBeDefined();
      expect(submitData.complexity).toBeDefined();
      expect(submitData.types).toContain("strategy");
    });
  });
});
