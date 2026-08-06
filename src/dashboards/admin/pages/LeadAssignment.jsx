import React, { useState } from 'react';
import {
  FiUserCheck,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiSend,
  FiMail,
  FiPhone,
  FiGlobe,
  FiUser,
  FiX
} from 'react-icons/fi';

const MANAGER_OPTIONS = [
  'Manager Ahmed',
  'Manager Ali',
  'Manager Sara',
  'Manager John',
  'Manager Smith'
];

export default function LeadAssignment() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactModalData, setContactModalData] = useState(null);

  // Realistic sample rows (25 items)
  const initialLeads = [
    { id: 'LD-1001', name: 'Alexander Wright', email: 'alex.wright@techcorp.io', phone: '+1 (555) 234-5678', location: 'New York, USA', source: 'Website Form', dateAdded: '2026-07-28', manager: 'Manager Ahmed', status: 'In Progress', assignedTo: 'Manager Ahmed' },
    { id: 'LD-1002', name: 'Sophia Martinez', email: 'sophia.m@globalenterprise.com', phone: '+44 20 7946 0912', location: 'London, UK', source: 'Google Ads', dateAdded: '2026-07-28', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1003', name: 'Liam O\'Connor', email: 'liam.oc@emerald.ie', phone: '+353 1 496 0123', location: 'Dublin, Ireland', source: 'LinkedIn Campaign', dateAdded: '2026-07-27', manager: 'Manager Ali', status: 'Contacted', assignedTo: 'Manager Ali' },
    { id: 'LD-1004', name: 'Emma Vance', email: 'emma.vance@apexsol.com', phone: '+1 (555) 345-6789', location: 'Chicago, USA', source: 'Direct Referral', dateAdded: '2026-07-27', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1005', name: 'Noah Thorne', email: 'noah.thorne@cyberdyn.com', phone: '+1 (555) 456-7890', location: 'San Francisco, USA', source: 'Cold Outreach', dateAdded: '2026-07-26', manager: 'Manager Sara', status: 'Qualified', assignedTo: 'Manager Sara' },
    { id: 'LD-1006', name: 'Olivia Sterling', email: 'olivia.s@sterlingmedia.ca', phone: '+1 (416) 555-0147', location: 'Toronto, Canada', source: 'Facebook Campaign', dateAdded: '2026-07-26', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1007', name: 'Ethan Hunt', email: 'ethan.h@imfsec.org', phone: '+1 (555) 987-6543', location: 'Washington D.C., USA', source: 'Website Form', dateAdded: '2026-07-25', manager: 'Manager John', status: 'In Progress', assignedTo: 'Manager John' },
    { id: 'LD-1008', name: 'Ava Dubois', email: 'ava.dubois@lumiere.fr', phone: '+33 1 42 68 55 00', location: 'Paris, France', source: 'Partner Referral', dateAdded: '2026-07-25', manager: 'Manager Smith', status: 'Qualified', assignedTo: 'Manager Smith' },
    { id: 'LD-1009', name: 'Lucas Rossi', email: 'lucas.rossi@velox.it', phone: '+39 06 698 12345', location: 'Rome, Italy', source: 'Google Ads', dateAdded: '2026-07-24', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1010', name: 'Mia Tanaka', email: 'mia.tanaka@tokyonet.jp', phone: '+81 3 5555 0192', location: 'Tokyo, Japan', source: 'LinkedIn Campaign', dateAdded: '2026-07-24', manager: 'Manager Ahmed', status: 'Contacted', assignedTo: 'Manager Ahmed' },
    { id: 'LD-1011', name: 'James Wilson', email: 'j.wilson@horizon.com', phone: '+1 (555) 876-5432', location: 'Boston, USA', source: 'Website Form', dateAdded: '2026-07-24', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1012', name: 'Isabella Schmidt', email: 'isabella@schmidt-gmbh.de', phone: '+49 30 1234567', location: 'Berlin, Germany', source: 'Cold Outreach', dateAdded: '2026-07-23', manager: 'Manager Ali', status: 'In Progress', assignedTo: 'Manager Ali' },
    { id: 'LD-1013', name: 'Benjamin Zhang', email: 'benjamin.z@pacific.cn', phone: '+86 10 8511 1234', location: 'Beijing, China', source: 'Direct Referral', dateAdded: '2026-07-23', manager: 'Manager Sara', status: 'Qualified', assignedTo: 'Manager Sara' },
    { id: 'LD-1014', name: 'Charlotte Evans', email: 'charlotte@evansdesign.co.uk', phone: '+44 161 496 0888', location: 'Manchester, UK', source: 'Google Ads', dateAdded: '2026-07-22', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1015', name: 'Mason Brooks', email: 'mason.b@brookslogistics.com', phone: '+1 (555) 765-4321', location: 'Dallas, USA', source: 'Website Form', dateAdded: '2026-07-22', manager: 'Manager John', status: 'Contacted', assignedTo: 'Manager John' },
    { id: 'LD-1016', name: 'Amelia Santos', email: 'amelia.santos@iberia.es', phone: '+34 91 123 45 67', location: 'Madrid, Spain', source: 'LinkedIn Campaign', dateAdded: '2026-07-21', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1017', name: 'Harper Reed', email: 'harper.r@summit.org', phone: '+1 (555) 654-3210', location: 'Seattle, USA', source: 'Partner Referral', dateAdded: '2026-07-21', manager: 'Manager Smith', status: 'In Progress', assignedTo: 'Manager Smith' },
    { id: 'LD-1018', name: 'Evelyn Miller', email: 'evelyn.m@millertech.com', phone: '+1 (555) 543-2109', location: 'Austin, USA', source: 'Website Form', dateAdded: '2026-07-20', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' },
    { id: 'LD-1019', name: 'Logan Kim', email: 'logan.kim@seoultech.kr', phone: '+82 2 3456 7890', location: 'Seoul, South Korea', source: 'Google Ads', dateAdded: '2026-07-20', manager: 'Manager Ahmed', status: 'Qualified', assignedTo: 'Manager Ahmed' },
    { id: 'LD-1020', name: 'Abigail Garcia', email: 'abigail.g@solaria.mx', phone: '+52 55 5123 4567', location: 'Mexico City, Mexico', source: 'Cold Outreach', dateAdded: '2026-07-19', manager: 'Unassigned', status: 'Unassigned', assignedTo: '' }
  ];

  const [leads, setLeads] = useState(initialLeads);

  const handleAssignChange = (id, managerName) => {
    setLeads(prev =>
      prev.map(item => (item.id === id ? { ...item, assignedTo: managerName } : item))
    );
  };

  const filteredLeads = leads.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === 'Assigned') return matchesSearch && item.manager !== 'Unassigned';
    if (selectedFilter === 'Unassigned') return matchesSearch && item.manager === 'Unassigned';
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Qualified':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Contacted':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'Unassigned':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full animate-fadeIn min-h-screen">
      {/* Header */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
              <FiUserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)]">
                Lead Assignment
              </h1>
              <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
                Assign enterprise leads (1,000+ total dataset) to team managers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
            <FiSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-primary)]">
            <button
              onClick={() => setSelectedFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFilter === 'All'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              All Leads
            </button>
            <button
              onClick={() => setSelectedFilter('Assigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFilter === 'Assigned'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              Assigned
            </button>
            <button
              onClick={() => setSelectedFilter('Unassigned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedFilter === 'Unassigned'
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              Unassigned
            </button>
          </div>

          <button className="px-3.5 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--border-primary)] text-xs font-semibold transition-all flex items-center gap-1.5">
            <FiFilter className="w-4 h-4 text-[var(--accent-primary)]" />
            Filter
          </button>
        </div>
      </div>

      {/* Leads Table - Sleek & Compact with No Horizontal Scrollbar */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)] text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <th className="px-3 py-3.5">Lead ID</th>
              <th className="px-3 py-3.5">Customer Name</th>
              <th className="px-3 py-3.5 text-center">Contact Info</th>
              <th className="px-3 py-3.5">Location</th>
              <th className="px-3 py-3.5">Source</th>
              <th className="px-3 py-3.5">Date Added</th>
              <th className="px-3 py-3.5">Current Manager</th>
              <th className="px-3 py-3.5">Status</th>
              <th className="px-3 py-3.5">Assign To</th>
              <th className="px-3 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-primary)]/60 text-xs">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-[var(--bg-tertiary)]/40 transition-colors">
                {/* Lead ID */}
                <td className="px-3 py-3 font-mono font-bold text-[var(--accent-primary)] whitespace-nowrap">
                  {lead.id}
                </td>

                {/* Customer Name */}
                <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">
                  {lead.name}
                </td>

                {/* Contact Info (Modal Trigger Icon Button) */}
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => setContactModalData(lead)}
                    className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-sm active:scale-95 inline-flex items-center gap-1 font-bold text-[11px]"
                    title="View Contact Details"
                  >
                    <FiMail className="w-3.5 h-3.5" />
                    <FiPhone className="w-3.5 h-3.5" />
                  </button>
                </td>

                {/* Location */}
                <td className="px-3 py-3 text-[var(--text-secondary)] truncate max-w-[110px]">
                  {lead.location}
                </td>

                {/* Lead Source */}
                <td className="px-3 py-3 text-[var(--text-secondary)]">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[10px]">
                    {lead.source}
                  </span>
                </td>

                {/* Date Added */}
                <td className="px-3 py-3 text-[var(--text-tertiary)] font-mono text-[11px] whitespace-nowrap">
                  {lead.dateAdded}
                </td>

                {/* Current Manager */}
                <td className="px-3 py-3 font-medium">
                  <span className={lead.manager === 'Unassigned' ? 'text-rose-500 italic' : 'text-[var(--text-primary)]'}>
                    {lead.manager}
                  </span>
                </td>

                {/* Lead Status */}
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getStatusBadge(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>

                {/* Assign To (Static Dropdown) */}
                <td className="px-3 py-3">
                  <select
                    value={lead.assignedTo || lead.manager}
                    onChange={(e) => handleAssignChange(lead.id, e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                  >
                    <option value="" disabled>-- Select --</option>
                    {MANAGER_OPTIONS.map(mgr => (
                      <option key={mgr} value={mgr}>{mgr}</option>
                    ))}
                  </select>
                </td>

                {/* Action */}
                <td className="px-3 py-3 text-center">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-semibold text-xs shadow-sm transition-all inline-flex items-center gap-1 active:scale-95"
                  >
                    <FiSend className="w-3 h-3" />
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div>
            Showing <span className="font-bold text-[var(--text-primary)]">1 to 20</span> of{' '}
            <span className="font-bold text-[var(--text-primary)]">1,248</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:bg-[var(--border-primary)] disabled:opacity-40 transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded-xl bg-[var(--accent-primary)] text-white font-bold">
              {currentPage}
            </span>
            <span className="px-2 font-medium">of 50</span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:bg-[var(--border-primary)] transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sleek, Low-Height Compact Contact Details Modal (Optimized for Laptop Screens) */}
      {contactModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-4 sm:p-5 max-w-sm w-full shadow-xl relative animate-slideDown space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-lg">
                  <FiUser className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] leading-none">
                    Contact Details
                  </h3>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)]">
                    {contactModalData.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setContactModalData(null)}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Compact Rows */}
            <div className="space-y-2 text-xs">
              {/* Customer Name */}
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/70 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Customer:
                </span>
                <span className="font-bold text-xs text-[var(--text-primary)]">
                  {contactModalData.name}
                </span>
              </div>

              {/* Email Address */}
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/70 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                  <FiMail className="w-3 h-3 text-blue-500" />
                  Email:
                </span>
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[200px]" title={contactModalData.email}>
                  {contactModalData.email}
                </span>
              </div>

              {/* Phone Number */}
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/70 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                  <FiPhone className="w-3 h-3 text-emerald-500" />
                  Phone:
                </span>
                <span className="font-semibold text-xs text-[var(--text-primary)] font-mono">
                  {contactModalData.phone}
                </span>
              </div>

              {/* Location */}
              <div className="px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/70 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] flex items-center gap-1">
                  <FiGlobe className="w-3 h-3 text-purple-500" />
                  Location:
                </span>
                <span className="font-semibold text-xs text-[var(--text-primary)] truncate max-w-[180px]">
                  {contactModalData.location}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setContactModalData(null)}
                className="px-4 py-1.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white font-semibold text-xs shadow-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
