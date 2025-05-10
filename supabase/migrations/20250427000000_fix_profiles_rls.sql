-- Resetowanie polityk RLS dla tabeli profiles

-- Najpierw usuń istniejące polityki
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

-- Upewnij się, że włączone jest RLS dla tabeli profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Upewnij się, że kolumna user_id istnieje
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL;
  END IF;
END
$$;

-- Utwórz indeks na kolumnie user_id, jeśli jeszcze nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'idx_profiles_user_id'
  ) THEN
    CREATE INDEX idx_profiles_user_id ON profiles(user_id);
  END IF;
END
$$;

-- Dodaj ograniczenie unikalności dla user_id, jeśli jeszcze nie istnieje
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_user_id'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT unique_user_id UNIQUE (user_id);
  END IF;
END
$$;

-- Dodaj nowe polityki RLS
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 