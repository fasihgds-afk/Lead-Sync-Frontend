import { useState, useEffect } from 'react';
import { managerAPI } from '../api/manager.api';

export function useLeadCounts(userRole) {
    const [counts, setCounts] = useState({ newLeads: 0 });

    useEffect(() => {
        if (userRole !== 'Manager') return;

        const fetchCounts = async () => {
            try {
                const response = await managerAPI.getMyLeads();
                if (response.success) {
                    const pendingCount = (response.leads || []).filter(l => l.stage === 'MANAGER').length;
                    setCounts({ newLeads: pendingCount });
                }
            } catch (err) {
                console.error("Failed to fetch lead counts", err);
            }
        };

        fetchCounts();
        const interval = setInterval(fetchCounts, 30000); // Polling every 30 seconds

        return () => clearInterval(interval);
    }, [userRole]);

    return counts;
}
