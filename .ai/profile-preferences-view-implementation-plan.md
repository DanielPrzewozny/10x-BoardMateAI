# Plan implementacji widoku Profilu i Preferencji

## 1. Przegląd
Widok "Profil i Preferencje" umożliwia użytkownikom przeglądanie i edycję ich danych osobowych oraz preferencji dotyczących gier planszowych. Widok składa się z dwóch głównych sekcji: danych profilu oraz preferencji gier.

## 2. Routing widoku
- Główny widok profilu: `/profile`
- Edycja preferencji: `/profile/preferences`

## 3. Struktura komponentów
- **ProfileView** (główny komponent)
  - **ProfileHeader** (nagłówek z podstawowymi informacjami)
  - **ProfileTabs** (zakładki nawigacyjne)
  - **ProfileForm** (formularz danych osobowych)
  - **PreferencesForm** (formularz preferencji gier)
  - **SaveButton** (przycisk zapisywania zmian)

## 4. Szczegóły komponentów

### ProfileView
- Opis komponentu: Główny kontener widoku profilu.
- Główne elementy:
  - Nagłówek z avatarem i podstawowymi danymi
  - System zakładek do przełączania sekcji
  - Formularze edycji
- Obsługiwane interakcje:
  - Przełączanie między sekcjami
  - Zapisywanie zmian
  - Anulowanie zmian
- Typy:
  - `UserProfile`
  - `ProfileDTO`
- Propsy:
  - `initialData`: początkowe dane profilu

### ProfileHeader
- Opis komponentu: Nagłówek z podstawowymi informacjami o użytkowniku.
- Główne elementy:
  - Avatar użytkownika
  - Imię i nazwisko
  - Status konta
  - Data dołączenia
- Obsługiwane interakcje:
  - Zmiana avatara
- Typy:
  - `ProfileHeaderData`
- Propsy:
  - `userData`: dane użytkownika
  - `onAvatarChange`: funkcja zmiany avatara

### ProfileForm
- Opis komponentu: Formularz edycji danych osobowych.
- Główne elementy:
  - Pola do edycji imienia i nazwiska
  - Pole emaila (tylko do odczytu)
  - Przycisk zmiany hasła
- Obsługiwane interakcje:
  - Edycja pól formularza
  - Inicjowanie zmiany hasła
- Obsługiwana walidacja:
  - Wymagane pola
  - Format danych
- Typy:
  - `UpdateProfileDTO`
- Propsy:
  - `profile`: dane profilu
  - `onChange`: funkcja obsługująca zmiany
  - `onPasswordChange`: funkcja zmiany hasła

### PreferencesForm
- Opis komponentu: Formularz edycji preferencji gier.
- Główne elementy:
  - Suwaki do wyboru liczby graczy
  - Suwak czasu gry
  - Wybór typów gier
  - Suwak poziomu złożoności
  - Pole budżetu
- Obsługiwane interakcje:
  - Zmiana wartości suwaków
  - Wybór/odznaczanie typów gier
- Obsługiwana walidacja:
  - Zakresy wartości liczbowych
  - Wymagane minimum typów gier
- Typy:
  - `GamePreferences`
- Propsy:
  - `preferences`: aktualne preferencje
  - `onChange`: funkcja obsługująca zmiany

## 5. Typy
```typescript
interface ProfileHeaderData {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  accountStatus: string;
  joinDate: Date;
}

interface GamePreferences {
  minPlayers: number;
  maxPlayers: number;
  preferredDuration: number;
  preferredTypes: string[];
  complexityLevel: number;
  budget?: number;
}

interface ProfileViewState {
  activeTab: 'profile' | 'preferences';
  isEditing: boolean;
  hasUnsavedChanges: boolean;
}
```

## 6. Zarządzanie stanem
- Wykorzystanie `useState` do przechowywania aktywnej zakładki i stanu edycji
- Wykorzystanie `useForm` do zarządzania formularzami
- Wykorzystanie `useQuery` i `useMutation` do operacji na danych
- Wykorzystanie `useCallback` dla funkcji obsługujących zmiany

## 7. Integracja API
- Endpoint `GET /api/profiles/{id}` do pobierania danych profilu
- Endpoint `PATCH /api/profiles/{id}` do aktualizacji profilu
- Endpoint `PUT /api/profiles/{id}/preferences` do aktualizacji preferencji

## 8. Interakcje użytkownika
1. Użytkownik może przełączać się między zakładkami profilu i preferencji
2. Edycja danych aktywuje przycisk zapisywania
3. Próba opuszczenia formularza z niezapisanymi zmianami wyświetla ostrzeżenie
4. Po zapisie wyświetlane jest potwierdzenie

## 9. Warunki i walidacja
- Imię i nazwisko: wymagane, min. 2 znaki
- Liczba graczy: 1-10
- Czas gry: 15-300 minut
- Złożoność: 1-5
- Budżet: wartość nieujemna
- Typy gier: minimum 1 wybrany

## 10. Obsługa błędów
- Wyświetlanie błędów walidacji przy polach
- Obsługa błędów API
- Zabezpieczenie przed utratą niezapisanych zmian
- Możliwość anulowania zmian

## 11. Kroki implementacji
1. Utworzenie podstawowej struktury komponentów
2. Implementacja systemu zakładek
3. Implementacja formularza profilu
4. Implementacja formularza preferencji
5. Dodanie walidacji
6. Integracja z API
7. Implementacja zapisywania zmian
8. Dodanie obsługi błędów
9. Stylizacja komponentów
10. Testy jednostkowe i integracyjne

## 12. Komponenty UI
```tsx
// ProfileView.tsx
export const ProfileView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const { data: profile, isLoading } = useQuery('profile', fetchProfile);
  
  return (
    <div className="profile-view">
      <ProfileHeader userData={profile} />
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === 'profile' ? (
        <ProfileForm profile={profile} />
      ) : (
        <PreferencesForm preferences={profile?.preferences} />
      )}
    </div>
  );
};

// PreferencesForm.tsx
export const PreferencesForm: React.FC<PreferencesFormProps> = ({ preferences, onChange }) => {
  return (
    <form className="preferences-form">
      <div className="form-group">
        <label>Liczba graczy</label>
        <RangeSlider
          min={1}
          max={10}
          value={[preferences.minPlayers, preferences.maxPlayers]}
          onChange={handlePlayersChange}
        />
      </div>
      
      <div className="form-group">
        <label>Czas gry (minuty)</label>
        <Slider
          min={15}
          max={300}
          value={preferences.preferredDuration}
          onChange={handleDurationChange}
        />
      </div>
      
      <div className="form-group">
        <label>Typy gier</label>
        <GameTypeSelector
          selected={preferences.preferredTypes}
          onChange={handleTypesChange}
        />
      </div>
      
      <div className="form-group">
        <label>Poziom złożoności</label>
        <ComplexitySlider
          value={preferences.complexityLevel}
          onChange={handleComplexityChange}
        />
      </div>
      
      <div className="form-group">
        <label>Budżet</label>
        <NumberInput
          value={preferences.budget}
          onChange={handleBudgetChange}
          min={0}
        />
      </div>
    </form>
  );
}; 