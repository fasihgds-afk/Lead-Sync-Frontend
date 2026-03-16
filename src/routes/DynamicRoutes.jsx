import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardConfig } from '../dashboards/dashboardConfig';
import SharedLoader from '../components/SharedLoader';

import ProtectedRoute from '../components/ProtectedRoute';

// Premium loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <SharedLoader />
  </div>
);

export default function DynamicRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        {/* Dynamic Dashboard Routes with Role Protection */}
        {dashboardConfig.map((dashboard) => (
          <Route
            key={dashboard.id}
            path={dashboard.basePath + '/*'}
            element={
              <ProtectedRoute allowedRoles={Array.isArray(dashboard.role) ? dashboard.role : [dashboard.role]}>
                <Routes>
                  {dashboard.pages.map((page) => {
                    const PageComponent = page.component;
                    return (
                      <Route
                        key={page.path || 'index'}
                        path={page.path || ''}
                        element={
                          <Suspense fallback={<PageLoader />}>
                            <PageComponent />
                          </Suspense>
                        }
                      />
                    );
                  })}
                </Routes>
              </ProtectedRoute>
            }
          />
        ))}

        {/* Fallback route inside DashboardLayout */}
        <Route path="*" element={
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
        } />
      </Route>
    </Routes>
  );
}
