import React, { useState, useEffect } from "react";
import { FiMessageCircle } from "react-icons/fi";
import ThoughtServices from "@/services/ThoughtServices";

const RotatingThoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [isThoughtFading, setIsThoughtFading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch random thoughts
  const fetchRandomThoughts = async () => {
    try {
      setLoading(true);
      const response = await ThoughtServices.getRandomThoughts();
      console.log("Thoughts response:", response);
      if (response && response.data) {
        setThoughts(response.data);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching thoughts:", err);
      setError("Failed to load thoughts");
    } finally {
      setLoading(false);
    }
  };

  // fetch thoughts and setup rotation
  useEffect(() => {
    fetchRandomThoughts();

    // Rotate through thoughts every 8 seconds
    const thoughtInterval = setInterval(() => {
      if (thoughts.length > 0) {
        // Start the fade out animation
        setIsThoughtFading(true);
        
        // After fade out completes, change the thought and fade back in
        setTimeout(() => {
          setCurrentThoughtIndex((prevIndex) => 
            prevIndex === thoughts.length - 1 ? 0 : prevIndex + 1
          );
          setIsThoughtFading(false);
        }, 500); // 500ms transition time
      }
    }, 8000);

    return () => clearInterval(thoughtInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thoughts.length]);

  if (loading && !thoughts.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-24 flex items-center justify-center">
        <div className="animate-pulse flex items-center">
          <FiMessageCircle className="text-gray-300 dark:text-gray-600 w-5 h-5 mr-3" />
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full w-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-24 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
          <FiMessageCircle className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-3" />
          <span>Unable to load thoughts at this time.</span>
        </div>
      </div>
    );
  }

  if (!thoughts.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-24 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
          <FiMessageCircle className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-3" />
          <span>No thoughts available.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center mb-3">
        <FiMessageCircle className="text-[#1a5d96] dark:text-[#e2692c] w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Thought of the Day</h3>
      </div>
      <div 
        className="relative h-16 flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-md"
      >
        <p 
          className="text-gray-700 dark:text-gray-200 text-sm font-medium transition-opacity duration-500"
          style={{ opacity: isThoughtFading ? 0 : 1 }}
        >
          {thoughts[currentThoughtIndex]?.text || thoughts[currentThoughtIndex]?.content || ""}
        </p>
      </div>
    </div>
  );
};

export default RotatingThoughts; 