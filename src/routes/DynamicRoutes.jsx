import React, { Suspense, useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardConfig } from '../dashboards/dashboardConfig';
import SharedLoader from '../components/SharedLoader';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';

const PageLoader = () => (
  <div className="flex items-center justify-center p-12 w-full">
    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      <span>Loading page...</span>
    </div>
  </div>
);

export default function DynamicRoutes() {
  const normalizedDashboards = useMemo(
    () =>
      dashboardConfig.map((dashboard) => ({
        ...dashboard,
        roles: Array.isArray(dashboard.role) ? dashboard.role : [dashboard.role],
      })),
    [] // dashboardConfig is static import data; compute once
  );

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {normalizedDashboards.map((dashboard) => (
          <Route
            key={dashboard.id}
            path={dashboard.basePath + '/*'}
            element={
              <ProtectedRoute allowedRoles={dashboard.roles}>
                <Routes>
                  {dashboard.pages.map((page) => {
                    const PageComponent = page.component;
                    const hasPageLevelProtection = page.allowedRoles && page.allowedRoles.length > 0;

                    return (
                      <Route
                        key={page.path || 'index'}
                        path={page.path || ''}
                        element={
                          <ErrorBoundary>
                            {hasPageLevelProtection ? (
                              <ProtectedRoute allowedRoles={page.allowedRoles}>
                                <Suspense fallback={<PageLoader />}>
                                  <PageComponent />
                                </Suspense>
                              </ProtectedRoute>
                            ) : (
                              <Suspense fallback={<PageLoader />}>
                                <PageComponent />
                              </Suspense>
                            )}
                          </ErrorBoundary>
                        }
                      />
                    );
                  })}
                </Routes>
              </ProtectedRoute>
            }
          />
        ))}

        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  404 - Page Not Found
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  The page you're looking for doesn't exist within the dashboard.
                </p>
              </div>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}