import React, { useContext } from 'react';
import { WindmillContext } from "@windmill/react-ui";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeToggle = ({ className = "" }) => {
  const { mode, toggleMode } = useContext(WindmillContext);

  return (
    <button
      className={`rounded-md focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${className}`}
      onClick={toggleMode}
      aria-label="Toggle color mode"
    >
      {mode === "dark" ? (
        <FiSun className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
      ) : (
        <FiMoon className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
      )}
    </button>
  );
};

export default ThemeToggle; 