-- Dodanie nowych kolumn do tabeli game_recommendations
ALTER TABLE public.game_recommendations
ADD COLUMN IF NOT EXISTS complexity numeric,
ADD COLUMN IF NOT EXISTS players text,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS types text[];

-- Aktualizacja comment dla tabeli
COMMENT ON TABLE public.game_recommendations IS 'Tabela przechowująca rekomendacje gier planszowych dla użytkowników z dodatkowymi informacjami';

-- Komentarze dla nowych kolumn
COMMENT ON COLUMN public.game_recommendations.complexity IS 'Poziom złożoności gry w skali 1-5';
COMMENT ON COLUMN public.game_recommendations.players IS 'Liczba graczy jako tekst, np. "2-4"';
COMMENT ON COLUMN public.game_recommendations.duration IS 'Czas gry jako tekst, np. "30-60 min"';
COMMENT ON COLUMN public.game_recommendations.types IS 'Tablica zawierająca typy/kategorie gry'; 