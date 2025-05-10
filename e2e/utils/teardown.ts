import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../src/db/database.types';

/**
 * Funkcja czyszcząca bazę danych po testach E2E
 * Wykorzystuje adnotacje @E2ETeardownDoc z definicji typów bazy
 */
export async function cleanupDatabase(): Promise<void> {
  console.log('Rozpoczynanie czyszczenia bazy danych po testach E2E...');
  
  // Inicjalizacja klienta Supabase
  const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.PUBLIC_SUPABASE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Brak konfiguracji Supabase. Ustaw zmienne środowiskowe PUBLIC_SUPABASE_URL i PUBLIC_SUPABASE_KEY');
    return;
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey);
  
  try {
    // Pobierz ID testowych użytkowników, które chcemy zachować
    const testUserIds = [
      process.env.E2E_TEST_USER_ID || '', // ID testowego użytkownika wykorzystywanego w testach
    ].filter(Boolean);
    
    if (testUserIds.length === 0) {
      console.warn('Nie określono ID testowych użytkowników - zachowaj ostrożność przy czyszczeniu danych!');
    }
    
    // Usuń zapisane rekomendacje utworzone podczas testów
    const { error: recommendationsError } = await supabase
      .from('recommendations')
      .delete()
      .in('user_id', testUserIds);
    
    if (recommendationsError) {
      console.error('Błąd podczas czyszczenia tabeli recommendations:', recommendationsError);
    } else {
      console.log('Wyczyszczono rekomendacje dla testowych użytkowników');
    }
    
    // Usuń ulubione gry dodane podczas testów
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .in('user_id', testUserIds);
    
    if (favoritesError) {
      console.error('Błąd podczas czyszczenia tabeli favorites:', favoritesError);
    } else {
      console.log('Wyczyszczono ulubione gry dla testowych użytkowników');
    }
    
    // Usuń nowe rekordy w board_games utworzone podczas testów
    // Zwykle chcemy zachować domyślne testowe gry, więc warto usunąć tylko te dodane po określonej dacie
    // lub te, które spełniają określone kryteria (np. zawierają specjalny prefiks w nazwie)
    const testStartTime = process.env.E2E_TEST_START_TIME 
      ? new Date(process.env.E2E_TEST_START_TIME) 
      : new Date(Date.now() - 1000 * 60 * 60); // Domyślnie 1 godzina wstecz
    
    const { error: gamesError } = await supabase
      .from('board_games')
      .delete()
      .gt('created_at', testStartTime.toISOString());
    
    if (gamesError) {
      console.error('Błąd podczas czyszczenia tabeli board_games:', gamesError);
    } else {
      console.log(`Wyczyszczono gry utworzone po ${testStartTime.toISOString()}`);
    }
    
    console.log('Czyszczenie bazy danych zakończone pomyślnie');
  } catch (error) {
    console.error('Błąd podczas czyszczenia bazy danych:', error);
  }
} 