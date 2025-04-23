import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileHeader } from './ProfileHeader';
import { ProfileTabs } from './ProfileTabs';
import { ProfileForm } from './ProfileForm';
import { PreferencesForm } from './PreferencesForm';
import type { ProfileDTO, GamePreferences } from '@/types';
import { useProfile } from '../hooks/useProfile';

const queryClient = new QueryClient();

interface ProfileViewProps {
  defaultTab?: 'profile' | 'preferences';
}

const ProfileViewContent: React.FC<ProfileViewProps> = ({ defaultTab = 'profile' }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>(defaultTab);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    profile,
    isLoading,
    isProfileEmpty,
    updateProfile,
    updatePreferences,
    isUpdating
  } = useProfile();

  // Obsługa zmiany zakładki
  const handleTabChange = useCallback((tab: 'profile' | 'preferences') => {
    if (hasUnsavedChanges) {
      if (window.confirm('Masz niezapisane zmiany. Czy na pewno chcesz zmienić zakładkę?')) {
        setActiveTab(tab);
        setHasUnsavedChanges(false);
      }
    } else {
      setActiveTab(tab);
    }
  }, [hasUnsavedChanges]);

  // Obsługa zmian w profilu
  const handleProfileChange = useCallback((data: Partial<ProfileDTO>) => {
    setHasUnsavedChanges(true);
  }, []);

  // Obsługa zmian w preferencjach
  const handlePreferencesChange = useCallback((data: Partial<GamePreferences>) => {
    setHasUnsavedChanges(true);
  }, []);

  // Obsługa zapisu profilu
  const handleProfileSave = useCallback((data: ProfileDTO) => {
    updateProfile(data);
    setHasUnsavedChanges(false);
  }, [updateProfile]);

  // Obsługa zapisu preferencji
  const handlePreferencesSave = useCallback((data: GamePreferences) => {
    updatePreferences(data);
    setHasUnsavedChanges(false);
  }, [updatePreferences]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Ładowanie...</div>;
  }

  // Jeśli profil jest pusty, pokazujemy tylko formularz edycji
  if (isProfileEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Uzupełnij swój profil</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProfileForm
            profile={profile}
            onChange={handleProfileChange}
            onSubmit={handleProfileSave}
            isLoading={isUpdating}
          />
        </div>
      </div>
    );
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
            isLoading={isUpdating}
          />
        ) : (
          <PreferencesForm
            preferences={profile?.preferences}
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