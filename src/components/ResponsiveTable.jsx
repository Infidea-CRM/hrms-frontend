import React from 'react';

const ResponsiveTable = ({ 
  headers, 
  data, 
  onEdit, 
  onView, 
  onDelete, 
  darkMode,
  getStatusColorClass,
  itemsPerPage,
  totalItems,
  currentPage,
  onPageChange
}) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="overflow-hidden shadow-md rounded-lg">
      {/* Main table container with horizontal scroll for small screens */}
      <div className="overflow-x-auto">
        <table className={`min-w-full ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-700'}`}>
          {/* Table header */}
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className={`py-3 px-4 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {header.label}
                </th>
              ))}
              <th className={`py-3 px-4 text-center text-xs font-medium uppercase tracking-wider ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Actions
              </th>
            </tr>
          </thead>
          
          {/* Table body */}
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={headers.length + 1} 
                  className={`py-4 px-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={item.id || rowIndex} 
                  className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                >
                  {headers.map((header, colIndex) => {
                    // Get the value for this cell
                    const value = item[header.key];
                    
                    // If there's a special renderer for this column, use it
                    const displayValue = header.render ? header.render(value, item) : value;
                    
                    // Apply special styling for status if status color function exists
                    const isStatus = header.key === 'callStatus' && getStatusColorClass;
                    const statusClass = isStatus ? getStatusColorClass(value) : '';
                    
                    return (
                      <td 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`py-3 px-4 whitespace-normal break-words ${
                          darkMode ? 'text-gray-300' : 'text-gray-800'
                        } ${statusClass}`}
                      >
                        {/* If the content is long, allow it to wrap */}
                        <div className="max-w-xs">
                          {displayValue || '-'}
                        </div>
                      </td>
                    );
                  })}
                  
                  {/* Actions column */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(item)}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            darkMode 
                              ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          View
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            darkMode 
                              ? 'bg-orange-600 text-white hover:bg-orange-500' 
                              : 'bg-blue-600 text-white hover:bg-blue-500'
                          }`}
                        >
                          Edit
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            darkMode 
                              ? 'bg-red-600 text-white hover:bg-red-500' 
                              : 'bg-red-600 text-white hover:bg-red-500'
                          }`}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className={`px-4 py-3 flex items-center justify-between border-t ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 disabled:bg-gray-800 disabled:text-gray-600' 
                  : 'bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-500'
              } border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 disabled:bg-gray-800 disabled:text-gray-600' 
                  : 'bg-white text-gray-700 disabled:bg-gray-100 disabled:text-gray-500'
              } border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing 
                <span className="font-medium"> {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} </span>
                to
                <span className="font-medium"> {Math.min(currentPage * itemsPerPage, totalItems)} </span>
                of
                <span className="font-medium"> {totalItems} </span>
                results
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-500'
                  } ${currentPage === 1 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : ''}`}
                >
                  <span className="sr-only">First</span>
                  <span>«</span>
                </button>
                <button
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-500'
                  } ${currentPage === 1 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : ''}`}
                >
                  <span className="sr-only">Previous</span>
                  <span>‹</span>
                </button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Create a simple pagination that shows at most 5 page numbers centered around the current page
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // Show all pages if there are 5 or fewer
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // Show pages 1-5 if current page is near the beginning
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // Show last 5 pages if current page is near the end
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Show current page and 2 on each side
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        currentPage === pageNum
                          ? (darkMode 
                              ? 'bg-gray-600 border-gray-500 text-orange-400 font-bold' 
                              : 'bg-blue-50 border-blue-500 text-blue-600 font-bold')
                          : (darkMode 
                              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' 
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50')
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-500'
                  } ${currentPage === totalPages ? (darkMode ? 'text-gray-600' : 'text-gray-300') : ''}`}
                >
                  <span className="sr-only">Next</span>
                  <span>›</span>
                </button>
                <button
                  onClick={() => onPageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                    darkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-300 bg-white text-gray-500'
                  } ${currentPage === totalPages ? (darkMode ? 'text-gray-600' : 'text-gray-300') : ''}`}
                >
                  <span className="sr-only">Last</span>
                  <span>»</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable; 