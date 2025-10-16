import React, { useState, useEffect, useRef } from "react";
import { useActivity } from "@/components/ActivityContext";
import { FiActivity, FiClock, FiChevronDown, FiAlertTriangle } from "react-icons/fi";
import { MdHistory, MdLunchDining, MdGroups, MdPersonSearch, MdCelebration, MdWork, MdDesk, MdDesktopMac } from "react-icons/md";
import { FaUserTie } from "react-icons/fa";

const ActivityDropdown = ({ onDeskCount }) => {
  const { currentActivity, startActivity, isLoading, isTimeLimitExceeded } = useActivity();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [blinkWarning, setBlinkWarning] = useState(false);
  const dropdownRef = useRef(null);

  const activities = [
    "On Desk",
    "Lunch Break",
    "Team Meeting",
    "Client Meeting",
    "Office Celebration",
    "Interview Session",
  ];

  const activityIcons = {
    "On Desk": <MdDesktopMac className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
    "Lunch Break": <MdLunchDining className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
    "Team Meeting": <MdGroups className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
    "Client Meeting": <FaUserTie className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
    "Office Celebration": <MdCelebration className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
    "Interview Session": <MdPersonSearch className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />,
  };

  // Blink effect for time limit exceeded warning
  useEffect(() => {
    if (!isTimeLimitExceeded) return;
    
    const blinkInterval = setInterval(() => {
      setBlinkWarning(prev => !prev);
    }, 600);
    
    return () => clearInterval(blinkInterval);
  }, [isTimeLimitExceeded]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle activity selection
  const handleActivityChange = async (activity) => {
    if (activity !== currentActivity && !isLoading) {
      await startActivity(activity);
      // Refresh activities table data after changing activity
      if (typeof window !== 'undefined') {
        // Dispatch a custom event that the Activities page can listen for
        const refreshEvent = new CustomEvent('refreshActivitiesTable');
        window.dispatchEvent(refreshEvent);
      }
    }
    setIsDropdownOpen(false);
  };

  // Get color based on activity
  const getActivityColor = (activity) => {
    // If current activity and time limit exceeded
    if (activity === currentActivity && isTimeLimitExceeded) {
      return blinkWarning ? "text-red-600" : "text-red-500";
    }
    
    switch (activity) {
      case "On Desk":
        return "text-green-500";
      case "Lunch Break":
        return "text-orange-500";
      case "Team Meeting":
        return "text-blue-500";
      case "Client Meeting":
        return "text-indigo-500";
      case "Office Celebration":
        return "text-purple-500";
      case "Interview Session":
        return "text-pink-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-medium rounded-md 
          ${isTimeLimitExceeded ? 'bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700' : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700'} 
          shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none`}
        disabled={isLoading}
      >
        {isTimeLimitExceeded ? (
          <FiAlertTriangle className={`w-3 h-3 sm:w-4 sm:h-4 ${getActivityColor(currentActivity)}`} />
        ) : (
          <MdDesktopMac className={`w-3 h-3 sm:w-4 sm:h-4 ${getActivityColor(currentActivity)}`} />
        )}
        <span className={`${getActivityColor(currentActivity)} ${isTimeLimitExceeded ? 'font-bold' : ''} whitespace-nowrap`}>
          {currentActivity}
          {onDeskCount && <span className="ml-1">({onDeskCount})</span>}
        </span>
        <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
      </button>

      {isDropdownOpen && (
        <div className="origin-top-right absolute right-0 mt-1 sm:mt-2 w-40 sm:w-48 rounded-md shadow-lg z-50 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {activities.map((activity) => (
              <button
                key={activity}
                onClick={() => handleActivityChange(activity)}
                className={`${
                  currentActivity === activity ? "bg-gray-100 dark:bg-gray-700" : ""
                } ${getActivityColor(
                  activity
                )} block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150`}
              >
                <div className="flex items-center">
                  {activityIcons[activity]}
                  <span className="truncate">{activity}</span>
                  {currentActivity === activity && (
                    <span className="ml-auto">•</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityDropdown; 