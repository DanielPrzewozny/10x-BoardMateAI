-- Dodanie klucza obcego łączącego reviews.user_id z profiles.user_id
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_profile_userid_fkey;

ALTER TABLE public.reviews 
  ADD CONSTRAINT reviews_profile_userid_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

-- Dodanie indeksu dla poprawy wydajności
CREATE INDEX IF NOT EXISTS reviews_user_id_profile_idx ON public.reviews(user_id);

COMMENT ON CONSTRAINT reviews_profile_userid_fkey ON public.reviews IS 'Łączy recenzje z profilami użytkowników'; 