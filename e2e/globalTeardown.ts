import { cleanupDatabase } from './utils/teardown';

/**
 * Globalny teardown po zakończeniu testów E2E.
 * 
 * Ten plik jest wykonywany raz po zakończeniu wszystkich testów.
 * Czyści dane testowe i przeprowadza niezbędne operacje końcowe.
 */
export default async function globalTeardown() {
  console.log('Rozpoczynanie globalnego teardownu testów E2E...');
  
  // Wyczyść dane testowe z bazy danych
  await cleanupDatabase();
  
  console.log('Globalny teardown zakończony');
} 