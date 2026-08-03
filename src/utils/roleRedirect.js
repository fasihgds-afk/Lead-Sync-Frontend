// ✅ Single Source of Truth for Departments & Roles
//
// ALL role strings in the app should be imported from here.
// Change a name in ROLES once → it propagates everywhere automatically.

// ─────────────────────────────────────────────────────────────────────────────
// ROLES — canonical string values used across dashboardConfig, hooks, etc.
// ─────────────────────────────────────────────────────────────────────────────
export const ROLES = {
  SUPER_ADMIN:    'Super Admin',
  ADMIN:          'Admin',
  DATA_MINORS:    'Data Minors',
  LEAD_QUALIFIERS:'Lead Qualifiers',
  VERIFIER:       'Verifier',
  MANAGER:        'Manager',
  WRITERS:        'Writers',
  WRITING:        'Writing',   // alias backend sends sometimes
  WRITER:         'Writer',    // alias backend sends sometimes
};

// Departments available for User Signup
export const SIGNUP_DEPARTMENTS = [
  'RND',
  'Quality Assurance',
  'Sales',
  ROLES.LEAD_QUALIFIERS,
  ROLES.WRITING,
];

// System Roles available for Admin Assignment
export const SYSTEM_ROLES = [
  ROLES.DATA_MINORS,
  ROLES.LEAD_QUALIFIERS,
  ROLES.VERIFIER,
  ROLES.MANAGER,
  ROLES.WRITERS,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];

// Department Badge Acronyms
export const DEPARTMENT_ABBREVIATIONS = {
  [ROLES.DATA_MINORS]:     'DM',
  [ROLES.LEAD_QUALIFIERS]: 'LQ',
  [ROLES.VERIFIER]:        'VER',
  [ROLES.MANAGER]:         'MGR',
  [ROLES.WRITING]:         'WRT',
  [ROLES.WRITERS]:         'WRT',
  [ROLES.ADMIN]:           'ADM',
  [ROLES.SUPER_ADMIN]:     'SA',
};

export const getDepartmentAbbrev = (dept) => {
  if (!dept) return 'N/A';
  return DEPARTMENT_ABBREVIATIONS[dept] || dept.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
};

// ✅ Normalize role helper
const normalizeRole = (role) =>
  role?.toLowerCase().trim();

// ✅ Central role config (Single Source of Truth)
const ROLE_CONFIG = {
  admin: {
    redirect: '/gds/admin',
    display: 'Admin',
  },
  'super admin': {
    redirect: '/gds/admin',
    display: 'Super Admin',
  },
  'lead qualifier': {
    redirect: '/gds/lead-qualifier',
    display: 'Lead Qualifier',
  },
  'data minor': {
    redirect: '/gds/data-minor',
    display: 'Data Minor',
  },
  verifier: {
    redirect: '/gds/verifier',
    display: 'Verifier',
  },
  manager: {
    redirect: '/gds/manager',
    display: 'Manager',
  },
  writer: {
    redirect: '/gds/writer',
    display: 'Writer',
  },
};

// ✅ Role aliases (handles messy backend data)
const ROLE_ALIASES = {
  'lead qualifiers': 'lead qualifier',
  'team lead( lead qualifiers,)': 'lead qualifier',
  'data minors': 'data minor',
  'team lead (data minors )': 'data minor',
  'writers': 'writer',
  'writing': 'writer',
};

// ✅ Resolve final role
const resolveRole = (role) => {
  const normalized = normalizeRole(role);
  return ROLE_ALIASES[normalized] || normalized;
};

// 🔹 Redirect
export const getRoleBasedRedirect = (userRole) => {
  const role = resolveRole(userRole);
  return ROLE_CONFIG[role]?.redirect || '/unauthorized';
};

// 🔹 Display Name
export const getRoleDisplayName = (userRole) => {
  const role = resolveRole(userRole);
  return ROLE_CONFIG[role]?.display || 'User';
};

// 🔹 Dashboard Title
export const getDashboardTitleFromPath = (pathname, userRole) => {
  const role = resolveRole(userRole);

  if (pathname?.startsWith('/gds/admin')) {
    return role === 'super admin'
      ? 'Super Admin Portal'
      : 'Admin Dashboard';
  }

  const match = Object.values(ROLE_CONFIG).find(config =>
    pathname?.startsWith(config.redirect)
  );

  return match
    ? `${match.display} Dashboard`
    : 'Dashboard';
};

// 🔹 Get user role
import tokenManager from './tokenManager';

export const getUserRole = () => {
  const user = tokenManager.getUser();
  return user ? (user.role || user.department || null) : null;
};

// Role check (safe)
export const hasRequiredRole = (userRole, requiredRoles) => {
  if (!requiredRoles?.length) return true;

  const role = resolveRole(userRole);

  return requiredRoles
    .map(r => resolveRole(r))
    .includes(role);
};

// Public routes (Single Source of Truth)
const PUBLIC_ROUTES = new Set(['/', '/login', '/signup', '/forgot-password']);

export const isPublicRoute = (pathname) => {
  const path = pathname || window.location.pathname;
  const normalizedPath = path.toLowerCase().replace(/\/$/, '') || '/';
  return PUBLIC_ROUTES.has(normalizedPath) || normalizedPath.startsWith('/reset-password');
};