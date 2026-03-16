import React, { lazy } from "react";

// Icons
const DashboardIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const LeadsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FilesIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CombinedIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const RejectedIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Lazy Loaded Components
const LeadQualifierDashboard = lazy(() => import("../dashboards/lead-qualifier/pages/LeadQualifierDashboard"));
const DataMinorDashboard = lazy(() => import("../dashboards/data-minor/pages/DataMinorDashboard"));
const InputFiles = lazy(() => import("../dashboards/data-minor/pages/InputFiles"));
const Employees = lazy(() => import("../dashboards/data-minor/pages/EmployeeListing"));
const LeadQualifierLeads = lazy(() => import("../dashboards/lead-qualifier/pages/LeadQualifierLeads"));

const VerifierLeads = lazy(() => import("../dashboards/Verifier/pages/VerifierLeads"));
const ManagerDashboard = lazy(() => import("../dashboards/manager/pages/ManagerDashboard"));
const ManagerNewLeads = lazy(() => import("../dashboards/manager/pages/ManagerNewLeads"));
const ManagerHistory = lazy(() => import("../dashboards/manager/pages/ManagerHistory"));
const ManagerRejectedLeads = lazy(() => import("../dashboards/manager/pages/ManagerRejectedLeads"));

// Admin Pages
const AdminDashboard = lazy(() => import("../dashboards/admin/pages/AdminDashboard"));
const AdminManagerLeads = lazy(() => import("../dashboards/admin/pages/ManagerLeads"));
const AdminCombinedLeads = lazy(() => import("../dashboards/admin/pages/CombinedLeads"));
const AdminPendingRequests = lazy(() => import("../dashboards/admin/pages/PendingRequests"));
const AdminUsersManagement = lazy(() => import("../dashboards/admin/pages/UsersManagement"));
const AdminRejectedLeads = lazy(() => import("../dashboards/admin/pages/rejectedleads"));
const SuperAdminPortal = lazy(() => import("../dashboards/admin/pages/SuperAdminPortal"));

// Centralized Configuration
export const dashboardConfig = [
  {
    id: 'admin',
    name: 'Admin',
    role: ['Admin', 'Super Admin'],
    basePath: '/gds/admin',
    icon: <DashboardIcon />,
    pages: [
      { name: 'Dashboard', path: '', component: AdminDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { name: 'Combined Leads', path: 'combined-leads', component: AdminCombinedLeads, icon: <CombinedIcon />, showInSidebar: true },


      { name: 'Managers Leads', path: 'manager-leads', component: AdminManagerLeads, icon: <LeadsIcon />, showInSidebar: true },
      { name: 'Rejected Leads', path: 'rejection-requests', component: AdminRejectedLeads, icon: <RejectedIcon />, showInSidebar: true },

      { name: 'LQ Assign', path: 'super-admin', component: SuperAdminPortal, icon: <SettingsIcon />, showInSidebar: true, allowedRoles: ['Super Admin'] },

      { name: 'Pending Requests', path: 'pending-requests', component: AdminPendingRequests, icon: <UsersIcon />, showInSidebar: true },

      { name: 'Users Management', path: 'users', component: AdminUsersManagement, icon: <UsersIcon />, showInSidebar: false },
    ],
  },
  {
    id: 'lead-qualifier',
    name: 'Lead Qualifier',
    role: 'Lead Qualifiers',
    basePath: '/gds/lead-qualifier',
    icon: <DashboardIcon />,
    pages: [

      { name: 'Dashboard', path: '', component: LeadQualifierDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { name: 'All Leads', path: 'all-leads', component: LeadQualifierLeads, icon: <CombinedIcon />, showInSidebar: true },
    ],
  },
  {
    id: 'data-minor',
    name: 'Data Minor',
    role: 'Data Minors',
    basePath: '/gds/data-minor',
    icon: <LeadsIcon />,
    pages: [
      { name: 'Dashboard', path: '', component: DataMinorDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { name: 'lead Form', path: 'lead-form', component: InputFiles, icon: <FilesIcon />, showInSidebar: true },
      // { name: 'Employees', path: 'employees', component: Employees, icon: <UsersIcon />, showInSidebar: true },
      // { name: 'Leads', path: 'leads', component: VerifierLeads, icon: <LeadsIcon />, showInSidebar: true, allowedRoles: ['Verifier'] },
    ],
  },
  {
    id: 'verifier',
    name: 'Verifier',
    role: 'Verifier',
    basePath: '/gds/verifier',
    icon: <LeadsIcon />,
    hideSidebar: true,
    pages: [
      { name: 'Leads', path: '', component: VerifierLeads, icon: <LeadsIcon />, showInSidebar: false },
    ],
  },
  {
    id: 'manager',
    name: 'Manager',
    role: 'Manager',
    basePath: '/gds/manager',
    icon: <LeadsIcon />,
    pages: [
      { name: 'Dashboard', path: '', component: ManagerDashboard, icon: <DashboardIcon />, showInSidebar: true },
      { name: 'New Leads', path: 'new-leads', component: ManagerNewLeads, icon: <LeadsIcon />, showInSidebar: true },
      { name: 'History', path: 'history', component: ManagerHistory, icon: <FilesIcon />, showInSidebar: true },
      { name: 'Rejected Leads', path: 'rejected-leads', component: ManagerRejectedLeads, icon: <RejectedIcon />, showInSidebar: true },
    ],
  },
];

// For backward compatibility or alternative routing
export const appRoutes = dashboardConfig;
