import React, { useState, useEffect } from "react";
import { useActivity } from "@/components/ActivityContext";
import { FiClock, FiActivity, FiAlertTriangle } from "react-icons/fi";
import { 
  FaUtensils, FaUsers, FaUserTie, FaBirthdayCake, 
  FaUserPlus, FaQuestion, FaCoffee, FaPizzaSlice, 
  FaApple, FaComments, FaLaptop, FaChartLine, 
  FaHandshake, FaBriefcase, FaGlassCheers, 
  FaGift, FaSmile, FaClipboardCheck 
} from "react-icons/fa";

const ActivityLockScreen = () => {
  const { 
    currentActivity, 
    activityStartTime, 
    goOnDesk, 
    isScreenLocked,
    timeLimit,
    isTimeLimitExceeded
  } = useActivity();
  
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [floatingElements, setFloatingElements] = useState([]);
  
  // Generate floating elements once when component mounts or activity changes
  useEffect(() => {
    if (isScreenLocked) {
      setFloatingElements(generateFloatingElements());
    }
  }, [isScreenLocked, currentActivity]);

  // Toggle warning blink effect
  useEffect(() => {
    if (!isTimeLimitExceeded) return;
    
    const blinkInterval = setInterval(() => {
      setShowWarning(prev => !prev);
    }, 600);
    
    return () => clearInterval(blinkInterval);
  }, [isTimeLimitExceeded]);

  // Update timer every second
  useEffect(() => {
    if (!isScreenLocked) return;

    const timer = setInterval(() => {
      if (activityStartTime) {
        const now = new Date();
        const diff = now - activityStartTime;
        
        // Calculate elapsed minutes for time limit comparison
        const minutes = Math.floor((diff % 3600000) / 60000);
        setElapsedMinutes(Math.floor(diff / 60000));
        
        // Format time as HH:MM:SS
        const hours = Math.floor(diff / 3600000).toString().padStart(2, "0");
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
        
        setElapsedTime(`${hours}:${formattedMinutes}:${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activityStartTime, isScreenLocked]);

  // Get background color based on activity and time limit
  const getActivityColor = () => {
    // If time limit exceeded, use red background
    if (isTimeLimitExceeded) {
      return showWarning ? "bg-red-600" : "bg-red-500";
    }
    
    // Otherwise use standard activity colors
    switch (currentActivity) {
      case "Lunch Break":
        return "bg-orange-500";
      case "Team Meeting":
        return "bg-blue-500";
      case "Client Meeting":
        return "bg-indigo-500";
      case "Office Celebration":
        return "bg-purple-500";
      case "Interview Session":
        return "bg-pink-500";
      default:
        return "bg-gray-700";
    }
  };

  // Format the time limit for display
  const formatTimeLimit = () => {
    if (!timeLimit) return null;
    return `${timeLimit} minute${timeLimit !== 1 ? 's' : ''}`;
  };

  // Calculate time remaining or overtime
  const getTimeStatus = () => {
    if (!timeLimit) return null;
    
    const totalSeconds = timeLimit * 60;
    const elapsedSeconds = Math.floor((new Date() - activityStartTime) / 1000);
    const remainingSeconds = totalSeconds - elapsedSeconds;
    
    if (remainingSeconds > 0) {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")} remaining`;
    } else {
      const overtimeSeconds = Math.abs(remainingSeconds);
      const minutes = Math.floor(overtimeSeconds / 60);
      const seconds = overtimeSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")} overtime`;
    }
  };

  // Get the appropriate icons based on activity type
  const getActivityIcons = () => {
    switch (currentActivity) {
      case "Lunch Break":
        return [
          <FaUtensils key="utensils" />, 
          <FaCoffee key="coffee" />, 
          <FaPizzaSlice key="pizza" />, 
          <FaApple key="apple" />
        ];
      case "Team Meeting":
        return [
          <FaUsers key="users" />, 
          <FaComments key="comments" />, 
          <FaLaptop key="laptop" />, 
          <FaChartLine key="chart" />
        ];
      case "Client Meeting":
        return [
          <FaUserTie key="userTie" />, 
          <FaHandshake key="handshake" />, 
          <FaBriefcase key="briefcase" />, 
          <FaChartLine key="chart" />
        ];
      case "Office Celebration":
        return [
          <FaBirthdayCake key="cake" />, 
          <FaGlassCheers key="cheers" />, 
          <FaGift key="gift" />, 
          <FaSmile key="smile" />
        ];
      case "Interview Session":
        return [
          <FaUserPlus key="userPlus" />, 
          <FaClipboardCheck key="clipboard" />, 
          <FaHandshake key="handshake" />, 
          <FaBriefcase key="briefcase" />
        ];
      default:
        return [<FaQuestion key="question" />];
    }
  };

  // Get the primary activity icon for the circle
  const getActivityPrimaryIcon = () => {
    switch (currentActivity) {
      case "Lunch Break":
        return <FaUtensils className="w-10 h-10 mb-4" />;
      case "Team Meeting":
        return <FaUsers className="w-10 h-10 mb-4" />;
      case "Client Meeting":
        return <FaUserTie className="w-10 h-10 mb-4" />;
      case "Office Celebration":
        return <FaBirthdayCake className="w-10 h-10 mb-4" />;
      case "Interview Session":
        return <FaUserPlus className="w-10 h-10 mb-4" />;
      default:
        return <FaQuestion className="w-10 h-10 mb-4" />;
    }
  };

  // Generate fixed positions for floating elements
  const generateFloatingElements = () => {
    const icons = getActivityIcons();
    // Create 15 fixed floating elements using the activity icons
    return Array(15).fill(0).map((_, index) => {
      // Random icon from the set
      const iconIndex = index % icons.length;
      const icon = icons[iconIndex];
      
      // Fixed positions, but random sizes
      const top = Math.random() * 80 + 10; // Keep away from edges
      const left = Math.random() * 80 + 10; // Keep away from edges
      const size = 20 + Math.random() * 30; // Less variation in size
      
      // Use much longer durations for subtle movement
      const durationX = 60 + Math.random() * 30; // 1-1.5 minutes
      const durationY = 70 + Math.random() * 30; // 1.1-1.6 minutes
      const durationRotate = 90 + Math.random() * 60; // 1.5-2.5 minutes
      
      // Very subtle movement distances
      const moveDistanceX = 5 + Math.random() * 10; // only move 5-15px
      const moveDistanceY = 5 + Math.random() * 10; // only move 5-15px
      
      // Use different depths for parallax effect
      const depth = Math.random();
      const zIndex = Math.floor(depth * 10);
      const scale = 0.6 + depth * 0.6; // Less scale variation
      
      // Determine color based on activity
      let iconColor;
      switch (currentActivity) {
        case "Lunch Break":
          iconColor = "text-orange-300";
          break;
        case "Team Meeting":
          iconColor = "text-blue-300";
          break;
        case "Client Meeting":
          iconColor = "text-indigo-300";
          break;
        case "Office Celebration":
          iconColor = "text-purple-300";
          break;
        case "Interview Session":
          iconColor = "text-pink-300";
          break;
        default:
          iconColor = "text-gray-300";
      }
      
      // Set a static opacity - no flashing
      const opacity = 0.15 + (depth * 0.2);
      
      // Generate unique animation name for this element to prevent synchronization
      const uniqueX = `floatX_${index}`;
      const uniqueY = `floatY_${index}`;
      
      const animationStyle = {
        [`@keyframes ${uniqueX}`]: {
          '0%': { transform: `translateX(0px)` },
          '50%': { transform: `translateX(${moveDistanceX}px)` },
          '100%': { transform: `translateX(0px)` }
        },
        [`@keyframes ${uniqueY}`]: {
          '0%': { transform: `translateY(0px)` },
          '50%': { transform: `translateY(${moveDistanceY}px)` },
          '100%': { transform: `translateY(0px)` }
        }
      };
      
      return (
        <div 
          key={index}
          className={`absolute ${iconColor} floating-item`}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            fontSize: `${size}px`,
            opacity: opacity,
            zIndex: zIndex,
            transform: `scale(${scale})`,
            animation: `
              ${uniqueX} ${durationX}s ease-in-out infinite,
              ${uniqueY} ${durationY}s ease-in-out infinite,
              floatRotate ${durationRotate}s linear infinite
            `
          }}
        >
          {icon}
        </div>
      );
    });
  };

  // Return to desk button click handler
  const handleReturnToDesk = async () => {
    await goOnDesk();
    // Refresh activities table data after returning to desk
    if (typeof window !== 'undefined') {
      // Dispatch a custom event that the Activities page can listen for
      const refreshEvent = new CustomEvent('refreshActivitiesTable');
      window.dispatchEvent(refreshEvent);
    }
  };

  if (!isScreenLocked) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75 backdrop-blur-sm overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingElements}
      </div>
      
      <div className="flex flex-col items-center justify-center max-w-md mx-auto text-white p-8 z-10">
        {/* Time limit display above the circle */}
        {timeLimit && (
          <div className={`text-sm mb-4 ${isTimeLimitExceeded ? 'text-red-200 font-bold' : 'text-white opacity-80'}`}>
            Time limit: {formatTimeLimit()}
          </div>
        )}
        {/* Colored circle */}
        <div className={`${getActivityColor()} rounded-full w-64 h-64 flex items-center justify-center mb-6 shadow-lg transition-colors duration-300`}>
          <div className="flex flex-col items-center justify-center">
            {isTimeLimitExceeded ? (
              <FiAlertTriangle className="w-16 h-16 mb-4 animate-pulse" />
            ) : (
              <>
                {getActivityPrimaryIcon()}
              </>
            )}
            <div className="text-4xl font-bold mb-2">{elapsedTime}</div>
            <div className="text-xl mb-1">{currentActivity}</div>
          </div>
        </div>
        
        {timeLimit && (
          <div className={`mb-4 text-center ${isTimeLimitExceeded ? 'text-red-300 animate-pulse font-bold' : 'text-gray-300'}`}>
            {isTimeLimitExceeded ? (
              <div className="flex items-center justify-center">
                <FiAlertTriangle className="mr-2" />
                <span>Time limit exceeded! {getTimeStatus()}</span>
              </div>
            ) : (
              <span>{getTimeStatus()}</span>
            )}
          </div>
        )}
        
        <button
          onClick={handleReturnToDesk}
          className={`mt-4 px-6 py-3 ${
            isTimeLimitExceeded 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white rounded-full shadow-lg transition duration-200 flex items-center`}
        >
          <FiClock className="mr-2" />
          Return to Desk
        </button>
      </div>
    </div>
  );
};

export default ActivityLockScreen;

// Updated animation styles for smoother floating effect
const floatAnimationStyle = `
@keyframes floatRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.floating-item {
  will-change: transform;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: all 0.5s ease-in-out;
}

.floating-item * {
  backface-visibility: hidden;
}
`;

// Add the style element to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = floatAnimationStyle;
  document.head.appendChild(styleElement);
}