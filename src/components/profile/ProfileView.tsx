import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs } from './ProfileTabs';
import { ProfileForm } from './ProfileForm';
import { PreferencesForm } from './PreferencesForm';
import type { ProfileDTO, GamePreferences } from '@/types';
import { toast } from 'sonner';

const queryClient = new QueryClient();

interface ProfileViewProps {
  userId: string;
  defaultTab?: 'profile' | 'preferences';
}

const ProfileViewContent: React.FC<ProfileViewProps> = ({ userId, defaultTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>(defaultTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Pobieranie danych profilu
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetch(`/api/profiles/${userId}`).then((res) => res.json())
  });

  // Mutacja do aktualizacji profilu
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileDTO) =>
      fetch(`/api/profiles/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Profil został zaktualizowany');
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error('Wystąpił błąd podczas aktualizacji profilu');
    },
  });

  // Mutacja do aktualizacji preferencji
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: GamePreferences) =>
      fetch(`/api/profiles/${userId}/preferences`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: () => {
      toast.success('Preferencje zostały zaktualizowane');
      setHasUnsavedChanges(false);
    },
    onError: () => {
      toast.error('Wystąpił błąd podczas aktualizacji preferencji');
    },
  });

  // Obsługa zmiany zakładki
  const handleTabChange = (tab: 'profile' | 'preferences') => {
    if (hasUnsavedChanges) {
      if (window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz zmienić zakładkę?')) {
        setActiveTab(tab);
        setHasUnsavedChanges(false);
      }
    } else {
      setActiveTab(tab);
    }
  };

  // Obsługa zmian w profilu
  const handleProfileChange = (data: Partial<ProfileDTO>) => {
    setHasUnsavedChanges(true);
  };

  // Obsługa zmian w preferencjach
  const handlePreferencesChange = (data: Partial<GamePreferences>) => {
    setHasUnsavedChanges(true);
  };

  // Obsługa zapisu profilu
  const handleProfileSave = (data: ProfileDTO) => {
    updateProfileMutation.mutate(data);
  };

  // Obsługa zapisu preferencji
  const handlePreferencesSave = (data: GamePreferences) => {
    updatePreferencesMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader userData={profile} />
      
      <div className="mt-8">
        <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className="mt-6">
        {activeTab === 'profile' ? (
          <ProfileForm
            profile={profile}
            onChange={handleProfileChange}
            onSubmit={handleProfileSave}
            isLoading={updateProfileMutation.isPending}
          />
        ) : (
          <PreferencesForm
            preferences={profile?.preferences}
            onChange={handlePreferencesChange}
            onSubmit={handlePreferencesSave}
            isLoading={updatePreferencesMutation.isPending}
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