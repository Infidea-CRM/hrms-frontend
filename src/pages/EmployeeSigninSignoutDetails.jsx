import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableContainer,
  TableCell,
  TableBody,
  TableRow,
} from "@windmill/react-ui";
import { FaSearch, FaTimesCircle, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AnimatedContent from "@/components/common/AnimatedContent";
import EmployeeFilterDropdown from "@/components/common/EmployeeFilterDropdown";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import EmployeeServices from "@/services/EmployeeServices";
import { AdminContext } from "@/context/AdminContext";
import { formatLongDateAndTime } from "@/utils/dateFormatter";
import { notifyError } from "@/utils/toast";

const DEFAULT_ITEMS_PER_PAGE = 10;

const getPreviousDayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
};

const formatDateForApi = (date) => {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateTimeValue = (value) => {
  if (!value) return "-";
  return formatLongDateAndTime(value);
};

const EmployeeSigninSignoutDetails = () => {
  const { state } = useContext(AdminContext);
  const isAdmin = state?.adminInfo?.isAdmin || false;

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({
    employeesOnPage: 0,
    currentlyLoggedIn: 0,
    formattedTotalLoggedIn: "0h 0m",
    formattedTotalLoggedOut: "0h 0m",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const [selectedDate, setSelectedDate] = useState(() => getPreviousDayDate());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // State for tracking expanded rows (to show activity breakdown)
  const [expandedRows, setExpandedRows] = useState({});

  const fetchSigninSignoutData = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      setError("Access denied. Admin only.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await EmployeeServices.getEmployeeSigninSignoutReport({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        startDate: formatDateForApi(selectedDate),
        endDate: formatDateForApi(selectedDate),
        employeeIds: selectedEmployeeIds,
      });

      if (response?.success) {
        setRows(response.employees || []);
        setSummary(
          response.summary || {
            employeesOnPage: 0,
            currentlyLoggedIn: 0,
            formattedTotalLoggedIn: "0h 0m",
            formattedTotalLoggedOut: "0h 0m",
          }
        );
        setTotalRecords(response.pagination?.totalRecords || 0);
        setTotalPages(response.pagination?.totalPages || 1);
        setCurrentPage(response.pagination?.page || 1);
      } else {
        setRows([]);
        setSummary({
          employeesOnPage: 0,
          currentlyLoggedIn: 0,
          formattedTotalLoggedIn: "0h 0m",
          formattedTotalLoggedOut: "0h 0m",
        });
      }
    } catch (err) {
      console.error("Error fetching signin/signout report:", err);
      setRows([]);
      setSummary({
        employeesOnPage: 0,
        currentlyLoggedIn: 0,
        formattedTotalLoggedIn: "0h 0m",
        formattedTotalLoggedOut: "0h 0m",
      });
      setError(err?.response?.data?.message || "Failed to load report data");
      notifyError(err?.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  }, [
    isAdmin,
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedDate,
    selectedEmployeeIds,
  ]);

  useEffect(() => {
    fetchSigninSignoutData();
  }, [fetchSigninSignoutData]);

  const handleSearchApply = () => {
    setCurrentPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleResetFilters = () => {
    const previousDay = getPreviousDayDate();
    setSearchInput("");
    setSearchTerm("");
    setSelectedEmployeeIds([]);
    setSelectedDate(previousDay);
    setCurrentPage(1);
    setItemsPerPage(DEFAULT_ITEMS_PER_PAGE);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (employeeIds) => {
    setSelectedEmployeeIds(employeeIds);
    setCurrentPage(1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getStatusBadge = (row) => {
    if (row.isCurrentlyLoggedIn) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400">
          Logged In
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Logged Out
      </span>
    );
  };

  // Toggle expanded row to show/hide activity breakdown
  const toggleRowExpansion = (employeeId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  // Render activity breakdown dropdown for a row
  const renderActivityBreakdown = (row) => {
    const breakdown = row.activityBreakdown || {};
    const isExpanded = expandedRows[row._id];
    
    // Activity types to display
    const activityTypes = [
      "Lunch Break",
      "Team Meeting",
      "Client Meeting",
      "Office Celebration",
      "Interview Session",
    ];

    return (
      <tr key={`${row._id}-breakdown`}>
        <TableCell colSpan={9} className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="ml-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Activity Breakdown
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {activityTypes.map((type) => {
                const data = breakdown[type] || { count: 0, formattedTime: "0h 0m" };
                return (
                  <div 
                    key={type} 
                    className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{type}</p>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {data.formattedTime}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {data.count} {data.count === 1 ? "time" : "times"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </TableCell>
      </tr>
    );
  };

  return (
    <AnimatedContent>
      <div className="py-4 w-full overflow-x-hidden">
        <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
          Employee Signin/Signout Details
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 mb-4 max-w-lg">     
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Employees</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {summary.employeesOnPage}
            </p>
          </div>

          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Currently Logged In
            </p>
            <p className="text-xl font-semibold text-green-700 dark:text-green-400">
              {summary.currentlyLoggedIn}
            </p>
          </div>
        </div>

        <div className="rounded-lg shadow-md bg-white dark:bg-gray-700 p-3 max-w-full mb-4">
  <div className="flex flex-wrap items-end gap-3 pb-2">

    {/* SEARCH */}
    <div className="w-full sm:w-auto sm:flex-none sm:min-w-[220px]">
      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            setSearchTerm(value.trim());
            setCurrentPage(1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchApply();
            }
          }}
          placeholder="Search by name, email, code"
          className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
        />
        <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 h-3 w-3" />
      </div>
    </div>

    {/* APPLY BUTTON */}
    <div className="w-full sm:w-auto sm:flex-none">
      <button
        onClick={handleSearchApply}
        className="px-3 py-1.5 rounded-md text-xs bg-blue-600 hover:bg-blue-700 text-white"
      >
        Apply
      </button>
    </div>

    {/* DATE */}
    <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="dd-MMM-yyyy"
        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
        placeholderText="Select Date"
        popperClassName="z-50"
      />
    </div>

    {/* EMPLOYEE FILTER */}
    <EmployeeFilterDropdown
      isAdmin={isAdmin}
      selectedEmployeeIds={selectedEmployeeIds}
      onEmployeeChange={handleEmployeeChange}
    />

    {/* ITEMS PER PAGE */}
    <div className="w-full sm:w-auto sm:flex-none sm:min-w-[110px]">
      <select
        value={itemsPerPage}
        onChange={(e) => {
          setItemsPerPage(parseInt(e.target.value, 10));
          setCurrentPage(1);
        }}
        className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
      >
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>

    {/* RESET */}
    <div className="flex-none">
      <button
        onClick={handleResetFilters}
        className="px-3 py-1.5 rounded-md text-xs bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
      >
        <FaTimesCircle className="mr-1 inline" />
        Reset
      </button>
    </div>

  </div>
</div>

        {rows.length > 0 && (
          <div className="mb-8 w-full overflow-x-hidden">
            <TableContainer className="mb-8 overflow-x-auto w-full">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  <tr className="h-14 text-xs font-semibold bg-gray-50 dark:bg-gray-800">
                    <TableCell className="sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 text-center">
                      Employee
                    </TableCell>
                    <TableCell className="text-center">Code</TableCell>
                    <TableCell className="text-center">Email</TableCell>
                    <TableCell className="text-center">First Signin</TableCell>
                    <TableCell className="text-center">Last Signin</TableCell>
                    <TableCell className="text-center">Last Signout</TableCell>
                    <TableCell className="text-center">Logged In Time</TableCell>
                    <TableCell className="text-center">Logout Events</TableCell>
                    <TableCell className="text-center">Current Status</TableCell>
                  </tr>
                </TableHeader>

                <TableBody className="dark:bg-gray-900">
                  {rows.map((row) => (
                    <React.Fragment key={row._id}>
                      <TableRow className="text-center">
                        <TableCell className="px-3 py-3 sticky left-0 bg-gray-900 z-10">
                          <p className="text-sm font-medium text-gray-100">
                            {row.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {row.designation || "-"}
                          </p>
                        </TableCell>

                        <TableCell>{row.employeeCode || "-"}</TableCell>
                        <TableCell>{row.email || "-"}</TableCell>
                        <TableCell>{formatDateTimeValue(row.firstSigninAt)}</TableCell>
                        <TableCell>{formatDateTimeValue(row.lastSigninAt)}</TableCell>
                        <TableCell>{formatDateTimeValue(row.lastSignoutAt)}</TableCell>
                        <TableCell className="text-green-400">
                          {row.formattedLoggedInTime}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <span>{row.logoutEvents}</span>
                            <button
                              onClick={() => toggleRowExpansion(row._id)}
                              className="p-1 rounded hover:bg-gray-700 focus:outline-none"
                              title={expandedRows[row._id] ? "Collapse" : "Expand"}
                            >
                              {expandedRows[row._id] ? (
                                <FaChevronUp className="w-3 h-3 text-gray-400" />
                              ) : (
                                <FaChevronDown className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(row)}</TableCell>
                      </TableRow>
                      {expandedRows[row._id] && renderActivityBreakdown(row)}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </AnimatedContent>
  );
};

export default EmployeeSigninSignoutDetails;