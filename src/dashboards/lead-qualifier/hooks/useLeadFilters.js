import { useState, useMemo } from 'react';

export const useLeadFilters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');
    const [customFromDate, setCustomFromDate] = useState('');
    const [customToDate, setCustomToDate] = useState('');
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [searchReady, setSearchReady] = useState(false);

    // Build filters object for API
    const apiFilters = useMemo(() => {
        const filters = {};

        // Status filter - always apply if it's not 'ALL'
        if (activeTab && activeTab !== 'ALL') {
            filters.lqStatus = activeTab;
        }

        // Date filters - only apply when user is ready to search or if searchReady is set
        if (searchReady && customFromDate) {
            filters.from = customFromDate;
            if (showToDatePicker && customToDate) {
                filters.to = customToDate;
            } else {
                // If only From date is selected, search for that specific day
                filters.to = customFromDate;
            }
        }

        return filters;
    }, [activeTab, customFromDate, customToDate, showToDatePicker, searchReady]);

    return {
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        dateFilter,
        setDateFilter,
        customFromDate,
        setCustomFromDate,
        customToDate,
        setCustomToDate,
        showToDatePicker,
        setShowToDatePicker,
        searchReady,
        setSearchReady,
        apiFilters
    };
};
