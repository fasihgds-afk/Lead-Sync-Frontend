import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../../api/admin.api';
import SharedLoader from '../../../components/SharedLoader';
import {
  FiUserCheck,
  FiShield,
  FiXCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiClock,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiAlertTriangle,
  FiSend,
  FiUsers
} from 'react-icons/fi';

export default function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState({});
  const [rejectModal, setRejectModal] = useState({ isOpen: false, requestId: null, comment: '' });
  const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, requestId: null, role: null });

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

  const openApproveConfirmation = (requestId, role) => {
    if (!role) {
      setError("Please select a role before approving");
      return;
    }
    setConfirmApprove({ isOpen: true, requestId, role });
  };

  const handleApprove = async () => {
    const { requestId, role } = confirmApprove;
    try {
      setActionLoading(requestId);
      await adminAPI.approveRequest(requestId, role);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      setError(null);
      setConfirmApprove({ isOpen: false, requestId: null, role: null });
      window.dispatchEvent(new CustomEvent('pendingRequestsUpdated', { detail: { change: -1 } }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve request');
      console.error('Error approving request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (requestId) => {
    setRejectModal({ isOpen: true, requestId, comment: '' });
  };

  const confirmRejection = async () => {
    const { requestId, comment } = rejectModal;

    if (!comment || comment.trim() === "") {
      setError("Please provide a rejection comment");
      return;
    }

    try {
      setActionLoading(requestId);
      await adminAPI.decideRejectionRequest(requestId);
      setRequests(prev => prev.filter(req => req._id !== requestId));
      setError(null);
      setRejectModal({ isOpen: false, requestId: null, comment: '' });
      window.dispatchEvent(new CustomEvent('pendingRequestsUpdated', { detail: { change: -1 } }));
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
    <div className="p-4 md:p-6 space-y-5 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">

      {/* Header */}
      <div className="border bg-[var(--bg-secondary)] border-black/10 rounded-2xl p-6 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] -mr-36 -mt-36" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-[100px] -ml-36 -mb-36" />

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg shadow-emerald-500/25">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] whitespace-nowrap leading-tight">
                  Pending Requests
                </h1>

              </div>
            </div>

            <div className="h-8 w-px bg-gradient-to-b from-emerald-200 to-transparent dark:from-gray-700 hidden md:block" />

            {/* Sync Status */}
            <div className="flex items-center gap-3 bg-transparent border border-black/10 rounded-full px-3 py-1.5">
              <button
                onClick={() => fetchPendingRequests(true)}
                disabled={refreshing}
                className="w-7 h-7 flex items-center justify-center bg-transparent border border-black/10 rounded-full hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Live Sync</span>
                </div>
                <span className="text-[10px] font-mono text-gray-600 dark:text-gray-300">
                  {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-4 animate-shake">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-xs font-medium text-red-700 dark:text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <FiXCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Stats */}
        <div className="px-6 py-3 bg-black/5 border-b border-black/10">
          <div className="flex items-center justify-between text-[10px] font-semibold opacity-70">
            <span>Total: {requests.length} requests awaiting approval</span>
            <span>Last 7 days: {requests.filter(r => new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</span>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[var(--bg-secondary)] border-b border-black/10 opacity-80">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role Assignment</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                        <FiUserCheck className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No pending requests</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">All user requests have been processed</p>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <tr key={req._id} className="group hover:bg-emerald-50/30 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm group-hover:scale-110 transition-transform`}>
                            {req.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800"></div>
                        </div>
                        <div className="text-sm font-bold">{req.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="w-3.5 h-3.5 text-emerald-500" />
                        <span
                          className="px-2.5 py-1 rounded-lg bg-black/5 border border-black/10 text-[10px] font-bold text-emerald-500 uppercase tracking-wider"
                          title={req.department || ''}
                        >
                          {req.department ? (
                            {
                              'Data Minors': 'DM',
                              'Lead Qualifiers': 'LQ',
                              'Verifier': 'VER',
                              'Manager': 'MGR',
                              'Admin': 'ADM',
                              'Super Admin': 'SA'
                            }[req.department] || req.department.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase()
                          ) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-medium opacity-80 whitespace-nowrap">
                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiClock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-[10px] text-gray-400">
                            {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={selectedRoles[req._id] || ''}
                          onChange={(e) => setSelectedRoles({ ...selectedRoles, [req._id]: e.target.value })}
                          className="w-40 bg-[var(--bg-secondary)] border border-gray-500/30 rounded-xl px-3 py-2 text-[11px] font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                        >
                          <option className="bg-[var(--bg-secondary)]" value="" disabled>Select Role</option>
                          <option className="bg-[var(--bg-secondary)]" value="Data Minors">Data Minors</option>
                          <option className="bg-[var(--bg-secondary)]" value="Lead Qualifiers">Lead Qualifiers</option>
                          <option className="bg-[var(--bg-secondary)]" value="Verifier">Verifier</option>
                          <option className="bg-[var(--bg-secondary)]" value="Manager">Manager</option>
                          <option className="bg-[var(--bg-secondary)]" value="Admin">Admin</option>
                          <option className="bg-[var(--bg-secondary)]" value="Super Admin">Super Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Approve Button with Confirmation */}
                        <button
                          onClick={() => openApproveConfirmation(req._id, selectedRoles[req._id])}
                          disabled={actionLoading === req._id || !selectedRoles[req._id]}
                          className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold uppercase tracking-wider shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <div className="flex items-center gap-2">
                            {actionLoading === req._id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <FiCheckCircle className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </>
                            )}
                          </div>
                        </button>

                        {/* Reject Button with better visibility */}
                        <button
                          onClick={() => handleReject(req._id)}
                          disabled={actionLoading === req._id}
                          className="group px-4 py-2 rounded-xl bg-transparent border-2 border-red-500/50 text-red-500 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-2">
                            <FiXCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </div>
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

      {/* Approve Confirmation Modal */}
      {confirmApprove.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setConfirmApprove({ isOpen: false, requestId: null, role: null })}
          />
          <div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 animate-modalIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Confirm Approval</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This action will grant system access</p>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Role: <span className="font-bold">{confirmApprove.role}</span>
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                User will receive access permissions for {confirmApprove.role} department
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmApprove({ isOpen: false, requestId: null, role: null })}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
          />
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative z-10 animate-modalIn">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />

            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <FiAlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Reject Request</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for rejecting this access request:
            </p>

            <textarea
              value={rejectModal.comment}
              onChange={(e) => setRejectModal({ ...rejectModal, comment: e.target.value })}
              placeholder="Enter rejection reason..."
              className="w-full h-28 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ ...rejectModal, isOpen: false })}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejection}
                disabled={!rejectModal.comment.trim()}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.4s ease-out both; }
        .animate-modalIn { animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        `
      }} />
    </div>
  );
}