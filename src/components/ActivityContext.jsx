import React, { createContext, useContext, useState, useEffect } from "react";
import EmployeeServices from "@/services/EmployeeServices";

// Create context
export const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [currentActivity, setCurrentActivity] = useState("On Desk");
  const [isLoading, setIsLoading] = useState(false);
  const [activityStartTime, setActivityStartTime] = useState(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [timeLimit, setTimeLimit] = useState(null);
  const [isTimeLimitExceeded, setIsTimeLimitExceeded] = useState(false);

  // Fetch current activity on component mount
  useEffect(() => {
    fetchCurrentActivity();
  }, []);

  // Check if time limit is exceeded
  useEffect(() => {
    if (!timeLimit || !activityStartTime || !isScreenLocked) {
      setIsTimeLimitExceeded(false);
      return;
    }

    const checkTimeLimit = () => {
      const now = new Date();
      const diffInMinutes = (now - activityStartTime) / (1000 * 60);
      setIsTimeLimitExceeded(diffInMinutes > timeLimit);
    };

    // Check immediately
    checkTimeLimit();
    
    // Then check periodically
    const timerId = setInterval(checkTimeLimit, 10000); // Check every 10 seconds
    
    return () => clearInterval(timerId);
  }, [timeLimit, activityStartTime, isScreenLocked]);

  // Get current activity
  const fetchCurrentActivity = async () => {
    try {
      setIsLoading(true);
      const response = await EmployeeServices.getCurrentActivity();
      
      if (response.success) {
        setCurrentActivity(response.activity.type);
        setActivityStartTime(new Date(response.activity.startTime));
        setIsScreenLocked(response.shouldBlock);
        setTimeLimit(response.timeLimit);
      }
    } catch (error) {
      console.error("Error fetching current activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new activity
  const startActivity = async (activityType) => {
    try {
      setIsLoading(true);
      const response = await EmployeeServices.startActivity({ type: activityType });
      
      if (response.success) {
        setCurrentActivity(response.activity.type);
        setActivityStartTime(new Date(response.activity.startTime));
        setIsScreenLocked(activityType !== "On Desk");
        setTimeLimit(response.timeLimit);
        setIsTimeLimitExceeded(false);
      }
    } catch (error) {
      console.error("Error starting activity:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Return to "On Desk" status
  const goOnDesk = async () => {
    try {
      setIsLoading(true);
      const response = await EmployeeServices.goOnDesk();
      
      if (response.success) {
        setCurrentActivity("On Desk");
        setActivityStartTime(new Date(response.activity.startTime));
        setIsScreenLocked(false);
        setTimeLimit(null);
        setIsTimeLimitExceeded(false);
      }
      
    } catch (error) {
      console.error("Error setting status to on desk:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        activityStartTime,
        isLoading,
        isScreenLocked,
        timeLimit,
        isTimeLimitExceeded,
        startActivity,
        goOnDesk,
        fetchCurrentActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

// Custom hook for using activity context
export const useActivity = () => useContext(ActivityContext); 