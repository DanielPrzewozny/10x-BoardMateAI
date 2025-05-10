-- Migracja łagodząca ograniczenia w tabeli board_games dla lepszej obsługi rekomendacji AI

-- 1. Zmodyfikuj ograniczenie dla complexity - domyślnie 3, jeśli NULL
ALTER TABLE public.board_games 
    DROP CONSTRAINT IF EXISTS board_games_complexity_check,
    ALTER COLUMN complexity SET DEFAULT 3,
    ADD CONSTRAINT board_games_complexity_check CHECK (
        complexity IS NULL OR (complexity BETWEEN 1 AND 5)
    );

-- 2. Zmodyfikuj ograniczenie dla min_players - domyślnie 2, jeśli NULL
ALTER TABLE public.board_games
    DROP CONSTRAINT IF EXISTS board_games_min_players_check,
    ALTER COLUMN min_players SET DEFAULT 2,
    ADD CONSTRAINT board_games_min_players_check CHECK (
        min_players IS NULL OR min_players > 0
    );

-- 3. Zmodyfikuj ograniczenie dla max_players - domyślnie 4, jeśli NULL
ALTER TABLE public.board_games
    DROP CONSTRAINT IF EXISTS board_games_max_players_check,
    ALTER COLUMN max_players SET DEFAULT 4,
    ADD CONSTRAINT board_games_max_players_check CHECK (
        max_players IS NULL OR max_players >= COALESCE(min_players, 1)
    );

-- 4. Zmodyfikuj ograniczenie dla duration - domyślnie 60, jeśli NULL
ALTER TABLE public.board_games
    ALTER COLUMN duration DROP NOT NULL,
    ALTER COLUMN duration SET DEFAULT 60;

-- 5. Dodaj trigger, który zapewni, że wszystkie niejawne NULL będą zastąpione wartościami domyślnymi
CREATE OR REPLACE FUNCTION public.handle_board_games_defaults()
RETURNS TRIGGER AS $$
BEGIN
    NEW.complexity := COALESCE(NEW.complexity, 3);
    NEW.min_players := COALESCE(NEW.min_players, 2);
    NEW.max_players := COALESCE(NEW.max_players, GREATEST(4, NEW.min_players));
    NEW.duration := COALESCE(NEW.duration, 60);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_board_games_defaults ON public.board_games;
CREATE TRIGGER ensure_board_games_defaults
    BEFORE INSERT OR UPDATE ON public.board_games
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_board_games_defaults();

-- 6. Aktualizuj istniejące NULL na wartości domyślne (jeśli takie istnieją)
UPDATE public.board_games SET complexity = 3 WHERE complexity IS NULL;
UPDATE public.board_games SET min_players = 2 WHERE min_players IS NULL;
UPDATE public.board_games SET max_players = 4 WHERE max_players IS NULL;
UPDATE public.board_games SET duration = 60 WHERE duration IS NULL;
