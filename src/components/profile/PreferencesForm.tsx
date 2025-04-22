import React from 'react';
import { GamePreferences } from '@/types';

interface PreferencesFormProps {
  preferences: GamePreferences;
  onChange: (data: Partial<GamePreferences>) => void;
  onSubmit: (data: GamePreferences) => void;
  isLoading: boolean;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onChange,
  onSubmit,
  isLoading
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(preferences);
  };

  const handlePlayersChange = (value: [number, number]) => {
    onChange({
      ...preferences,
      minPlayers: value[0],
      maxPlayers: value[1]
    });
  };

  const handleDurationChange = (value: number) => {
    onChange({
      ...preferences,
      preferredDuration: value
    });
  };

  const handleComplexityChange = (value: number) => {
    onChange({
      ...preferences,
      complexityLevel: value
    });
  };

  const handleTypesChange = (types: string[]) => {
    onChange({
      ...preferences,
      preferredTypes: types
    });
  };

  const handleBudgetChange = (value: number) => {
    onChange({
      ...preferences,
      budget: value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preferencje gier</h2>
        
        <div className="space-y-6">
          {/* Liczba graczy */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Liczba graczy
            </label>
            <div className="mt-2">
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={preferences.minPlayers}
                  onChange={(e) => handlePlayersChange([parseInt(e.target.value), preferences.maxPlayers])}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">
                  {preferences.minPlayers} - {preferences.maxPlayers} graczy
                </span>
              </div>
            </div>
          </div>

          {/* Czas gry */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferowany czas gry (minuty)
            </label>
            <div className="mt-2">
              <input
                type="range"
                min={15}
                max={300}
                step={15}
                value={preferences.preferredDuration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {preferences.preferredDuration} minut
              </span>
            </div>
          </div>

          {/* Poziom złożoności */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Poziom złożoności
            </label>
            <div className="mt-2">
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={preferences.complexityLevel}
                onChange={(e) => handleComplexityChange(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">
                {preferences.complexityLevel}
              </span>
            </div>
          </div>

          {/* Typy gier */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferowane typy gier
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Strategiczna', 'Przygodowa', 'Ekonomiczna', 'Imprezowa', 'Rodzinna'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    const types = preferences.preferredTypes.includes(type)
                      ? preferences.preferredTypes.filter(t => t !== type)
                      : [...preferences.preferredTypes, type];
                    handleTypesChange(types);
                  }}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      preferences.preferredTypes.includes(type)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Budżet */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Budżet (PLN)
            </label>
            <div className="mt-2">
              <input
                type="number"
                min={0}
                step={10}
                value={preferences.budget}
                onChange={(e) => handleBudgetChange(parseInt(e.target.value))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
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
            {isLoading ? 'Zapisywanie...' : 'Zapisz preferencje'}
          </button>
        </div>
      </div>
    </form>
  );
}; 