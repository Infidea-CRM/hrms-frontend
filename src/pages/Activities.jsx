import React, { useState, useEffect, useCallback } from "react";
import { TableHeader, TableContainer, TableCell, Table } from "@windmill/react-ui";
import PageTitle from "@/components/Typography/PageTitle";
import moment from "moment";
import EmployeeServices from "@/services/EmployeeServices";
import ActivitiesTable from "@/components/activities/ActivitiesTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import { FaTimesCircle, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AnimatedContent from "@/components/common/AnimatedContent";
import { activitiesStatusOptions, dateRangeTypeOptions, resultsPerPageOptions, getStatusColorClass } from "@/utils/optionsData";
import useFilter from "@/hooks/useFilter";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState();
  const [filters, setFilters] = useState({
    status: "",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Using useFilter hook for filtering and sorting
  const {
    dateRange,
    handleDateRangeChange,
    dateRangeType,
    handleDateRangeTypeChange,
    setSortBy,
    setSortOrder,
    setDateRange
  } = useFilter(activities);

  // Filter activities by status
  const filterActivitiesByStatus = (activities) => {
    const { status } = filters;
    if (!status) return activities;
    
    return activities.filter(activity => activity.type.replace(" ", "").toLowerCase() === status.toLowerCase());
  };

  // Combined filtered results
  const filteredByStatus = filterActivitiesByStatus(filteredActivities);

  // Total pages calculation
  const totalPages = Math.ceil(filteredByStatus.length / itemsPerPage);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await EmployeeServices.getActivityHistory();

      if (response.success) {
        setActivities(response.activities);
        // Initial filtering will be done when date range changes via useEffect below
        setCurrentPage(1); // Reset to first page when filtering
      }
    } catch (error) {
      setError(error);
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);  

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle results per page change
  const handleResultsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Reset filters to default values
  const handleResetField = () => {
    setFilters({
      status: "",
    });
    setDateRange({
      startDate: null,
      endDate: null,
    });
    handleDateRangeTypeChange("day");
    setCurrentPage(1);
    setSortBy("");
    setSortOrder("asc");
  };

  // Navigation
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities, refreshKey]);

  useEffect(() => {
    // Filter activities by date range
    const filterActivitiesByDate = () => {
      if (!dateRange.startDate || !dateRange.endDate) {
        setFilteredActivities(activities);
        return;
      }
      
      const start = moment(dateRange.startDate).startOf('day');
      const end = moment(dateRange.endDate).endOf('day');
  
      const filtered = activities.filter(activity => {
        const activityDate = moment(activity.startTime);
        return activityDate.isBetween(start, end, 'day', '[]');
      });
      
      setFilteredActivities(filtered);
      setCurrentPage(1); // Reset to first page when filtering
    };

    filterActivitiesByDate();
  }, [activities, dateRange]);

  // Add event listener for custom refresh event
  useEffect(() => {
    const handleRefreshTable = () => {
      setRefreshKey(prevKey => prevKey + 1);
    };

    // Add event listener
    window.addEventListener('refreshActivitiesTable', handleRefreshTable);

    // Clean up
    return () => {
      window.removeEventListener('refreshActivitiesTable', handleRefreshTable);
    };
  }, []);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredByStatus.slice(startIndex, endIndex);
  };

  // Update any function that uses these options to use the imported ones
  const getStatusColor = (status) => {
    return getStatusColorClass(status);
  };

  return (
    <>
    <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Activities
          </h1>
        </div>
      <div className="relative pb-4">
<AnimatedContent>
      {/* Compact Filter Bar */}
      <div className="rounded-lg shadow-md bg-white dark:bg-gray-700 p-3 max-w-full mb-4">
        <div className="flex flex-wrap items-end gap-3 pb-2">
          <div className="flex-none">
            <button
              onClick={handleResetField}
              className="px-3 py-1.5 rounded-md text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
            >
              <FaTimesCircle className="mr-1 inline" />
              Reset
            </button>
          </div>
          
          <div className="w-full sm:w-auto sm:flex-none sm:min-w-[150px]">
            <select
              name="status"
              value={filters.status}
              onChange={(e) => handleFilterChange(e)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
            >
              <option value="">Select Activity</option>
              {activitiesStatusOptions.filter(option => option.value !== "").map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="w-full sm:w-auto sm:flex-none sm:min-w-[120px]">
            <select 
              value={dateRangeType}
              onChange={(e) => handleDateRangeTypeChange(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
            >
              {dateRangeTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Date Range Picker */}
          {dateRangeType === 'year' ? (
            <>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[120px]">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="yyyy"
                  showYearPicker
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="Start Year"
                  popperClassName="z-50"
                />
              </div>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[120px]">
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="yyyy"
                  showYearPicker
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="End Year"
                  popperClassName="z-50"
                />
              </div>
            </>
          ) : dateRangeType === 'month' ? (
            <>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="MMM-yyyy"
                  showMonthYearPicker
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="Start Month"
                  popperClassName="z-50"
                />
              </div>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="MMM-yyyy"
                  showMonthYearPicker
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="End Month"
                  popperClassName="z-50"
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                <DatePicker
                  selected={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="dd-MMM-yyyy"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="Start Date"
                  popperClassName="z-50"
                />
              </div>
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                <DatePicker
                  selected={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  dateFormat="dd-MMM-yyyy"
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  placeholderText="End Date"
                  popperClassName="z-50"
                />
              </div>
            </>
          )}
          
          {/* Items per page selector */}
          <div className="w-full sm:w-auto sm:flex-none sm:min-w-[100px]">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                handleResultsPerPageChange(e);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
            >
              {resultsPerPageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} per page
                </option>
              ))}
            </select>
          </div>
          
          {/* Pagination controls - moved from bottom to top */}
          {filteredByStatus.length > 0 && (
            <div className="w-full sm:w-auto sm:flex-none sm:ml-auto">
              <div className="flex items-center justify-center sm:justify-end space-x-1">
                <button
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center p-1.5 h-8 w-8 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FaChevronLeft className="h-3 w-3" />
                </button>
                
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {currentPage} / {totalPages || 1}
                </span>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center p-1.5 h-8 w-8 rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FaChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </AnimatedContent>
      </div>

      {loading ? (
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : filteredByStatus.length > 0 ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader > 
              <tr className="h-14 ml-2 text-xs font-semibold tracking-wide text-left bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <TableCell className="text-center">
                Activity
                </TableCell>
                <TableCell className="text-center">
                Start Time
                </TableCell>
                <TableCell className="text-center">
                End Time
                </TableCell>
                <TableCell className="text-center">
                Duration
                </TableCell>
                <TableCell className="text-center">
                Status
                </TableCell>
              </tr>
            </TableHeader>

            <ActivitiesTable 
              activities={getPaginatedData()}
            />
          </Table>
        </TableContainer>
      ) : activities.length > 0 ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
          <p>No activities match your filter criteria.</p>
          <button
            onClick={handleResetField}
            className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <NotFound title="Activities" />
      )}
    </>
  );
};

export default Activities; 