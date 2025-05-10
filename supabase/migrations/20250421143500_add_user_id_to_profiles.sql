-- Dodanie kolumny UserId do tabeli profiles tylko jeśli jeszcze nie istnieje
DO $$
BEGIN
    -- Sprawdź czy kolumna UserId już istnieje w tabeli profiles
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'user_id'
    ) THEN
        -- Dodanie kolumny UserId do tabeli profiles
        ALTER TABLE profiles
        ADD COLUMN "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Dodanie unikalnego indeksu
        CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_key ON profiles("user_id");

        -- Dodanie NOT NULL constraint
        ALTER TABLE profiles
        ALTER COLUMN "user_id" SET NOT NULL;
    END IF;
END
$$; 