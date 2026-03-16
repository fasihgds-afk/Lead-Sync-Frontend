import React from 'react';

const TabsNavigation = ({ activeTab, onTabChange, rejectedCount }) => {
    return (
        <div className="flex items-center gap-1 border-b border-white/5">
            <button
                onClick={() => onTabChange('pending')}
                className={`px-5 py-2.5 text-sm font-medium transition-all relative ${activeTab === 'pending'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                    }`}
            >
                Pending Leads
                {activeTab === 'pending' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full"></span>
                )}
            </button>
            <button
                onClick={() => onTabChange('rejected')}
                className={`px-5 py-2.5 text-sm font-medium transition-all relative ${activeTab === 'rejected'
                    ? 'text-rose-400'
                    : 'text-slate-400 hover:text-slate-300'
                    }`}
            >
                Rejected Leads
                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 rounded-full">
                    {rejectedCount}
                </span>
                {activeTab === 'rejected' && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-full"></span>
                )}
            </button>
        </div>
    );
};

export default TabsNavigation;