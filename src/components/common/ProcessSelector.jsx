import React, { useState } from "react";
import { MdInfo } from "react-icons/md";
import ProcessJDModal from "./ProcessJDModal";
import { getProcessJDData } from "@/utils/processJDData";

const ProcessSelector = ({
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = "",
  label = "",
  error,
  showInfoButton = true,
  phoneNumber
}) => {
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [selectedProcessJD, setSelectedProcessJD] = useState(null);

  // Handle info button click
  const handleInfoClick = (e) => {
    e.preventDefault();
    const jdData = getProcessJDData(value);
    if (jdData) {
      setSelectedProcessJD(jdData);
      setIsJDModalOpen(true);
    }
  };

  // Check if the current process has a JD available
  const hasJD = value && getProcessJDData(value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
            dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
            ${error ? 'border-red-500 dark:border-red-500' : ''} 
            ${className}
            ${showInfoButton && hasJD ? 'pr-10' : ''}
            ${disabled ? 'cursor-not-allowed opacity-70' : ''}
          `}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Info Button - Only shown when there's a selected process with JD data */}
        {showInfoButton && hasJD && (
          <button
            type="button"
            onClick={handleInfoClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
            title="View Process Details"
          >
          </button>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}

      {/* Process JD Modal */}
      <ProcessJDModal
        isOpen={isJDModalOpen}
        onClose={() => setIsJDModalOpen(false)}
        jdData={selectedProcessJD}
        phoneNumber={phoneNumber}
      />
    </div>
  );
};

export default ProcessSelector; 