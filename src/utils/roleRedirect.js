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
};

// ✅ Role aliases (handles messy backend data)
const ROLE_ALIASES = {
  'lead qualifiers': 'lead qualifier',
  'team lead( lead qualifiers,)': 'lead qualifier',
  'data minors': 'data minor',
  'team lead (data minors )': 'data minor',
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

// 🔹 Role check (safe)
export const hasRequiredRole = (userRole, requiredRoles) => {
  if (!requiredRoles?.length) return true;

  const role = resolveRole(userRole);

  return requiredRoles
    .map(r => resolveRole(r))
    .includes(role);
};