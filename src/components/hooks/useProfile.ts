import { useQuery, useMutation } from "@tanstack/react-query";
import type { ProfileDTO, GamePreferences } from "@/types";
import { toast } from "sonner";

const defaultPreferences: GamePreferences = {
  minPlayers: 2,
  maxPlayers: 4,
  preferredDuration: 60,
  preferredTypes: [],
  complexityLevel: 2,
  budget: 200,
};

const defaultProfile: ProfileDTO = {
  first_name: "",
  last_name: "",
  email: "",
};

export const useProfile = () => {
  const {
    data: rawProfile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      console.log("Pobieranie danych profilu z API");
      try {
        const res = await fetch(`/api/profiles/me`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Błąd odpowiedzi API:", errorText);
          throw new Error(`Błąd pobierania danych profilu: ${res.status}`);
        }
        const data = await res.json();
        console.log("Otrzymane dane profilu z API:", data);
        return data;
      } catch (error) {
        console.error("Wyjątek podczas pobierania profilu:", error);
        throw error;
      }
    },
    staleTime: 30000,
    retry: 1,
  });

  // Połącz otrzymany profil z domyślnymi wartościami
  const profile: ProfileDTO = {
    ...defaultProfile,
    ...rawProfile,
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileDTO) => {
      console.log("Aktualizacja profilu z danymi:", data);
      console.log("JSON do wysłania:", JSON.stringify(data, null, 2));

      try {
        // Upewnij się, że nie wysyłamy undefined lub null jako wartości pól
        const cleanData = {
          ...data,
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        };

        console.log("Oczyszczone dane przed wysłaniem:", cleanData);

        const response = await fetch(`/api/profiles/me`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanData),
        });

        console.log("Status odpowiedzi:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Błąd aktualizacji profilu:", errorText);
          throw new Error(`Błąd aktualizacji profilu: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        console.log("Dane odpowiedzi po aktualizacji profilu:", responseData);
        return responseData;
      } catch (error) {
        console.error("Wyjątek podczas aktualizacji profilu:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Sukces aktualizacji profilu:", data);
      toast.success("Profil został zaktualizowany");

      // Odśwież dane profilu, wymuszając pełne odświeżenie
      setTimeout(() => {
        refetch();
      }, 100);
    },
    onError: (error) => {
      console.error("Błąd aktualizacji profilu:", error);
      toast.error(
        `Wystąpił błąd podczas aktualizacji profilu: ${error instanceof Error ? error.message : "Nieznany błąd"}`
      );
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: GamePreferences) => {
      console.log("Aktualizacja preferencji z danymi:", data);

      // Konwersja danych z formatu frontendu na format API
      const apiData = {
        min_players: data.minPlayers,
        max_players: data.maxPlayers,
        preferred_duration: data.preferredDuration,
        preferred_types: data.preferredTypes,
        complexity_level: data.complexityLevel,
        budget: data.budget,
      };

      console.log("Skonwertowane dane API dla preferencji:", apiData);

      return fetch(`/api/profiles/me/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      }).then((res) => res.json());
    },
    onSuccess: (data) => {
      console.log("Sukces aktualizacji preferencji:", data);
      toast.success("Preferencje zostały zaktualizowane");
      refetch();
    },
    onError: (error) => {
      console.error("Błąd aktualizacji preferencji:", error);
      toast.error("Wystąpił błąd podczas aktualizacji preferencji");
    },
  });

  // Profil jest pusty, jeśli nie ma imienia lub jest ono puste
  const isProfileEmpty = !profile.first_name?.trim();

  return {
    profile,
    isLoading,
    error,
    isProfileEmpty,
    updateProfile: updateProfileMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updateProfileMutation.isPending || updatePreferencesMutation.isPending,
  };
};
