import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RecommendationList from "../RecommendationList";
import type { GameRecommendationItem, GameRecommendationsResponseDto } from "@/types";

// Mock dla komponentu SaveRecommendationButton
vi.mock("@/components/SaveRecommendationButton", () => ({
  default: ({ recommendation }: { recommendation: GameRecommendationItem }) => (
    <button onClick={() => {}}>Zapisz rekomendację: {recommendation.title}</button>
  ),
}));

describe("RecommendationList", () => {
  const mockRecommendations: GameRecommendationsResponseDto = {
    recommendations: [
      {
        id: "1",
        game_id: "game-1",
        title: "Catan",
        players: "3-4",
        duration: "60-120",
        complexity: 3,
        types: ["strategy", "family"],
        description: "Testowy opis rekomendacji dla gry planszowej.",
        imageUrl: "",
      },
      {
        id: "2",
        game_id: "game-2",
        title: "Ticket to Ride",
        players: "2-5",
        duration: "30-60",
        complexity: 2,
        types: ["family", "railway"],
        description: "Druga testowa rekomendacja gry planszowej.",
        imageUrl: "",
      },
      {
        id: "3",
        game_id: "game-3",
        title: "Scythe",
        players: "1-5",
        duration: "90-120",
        complexity: 4,
        types: ["strategy", "war"],
        description: "Trzecia testowa rekomendacja gry planszowej.",
        imageUrl: "",
      },
    ],
  };

  it("renderuje stan ładowania", () => {
    render(<RecommendationList recommendations={null} isLoading={true} error={null} />);

    expect(screen.getByText("Generowanie rekomendacji...")).toBeInTheDocument();
    expect(screen.getByText("To może potrwać kilka sekund")).toBeInTheDocument();
  });

  it("renderuje stan błędu", () => {
    const errorMessage = "Wystąpił błąd podczas generowania rekomendacji";
    render(<RecommendationList recommendations={null} isLoading={false} error={errorMessage} />);

    expect(screen.getByText("Wystąpił błąd")).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("renderuje rekomendacje gdy dane są dostępne", () => {
    render(<RecommendationList recommendations={mockRecommendations} isLoading={false} error={null} />);

    expect(screen.getByText("Twoje rekomendacje")).toBeInTheDocument();

    // Sprawdź, czy wyświetlone są tytuły wszystkich gier
    mockRecommendations.recommendations.forEach((recommendation) => {
      expect(screen.getByText(recommendation.title)).toBeInTheDocument();
      expect(screen.getByText(`Zapisz rekomendację: ${recommendation.title}`)).toBeInTheDocument();
    });

    // Sprawdź elementy pierwszej rekomendacji
    expect(screen.getByText("Catan")).toBeInTheDocument();
    expect(screen.getByText("3-4")).toBeInTheDocument(); // players

    // Sprawdź typy gier - używamy getAllByText, ponieważ niektóre typy mogą występować wielokrotnie
    expect(screen.getAllByText("strategy")).toHaveLength(2); // występuje w Catan i Scythe
    expect(screen.getAllByText("family")).toHaveLength(2); // występuje w Catan i Ticket to Ride
    expect(screen.getByText("railway")).toBeInTheDocument(); // występuje tylko w Ticket to Ride
    expect(screen.getByText("war")).toBeInTheDocument(); // występuje tylko w Scythe
  });

  it("renderuje komunikat o braku rekomendacji gdy nie ma rekomendacji", () => {
    render(<RecommendationList recommendations={null} isLoading={false} error={null} />);

    expect(screen.getByText("Brak rekomendacji")).toBeInTheDocument();
    expect(screen.getByText("Nie znaleziono rekomendacji pasujących do podanych kryteriów.")).toBeInTheDocument();
    expect(screen.getByText("Spróbuj zmienić parametry wyszukiwania.")).toBeInTheDocument();
  });

  it("renderuje komunikat o braku rekomendacji gdy tablica rekomendacji jest pusta", () => {
    render(<RecommendationList recommendations={{ recommendations: [] }} isLoading={false} error={null} />);

    expect(screen.getByText("Brak rekomendacji")).toBeInTheDocument();
    expect(screen.getByText("Nie znaleziono rekomendacji pasujących do podanych kryteriów.")).toBeInTheDocument();
    expect(screen.getByText("Spróbuj zmienić parametry wyszukiwania.")).toBeInTheDocument();
  });
});
