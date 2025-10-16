import React, { useState, useEffect, useRef } from "react";

const LiveFeeds = ({ data = [], loading = false, realtime = false }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState('in');
  const prevDataLength = useRef(0);
  const lastUpdateTime = useRef(Date.now());
  
  // Ensure data is an array even if undefined
  const safeData = Array.isArray(data) ? data : [];
  
  // Debounced data update to prevent too frequent refreshes
  useEffect(() => {
    if (realtime && safeData.length > prevDataLength.current) {
      const currentTime = Date.now();
      if (currentTime - lastUpdateTime.current > 2000) {
        setActiveIndex(0);
        setFadeState('in');
        lastUpdateTime.current = currentTime;
      }
    }
    prevDataLength.current = safeData.length;
  }, [safeData, realtime]);
  
  // Auto-change effect
  useEffect(() => {
    if (isPaused || safeData.length <= 1) return;
    
    let fadeTimeout;
    const changeInterval = setInterval(() => {
      setFadeState('out');
      fadeTimeout = setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % safeData.length);
        setFadeState('in');
      }, 300);
    }, 5000);
    
    return () => {
      clearInterval(changeInterval);
      clearTimeout(fadeTimeout);
    };
  }, [isPaused, safeData.length]);

  // Navigation methods
  const goToPrev = () => {
    setFadeState('out');
    setTimeout(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === 0 ? safeData.length - 1 : prevIndex - 1
      );
      setFadeState('in');
    }, 300);
  };

  const goToNext = () => {
    setFadeState('out');
    setTimeout(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % safeData.length);
      setFadeState('in');
    }, 300);
  };

  const goToIndex = (index) => {
    if (index === activeIndex) return;
    setFadeState('out');
    setTimeout(() => {
      setActiveIndex(index);
      setFadeState('in');
    }, 300);
  };

  // Get color based on action
  const getColor = (action) => {
    switch (action) {
      case "Lineup": return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/30";
      case "Selection": return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/30";
      case "Joining": return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800/30";
      default: return "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-700/30 dark:border-slate-600/30";
    }
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case "Selected": return "bg-green-50 text-green-700 ring-1 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/20";
      case "In Progress": return "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-500/20";
      case "Pending": return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500/20";
      default: return "bg-slate-50 text-slate-700 ring-1 ring-slate-600/20 dark:bg-slate-700/30 dark:text-slate-400 dark:ring-slate-500/20";
    }
  };

  // Mock data for display purposes
  const mockData = [
    {
      employeeName: "Alex Johnson",
      action: "Selection",
      timestamp: "10 mins ago",
      candidateName: "Emma Roberts",
      company: "Acme Corp",
      process: "Frontend Dev",
      status: "Selected"
    },
    {
      employeeName: "Sarah Lee",
      action: "Lineup",
      timestamp: "32 mins ago",
      candidateName: "Michael Chen",
      company: "TechGlobal",
      process: "DevOps",
      status: "In Progress"
    },
    {
      employeeName: "David Miller",
      action: "Joining",
      timestamp: "2 hours ago",
      candidateName: "Jessica Williams",
      company: "InnovateCo",
      process: "Product Design",
      status: "Pending"
    }
  ];

  // Use mock data if no data is provided
  const displayData = safeData.length > 0 ? safeData : mockData;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 h-full flex flex-col"
         onMouseEnter={() => setIsPaused(true)}
         onMouseLeave={() => setIsPaused(false)}>
      
      {/* Header */}
      <div className="bg-gray-50 p-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h2 className="font-medium text-slate-800">Live Updates</h2>
        </div>
        <div className="flex items-center space-x-3">
          {realtime && (
            <div className="flex items-center">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-slate-600">Live</span>
            </div>
          )}
          
          {/* Auto-play toggle button */}
          <button 
            onClick={() => setIsPaused(!isPaused)} 
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            title={isPaused ? "Resume auto-play" : "Pause auto-play"}
          >
            {isPaused ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[240px] flex-1 overflow-hidden relative">
        {loading ? (
          <div className="p-4 space-y-3">
            <div className="animate-pulse flex space-x-3">
              <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-16 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
            <div className="flex space-x-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 h-full">
            <svg className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No updates available
            </p>
          </div>
        ) : (
          <div className="relative p-4 h-full flex flex-col">
            {/* Current Feed */}
            <div className="flex-1">
              {displayData.map((feed, index) => {
                if (index !== activeIndex) return null;
                const colorClasses = getColor(feed.action);
                
                return (
                  <div 
                    key={index}
                    className={`transition-all duration-300 ease-out ${
                      fadeState === 'in' ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'
                    }`}
                  >
                    {/* Employee Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <span className="text-sm font-medium">
                            {feed.employeeName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="ml-2">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                            {feed.employeeName || "Unknown"}
                          </h3>
                          <div className="flex items-center">
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${colorClasses}`}>
                              {feed.action}
                            </span>
                            <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>
                            <time className="text-xs text-slate-500 dark:text-slate-400">
                              {feed.timestamp}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content Card */}
                    <div className="mb-3 p-3.5 bg-slate-50 dark:bg-slate-700/40 rounded-lg border border-slate-200 dark:border-slate-600/40 transition-all duration-200 hover:shadow-sm">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        Created a {feed.action.toLowerCase()} for <span className="font-medium">{feed.candidateName || "Unknown Candidate"}</span>
                      </p>
                      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {feed.company && <span>{feed.company}</span>}
                        {feed.company && feed.process && <span className="mx-1">•</span>}
                        {feed.process && <span>{feed.process}</span>}
                      </div>
                    </div>
                    
                    {/* Status */}
                    {feed.status && (
                      <div className="flex">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadge(feed.status)}`}>
                          {feed.status === "Selected" ? (
                            <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {feed.status}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Navigation controls */}
            {displayData.length > 1 && (
              <div className="mt-auto pt-3 flex items-center justify-between">
                <button 
                  onClick={goToPrev}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                {/* Pagination indicators */}
                <div className="flex space-x-1.5 items-center">
                  {displayData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToIndex(index)}
                      className={`transition-all duration-200 h-1.5 rounded-full ${
                        index === activeIndex
                          ? 'w-4 bg-blue-500'
                          : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={goToNext}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeeds;