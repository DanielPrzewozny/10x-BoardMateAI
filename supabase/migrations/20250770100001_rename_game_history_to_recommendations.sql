-- Zmiana nazwy tabeli z game_history na game_recommendations
ALTER TABLE public.game_history 
RENAME TO game_recommendations;

-- Aktualizacja nazwy indeksu
ALTER INDEX IF EXISTS game_history_title_idx
RENAME TO game_recommendations_title_idx;

-- Aktualizacja nazwy ograniczenia klucza obcego
ALTER TABLE public.game_recommendations
RENAME CONSTRAINT game_history_game_id_fkey TO game_recommendations_game_id_fkey;

-- Aktualizacja nazwy sekwencji (jeśli istnieje)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'game_history_id_seq') THEN
    ALTER SEQUENCE game_history_id_seq RENAME TO game_recommendations_id_seq;
  END IF;
END
$$;

-- Dodanie komentarza do tabeli
COMMENT ON TABLE public.game_recommendations IS 'Tabela przechowująca rekomendacje gier planszowych dla użytkowników'; 