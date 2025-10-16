import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdownButton = ({ 
  label, 
  options, 
  register,
  value = [], 
  onChange, 
  name,
  formatOption, 
  error,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Clear search when closing
    if (!newIsOpen) {
      setSearchTerm('');
    } else {
      // Focus search input when opening
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 10);
    }
  };

    // Required field label component with red asterisk
    const RequiredLabel = ({ text }) => (
      <span>
        {text} <span className="text-red-500">*</span>
      </span>
    );
  

  // Handle option selection
  const handleOptionToggle = (option) => {
    let newValue;
    if (value.includes(option)) {
      // Remove the option if already selected
      newValue = value.filter(item => item !== option);
    } else {
      // Add the option if not already selected
      newValue = [...value, option];
    }
    onChange(newValue);
  };

  // Calculate and set dropdown position when it opens
  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      // Get the button's position and dimensions
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      
      // Set the menu's position
      menuRef.current.style.width = `${buttonRect.width}px`;
      menuRef.current.style.top = `${buttonRect.height + 4}px`; // 4px gap
      menuRef.current.style.left = '0';
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    // Modified scroll handler that only closes the dropdown when scrolling
    // outside of the dropdown and its menu
    const handleScroll = (event) => {
      // Check if the scroll event originated from within the dropdown or its menu
      if (isOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          menuRef.current && 
          !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true); // true for capture phase
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // Format the display text for the button
  const getDisplayText = () => {
    if (value.length === 0) return "--Select One Skill--";
    
    // Format each selected value and join them with commas
    return value.map(item => formatOption ? formatOption(item) : item).join(', ');
  };

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const optionText = formatOption ? formatOption(option) : option;
    return optionText.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Create a hidden input field for React Hook Form
  const registerField = () => {
    if (register && name) {
      return (
        <input
          type="hidden"
          {...register(name, {
            required: required ? `${label} is required` : false,
            // Add any other validation rules here
          })}
          value={Array.isArray(value) ? value.join(',') : ''}
          id={name}
        />
      );
    }
    return null;
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-2 w-full">
      {registerField()}
      
      <div className="relative w-full" ref={dropdownRef}>
        {/* Dropdown Button */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <RequiredLabel text={label} />
        </label>
        <button
          type="button"
          onClick={toggleDropdown}
          className={`w-full flex justify-between items-center rounded-md border ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 px-3 py-2 text-gray-700 dark:text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="truncate">{getDisplayText()}</span>
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        
        {/* Dropdown Menu with Search */}
        {isOpen && (
          <div 
            ref={menuRef}
            className="absolute z-50 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-lg"
            style={{ maxWidth: 'calc(100vw - 20px)' }} // Prevent overflow beyond viewport
          >
            {/* Search input */}
            <div className="sticky top-0 p-2 bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <ul className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => handleOptionToggle(option)}
                  >
                    <input
                      type="checkbox"
                      checked={value.includes(option)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-200">
                      {formatOption ? formatOption(option) : option}
                    </span>
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

export default MultiSelectDropdownButton;