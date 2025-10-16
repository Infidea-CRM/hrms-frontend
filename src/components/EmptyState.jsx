import React from 'react';
import { FiInbox } from 'react-icons/fi';

/**
 * EmptyState component for displaying empty state messages
 * @param {Object} props Component props
 * @param {string} props.message Message to display in the empty state
 * @param {React.ReactNode} props.icon Icon to display (optional)
 * @param {string} props.className Additional classes for the component
 * @param {React.ReactNode} props.children Children components (optional)
 */
const EmptyState = ({ 
  message = "No data found", 
  icon = <FiInbox className="h-12 w-12 text-gray-400" />, 
  className = "", 
  children 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-6 ${className}`}>
      <div className="mb-4">
        {icon}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{message}</p>
      {children}
    </div>
  );
};

export default EmptyState; 