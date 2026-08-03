import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin.api';
import { ROLES } from '../utils/roleRedirect';

const isProd = import.meta.env.PROD;
const logError = (...args) => { if (!isProd) console.error(...args); };

export function usePendingRequestsCount(userRole) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch for Super Admin / Admin roles
    if (userRole !== ROLES.SUPER_ADMIN && userRole !== ROLES.ADMIN) {
      setLoading(false);
      return;
    }


    const fetchCount = async () => {
      try {
        const data = await adminAPI.getPendingRequests();
        setCount(data.requests?.length || 0);
      } catch (error) {
        logError('Error fetching pending requests count:', error);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();

    // Listen for manual updates (e.g. from PendingRequests page)
    const handleUpdate = () => fetchCount();
    window.addEventListener('pendingRequestsUpdated', handleUpdate);

    return () => {
      window.removeEventListener('pendingRequestsUpdated', handleUpdate);
    };
  }, [userRole]);

  return { count, loading };
}
