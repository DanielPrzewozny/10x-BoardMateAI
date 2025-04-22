import React from 'react';

interface ProfileTabsProps {
  activeTab: 'profile' | 'preferences';
  onTabChange: (tab: 'profile' | 'preferences') => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('profile')}
          className={`
            py-4 px-1 border-b-2 font-medium text-sm
            ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          Profil
        </button>
        <button
          onClick={() => onTabChange('preferences')}
          className={`
            py-4 px-1 border-b-2 font-medium text-sm
            ${
              activeTab === 'preferences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          Preferencje gier
        </button>
      </nav>
    </div>
  );
}; 