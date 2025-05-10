-- Migration: Add index to game_recommendations
-- Description: Dodaje indeks na kolumnie user_id do tabeli game_recommendations dla szybszego usuwania rekordów
-- Author: AI Assistant
-- Date: 2025-08-20

-- Dodanie indeksu dla kolumny user_id w tabeli game_recommendations
CREATE INDEX IF NOT EXISTS idx_game_recommendations_user_id 
ON public.game_recommendations(user_id);

-- Dodanie indeksu dla łączonego warunku user_id i id (często używanego przy usuwaniu)
CREATE INDEX IF NOT EXISTS idx_game_recommendations_user_id_id 
ON public.game_recommendations(user_id, id);

-- Komentarz do indeksów
COMMENT ON INDEX public.idx_game_recommendations_user_id IS 'Indeks przyspieszający wyszukiwanie rekomendacji dla danego użytkownika';
COMMENT ON INDEX public.idx_game_recommendations_user_id_id IS 'Indeks przyspieszający operacje usuwania rekomendacji przez użytkownika'; 