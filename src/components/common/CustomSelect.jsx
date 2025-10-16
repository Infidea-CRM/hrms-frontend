import React from 'react';
import Select from 'react-select';
import { MdOutlineWhatsapp } from "react-icons/md";

const CustomSelect = ({
  label,
  icon,
  value,
  onChange,
  options,
  isDisabled,
  isRequired,
  darkMode,
  loading,
  hasWhatsAppButton = false,
  whatsAppNumber = '',
  processDetails = '',
  customInput = false,
  customValue = '',
  onCustomChange,
  customPlaceholder = 'Enter custom value',
  className = ''
}) => {
  const getSelectStyles = (darkMode) => ({
    control: (base, state) => ({
      ...base,
      minHeight: '36px',
      background: darkMode ? '#374151' : 'white',
      borderColor: darkMode 
        ? state.isFocused ? '#e2692c' : '#4B5563' 
        : state.isFocused ? '#1a5d96' : '#D1D5DB',
      boxShadow: state.isFocused 
        ? darkMode 
          ? '0 0 0 1px #e2692c' 
          : '0 0 0 1px #1a5d96'
        : 'none',
      '&:hover': {
        borderColor: darkMode ? '#e2692c' : '#1a5d96'
      }
    }),
    menu: (base) => ({
      ...base,
      background: darkMode ? '#374151' : 'white',
      zIndex: 999
    }),
    option: (base, state) => ({
      ...base,
      background: state.isFocused 
        ? darkMode ? '#4B5563' : '#E5E7EB'
        : 'transparent',
      color: darkMode ? 'white' : 'black',
      '&:active': {
        background: darkMode ? '#e2692c' : '#1a5d96',
        color: 'white'
      }
    }),
    singleValue: (base) => ({
      ...base,
      color: darkMode ? 'white' : 'black'
    }),
    input: (base) => ({
      ...base,
      color: darkMode ? 'white' : 'black'
    })
  });

  const handleChange = (selectedOption) => {
    onChange(selectedOption?.value || "");
    
    // Find the next focusable element
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const currentSelect = document.activeElement;
    const allFocusable = Array.from(document.querySelectorAll(focusableElements));
    const currentIndex = allFocusable.indexOf(currentSelect);
    const nextElement = allFocusable[currentIndex + 1];
    
    // Focus the next element if found
    if (nextElement) {
      nextElement.focus();
    }
  };

  return (
    <div className={`flex flex-col relative ${className}`}>
      <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        <span className="text-base">{icon}</span>
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={options?.find(opt => opt.value === value)}
            onChange={handleChange}
            options={options}
            isDisabled={isDisabled || loading}
            isRequired={isRequired}
            isClearable={false}
            classNamePrefix="react-select"
            className={`${darkMode ? 'react-select-dark' : ''}`}
            styles={getSelectStyles(darkMode)}
          />
        </div>
        {hasWhatsAppButton && whatsAppNumber && (
          <button
            type="button"
            onClick={() => window.open(`https://wa.me/91${whatsAppNumber}?text=Process%20Details:%20${encodeURIComponent(processDetails)}`)}
            className={`px-2 rounded-md ${darkMode ? 'bg-[#e2692c] hover:bg-[#d15a20]' : 'bg-[#1a5d96] hover:bg-[#154a7a]'} text-white`}
            title="Send process details on WhatsApp"
          >
            <MdOutlineWhatsapp className="text-lg" />
          </button>
        )}
      </div>

      {/* Custom input field for "others" option */}
      {customInput && (value?.toLowerCase() === "others" || customValue) && (
        <input
          type="text"
          value={customValue || ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={customPlaceholder}
          required={isRequired && value?.toLowerCase() === "others"}
          className={`mt-1.5 px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
            ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
            : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full`}
        />
      )}
    </div>
  );
};

export default CustomSelect; 