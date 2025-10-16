import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ActivityTimelineChart = ({ timeDistributions = {}, loading = false }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("hourly");
  const [chartData, setChartData] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [usingSampleData, setUsingSampleData] = useState(false);

  // Format hour display (e.g., "9:00 AM", "2:00 PM")
  const formatHourLabel = useCallback((hour) => {
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const timePeriod = hour >= 12 ? 'PM' : 'AM';
    return `${formattedHour}:00 ${timePeriod}`;
  }, []);

  // Sample data when no real data is available
  const sampleData = useMemo(() => ({
    hourly: Array(24).fill(0).map((_, hour) => ({
      hour,
      label: formatHourLabel(hour),
      lineups: Math.floor(Math.random() * 5) + (hour >= 9 && hour <= 17 ? 2 : 0),
      selections: Math.floor(Math.random() * 3) + (hour >= 10 && hour <= 16 ? 1 : 0),
      joinings: Math.floor(Math.random() * 2) + (hour >= 11 && hour <= 15 ? 1 : 0),
      calls: Math.floor(Math.random() * 7) + (hour >= 9 && hour <= 17 ? 3 : 0),
    })),
    daily: Array(7).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
      
      return {
        date,
        dateLabel: `${dayOfWeek} ${formattedDate}`,
        lineups: Math.floor(Math.random() * 15) + (index < 5 ? 5 : 2),
        selections: Math.floor(Math.random() * 10) + (index < 5 ? 3 : 1),
        joinings: Math.floor(Math.random() * 5) + (index < 5 ? 2 : 0),
        calls: Math.floor(Math.random() * 20) + (index < 5 ? 8 : 3),
      };
    }),
    monthly: Array(12).fill(0).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - index));
      const monthName = date.toLocaleString("default", { month: "short" });
      
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        monthLabel: `${monthName}`,
        lineups: Math.floor(Math.random() * 50) + 20,
        selections: Math.floor(Math.random() * 30) + 10,
        joinings: Math.floor(Math.random() * 15) + 5,
        calls: Math.floor(Math.random() * 80) + 30,
      };
    }),
  }), [formatHourLabel]);

  // Time range selector options
  const timeRangeOptions = useMemo(() => [
    { value: "hourly", label: t("Today") },
    { value: "daily", label: t("This Week") },
    { value: "monthly", label: t("This Year") },
  ], [t]);

  // Activity types for filtering
  const activityTypes = useMemo(() => [
    { id: "all", label: t("All"), color: "#64748b" },
    { id: "lineups", label: t("Lineups"), color: "#3B82F6" },
    { id: "selections", label: t("Selections"), color: "#10B981" },
    { id: "joinings", label: t("Joinings"), color: "#8B5CF6" },
    { id: "calls", label: t("Calls"), color: "#F97316" },
  ], [t]);

  // Chart colors - modern and clean
  const chartColors = useMemo(() => ({
    lineups: "#3B82F6", // blue
    selections: "#10B981", // green
    joinings: "#8B5CF6", // purple
    calls: "#F97316", // orange
    grid: document.documentElement.classList.contains('dark') ? "#334155" : "#f1f5f9",
    text: document.documentElement.classList.contains('dark') ? "#cbd5e1" : "#475569",
  }), []);

  useEffect(() => {
    // Use real data if available, otherwise fallback to sample data
    let dataSource = timeDistributions;
    let usingFallback = false;

    if (!timeDistributions || !timeDistributions[timeRange] || timeDistributions[timeRange].length === 0) {
      dataSource = sampleData;
      usingFallback = true;
    }
    
    setUsingSampleData(usingFallback);
    
    let formattedData = [];
    const activeData = dataSource[timeRange] || [];

    // Format data for recharts
    switch (timeRange) {
      case "hourly":
        formattedData = activeData
          .filter(item => {
            const hour = item.hour !== undefined ? item.hour : parseInt(item.label);
            return hour >= 9 && hour <= 21; // Only show 9am to 9pm
          })
          .map(item => ({
          name: item.label || formatHourLabel(item.hour),
          lineups: item.lineups || 0,
          selections: item.selections || 0,
          joinings: item.joinings || 0,
          calls: item.calls || 0,
          total: (item.lineups || 0) + (item.selections || 0) + (item.joinings || 0) + (item.calls || 0),
        }));
        break;
      case "daily":
        formattedData = activeData.map(item => ({
          name: item.dateLabel,
          lineups: item.lineups || 0,
          selections: item.selections || 0,
          joinings: item.joinings || 0,
          calls: item.calls || 0,
          total: (item.lineups || 0) + (item.selections || 0) + (item.joinings || 0) + (item.calls || 0),
        }));
        break;
      case "monthly":
        formattedData = activeData.map(item => ({
          name: item.monthLabel,
          lineups: item.lineups || 0,
          selections: item.selections || 0,
          joinings: item.joinings || 0,
          calls: item.calls || 0,
          total: (item.lineups || 0) + (item.selections || 0) + (item.joinings || 0) + (item.calls || 0),
        }));
        break;
      default:
        formattedData = [];
    }
    
    setChartData(formattedData);
  }, [timeRange, timeDistributions, formatHourLabel, sampleData]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!chartData.length) return { lineups: 0, selections: 0, joinings: 0, calls: 0, total: 0 };
    
    return chartData.reduce((acc, item) => ({
      lineups: acc.lineups + (item.lineups || 0),
      selections: acc.selections + (item.selections || 0),
      joinings: acc.joinings + (item.joinings || 0),
      calls: acc.calls + (item.calls || 0),
      total: acc.total + (item.total || 0),
    }), { lineups: 0, selections: 0, joinings: 0, calls: 0, total: 0 });
  }, [chartData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-2 text-xs">
              <span className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-medium ml-3">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

 

  // Modern, clean design
  return (
    <div className="p-5 h-full">
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-1 bg-blue-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {t("Work Timeline")}
            </h2>
            {usingSampleData && (
              <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-xs rounded text-blue-700 dark:text-blue-300 font-medium ml-2">
                {t("Demo")}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <select
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activityTypes.map((type) => (
            <button
              key={type.id}
              className={`flex items-center text-xs px-3 py-1.5 rounded-full border  ${
                activeType === type.id
                  ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 font-medium dark:text-gray-200'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
              }`}
              onClick={() => setActiveType(type.id)}
            >
              {type.id !== 'all' && (
                <span 
                  className="w-2.5 h-2.5 rounded-full mr-1.5" 
                  style={{ backgroundColor: type.color }}
                />
              )}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full h-64 flex items-center justify-center">
          <Skeleton height={250} width="100%" />
        </div>
      ) : (
        <div className="mt-2">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorLineups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.lineups} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.lineups} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSelections" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.selections} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.selections} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorJoinings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.joinings} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.joinings} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.calls} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.calls} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={chartColors.grid} 
                  vertical={false}
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: chartColors.text, fontSize: 12 }} 
                  tickLine={{ stroke: chartColors.grid }}
                  axisLine={{ stroke: chartColors.grid }}
                />
                <YAxis 
                  tick={{ fill: chartColors.text, fontSize: 12 }} 
                  tickLine={{ stroke: chartColors.grid }}
                  axisLine={{ stroke: chartColors.grid }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={8}
                />
                {(activeType === "all" || activeType === "lineups") && (
                  <Area
                    type="monotone"
                    dataKey="lineups"
                    name={t("Lineups")}
                    stroke={chartColors.lineups}
                    fillOpacity={1}
                    fill="url(#colorLineups)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(activeType === "all" || activeType === "selections") && (
                  <Area
                    type="monotone"
                    dataKey="selections"
                    name={t("Selections")}
                    stroke={chartColors.selections}
                    fillOpacity={1}
                    fill="url(#colorSelections)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(activeType === "all" || activeType === "joinings") && (
                  <Area
                    type="monotone"
                    dataKey="joinings"
                    name={t("Joinings")}
                    stroke={chartColors.joinings}
                    fillOpacity={1}
                    fill="url(#colorJoinings)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
                {(activeType === "all" || activeType === "calls") && (
                  <Area
                    type="monotone"
                    dataKey="calls"
                    name={t("Calls")}
                    stroke={chartColors.calls}
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityTimelineChart; 