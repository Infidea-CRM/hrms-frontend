import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import FlipCard from "@/components/flipcard/Flipcard";
import useError from "@/hooks/useError";
import { ErrorBoundary } from 'react-error-boundary';
import { AdminContext } from "@/context/AdminContext";

//internal import
import useAsync from "@/hooks/useAsync";
import AnimatedContent from "@/components/common/AnimatedContent";
import EmployeeServices from "@/services/EmployeeServices";
// import { useSocket } from "@/context/SocketContext";

// Import dashboard components
//import LiveFeeds from "@/components/dashboard/LiveFeeds";
import ActivityTimelineChart from "@/components/dashboard/ActivityTimelineChart";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import IncentivesChart from "@/components/dashboard/IncentivesChart";
import RotatingThoughts from "@/components/dashboard/RotatingThoughts";
// import SocketStatusIndicator from "@/components/dashboard/SocketStatusIndicator";
// import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-50 rounded-lg">
      <p className="text-red-600 font-medium">Something went wrong:</p>
      <pre className="text-sm text-red-500">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { handleErrorNotification } = useError();
  const { state } = useContext(AdminContext);
  const adminInfo = state?.adminInfo;
  const employeeName = adminInfo?.user?.name || '';
  
  // Use the global socket context
  // const { 
  //   isConnected, 
  //   socketError, 
  //   liveData, 
  //   reconnect,
  //   updateFeeds 
  // } = useSocket();

  dayjs.extend(isBetween);  
  dayjs.extend(isToday);
  dayjs.extend(isYesterday);

  const { data: dashboardAnalytics, loading: loadingDashboardAnalytics, error: dashboardAnalyticsError } = useAsync(
    () => EmployeeServices.getDashboardAnalytics()
  );

  const { data: dashboardVisualResponse, loading: loadingVisualData, error: visualDataError } = useAsync(
    () => EmployeeServices.getDashboardVisualData()
  );

  const { data: incentivesResponse, loading: loadingIncentivesData, error: incentivesDataError } = useAsync(
    () => EmployeeServices.getIncentivesData()
  );
  
  
  // Extract the actual data from the response
  const dashboardVisualData = dashboardVisualResponse?.data;
  const incentivesData = incentivesResponse?.data;


  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "₹0";
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  // Handle navigation with filters
  const handleNavigation = (path, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    navigate(queryParams ? `${path}?${queryParams}` : path);
  };
  
  // // Function to fetch live feeds
  // const fetchLiveFeeds = useCallback(async (afterTimestamp = null) => {
  //   try {
  //     setLoadingLiveFeeds(true);
  //     const params = afterTimestamp ? { after: afterTimestamp } : {};
  //     const response = await EmployeeServices.getRecentFeeds(params);
      
  //     if (response?.success && Array.isArray(response.data)) {
  //       // Use the global updateFeeds function to update feeds in the SocketContext
  //       if (response.data.length > 0) {
  //         // Let the SocketContext handle feed management
  //         // The SocketContext's updateFeeds will handle sorting, deduplication, etc.
  //         updateFeeds(response.data);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching live feeds:", error);
  //   } finally {
  //     setLoadingLiveFeeds(false);
  //   }
  // }, [updateFeeds]);
  
  // // Initial fetch of live feeds
  // useEffect(() => {
  //   if (liveData.feeds.length === 0) {
  //     fetchLiveFeeds();
  //   } else {
  //     setLoadingLiveFeeds(false);
  //   }
  // }, [fetchLiveFeeds, liveData.feeds.length]);
  
  // // Setup polling if WebSockets are disconnected
  // useEffect(() => {
  //   // Clear any existing interval
  //   if (pollingIntervalRef.current) {
  //     clearInterval(pollingIntervalRef.current);
  //     pollingIntervalRef.current = null;
  //   }
    
  //   // If WebSockets are not connected, use polling
  //   if (!isConnected) {
  //     pollingIntervalRef.current = setInterval(() => {
  //       fetchLiveFeeds(liveData.lastUpdated);
  //     }, 30000); // Poll every 30 seconds
      
  //     return () => {
  //       if (pollingIntervalRef.current) {
  //         clearInterval(pollingIntervalRef.current);
  //         pollingIntervalRef.current = null;
  //       }
  //     };
  //   }
  // }, [isConnected, fetchLiveFeeds, liveData.lastUpdated]);
  
  // Add error handling to useAsync results
  useEffect(() => {
    if (dashboardAnalyticsError || visualDataError || incentivesDataError) {
      handleErrorNotification(dashboardAnalyticsError || visualDataError || incentivesDataError, "Dashboard");
    }
  }, [dashboardAnalyticsError, visualDataError, incentivesDataError, handleErrorNotification]);

  const transformDashboardData = (data) => {
    try {
      if (!data) {
        throw new Error('No data available for transformation');
      }

      // Transform data for charts
      const transformedData = {
        // ... existing transformations
      };

      return transformedData;
    } catch (err) {
      handleErrorNotification(err.message, 'Dashboard Data Transformation');
      return null;
    }
  };

  const transformVisualData = (data) => {
    try {
      if (!data) {
        throw new Error('No visual data available for transformation');
      }

      // Transform visual data
      const transformedData = {
        // ... existing transformations
      };

      return transformedData;
    } catch (err) {
      handleErrorNotification(err.message, 'Visual Data Transformation');
      return null;
    }
  };

  // Function to get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("Good morning");
    if (hour < 18) return t("Good afternoon");
    return t("Good evening");
  };

  return (
    <AnimatedContent>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Page Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1a5d96] dark:text-[#e2692c] flex items-center">
            <span className="border-l-4 border-[#1a5d96] dark:border-[#e2692c] pl-3">
              {employeeName.en ? `${getGreeting()}, ${employeeName.en}` : t("Welcome")}
            </span>
          </h1>
        </header>
        
        {/* Thoughts of the Day */}
        <section className="mb-6">
          <RotatingThoughts />
        </section>
        
        {/* Dashboard Overview - Stats Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-5">
            <FlipCard 
              title="Calls" 
              data={dashboardAnalytics?.dashboardOverview?.totalCalls || 0} 
              onTap={() => handleNavigation("/call-details")} 
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Lineups" 
              data={dashboardAnalytics?.dashboardOverview?.totalLineups || 0} 
              onTap={() => handleNavigation("/lineups")} 
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Joinings" 
              data={dashboardAnalytics?.dashboardOverview?.totalJoinings || 0} 
              onTap={() => handleNavigation("/joinings")} 
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Selections" 
              data={dashboardAnalytics?.dashboardOverview?.totalSelections || 0}
              onTap={() => handleNavigation("/lineups", { status: "selected" })}
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Offer Drops" 
              data={dashboardAnalytics?.dashboardOverview?.offerDrops || 0} 
              onTap={() => handleNavigation("/lineups", { status: "offer drop" })}
              loading={loadingDashboardAnalytics}
            />
           <FlipCard 
              title="Conversion" 
              data={dashboardAnalytics?.dashboardOverview?.totalConversionRate + "%" || 0}
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Time Spent" 
              data={dashboardAnalytics?.dashboardOverview?.timeSpent || "0h"} 
              loading={loadingDashboardAnalytics}
            />
            <FlipCard 
              title="Incentives" 
              data={formatCurrency(dashboardAnalytics?.dashboardOverview?.totalIncentives || 0)} 
              onTap={() => handleNavigation("/joinings")}
              loading={loadingDashboardAnalytics}
            />
          </div>
        </section>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics - 1/3 width on large screens */}
          <section className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                // Reset the state that caused the error
                setRefreshKey(prev => prev + 1);
              }}
            >
              <PerformanceMetrics 
                data={dashboardVisualData?.performanceMetrics?.today || {}} 
                loading={loadingVisualData} 
              />
            </ErrorBoundary>
          </section>

          {/* Activity Timeline Chart - 2/3 width on large screens */}
          <section className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => {
                setRefreshKey(prev => prev + 1);
              }}
            >
              <ActivityTimelineChart 
                timeDistributions={dashboardVisualData?.timeDistributions || {}} 
                loading={loadingVisualData} 
              />
            </ErrorBoundary>
          </section>
        </div>

        {/* Incentives Chart - Full width */}
        <section className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
              setRefreshKey(prev => prev + 1);
            }}
          >
            <IncentivesChart 
              incentivesData={incentivesData} 
              loading={loadingIncentivesData} 
            />
          </ErrorBoundary>
        </section>
      </div>
    </AnimatedContent>
  );
};

export default Dashboard;
