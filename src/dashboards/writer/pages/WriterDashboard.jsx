import React, { useState } from 'react';
import {
  FiEdit3,
  FiCheckCircle,
  FiSearch,
  FiEye,
  FiLayers,
  FiCheck
} from 'react-icons/fi';

export default function WriterDashboard() {
  const [activeTab, setActiveTab] = useState('normal');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [confirmArticle, setConfirmArticle] = useState(null);

  // Static Sample Data for Writers
  const [articles, setArticles] = useState([
    {
      id: 'ART-101',
      title: 'Top 10 Lead Generation Strategies for B2B SaaS in 2026',
      niche: 'Digital Marketing',
      words: 2400,
      status: 'Approved',
      type: 'Normal',
      dueDate: '2026-07-28',
      submittedDate: '2026-07-26',
      feedback: 'Excellent breakdown of modern CRM integration workflows.'
    },
    {
      id: 'ART-102',
      title: 'How Artificial Intelligence is Automating Data Qualification',
      niche: 'AI & Automation',
      words: 1850,
      status: 'In Review',
      type: 'Recurring',
      dueDate: '2026-08-02',
      submittedDate: '2026-07-30',
      feedback: 'Currently under review by Lead Content Manager.'
    },
    {
      id: 'ART-103',
      title: 'Comprehensive Guide to Cold Email Deliverability & Warmup',
      niche: 'Sales Outreach',
      words: 3100,
      status: 'Revisions Needed',
      type: 'Normal',
      dueDate: '2026-08-01',
      submittedDate: '2026-07-29',
      feedback: 'Please expand section 3 with stats on SPF/DKIM verification.'
    },
    {
      id: 'ART-104',
      title: 'Building High-Converting Landing Pages: UX Best Practices',
      niche: 'Web Design & Conversion',
      words: 2150,
      status: 'Draft',
      type: 'Recurring',
      dueDate: '2026-08-05',
      submittedDate: '-',
      feedback: 'Work in progress.'
    },
    {
      id: 'ART-105',
      title: 'Customer Data Platforms vs Traditional CRMs: Key Differences',
      niche: 'Tech Stack',
      words: 1950,
      status: 'Approved',
      type: 'Normal',
      dueDate: '2026-07-24',
      submittedDate: '2026-07-22',
      feedback: 'Published on corporate blog.'
    }
  ]);

  const filteredArticles = articles.filter(art => {
    const matchesTab =
      (activeTab === 'normal' && art.type === 'Normal') ||
      (activeTab === 'recurring' && art.type === 'Recurring');

    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Approved</span>;
      case 'In Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">In Review</span>;
      case 'Revisions Needed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">Revisions Needed</span>;
      case 'Draft':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-600 border border-gray-500/20">Draft</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500/10 text-gray-500">{status}</span>;
    }
  };

  const handleConfirmDone = () => {
    if (!confirmArticle) return;
    setArticles(prev =>
      prev.map(art =>
        art.id === confirmArticle.id ? { ...art, status: 'Completed' } : art
      )
    );
    setConfirmArticle(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto animate-fadeIn min-h-screen">
      {/* Top Banner / Header */}
      <div className="border bg-[var(--bg-secondary)] border-black/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/20">
              <FiEdit3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
                  Writer Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                  Writer Portal
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Manage your content assignments, track approvals, and monitor writing output metrics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header & Tabs */}
        <div className="p-5 border-b border-black/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FiLayers className="text-emerald-500" />
                <span>Content Assignments & Submissions</span>
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Track writing progress and editor feedback
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles or niche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs rounded-xl bg-[var(--bg-tertiary)] border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-60 text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'recurring', label: 'Recurring' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-black/5 text-[var(--text-secondary)] hover:bg-black/10'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-black/5 border-b border-black/10 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Article Info</th>
                <th className="px-5 py-3.5">Niche</th>
                <th className="px-5 py-3.5">Word Count</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Due Date</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 text-xs">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-emerald-50/20 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[var(--text-primary)] max-w-xs truncate">
                        {art.title}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-600 mt-0.5">
                        ID: {art.id}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--text-secondary)] whitespace-nowrap">
                      {art.niche}
                    </td>
                    <td className="px-5 py-4 font-bold text-[var(--text-primary)] whitespace-nowrap">
                      {art.words.toLocaleString()} words
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {getStatusBadge(art.status)}
                    </td>
                    <td className="px-5 py-4 font-medium text-[var(--text-secondary)] whitespace-nowrap">
                      {art.dueDate}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedArticle(art)}
                          className="px-3 py-1.5 rounded-lg bg-black/5 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => setConfirmArticle(art)}
                          disabled={art.status === 'Completed'}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-600"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                          <span>OK</span>
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

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-fadeIn">
            <div className="flex justify-between items-start border-b border-black/10 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">{selectedArticle.id}</span>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-1">{selectedArticle.title}</h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-gray-500">Niche:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedArticle.niche}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-gray-500">Target Word Count:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedArticle.words} words</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-gray-500">Current Status:</span>
                <div>{getStatusBadge(selectedArticle.status)}</div>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5">
                <span className="text-gray-500">Due Date:</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedArticle.dueDate}</span>
              </div>

              <div className="pt-2">
                <span className="text-gray-500 block mb-1 font-semibold">Editorial Feedback / Notes:</span>
                <div className="p-3 bg-black/5 rounded-xl text-gray-700 italic border border-black/5">
                  "{selectedArticle.feedback}"
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simple Confirm Modal - Mark as Done */}
      {confirmArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-secondary)] border border-black/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center animate-fadeIn">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              Mark work as done?
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              {confirmArticle.id} — {confirmArticle.title}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmArticle(null)}
                className="px-4 py-2 rounded-xl bg-black/5 text-[var(--text-secondary)] font-bold text-xs hover:bg-black/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDone}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}