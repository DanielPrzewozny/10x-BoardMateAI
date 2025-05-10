-- Dodanie kolumny email do tabeli profiles (jeśli nie istnieje)

DO $$
BEGIN
    -- Sprawdzamy, czy kolumna email już istnieje
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        -- Dodanie kolumny email
        ALTER TABLE profiles
        ADD COLUMN email VARCHAR(255);
        
        -- Komentarz do kolumny
        COMMENT ON COLUMN profiles.email IS 'Adres email użytkownika';
        
        -- Aktualizacja danych (opcjonalnie - kopiowanie emaili z tabeli auth.users)
        UPDATE profiles 
        SET email = u.email
        FROM auth.users u
        WHERE profiles.id = u.id;
        
        -- Dodanie NOT NULL constraint po uzupełnieniu danych
        ALTER TABLE profiles 
        ALTER COLUMN email SET NOT NULL;
    ELSE
        RAISE NOTICE 'Kolumna email już istnieje w tabeli profiles.';
    END IF;
END
$$; 