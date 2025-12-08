import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FaChevronRight } from "react-icons/fa";
import EmployeeServices from "@/services/EmployeeServices";
import { notifyError } from "@/utils/toast";

/**
 * Reusable Employee Filter Dropdown Component
 * Shows only for admin users and allows filtering by employee
 * 
 * @param {boolean} isAdmin - Whether the current user is admin
 * @param {string} selectedEmployeeId - Currently selected employee ID
 * @param {function} onEmployeeChange - Callback when employee selection changes
 * @param {string} className - Additional CSS classes for the container
 */
const EmployeeFilterDropdown = ({ 
  isAdmin, 
  selectedEmployeeId, 
  onEmployeeChange,
  className = ""
}) => {
  const [employees, setEmployees] = useState([]);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  
  const employeeButtonRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Fetch employees list (admin only)
  useEffect(() => {
    const fetchEmployees = async () => {
      if (isAdmin) {
        try {
          const response = await EmployeeServices.getAllEmployees();
          if (response && response.employees && Array.isArray(response.employees)) {
            setEmployees(response.employees);
          }
        } catch (error) {
          console.error("Error fetching employees:", error);
          notifyError("Failed to load employees list");
        }
      }
    };

    fetchEmployees();
  }, [isAdmin]);

  // Calculate dropdown position when it opens
  useEffect(() => {
    const updatePosition = () => {
      if (showEmployeeDropdown && employeeButtonRef.current) {
        const rect = employeeButtonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showEmployeeDropdown]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target) &&
          employeeButtonRef.current && !employeeButtonRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
      }
    }

    if (showEmployeeDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmployeeDropdown]);

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const handleSelectEmployee = (employeeId) => {
    onEmployeeChange(employeeId);
    setShowEmployeeDropdown(false);
    setEmployeeSearchTerm("");
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name?.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(employeeSearchTerm.toLowerCase())
  );

  const selectedEmployeeName = selectedEmployeeId 
    ? employees.find(emp => emp._id === selectedEmployeeId)?.name || "Select Employee"
    : "All Employees";

  return (
    <>
      {/* Employee Filter Button */}
      <div className={`w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[220px] relative ${className}`}>
        <button
          ref={employeeButtonRef}
          type="button"
          onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
          className="w-full px-3 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 flex items-center justify-between"
        >
          <span className="truncate">{selectedEmployeeName}</span>
          <FaChevronRight 
            className={`ml-2 h-3 w-3 transition-transform ${showEmployeeDropdown ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* Employee Dropdown - Using Portal */}
      {showEmployeeDropdown && createPortal(
        <div 
          ref={employeeDropdownRef}
          className="fixed bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-200 dark:border-gray-700"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width || 220}px`,
            zIndex: 9999,
            maxHeight: '60vh',
          }}
        >
          <div className="flex flex-col overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <input
                type="text"
                placeholder="Search employees"
                value={employeeSearchTerm}
                onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Employee List */}
            <div 
              className="overflow-y-auto flex-1"
              style={{ 
                scrollBehavior: 'smooth',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                maxHeight: 'calc(60vh - 60px)'
              }}
              onWheel={(e) => e.stopPropagation()}
            >
              {/* All Employees Option */}
              <button
                type="button"
                onClick={() => handleSelectEmployee("")}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedEmployeeId === "" 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                    : "text-gray-900 dark:text-white"
                }`}
              >
                All Employees
              </button>
              
              {/* Employee List */}
              {filteredEmployees.map((employee) => (
                <button
                  key={employee._id}
                  type="button"
                  onClick={() => handleSelectEmployee(employee._id)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    selectedEmployeeId === employee._id 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {employee.name}
                </button>
              ))}
              
              {/* No Results */}
              {filteredEmployees.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  No employees found
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default EmployeeFilterDropdown;

