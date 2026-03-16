// Role-based routing utility
export const getRoleBasedRedirect = (userRole) => {
  const roleRedirectMap = {
    'Admin': '/gds/admin',
    'Super Admin': '/gds/admin',
    'Lead qualifiers': '/gds/lead-qualifier',
    'Lead Qualifiers': '/gds/lead-qualifier',
    'Team lead( Lead qualifiers,)': '/gds/lead-qualifier',
    'Data Minors': '/gds/data-minor',
    'Team lead (data minors )': '/gds/data-minor',
    'Verifier': '/gds/verifier',
    'Manager': '/gds/manager'
  };


  return roleRedirectMap[userRole] || '/gds/admin'; // Default fallback
};

export const getRoleDisplayName = (userRole) => {
  const roleNameMap = {
    'Admin': 'Admin',
    'Super Admin': 'Super Admin',
    'Lead qualifiers': 'Lead Qualifier',
    'Lead Qualifiers': 'Lead Qualifier',
    'Team lead( Lead qualifiers,)': 'Lead Qualifier',
    'Data Minors': 'Data Minor',
    'Team lead (data minors )': 'Data Minor',
    'Verifier': 'Verifier',
    'Manager': 'Manager'
  };

  return roleNameMap[userRole] || 'Dashboard';
};

export const getDashboardTitleFromPath = (pathname, userRole) => {
  // Special handling for Admin/Super Admin differentiation
  if (pathname?.startsWith('/gds/admin')) {
    return userRole === 'Super Admin' ? 'Super Admin Portal' : 'Admin Dashboard';
  }

  const pathTitleMap = {
    '/gds/admin': 'Admin Dashboard',
    '/gds/lead-qualifier': 'Lead Qualifier Dashboard',
    '/gds/data-minor': 'Data Minor Dashboard',
    '/gds/verifier': 'Verifier Dashboard',
    '/gds/manager': 'Manager Dashboard'
  };

  const match = Object.keys(pathTitleMap).find(base => pathname?.startsWith(base));
  return match ? pathTitleMap[match] : 'Dashboard';
};

import tokenManager from './tokenManager';

export const getUserRole = () => {
  // Get user role from token payload instead of localStorage
  const user = tokenManager.getUser();
  return user ? (user.role || user.department || null) : null;
};

export const hasRequiredRole = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};
