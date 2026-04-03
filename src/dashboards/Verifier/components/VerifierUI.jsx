import React from 'react';

export const VALID_STATUSES = ['ACTIVE', 'BOUNCED', 'DEAD'];

export const STATUS_STYLES = {
    ACTIVE: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    BOUNCED: 'border-rose-500/20 bg-rose-500/10 text-rose-400',
    DEAD: 'border-gray-500/20 bg-gray-500/10 text-gray-500',
    PENDING: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
};

export const STATUS_ICONS = { ACTIVE: '✓', BOUNCED: '✕', DEAD: '✕', PENDING: '…' };

export const getStatusStyle = (s) => STATUS_STYLES[(s || '').toUpperCase()] ?? STATUS_STYLES.PENDING;
export const getStatusIcon = (s) => STATUS_ICONS[(s || '').toUpperCase()] ?? '…';

export const Toast = ({ notification, onClose }) => {
    if (!notification) return null;
    return (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 duration-300">
            <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl
        ${notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : notification.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white
          ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                    {notification.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    {notification.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>}
                    {notification.type === 'info' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </div>
                <div>
                    <p className="font-black text-sm">{notification.message}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">System Notification</p>
                </div>
                <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
