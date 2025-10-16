import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';
import Skeleton from 'react-loading-skeleton';

// Mock data for testing purposes
const mockIncentivesData = {
  summary: {
    total: 78500,
    today: 2500,
    week: 12700,
    month: 35600,
    quarter: 48900,
    year: 78500,
    count: 24
  },
  distributions: {
    daily: Array(30).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      return {
        date: date.toISOString().split('T')[0],
        amount: Math.round(Math.random() * 1500) + (index > 20 ? 1000 : 500),
        count: Math.round(Math.random() * 3) + 1
      };
    }),
    weekly: Array(12).fill(0).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (date.getDay() + 7 * (11 - index)));
      const endDate = new Date(date);
      endDate.setDate(date.getDate() + 6);
      return {
        weekStart: date.toISOString(),
        weekEnd: endDate.toISOString(),
        weekLabel: `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}, ${endDate.getFullYear()}`,
        amount: Math.round(Math.random() * 4000) + 1500,
        count: Math.round(Math.random() * 4) + 1
      };
    }),
    monthly: Array(12).fill(0).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - index));
      return {
        month: date.getMonth(),
        year: date.getFullYear(),
        monthLabel: `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`,
        amount: Math.round(Math.random() * 8000) + 3000,
        count: Math.round(Math.random() * 6) + 2
      };
    }),
    quarterly: Array(8).fill(0).map((_, index) => {
      const date = new Date();
      const currentQuarter = Math.floor(date.getMonth() / 3);
      const targetQuarter = (currentQuarter - (7 - index)) % 4;
      const yearOffset = Math.floor((7 - index + (3 - currentQuarter)) / 4);
      const year = date.getFullYear() - yearOffset;
      return {
        quarterLabel: `Q${targetQuarter + 1} ${year}`,
        amount: Math.round(Math.random() * 15000) + 8000,
        count: Math.round(Math.random() * 10) + 5
      };
    }),
    byProcess: [
      { process: 'Backend Dev', amount: 23400, count: 7 },
      { process: 'Frontend Dev', amount: 18700, count: 6 },
      { process: 'DevOps', amount: 14200, count: 4 },
      { process: 'UI/UX Design', amount: 11500, count: 3 },
      { process: 'QA Testing', amount: 7300, count: 2 },
      { process: 'Other', amount: 3400, count: 2 }
    ],
    byCompany: [
      { company: 'TechCorp', amount: 19200, count: 6 },
      { company: 'Innovate Systems', amount: 16800, count: 5 },
      { company: 'Digital Solutions', amount: 14500, count: 4 },
      { company: 'WebDev Inc', amount: 12600, count: 3 },
      { company: 'Cloud Nine', amount: 9800, count: 3 },
      { company: 'Other Companies', amount: 5600, count: 3 }
    ]
  }
};

const IncentivesChart = ({ incentivesData, loading = false }) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState('monthly'); // 'monthly', 'quarterly', 'weekly', 'byProcess', 'byCompany'
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Update dark mode detection when theme changes
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    updateTheme();
    
    // Create a mutation observer to watch for class changes on documentElement
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          updateTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  // Use mock data if no data is provided (for testing)
  const displayData = useMemo(() => {
    if (!loading && !incentivesData) {
      console.log('Using mock incentives data for testing');
      return mockIncentivesData;
    }
    return incentivesData;
  }, [incentivesData, loading]);

  // Chart colors
  const chartColors = useMemo(() => ({
    monthly: {
      gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
      bar: 'url(#monthlyGradient)'
    },
    weekly: {
      gradient: ['#93C5FD', '#60A5FA', '#3B82F6'],
      bar: 'url(#weeklyGradient)'
    },
    quarterly: {
      gradient: ['#6EE7B7', '#34D399', '#10B981'],
      bar: 'url(#quarterlyGradient)'
    },
    byProcess: ['#3B82F6', '#10B981', '#F97316', '#EC4899', '#8B5CF6', '#6366F1'],
    byCompany: ['#F97316', '#8B5CF6', '#10B981', '#6366F1', '#EC4899', '#3B82F1'],
    grid: isDarkMode ? '#334155' : '#e2e8f0',
    text: isDarkMode ? '#cbd5e1' : '#475569',
    background: isDarkMode ? '#1e293b' : '#ffffff',
    tooltip: {
      bg: isDarkMode ? '#1e293b' : '#ffffff',
      border: isDarkMode ? '#475569' : '#e2e8f0',
      text: isDarkMode ? '#e2e8f0' : '#334155'
    }
  }), [isDarkMode]);

  // Format currency
  const formatCurrency = (value) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-lg shadow-xl border text-sm" style={{ 
          backgroundColor: chartColors.tooltip.bg,
          borderColor: chartColors.tooltip.border,
          color: chartColors.tooltip.text
        }}>
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between mb-1.5">
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-medium ml-3">{formatCurrency(entry.value)}</span>
            </div>
          ))}
          {chartType === 'monthly' && payload[0].payload.count !== undefined && (
            <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: chartColors.tooltip.border }}>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{t('Count')}: {payload[0].payload.count}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 rounded-lg shadow-xl border text-sm" style={{ 
          backgroundColor: chartColors.tooltip.bg,
          borderColor: chartColors.tooltip.border,
          color: chartColors.tooltip.text
        }}>
          <p className="font-semibold mb-2">{payload[0].name}</p>
          <div className="flex items-center justify-between mb-1.5">
            <span>{t('Amount')}:</span>
            <span className="font-medium ml-3">{formatCurrency(payload[0].value)}</span>
          </div>
          {payload[0].payload.count !== undefined && (
            <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: chartColors.tooltip.border }}>
              <span style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{t('Count')}: {payload[0].payload.count}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Active sector renderer for pie charts
  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text 
          x={cx} 
          y={cy - 12} 
          textAnchor="middle" 
          fill={chartColors.text} 
          className="font-medium text-xxs"
          dominantBaseline="middle"
          fontSize="10px"
        >
          {(payload.process || payload.company || "").length > 15 
            ? `${(payload.process || payload.company || "").substring(0, 15)}...` 
            : (payload.process || payload.company)}
        </text>
        <text 
          x={cx} 
          y={cy + 12} 
          textAnchor="middle" 
          fill={chartColors.text}
          className="text-xxs"
          dominantBaseline="middle"
          fontSize="9px"
        >
          {formatCurrency(value)}
        </text>
      </g>
    );
  };

  // Handle pie sector hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Render monthly bar chart
  const renderMonthlyChart = () => {
    const data = displayData?.distributions?.monthly || [];
    
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 15, right: 10, left: 10, bottom: 30 }}
          barGap={2}
          barSize={18}
        >
          <defs>
            <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.monthly.gradient[0]} />
              <stop offset="50%" stopColor={chartColors.monthly.gradient[1]} />
              <stop offset="100%" stopColor={chartColors.monthly.gradient[2]} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={chartColors.grid} opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="monthLabel" 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            tickFormatter={formatCurrency}
            width={60}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={{ opacity: 0.15 }} />
          <Bar 
            dataKey="amount" 
            name={t('Incentives')} 
            fill={chartColors.monthly.bar}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render weekly bar chart
  const renderWeeklyChart = () => {
    const data = displayData?.distributions?.weekly || [];
    
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 15, right: 10, left: 10, bottom: 30 }}
          barGap={2}
          barSize={18}
        >
          <defs>
            <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.weekly.gradient[0]} />
              <stop offset="50%" stopColor={chartColors.weekly.gradient[1]} />
              <stop offset="100%" stopColor={chartColors.weekly.gradient[2]} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={chartColors.grid} opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="weekLabel" 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            tickFormatter={formatCurrency}
            width={60}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={{ opacity: 0.15 }} />
          <Bar 
            dataKey="amount" 
            name={t('Incentives')} 
            fill={chartColors.weekly.bar}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render quarterly bar chart
  const renderQuarterlyChart = () => {
    const data = displayData?.distributions?.quarterly || [];
    
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 15, right: 10, left: 10, bottom: 30 }}
          barGap={2}
          barSize={18}
        >
          <defs>
            <linearGradient id="quarterlyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.quarterly.gradient[0]} />
              <stop offset="50%" stopColor={chartColors.quarterly.gradient[1]} />
              <stop offset="100%" stopColor={chartColors.quarterly.gradient[2]} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 6" stroke={chartColors.grid} opacity={0.3} vertical={false} />
          <XAxis 
            dataKey="quarterLabel" 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            angle={-45}
            textAnchor="end"
            height={40}
          />
          <YAxis 
            tick={{ fill: chartColors.text, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: chartColors.grid, strokeWidth: 1 }}
            tickFormatter={formatCurrency}
            width={60}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={{ opacity: 0.15 }} />
          <Bar 
            dataKey="amount" 
            name={t('Incentives')} 
            fill={chartColors.quarterly.bar}
            radius={[4, 4, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // Render process distribution pie chart
  const renderProcessChart = () => {
    const data = displayData?.distributions?.byProcess || [];
    
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={45}
            fill="#8884d8"
            dataKey="amount"
            nameKey="process"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors.byProcess[index % chartColors.byProcess.length]} 
                stroke={isDarkMode ? '#1e293b' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            formatter={(value) => <span style={{fontSize: '9px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</span>}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px', overflowWrap: 'break-word' }}
            iconType="circle"
            iconSize={7}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Render company distribution pie chart
  const renderCompanyChart = () => {
    const data = displayData?.distributions?.byCompany || [];
    
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={45}
            fill="#8884d8"
            dataKey="amount"
            nameKey="company"
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={chartColors.byCompany[index % chartColors.byCompany.length]} 
                stroke={isDarkMode ? '#1e293b' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            formatter={(value) => <span style={{fontSize: '9px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</span>}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ paddingTop: '20px', overflowWrap: 'break-word' }}
            iconType="circle"
            iconSize={7}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-5 w-1 bg-purple-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {t("Incentives Overview")}
        </h2>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("This Week")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {loading ? <Skeleton width={80} /> : formatCurrency(displayData?.summary?.week || 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("This Month")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {loading ? <Skeleton width={80} /> : formatCurrency(displayData?.summary?.month || 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-teal-500 mr-2"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("This Quarter")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {loading ? <Skeleton width={80} /> : formatCurrency(displayData?.summary?.quarter || 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center mb-1">
            <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("This Year")}</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {loading ? <Skeleton width={80} /> : formatCurrency(displayData?.summary?.year || 0)}
          </div>
        </div>
      </div>

      {/* Chart type selector */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
            chartType === 'weekly'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600  font-medium dark:text-gray-200'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          onClick={() => setChartType('weekly')}
        >
          {t("Weekly")}
        </button>
        <button
          className={`flex items-center text-xs px-3 py-1.5 rounded-full border  ${
            chartType === 'monthly'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600  font-medium dark:text-gray-200'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          onClick={() => setChartType('monthly')}
        >
          {t("Monthly")}
        </button>
        <button
          className={`flex items-center text-xs px-3 py-1.5 rounded-full border  ${
            chartType === 'quarterly'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600  font-medium dark:text-gray-200'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          onClick={() => setChartType('quarterly')}
        >
          {t("Quarterly")}
        </button>
        <button
          className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
            chartType === 'byProcess'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600  font-medium dark:text-gray-200'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          onClick={() => setChartType('byProcess')}
        >
          {t("By Process")}
        </button>
        <button
          className={`flex items-center text-xs px-3 py-1.5 rounded-full border ${
            chartType === 'byCompany'
              ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600  font-medium dark:text-gray-200'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
          onClick={() => setChartType('byCompany')}
        >
          {t("By Company")}
        </button>
      </div>
      
      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Skeleton height={250} width="100%" />
          </div>
        ) : (
          <>
            {chartType === 'weekly' && renderWeeklyChart()}
            {chartType === 'monthly' && renderMonthlyChart()}
            {chartType === 'quarterly' && renderQuarterlyChart()}
            {chartType === 'byProcess' && renderProcessChart()}
            {chartType === 'byCompany' && renderCompanyChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default IncentivesChart; 