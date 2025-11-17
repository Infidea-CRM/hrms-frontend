import React, { useState, useRef, useEffect, forwardRef } from "react";
import { MdInfo } from "react-icons/md";
import ProcessJDModal from "./ProcessJDModal";
import { getProcessJDData } from "@/utils/processJDData";

// Global flag to track if Tab key was recently pressed (for all dropdown instances)
let globalTabPressed = false;
let globalTabTimeout = null;

const SearchableProcessDropdown = forwardRef(({
  options,
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  required = false,
  disabled = false,
  darkMode = false,
  phoneNumber
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isJDModalOpen, setIsJDModalOpen] = useState(false);
  const [selectedProcessJD, setSelectedProcessJD] = useState(null);
  // Store the original selected value label
  const [selectedLabel, setSelectedLabel] = useState("");
  // Track if the focus is from tabbing
  const [isTabbing, setIsTabbing] = useState(false);
  
  const inputRef = useRef(null);
  const listboxRef = useRef(null);
  const containerRef = useRef(null);

  // Combine refs: external ref and internal inputRef
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);

  // Find the currently selected option's label
  const selectedOption = options.find(option => option.value === value);

  // Check if the current process has a JD available
  const hasJD = value && getProcessJDData(value);

  // Filter options based on search term
  const filteredOptions = searchTerm.trim() === "" 
    ? options 
    : options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // When value changes externally, update the search term to match the selected option
  useEffect(() => {
    if (selectedOption && isOpen === false) {
      setSearchTerm(selectedOption.label);
      setSelectedLabel(selectedOption.label);
    }
  }, [selectedOption, isOpen]);

  // Initialize searchTerm with selected option label on mount
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption.label);
      setSelectedLabel(selectedOption.label);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm("");
        }
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedOption]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length]);

  // Focus previous or next field based on shift key
  const focusAdjacentField = (isShift) => {
    if (inputRef.current) {
      const form = inputRef.current.closest('form');
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]), select, textarea, button:not([type="button"])'));
        const currentIndex = inputs.indexOf(inputRef.current);
        if (isShift && currentIndex > 0) {
          // Focus previous field
          inputs[currentIndex - 1].focus();
        } else if (!isShift && currentIndex >= 0 && currentIndex < inputs.length - 1) {
          // Focus next field
          inputs[currentIndex + 1].focus();
        }
      }
    }
  };

  // Handle info button click to open JD modal
  const handleInfoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const jdData = getProcessJDData(value);
    if (jdData) {
      setSelectedProcessJD(jdData);
      setIsJDModalOpen(true);
    }
  };

  // Add state to track if we're shift-tabbing
  const [isShiftTabbing, setIsShiftTabbing] = useState(false);
  // Track if the focus is from tabbing - use ref for immediate access
  const isTabbingRef = useRef(false);

  // Track key down/up for shift key and global Tab key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && e.shiftKey) {
        setIsShiftTabbing(true);
      }
      // Track Tab key globally
      if (e.key === 'Tab') {
        globalTabPressed = true;
        // Clear any existing timeout
        if (globalTabTimeout) {
          clearTimeout(globalTabTimeout);
        }
        // Reset after focus events have been processed
        globalTabTimeout = setTimeout(() => {
          globalTabPressed = false;
        }, 300);
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setIsShiftTabbing(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (globalTabTimeout) {
        clearTimeout(globalTabTimeout);
      }
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // Don't intercept the Ctrl+" shortcut (let it bubble up to focus call summary)
    if (e.ctrlKey && (e.key === '"' || e.key === "'" || e.keyCode === 222 || e.which === 222)) {
      return;
    }
    
    // Don't intercept the Ctrl+: shortcut (let it bubble up to focus candidate name)
    if (e.ctrlKey && (e.key === ':' || e.keyCode === 186)) {
      return;
    }
    
    // Set tabbing flag when Tab key is pressed
    if (e.key === "Tab") {
      isTabbingRef.current = true;
      setIsTabbing(true);
      // Reset after a short delay to allow handleFocus to check it
      setTimeout(() => {
        isTabbingRef.current = false;
        setIsTabbing(false);
      }, 200);
    }
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        // Clear search term when opening dropdown with arrow key
        setSearchTerm("");
      } else {
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        // Scroll to highlighted option
        if (listboxRef.current && listboxRef.current.children[highlightedIndex + 1]) {
          listboxRef.current.children[highlightedIndex + 1].scrollIntoView({
            block: 'nearest'
          });
        }
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
      // Scroll to highlighted option
      if (listboxRef.current && listboxRef.current.children[highlightedIndex - 1]) {
        listboxRef.current.children[highlightedIndex - 1].scrollIntoView({
          block: 'nearest'
        });
      }
    } else if (e.key === "Enter" && isOpen) {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleOptionSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      }
    } else if (e.key === "Tab") {
      // Close dropdown if open, but don't select anything
      if (isOpen) {
        setIsOpen(false);
        // Restore the search term to the selected value if any
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm("");
        }
      }
      // Always let Tab key work normally - don't prevent default
      // This allows normal tab navigation without auto-selecting options
    }
  };

  // Handle input changes (searching)
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Focus next field after selection
  const focusNextField = () => {
    if (inputRef.current) {
      // No explicit focus management - just close the dropdown
      // The browser's default tab order will take care of navigation
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    onChange({ target: { value: option.value } });
    setSearchTerm(option.label);
    setSelectedLabel(option.label);
    setIsOpen(false);
    
    // Just close the dropdown without explicit focus management
    setTimeout(focusNextField, 10);
  };

  // Handle click to open dropdown and clear search term
  const handleClick = () => {
    setIsOpen(true);
    setSearchTerm("");
    if (inputRef.current) {
      inputRef.current.select();
    }
  };

  // Handle focus to open dropdown and clear search term
  const handleFocus = (e) => {
    // Don't open dropdown if we're shift-tabbing or tabbing into this field
    // Only open on mouse click or explicit user interaction
    if (!isShiftTabbing && !isTabbingRef.current && !globalTabPressed) {
      setIsOpen(true);
      setSearchTerm("");
      
      if (inputRef.current) {
        inputRef.current.select();
      }
    } else {
      // When tabbing into field, keep dropdown closed and maintain current value
      if (selectedOption) {
        setSearchTerm(selectedOption.label);
      } else {
        setSearchTerm("");
      }
    }
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={containerRef}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleClick}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${
            hasJD ? 'pr-12' : 'pr-8'
          } ${darkMode 
            ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
            : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full ${
              disabled ? 'cursor-not-allowed opacity-70' : ''
            }`}
        />
        
        {/* Icons container */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          {/* Info Button - Only shown when there's a selected process with JD data */}
          {hasJD && (
            <button
              type="button"
              onClick={handleInfoClick}
              className="pr-6 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              title="View Process Details"
            >
              <MdInfo className="w-5 h-5" />
            </button>
          )}
          
          {/* Dropdown arrow */}
          <div className="pr-2 pointer-events-none">
            <svg
              className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Dropdown menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 shadow-lg ring-1 ${
            darkMode 
              ? 'bg-gray-700 text-white ring-black ring-opacity-5' 
              : 'bg-white text-gray-800 ring-black ring-opacity-5'
          }`}
          role="listbox"
        >
          {filteredOptions.length === 0 ? (
            <li className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
              No options found
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                role="option"
                className={`cursor-pointer select-none px-3 py-2 text-sm ${
                  index === highlightedIndex
                    ? darkMode
                      ? 'bg-[#e2692c] text-white'
                      : 'bg-[#1a5d96] text-white'
                    : ''
                }`}
                onClick={() => handleOptionSelect(option)}
                aria-selected={index === highlightedIndex}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
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
});

export default SearchableProcessDropdown; 