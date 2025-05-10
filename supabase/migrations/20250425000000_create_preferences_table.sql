-- Tworzenie tabeli preferences (jeśli nie istnieje)
CREATE TABLE IF NOT EXISTS public.preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    min_players INTEGER NOT NULL DEFAULT 2,
    max_players INTEGER NOT NULL DEFAULT 4,
    preferred_duration INTEGER NOT NULL DEFAULT 60,
    preferred_types TEXT[] DEFAULT '{}',
    complexity_level INTEGER NOT NULL DEFAULT 2 CHECK (complexity_level BETWEEN 1 AND 5),
    budget NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT preferences_min_max_players_check CHECK (max_players >= min_players)
);

-- Dodanie komentarzy dla dokumentacji
COMMENT ON TABLE public.preferences IS 'Preferencje użytkowników dotyczące gier planszowych';
COMMENT ON COLUMN public.preferences.profile_id IS 'Relacja 1:1 z profilem użytkownika';
COMMENT ON COLUMN public.preferences.user_id IS 'Relacja 1:1 z użytkownikiem auth.users';
COMMENT ON COLUMN public.preferences.min_players IS 'Minimalna liczba graczy';
COMMENT ON COLUMN public.preferences.max_players IS 'Maksymalna liczba graczy';
COMMENT ON COLUMN public.preferences.preferred_duration IS 'Preferowany czas gry w minutach';
COMMENT ON COLUMN public.preferences.preferred_types IS 'Preferowane typy gier';
COMMENT ON COLUMN public.preferences.complexity_level IS 'Preferowany poziom złożoności gry (1-5)';
COMMENT ON COLUMN public.preferences.budget IS 'Maksymalny budżet na zakup gry';

-- Dodanie indeksów dla optymalizacji wyszukiwania
CREATE INDEX IF NOT EXISTS preferences_profile_id_idx ON public.preferences(profile_id);
CREATE INDEX IF NOT EXISTS preferences_user_id_idx ON public.preferences(user_id);

-- Włączenie Row Level Security (RLS)
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;

-- Dodanie polityk RLS
CREATE POLICY "Użytkownicy mogą odczytywać tylko swoje preferencje"
ON public.preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą dodawać tylko swoje preferencje"
ON public.preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą aktualizować tylko swoje preferencje"
ON public.preferences FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą usuwać tylko swoje preferencje"
ON public.preferences FOR DELETE
USING (auth.uid() = user_id);

