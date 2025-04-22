import React from 'react';
import type { ProfileDTO } from '@/types';

interface ProfileHeaderProps {
  userData: ProfileDTO;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userData }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-6">
        <div className="relative w-24 h-24">
          <img
            src={userData.avatarUrl || '/default-avatar.png'}
            alt="Avatar użytkownika"
            className="rounded-full object-cover w-full h-full"
          />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {userData.first_name} {userData.last_name}
          </h1>
          <p className="text-sm text-gray-500">
            {userData.email}
          </p>
          <div className="mt-2 flex items-center">
            <span className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${userData.account_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
            `}>
              {userData.account_status === 'active' ? 'Aktywne konto' : 'Konto nieaktywne'}
            </span>
            <span className="ml-4 text-xs text-gray-500">
              Dołączył(a): {new Date(userData.joinDate).toLocaleDateString('pl-PL')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 