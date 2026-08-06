import React, { lazy } from "react";
import { ROLES } from '../utils/roleRedirect';

// =====================================================================
// Shared icon renderer — replaces 18 near-identical <svg> wrapper
// components with one component + a path-data dictionary. Usage stays
// exactly the same everywhere else in the app (<DashboardIcon />, etc).
// =====================================================================
const Icon = ({ paths, className = "h-5 w-5" }) => {
  const list = Array.isArray(paths) ? paths : [paths];
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {list.map((d, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
      ))}
    </svg>
  );
};

const ICON_PATHS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  // Shared by LeadsIcon and AnalyticsIcon — they were previously two
  // separate components with identical path data (copy-paste leftover).
  barChart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  settings: [
    "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
    "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  ],
  files: "M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  combined: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
  rejected: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  database: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4",
  briefcase: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  verifier: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  plus: "M12 4v16m8-8H4",
  userCheck: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  pencil: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
};

// Factory keeps the existing call sites unchanged: <DashboardIcon />
// still works exactly as before everywhere else in the app.
const makeIcon = (paths) => () => <Icon paths={paths} />;

const DashboardIcon = makeIcon(ICON_PATHS.dashboard);
const UsersIcon = makeIcon(ICON_PATHS.users);
const LeadsIcon = makeIcon(ICON_PATHS.barChart);
const SettingsIcon = makeIcon(ICON_PATHS.settings);
const FilesIcon = makeIcon(ICON_PATHS.files);
const AnalyticsIcon = makeIcon(ICON_PATHS.barChart);
const CombinedIcon = makeIcon(ICON_PATHS.combined);
const RejectedIcon = makeIcon(ICON_PATHS.rejected);
const ShieldIcon = makeIcon(ICON_PATHS.shield);
const SearchIcon = makeIcon(ICON_PATHS.search);
const DatabaseIcon = makeIcon(ICON_PATHS.database);
const BriefcaseIcon = makeIcon(ICON_PATHS.briefcase);
const VerifierIcon = makeIcon(ICON_PATHS.verifier);
const PlusIcon = makeIcon(ICON_PATHS.plus);
const UserCheckIcon = makeIcon(ICON_PATHS.userCheck);
const DollarIcon = makeIcon(ICON_PATHS.dollar);
const ClockIcon = makeIcon(ICON_PATHS.clock);
const PencilIcon = makeIcon(ICON_PATHS.pencil);
const LayersIcon = makeIcon(ICON_PATHS.layers);

// =====================================================================
// Lazy Loaded Components
// =====================================================================
const LeadQualifierDashboard = lazy(() => import("../dashboards/lead-qualifier/pages/LeadQualifierDashboard"));
const DataMinorDashboard = lazy(() => import("../dashboards/data-minor/pages/DataMinorDashboard"));
const InputFiles = lazy(() => import("../dashboards/data-minor/pages/InputFiles"));
const LeadQualifierLeads = lazy(() => import("../dashboards/lead-qualifier/pages/LeadQualifierLeads"));

const VerifierLeads = lazy(() => import("../dashboards/Verifier/pages/VerifierLeads"));
const ManagerDashboard = lazy(() => import("../dashboards/manager/pages/ManagerDashboard"));
const ManagerNewLeads = lazy(() => import("../dashboards/manager/pages/ManagerNewLeads"));
const ManagerHistory = lazy(() => import("../dashboards/manager/pages/ManagerHistory"));
const ManagerRejectedLeads = lazy(() => import("../dashboards/manager/pages/ManagerRejectedLeads"));
const WriterDashboard = lazy(() => import("../dashboards/writer/pages/WriterDashboard"));

// Admin Pages
const AdminDashboard = lazy(() => import("../dashboards/admin/pages/AdminDashboard"));
const AdminCombinedLeads = lazy(() => import("../dashboards/admin/pages/CombinedLeads"));
const AdminPendingRequests = lazy(() => import("../dashboards/admin/pages/PendingRequests"));
const AdminUsersManagement = lazy(() => import("../dashboards/admin/pages/UsersManagement"));
const AdminRejectedLeads = lazy(() => import("../dashboards/admin/pages/rejectedleads"));
const AdminPerformance = lazy(() => import("../dashboards/admin/pages/PerformanceDetails"));
const SuperAdminPortal = lazy(() => import("../dashboards/admin/pages/SuperAdminPortal"));
const AdminAddData = lazy(() => import("../dashboards/admin/pages/AddData"));
const AdminManagerLeads = lazy(() => import("../dashboards/admin/pages/ManagerLeads"));
const AdminPaidLeads = lazy(() => import("../dashboards/admin/pages/PaidLeads"));
const AdminPendingLeads = lazy(() => import("../dashboards/admin/pages/PendingLeads"));
const AdminMetaLeads = lazy(() => import("../dashboards/admin/pages/MetaLeads"));

// =====================================================================
// Centralized Configuration
//
// NOTE on `role`: always an array of strings now, even for single-role
// dashboards. Downstream access-control code can safely do
// `dashboard.role.includes(user.role)` everywhere without branching on
// whether it's a string or array. Double-check these values match your
// backend's role strings exactly (case + plural/singular matters).
// =====================================================================

export const dashboardConfig = [
  {
    id: 'admin',
    name: 'Admin',
    role: [ROLES.SUPER_ADMIN, ROLES.ADMIN],
    basePath: '/gds/admin',
    icon: <ShieldIcon />,
    pages: [
      { id: 'admin-dashboard', name: 'Dashboard', path: '', component: AdminDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { id: 'admin-combined-leads', name: 'Combined Leads', path: 'combined-leads', component: AdminCombinedLeads, icon: <CombinedIcon />, showInSidebar: true },
      { id: 'admin-rejected-leads', name: 'Rejected Leads', path: 'rejection-requests', component: AdminRejectedLeads, icon: <RejectedIcon />, showInSidebar: true },
      { id: 'admin-performance', name: 'Performance', path: 'performance', component: AdminPerformance, icon: <AnalyticsIcon />, showInSidebar: true, allowedRoles: [ROLES.SUPER_ADMIN] },
      { id: 'admin-pending-leads', name: 'Pending Leads', path: 'pending-leads', component: AdminPendingLeads, icon: <ClockIcon />, showInSidebar: true },
      { id: 'admin-paid-leads', name: 'Paid Leads', path: 'paid-leads', component: AdminPaidLeads, icon: <DollarIcon />, showInSidebar: true },
      { id: 'admin-manager-leads', name: 'Manager Leads', path: 'manager-leads', component: AdminManagerLeads, icon: <BriefcaseIcon />, showInSidebar: false },
      { id: 'admin-add-data', name: 'Add Data', path: 'add-data', component: AdminAddData, icon: <PlusIcon />, showInSidebar: true },
      { id: 'admin-meta-leads', name: 'Meta Leads', path: 'meta-leads', component: AdminMetaLeads, icon: <LayersIcon />, showInSidebar: true },
      { id: 'admin-lq-assign', name: 'LQ Assign', path: 'super-admin', component: SuperAdminPortal, icon: <SettingsIcon />, showInSidebar: true, allowedRoles: [ROLES.SUPER_ADMIN] },
      { id: 'admin-pending-requests', name: 'Pending Requests', path: 'pending-requests', component: AdminPendingRequests, icon: <UsersIcon />, showInSidebar: true, allowedRoles: [ROLES.SUPER_ADMIN] },
      { id: 'admin-users-management', name: 'Users Management', path: 'users', component: AdminUsersManagement, icon: <UsersIcon />, showInSidebar: false, allowedRoles: [ROLES.SUPER_ADMIN] },
    ],
  },
  {
    id: 'lead-qualifier',
    name: 'Lead Qualifier',
    role: [ROLES.LEAD_QUALIFIERS],
    basePath: '/gds/lead-qualifier',
    icon: <SearchIcon />,
    pages: [
      { id: 'lq-dashboard', name: 'Dashboard', path: '', component: LeadQualifierDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { id: 'lq-all-leads', name: 'All Leads', path: 'all-leads', component: LeadQualifierLeads, icon: <CombinedIcon />, showInSidebar: true },
    ],
  },
  {
    id: 'data-minor',
    name: 'Data Minor',
    role: [ROLES.DATA_MINORS],
    basePath: '/gds/data-minor',
    icon: <DatabaseIcon />,
    pages: [
      { id: 'dm-dashboard', name: 'Dashboard', path: '', component: DataMinorDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { id: 'dm-lead-form', name: 'Lead Form', path: 'lead-form', component: InputFiles, icon: <FilesIcon />, showInSidebar: true },
    ],
  },
  {
    id: 'verifier',
    name: 'Verifier',
    role: [ROLES.VERIFIER],
    basePath: '/gds/verifier',
    icon: <VerifierIcon />,
    hideSidebar: true,
    pages: [
      { id: 'verifier-leads', name: 'Leads', path: '', component: VerifierLeads, icon: <LeadsIcon />, showInSidebar: false },
    ],
  },
  {
    id: 'manager',
    name: 'Manager',
    role: [ROLES.MANAGER],
    basePath: '/gds/manager',
    icon: <BriefcaseIcon />,
    pages: [
      { id: 'manager-dashboard', name: 'Dashboard', path: '', component: ManagerDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { id: 'manager-new-leads', name: 'New Leads', path: 'new-leads', component: ManagerNewLeads, icon: <LeadsIcon />, showInSidebar: true },
      { id: 'manager-history', name: 'History', path: 'history', component: ManagerHistory, icon: <FilesIcon />, showInSidebar: true },
      { id: 'manager-rejected-leads', name: 'Rejected Leads', path: 'rejected-leads', component: ManagerRejectedLeads, icon: <RejectedIcon />, showInSidebar: true },
    ],
  },
  {
    id: 'writer',
    name: 'Writer',
    role: [ROLES.WRITERS, ROLES.WRITING, ROLES.WRITER],
    basePath: '/gds/writer',
    icon: <PencilIcon />,
    pages: [
      { id: 'writer-dashboard', name: 'Dashboard', path: '', component: WriterDashboard, icon: <DashboardIcon />, showInSidebar: true },
    ],
  },
];

// For backward compatibility or alternative routing
export const appRoutes = dashboardConfig;