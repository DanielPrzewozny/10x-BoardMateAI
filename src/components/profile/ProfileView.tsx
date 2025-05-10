import React, { useState, useCallback, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileForm } from "./ProfileForm";
import { PreferencesForm } from "./PreferencesForm";
import type { ProfileDTO, GamePreferences, PreferenceDTO } from "@/types";
import { useProfile } from "../hooks/useProfile";

// Domyślny profil używany jako fallback gdy nie ma danych
const defaultProfile: ProfileDTO = {
  first_name: "",
  last_name: "",
  email: "",
};

const queryClient = new QueryClient();

interface ProfileViewProps {
  defaultTab?: "profile" | "preferences";
}

const ProfileViewContent: React.FC<ProfileViewProps> = ({ defaultTab = "profile" }) => {
  const [activeTab, setActiveTab] = useState<"profile" | "preferences">(defaultTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Lokalny stan dla obu formularzy
  const [localProfile, setLocalProfile] = useState<ProfileDTO | null>(null);
  const [localPreferences, setLocalPreferences] = useState<GamePreferences | null>(null);

  // Pobieranie danych profilu
  const {
    profile,
    isLoading: isProfileLoading,
    isProfileEmpty,
    updateProfile,
    updatePreferences,
    isUpdating,
  } = useProfile();

  // Bezpośrednie pobieranie preferencji z API
  const {
    data: preferencesData,
    isLoading: isPreferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: ["preferences"],
    queryFn: () =>
      fetch("/api/profiles/me/preferences").then((res) => {
        if (!res.ok) {
          throw new Error("Błąd podczas pobierania preferencji");
        }
        return res.json();
      }),
    retry: 1,
    staleTime: 30000,
  });

  // Konwersja danych z API na format GamePreferences
  const preferences = React.useMemo(() => {
    if (preferencesData?.preferences) {
      const pref = preferencesData.preferences;
      return {
        minPlayers: pref.min_players || 1,
        maxPlayers: pref.max_players || 10,
        preferredDuration: pref.preferred_duration || 60,
        preferredTypes: pref.preferred_types || [],
        complexityLevel: pref.complexity_level || 1,
        budget: pref.budget,
      } as GamePreferences;
    }
    return null;
  }, [preferencesData]);

  // Inicjalizacja i aktualizacja lokalnego profilu
  const profileRef = useRef<any>(null);
  useEffect(() => {
    if (profile) {
      // Używamy referencji, żeby uniknąć nadmiarowych aktualizacji
      const profileJson = JSON.stringify(profile);

      // Aktualizujemy tylko gdy profile faktycznie się zmienił od ostatniej aktualizacji
      if (profileJson !== profileRef.current) {
        console.log("Aktualizacja lokalnego profilu z API:", profile);
        setLocalProfile({ ...profile });
        profileRef.current = profileJson;
      }
    }
  }, [profile]);

  // Inicjalizacja i aktualizacja preferencji, unikając nieskończonej pętli
  const preferencesRef = useRef<any>(null);
  useEffect(() => {
    if (preferences) {
      // Używamy referencji, żeby uniknąć nadmiarowych aktualizacji
      const preferencesJson = JSON.stringify(preferences);

      // Aktualizujemy tylko gdy preferencje faktycznie się zmieniły
      if (preferencesJson !== preferencesRef.current) {
        console.log("Aktualizacja lokalnych preferencji z API:", preferences);
        setLocalPreferences({ ...preferences });
        preferencesRef.current = preferencesJson;
      }
    }
  }, [preferences]);

  // Wykorzystujemy lokalne wersje jeśli istnieją, w przeciwnym razie używamy danych z API
  const currentProfile = localProfile || { ...defaultProfile, ...profile };
  const currentPreferences = localPreferences || preferences;

  // Obsługa zmiany zakładki
  const handleTabChange = useCallback(
    (tab: "profile" | "preferences") => {
      console.log(`Zmiana zakładki na ${tab}`);
      if (hasUnsavedChanges) {
        if (window.confirm("Masz niezapisane zmiany. Czy na pewno chcesz zmienić zakładkę?")) {
          setActiveTab(tab);
          setHasUnsavedChanges(false);
        }
      } else {
        setActiveTab(tab);
      }
    },
    [hasUnsavedChanges]
  );

  // Obsługa zmian w profilu
  const handleProfileChange = useCallback((data: Partial<ProfileDTO>) => {
    console.log("Zmiana w profilu:", data);

    // Pobierz nazwę pola i wartość do debugowania
    const fieldName = Object.keys(data)[0];
    const value = data[fieldName as keyof typeof data];
    console.log(`Aktualizacja pola ${fieldName} na wartość: '${value}'`);

    setHasUnsavedChanges(true);

    setLocalProfile((prev) => {
      if (!prev) {
        // Jeśli nie ma lokalnego profilu, utwórz nowy z domyślnymi wartościami
        const newProfile = {
          ...defaultProfile,
          ...data,
        };
        console.log("Utworzono nowy lokalny profil:", newProfile);
        return newProfile;
      }

      // Aktualizacja istniejącego profilu
      const updatedProfile = {
        ...prev,
        ...data,
      };
      console.log("Zaktualizowano lokalny profil:", updatedProfile);
      return updatedProfile;
    });
  }, []);

  // Obsługa zmian w preferencjach
  const handlePreferencesChange = useCallback((data: Partial<GamePreferences>) => {
    console.log("Zmiana w preferencjach:", data);
    setHasUnsavedChanges(true);
    setLocalPreferences((prev) => {
      if (!prev)
        return {
          minPlayers: 1,
          maxPlayers: 10,
          preferredDuration: 60,
          preferredTypes: [],
          complexityLevel: 1,
          ...data,
        };
      return {
        ...prev,
        ...data,
      };
    });
  }, []);

  // Obsługa zapisu profilu
  const handleProfileSave = useCallback(
    (data: ProfileDTO) => {
      console.log("Zapisywanie profilu w handleProfileSave:", data);

      // Musimy upewnić się, że przekazujemy obiekt z wymaganymi polami
      const profileToSave: ProfileDTO = {
        ...data,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      };

      console.log("Profil po przygotowaniu do zapisu:", profileToSave);

      // Najpierw zaktualizuj lokalny stan - wartości tymczasowe podczas zapisywania
      setLocalProfile(profileToSave);

      // Wyślij dane do API
      updateProfile(profileToSave);

      // Aktualizacja profRef, aby uniknąć podwójnej aktualizacji po refetch
      profileRef.current = JSON.stringify(profileToSave);

      // Resetujemy flagę niezapisanych zmian
      setHasUnsavedChanges(false);
    },
    [updateProfile, profileRef]
  );

  // Obsługa zapisu preferencji
  const handlePreferencesSave = useCallback(
    (data: GamePreferences) => {
      console.log("Zapisywanie preferencji:", data);

      // Najpierw zaktualizuj lokalny stan - wartości tymczasowe podczas zapisywania
      setLocalPreferences(data);

      // Wyślij dane do API
      updatePreferences(data);

      // Aktualizacja preferencesRef, aby uniknąć podwójnej aktualizacji po refetch
      preferencesRef.current = JSON.stringify(data);

      // Resetujemy flagę niezapisanych zmian
      setHasUnsavedChanges(false);
    },
    [updatePreferences, preferencesRef]
  );

  if (isProfileLoading || isPreferencesLoading) {
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  // Wyświetl komunikat o błędzie, jeśli wystąpił problem z ładowaniem preferencji
  if (preferencesError) {
    console.error("Błąd ładowania preferencji:", preferencesError);
  }

  console.log("Renderowanie ProfileView:", {
    activeTab,
    currentProfile,
    hasUnsavedChanges,
  });

  // Jeśli profil jest pusty, pokazujemy tylko formularz edycji
  if (isProfileEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Uzupełnij swój profil</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProfileForm
            profile={currentProfile}
            onChange={handleProfileChange}
            onSubmit={handleProfileSave}
            isLoading={isUpdating}
          />
        </div>
      </div>
    );
  }

  // Domyślne wartości preferencji, gdy nie są jeszcze załadowane
  const defaultGamePreferences: GamePreferences = {
    minPlayers: 1,
    maxPlayers: 10,
    preferredDuration: 60,
    preferredTypes: [],
    complexityLevel: 1,
    budget: 200,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader userData={currentProfile} />

      <div className="mt-8">
        <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className="mt-6">
        {activeTab === "profile" ? (
          <ProfileForm
            profile={currentProfile}
            onChange={handleProfileChange}
            onSubmit={handleProfileSave}
            isLoading={isUpdating}
          />
        ) : (
          <PreferencesForm
            preferences={currentPreferences ?? defaultGamePreferences}
            onChange={handlePreferencesChange}
            onSubmit={handlePreferencesSave}
            isLoading={isUpdating}
          />
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg shadow-lg">
          <p className="text-yellow-800">Masz niezapisane zmiany</p>
        </div>
      )}
    </div>
  );
};

export const ProfileView: React.FC<ProfileViewProps> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileViewContent {...props} />
    </QueryClientProvider>
  );
};
