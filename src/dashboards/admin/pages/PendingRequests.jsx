import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      const data = await adminAPI.getPendingRequests();
      setRequests(data.requests || []);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      if (!isBackground) {
        setError(err.response?.data?.message || 'Failed to fetch pending requests');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (requestId, role = 'User') => {
    try {
      setActionLoading(requestId);
      await adminAPI.approveRequest(requestId, role);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      setError(null);
      window.dispatchEvent(new CustomEvent('pendingRequestsUpdated', { detail: { change: -1 } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
      console.error('Error approving request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const comment = prompt("Enter rejection comment:");

      if (!comment) {
        alert("Comment is required");
        return;
      }

      setActionLoading(requestId);

      await adminAPI.decideRejectionRequest(
        requestId,
        "REJECT",
        comment
      );

      setRequests(prev => prev.filter(req => req._id !== requestId));

      setError(null);

      window.dispatchEvent(
        new CustomEvent('pendingRequestsUpdated', { detail: { change: -1 } })
      );

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
      console.error('Error rejecting request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <SharedLoader />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[32px] p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-success)] opacity-5 rounded-full blur-[100px] -mr-32 -mt-32" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[var(--accent-success)]/10 rounded-2xl text-[var(--accent-success)] shadow-inner">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-tight">
                  Pending <span className="text-[var(--accent-success)]">Requests</span>
                </h1>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 italic tracking-tight hidden sm:block">
                  Global authentication bridge and system access management
                </p>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-[var(--border-primary)] opacity-20 hidden md:block" />

            {/* Minimalist Sync Block */}
            <div className="flex items-center bg-[var(--bg-tertiary)]/40 border border-[var(--border-primary)]/40 rounded-full pl-1 pr-3 py-1 gap-3 hover:border-[var(--accent-success)]/40 transition-all group/sync-badge">
              <button
                onClick={() => fetchPendingRequests(true)}
                disabled={refreshing}
                className="w-7 h-7 flex items-center justify-center bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-full hover:bg-[var(--accent-success)] hover:text-white hover:border-[var(--accent-success)] transition-all shadow-sm"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : 'group-hover/sync-badge:rotate-180 transition-transform duration-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <div className="flex flex-col leading-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[var(--accent-success)] animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-[var(--text-tertiary)]">Synchronized</span>
                </div>
                <span className="text-[9px] font-black text-[var(--text-primary)] tabular-nums mt-0.5">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-2 p-4 rounded-xl border animate-shake" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', borderColor: 'rgba(248, 113, 113, 0.2)' }}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Target Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest">Date Logged</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]/30">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-[var(--text-tertiary)] font-bold text-xs uppercase tracking-widest opacity-50">
                    No pending registration sequences detected
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id} className="hover:bg-[var(--bg-tertiary)]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent-success)]/10 border border-[var(--accent-success)]/20 flex items-center justify-center font-black text-[var(--accent-success)] text-sm group-hover:rotate-6 transition-transform">
                          {req.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-[var(--text-primary)] group-hover:text-[var(--accent-success)] transition-colors">{req.name}</div>
                          <div className="text-[10px] font-bold text-[var(--text-tertiary)] opacity-60 uppercase tracking-tighter">{req.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                        {req.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-bold text-[var(--text-tertiary)]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          onChange={(e) => setSelectedRoles({ ...selectedRoles, [req._id]: e.target.value })}
                          className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-xl px-3 py-1.5 text-[10px] font-black text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-success)] outline-none transition-all uppercase tracking-widest"
                        >
                          <option value="">Role Assignment</option>
                          <option value="Data Minors">Data Minors</option>
                          <option value="Lead Qualifiers">Lead Qualifiers</option>
                          <option value="Manager">Manager</option>
                          <option value="Admin">Admin</option>
                          <option value="Verifier">Verifier</option>
                        </select>
                        <button
                          onClick={() => handleApprove(req._id, selectedRoles[req._id])}
                          disabled={actionLoading === req._id || !selectedRoles[req._id]}
                          className="p-2 rounded-xl bg-[var(--accent-success)] text-white shadow-lg shadow-[var(--accent-success)]/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </button>
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={actionLoading === req._id}
                          className="p-2 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
}
