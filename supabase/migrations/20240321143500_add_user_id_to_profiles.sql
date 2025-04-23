-- Dodanie kolumny UserId do tabeli Profiles
ALTER TABLE "Profiles" 
ADD COLUMN "UserId" UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Dodanie unikalnego indeksu
CREATE UNIQUE INDEX profiles_user_id_key ON "Profiles"("UserId");

-- Dodanie NOT NULL constraint
ALTER TABLE "Profiles" 
ALTER COLUMN "UserId" SET NOT NULL; 