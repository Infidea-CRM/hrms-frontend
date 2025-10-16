import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const DownloadDataModal = ({ 
  isOpen, 
  onClose, 
  title = "Download Data",
  availableColumns,
  selectedItems = [],
  onClearSelection = () => {},
  onDownload,
  showSelectedItemsUI = true,
  entityName = "Items"
}) => {
  const [selectedColumns, setSelectedColumns] = useState({});

  // Initialize all columns as selected
  const initializeSelectedColumns = useCallback(() => {
    const initialColumns = {};
    availableColumns.forEach(column => {
      initialColumns[column.key] = true;
    });
    setSelectedColumns(initialColumns);
  }, [availableColumns]);

  // Toggle individual column selection
  const toggleColumnSelection = (columnKey) => {
    setSelectedColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  // Add a select/deselect all columns function
  const toggleAllColumns = (selectAll) => {
    const updatedColumns = {};
    availableColumns.forEach(column => {
      updatedColumns[column.key] = selectAll;
    });
    setSelectedColumns(updatedColumns);
  };

  // Add a function to count selected columns
  const getSelectedColumnsCount = () => {
    return Object.values(selectedColumns).filter(Boolean).length;
  };

  // Initialize columns when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeSelectedColumns();
    }
  }, [isOpen, initializeSelectedColumns]);

  // Get grouped columns for better organization
  const getColumnGroups = () => {
    const totalColumns = availableColumns.length;
    
    // Define groupings - can be customized based on your needs
    const groups = [
      { 
        name: "Basic Information", 
        columns: availableColumns.slice(0, Math.min(9, totalColumns))
      }
    ];
    
    if (totalColumns > 9) {
      groups.push({
        name: "Intermediate Information",
        columns: availableColumns.slice(9, Math.min(16, totalColumns))
      });
    }
    
    if (totalColumns > 16) {
      groups.push({
        name: "Additional Information",
        columns: availableColumns.slice(16, Math.min(23, totalColumns))
      });
    }
    
    if (totalColumns > 23) {
      groups.push({
        name: "More Information",
        columns: availableColumns.slice(23)
      });
    }
    
    return groups;
  };

  // Don't render if not open
  if (!isOpen) return null;

  const columnGroups = getColumnGroups();
  
  const handleDownload = (onlySelected) => {
    const selectedColumnKeys = Object.keys(selectedColumns).filter(key => selectedColumns[key]);
    onDownload(selectedColumnKeys, onlySelected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-4">
      {/* Modal Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {title}
            </h3>
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-full p-1"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div className="px-6 py-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-base font-medium text-gray-900 dark:text-white">
                Select columns to include:
              </h4>
              <div className="flex space-x-3">
                <button 
                  onClick={() => toggleAllColumns(true)}
                  className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                >
                  Select All
                </button>
                <button 
                  onClick={() => toggleAllColumns(false)}
                  className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
            
            {/* Simple Selected Items Count Display - Only show if showSelectedItemsUI is true */}
            {showSelectedItemsUI && (
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
                    Selected {entityName}:
                  </span>
                  {selectedItems.length > 0 ? (
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                      {selectedItems.length}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      None
                    </span>
                  )}
                </div>
                
                {selectedItems.length > 0 && (
                  <button 
                    onClick={onClearSelection}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            )}
            
            {/* Column Selection Area */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Column categories */}
              <div className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {getSelectedColumnsCount()} of {availableColumns.length} columns selected
                </span>
              </div>
              
              {/* Scrollable column list with organized categories */}
              <div className="max-h-64 overflow-y-auto p-1 bg-white dark:bg-gray-800">
                {columnGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className={groupIndex < columnGroups.length - 1 ? "mb-3" : ""}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md mb-1">
                      {group.name}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 px-2">
                      {group.columns.map((column) => (
                        <label 
                          key={column.key} 
                          className="flex items-center px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-400 mr-2"
                            checked={selectedColumns[column.key] || false}
                            onChange={() => toggleColumnSelection(column.key)}
                          />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{column.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-650 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 dark:focus:ring-blue-400"
              onClick={onClose}
            >
              Cancel
            </button>
            
            {/* Conditionally render download buttons based on showSelectedItemsUI */}
            {showSelectedItemsUI ? (
              <>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  onClick={() => handleDownload(true)}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {getSelectedColumnsCount() > 0
                      ? `Download Particulary (${getSelectedColumnsCount()})` 
                      : `Download (${entityName})`}
                  </span>
                </button>
                
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-500 rounded-md shadow-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 dark:focus:ring-emerald-400"
                  onClick={() => handleDownload(false)}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {entityName}
                  </span>
                </button>
              </>
            ) : (
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md shadow-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                onClick={() => handleDownload(false)}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Data
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DownloadDataModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  availableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedItems: PropTypes.array,
  onClearSelection: PropTypes.func,
  onDownload: PropTypes.func.isRequired,
  showSelectedItemsUI: PropTypes.bool,
  entityName: PropTypes.string
};

export default DownloadDataModal; 