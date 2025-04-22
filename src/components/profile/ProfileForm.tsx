import React from 'react';
import type { ProfileDTO } from '@/types';

interface ProfileFormProps {
  profile: ProfileDTO;
  onChange: (data: Partial<ProfileDTO>) => void;
  onSubmit: (data: ProfileDTO) => void;
  isLoading: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onChange,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  const handleChange = (field: keyof ProfileDTO) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...profile,
      [field]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Dane profilu</h2>
        
        <div className="space-y-6">
          {/* Imię */}
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
              Imię
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange('first_name')}
                required
                minLength={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Nazwisko */}
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
              Nazwisko
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange('last_name')}
                required
                minLength={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1">
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Adres email nie może być zmieniony
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }
            `}
          >
            {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
        </div>
      </div>
    </form>
  );
}; 