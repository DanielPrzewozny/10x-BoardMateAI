-- Dodanie kolumny title do tabeli game_history
ALTER TABLE public.game_history
ADD COLUMN IF NOT EXISTS title VARCHAR(100);

-- Utworzenie indeksu dla poprawy wydajności wyszukiwania
CREATE INDEX IF NOT EXISTS game_history_title_idx ON public.game_history(title);

-- Aktualizacja istniejących rekordów na podstawie powiązania z tabelą board_games
UPDATE game_history AS gh
SET title = bg.title
FROM board_games AS bg
WHERE gh.game_id = bg.id
AND gh.title IS NULL;

COMMENT ON COLUMN public.game_history.title IS 'Tytuł gry, ułatwia wyszukiwanie i identyfikację rekordu historii bez konieczności łączenia z tabelą board_games'; 