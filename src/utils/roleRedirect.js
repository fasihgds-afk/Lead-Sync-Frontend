// ✅ Single Source of Truth for Departments & Roles
//
// To add a role: add ONE entry to ROLE_DEFINITIONS below.
// Everything else (ROLES, redirects, display names, abbreviations,
// aliases, resolveRole) is derived automatically.

import tokenManager from './tokenManager';

const ROLE_DEFINITIONS = [
  { id: 'superAdmin', canonical: 'Super Admin', redirect: '/gds/admin', abbrev: 'SA', aliases: [] },
  { id: 'admin', canonical: 'Admin', redirect: '/gds/admin', abbrev: 'ADM', aliases: [] },
  { id: 'dataMinors', canonical: 'Data Minors', redirect: '/gds/data-minor', abbrev: 'DM', aliases: ['data minors', 'team lead (data minors )'] },
  { id: 'leadQualifiers', canonical: 'Lead Qualifiers', redirect: '/gds/lead-qualifier', abbrev: 'LQ', aliases: ['lead qualifiers', 'team lead( lead qualifiers,)'] },
  { id: 'verifier', canonical: 'Verifier', redirect: '/gds/verifier', abbrev: 'VER', aliases: [] },
  { id: 'manager', canonical: 'Manager', redirect: '/gds/manager', abbrev: 'MGR', aliases: [] },
  { id: 'writer', canonical: 'Writer', redirect: '/gds/writer', abbrev: 'WRT', aliases: ['writers', 'writing', 'Writing'] },
];

const norm = (s) => s?.toLowerCase().trim();

// Derived: { SUPER_ADMIN: 'Super Admin', ADMIN: 'Admin', ... }
export const ROLES = Object.fromEntries(
  ROLE_DEFINITIONS.map(r => [
    r.id.replace(/([A-Z])/g, '_$1').toUpperCase(),
    r.canonical,
  ])
);

export const SYSTEM_ROLES = ROLE_DEFINITIONS.map(r => r.canonical);

export const DEPARTMENT_ABBREVIATIONS = Object.fromEntries(
  ROLE_DEFINITIONS.map(r => [r.canonical, r.abbrev])
);

// normalized-key -> definition (canonical form + all aliases point here)
const ROLE_LOOKUP = new Map();
for (const def of ROLE_DEFINITIONS) {
  ROLE_LOOKUP.set(norm(def.canonical), def);
  for (const alias of def.aliases) ROLE_LOOKUP.set(norm(alias), def);
}

export const resolveRole = (role) => ROLE_LOOKUP.get(norm(role)) ?? null;

export const getRoleBasedRedirect = (userRole) =>
  resolveRole(userRole)?.redirect ?? '/unauthorized';

export const getRoleDisplayName = (userRole) =>
  resolveRole(userRole)?.canonical ?? 'User';

export const getDepartmentAbbrev = (dept) =>
  resolveRole(dept)?.abbrev ?? (dept ? dept.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase() : 'N/A');

export const hasRequiredRole = (userRole, requiredRoles) => {
  if (!requiredRoles?.length) return true;
  const target = resolveRole(userRole);
  if (!target) return false;
  return requiredRoles.some(r => resolveRole(r) === target);
};

export const getDashboardTitleFromPath = (pathname, userRole) => {
  const target = resolveRole(userRole);
  if (pathname?.startsWith('/gds/admin')) {
    return target?.id === 'superAdmin' ? 'Super Admin Portal' : 'Admin Dashboard';
  }
  const match = ROLE_DEFINITIONS.find(def => pathname?.startsWith(def.redirect));
  return match ? `${match.canonical} Dashboard` : 'Dashboard';
};

export const getUserRole = () => {
  const user = tokenManager.getUser();
  return user ? (user.role || user.department || null) : null;
};

// Departments available for User Signup.
// These values MUST exactly match backend constants.js departments enum:
// ["Development", "IT", "Marketing&SEO", "RND", "Quality Assurance", "Sales", "Writing"]
export const SIGNUP_DEPARTMENTS = ['Development', 'IT', 'Marketing&SEO', 'RND', 'Quality Assurance', 'Sales', 'Writing'];

const PUBLIC_ROUTES = new Set(['/', '/login', '/signup', '/forgot-password']);
export const isPublicRoute = (pathname) => {
  const path = pathname || window.location.pathname;
  const normalizedPath = path.toLowerCase().replace(/\/$/, '') || '/';
  return PUBLIC_ROUTES.has(normalizedPath) || normalizedPath.startsWith('/reset-password');
};