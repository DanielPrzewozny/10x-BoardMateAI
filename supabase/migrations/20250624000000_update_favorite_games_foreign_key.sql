-- Aktualizacja klucza obcego w tabeli favorite_games
-- Usunięcie istniejącego ograniczenia
ALTER TABLE public.favorite_games DROP CONSTRAINT IF EXISTS favorite_games_user_id_fkey;

-- Dodanie nowego ograniczenia
ALTER TABLE public.favorite_games 
  ADD CONSTRAINT favorite_games_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Dodatkowo upewniamy się, że indeks istnieje dla poprawy wydajności
DROP INDEX IF EXISTS favorite_games_user_id_idx;
CREATE INDEX favorite_games_user_id_idx ON public.favorite_games(user_id);

COMMENT ON CONSTRAINT favorite_games_user_id_fkey ON public.favorite_games IS 'Klucz obcy łączący favorite_games z tabelą auth.users zamiast profiles'; 