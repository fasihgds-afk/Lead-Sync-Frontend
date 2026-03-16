import React, { useState, useEffect } from 'react';
import tokenManager from '../utils/tokenManager';

export default function SessionInfo() {
  const [tokenStatus, setTokenStatus] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const updateInfo = () => {
      setTokenStatus(tokenManager.getTokenStatus());
      setUser(tokenManager.getUser());
    };

    // Initial update
    updateInfo();

    // Listen for token events
    const handleTokenExpired = () => updateInfo();
    const handleTokenExpiringSoon = () => updateInfo();

    window.addEventListener('tokenExpired', handleTokenExpired);
    window.addEventListener('tokenExpiringSoon', handleTokenExpiringSoon);

    // Update every minute
    const interval = setInterval(updateInfo, 60000);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
      window.removeEventListener('tokenExpiringSoon', handleTokenExpiringSoon);
      clearInterval(interval);
    };
  }, []);

  if (!tokenStatus || !user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Session Information</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">User:</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Role:</span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{user.role || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">Status:</span>
          <span className={`text-xs font-medium ${
            tokenStatus.valid ? 'text-green-600' : 'text-red-600'
          }`}>
            {tokenStatus.valid ? 'Active' : 'Expired'}
          </span>
        </div>
        
        {tokenStatus.valid && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">Time remaining:</span>
            <span className={`text-xs font-medium ${
              tokenStatus.expiringSoon ? 'text-amber-600' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {tokenStatus.formattedTime}
            </span>
          </div>
        )}
      </div>
      
      {tokenStatus.expiringSoon && !tokenStatus.expired && (
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            ⚠️ Session expires soon. Consider refreshing your session.
          </p>
        </div>
      )}
    </div>
  );
}
