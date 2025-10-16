import React from "react";
import { useTranslation } from "react-i18next";
import Skeleton from "react-loading-skeleton";
import { TrendingDown, TrendingUp } from "lucide-react";
import { MdCallMade } from "react-icons/md";

const PerformanceMetrics = ({ data = {}, loading = false }) => {
  const { t } = useTranslation();

  // Add null check for data
  const safeData = data || {};
  const trends = safeData.trends || {};

  // Ensure numeric values
  const parseMetricValue = (value) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) : value;
  };

  const metrics = [
    {
      title: "Calls",
      value: parseMetricValue(safeData.calls),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"></path>
        </svg>
      ),
      trend: parseMetricValue(trends.calls),
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      trendColor: parseMetricValue(trends.calls) >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Lineups",
      value: parseMetricValue(safeData.lineups),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"></path>
        </svg>
      ),
      trend: parseMetricValue(trends.lineups),
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      trendColor: parseMetricValue(trends.lineups) >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Conversion",
      value: `${parseMetricValue(safeData.conversionRate)}%`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"></path>
        </svg>
      ),
      trend: 0, // Conversion rate doesn't have a trend in the API
      color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
      trendColor: "text-gray-500"
    },
    {
      title: "Selections",
      value: parseMetricValue(safeData.selections),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      trend: parseMetricValue(trends.selections),
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      trendColor: parseMetricValue(trends.selections) >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Average Time Per Call",
      value: parseMetricValue(safeData.todayAverageTime),
      icon: (
       <MdCallMade/>
      ),
      trend: parseMetricValue(trends.todayAverageTime),
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      trendColor: parseMetricValue(trends.todayAverageTime) >= 0 ? "text-green-500" : "text-red-500"
    },
    {
      title: "Time Spent",
      value: `${safeData.todayTimeSpent || "0"}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      trend: 0, // Time spent doesn't have a trend in the API
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      trendColor: "text-gray-500"
    },
  ];

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-1 bg-indigo-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("Today's Performance")}
        </h2>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loading 
          ? [...Array(6)].map((_, index) => (
              <div key={index} className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <Skeleton circle width={40} height={40} className="mr-4" />
                <div>
                  <Skeleton width={80} height={20} className="mb-2" />
                  <Skeleton width={60} height={16} />
                </div>
              </div>
            ))
          : metrics.map((metric, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-800
                   hover:shadow-md transform hover:translate-x-1 "
              >
                <div className="flex items-center">
                  <div className={`p-2.5 rounded-lg ${metric.color} mr-4`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                      {t(metric.title)}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {metric.value}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {metric.trend ? (
                    <>
                      {metric.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs font-medium ${metric.trendColor}`}>
                        {Math.abs(metric.trend)}%
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default PerformanceMetrics; 