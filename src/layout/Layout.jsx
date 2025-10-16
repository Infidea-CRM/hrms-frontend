import React, { useContext, Suspense, useEffect, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";

//internal import
import Main from "@/layout/Main";
import Header from "@/components/header/Header";
import Sidebar from "@/components/sidebar/Sidebar";
import { SidebarContext } from "@/context/SidebarContext";
import ThemeSuspense from "@/components/theme/ThemeSuspense";
import { routes } from "@/routes";
import { ActivityProvider } from "@/components/ActivityContext";
import ActivityLockScreen from "@/components/activity/ActivityLockScreen";
import { AdminContext } from "@/context/AdminContext";
import useGetCData from "@/hooks/useGetCData";

const Page404 = lazy(() => import("@/pages/404"));

const Layout = () => {
  const { isSidebarOpen, closeSidebar, navBar } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const { accessList = [] } = useGetCData();
  let location = useLocation();

  const isOnline = navigator.onLine;

  // console.log('routes',routes)

  useEffect(() => {
    closeSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Check for current path authorization
  const currentPath = location.pathname.split('/')[1]; // Get first part of path
  const isAuthorizedPath = accessList.includes(currentPath);

  // If current path is not in user's access list, redirect to dashboard
  if (currentPath && !isAuthorizedPath && currentPath !== 'dashboard') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ActivityProvider>
      <>
        {!isOnline && (
          <div className="fixed top-0 left-0 right-0 z-50 flex justify-center bg-red-600 text-white py-1 text-sm">
            You are in offline mode!
          </div>
        )}
        <div
          className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${
            isSidebarOpen && "overflow-hidden"
          }`}
        >
          <Sidebar />

          <div className="flex flex-col flex-1 w-full transition-all duration-300">
            <Header />
            <Main>
              <Suspense fallback={<ThemeSuspense />}>
                <Routes>
                  {/* Only render routes that the user has access to */}
                  {routes.map((route, i) => {
                    // Extract the route key from the path
                    const routeKey = route.path.split('/')[1];
                    // Check if user has access to this route (always allow dashboard)
                    const hasAccess = routeKey === 'dashboard' || accessList.includes(routeKey);
                    
                    return route.component && hasAccess ? (
                      <Route
                        key={i}
                        path={route.path}
                        element={<route.component />}
                      />
                    ) : null;
                  })}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Page404 />} />
                </Routes>
              </Suspense>
            </Main>
          </div>
        </div>
        <ActivityLockScreen />
      </>
    </ActivityProvider>
  );
};

export default Layout;
