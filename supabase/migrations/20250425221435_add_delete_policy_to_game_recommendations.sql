-- Description: Adds a delete policy to the game_recommendations table
-- This allows users to delete their own recommendations

-- Spróbujmy dodać politykę dla tabeli game_recommendations jeśli istnieje
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_recommendations') THEN
        -- Dodajemy politykę dla game_recommendations
        CREATE POLICY "Users can delete their own recommendations" 
        ON public.game_recommendations
        FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Created delete policy for game_recommendations table.';
    ELSE
        RAISE NOTICE 'game_recommendations table does not exist. Will try to create for game_history instead.';
        
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'game_history') THEN
            -- Dodajemy politykę dla game_history
            CREATE POLICY "Users can delete their own history entries" 
            ON public.game_history
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
                
            RAISE NOTICE 'Created delete policy for game_history table instead.';
        ELSE
            RAISE NOTICE 'Neither game_recommendations nor game_history tables exist.';
        END IF;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policy already exists, skipping.';
END
$$;
