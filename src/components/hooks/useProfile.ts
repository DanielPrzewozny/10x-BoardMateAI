import { useQuery, useMutation } from '@tanstack/react-query';
import type { ProfileDTO, GamePreferences } from '@/types';
import { toast } from 'sonner';

const defaultPreferences: GamePreferences = {
  minPlayers: 2,
  maxPlayers: 4,
  preferredDuration: 60,
  preferredTypes: [],
  complexityLevel: 2,
  budget: 200
};

const defaultProfile: ProfileDTO = {
  first_name: '',
  last_name: '',
  email: '',
  preferences: defaultPreferences
};

export const useProfile = () => {
  const { 
    data: rawProfile, 
    isLoading,
    error,
    refetch 
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch(`/api/profiles/me`).then((res) => res.json())
  });

  // Połącz otrzymany profil z domyślnymi wartościami
  const profile: ProfileDTO = {
    ...defaultProfile,
    ...rawProfile,
    preferences: {
      ...defaultPreferences,
      ...rawProfile?.preferences
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileDTO) =>
      fetch(`/api/profiles/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Profil został zaktualizowany');
      refetch();
    },
    onError: () => {
      toast.error('Wystąpił błąd podczas aktualizacji profilu');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (data: GamePreferences) =>
      fetch(`/api/profiles/me/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Preferencje zostały zaktualizowane');
      refetch();
    },
    onError: () => {
      toast.error('Wystąpił błąd podczas aktualizacji preferencji');
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
    isUpdating: updateProfileMutation.isPending || updatePreferencesMutation.isPending
  };
}; 