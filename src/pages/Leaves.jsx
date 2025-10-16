import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  TableHeader,
  TableContainer,
  TableCell,
  Table,
  Label,
  Select,
  Textarea,
  Badge,
  HelperText,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@windmill/react-ui";
import { useLocation, useNavigate } from "react-router";
import moment from "moment";
import EmployeeServices from "@/services/EmployeeServices";
import LeavesTable from "@/components/leaves/LeavesTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { FaTimesCircle, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaTimes } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AnimatedContent from "@/components/common/AnimatedContent";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { 
  leaveStatusOptions, 
  dateRangeTypeOptions, 
  resultsPerPageOptions 
} from "@/utils/optionsData";

const Leaves = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: "",
  });
  const [dateRangeType, setDateRangeType] = useState("day");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isOneDay, setIsOneDay] = useState(null);
  const [isSingleDateMode, setIsSingleDateMode] = useState(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [isEarlyLogoutValid, setIsEarlyLogoutValid] = useState(true);
  const [minDate] = useState(new Date());
  
  // Add useEffect for Escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close any open modals
        if (isModalOpen) {
          toggleModal();
        }
        if (isCalendarModalOpen) {
          toggleCalendarModal();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen, isCalendarModalOpen]);

  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    setValue,
    formState: { errors },
    control
  } = useForm();

  // Selected leave type to show remaining balance
  const leaveTypeWatch = watch("leaveType");
  
  // Watch for start date changes when one day is checked
  const startDate = watch("startDate");
  const singleDate = watch("singleDate");
  
  const calendarModalRef = useRef(null);
  
  useEffect(() => {
    // Update selectedLeaveType state when form value changes
    setSelectedLeaveType(leaveTypeWatch);

    // If early logout is selected, check if current time is after 5 PM
    if (leaveTypeWatch === "Early Logout") {
      const currentHour = new Date().getHours();
      setIsEarlyLogoutValid(currentHour >= 17); // 17 is 5 PM in 24-hour format
      
      // Set today's date automatically for early logout
      const today = moment().format("YYYY-MM-DD");
      setValue("singleDate", today);
      setValue("startDate", today);
      setValue("endDate", today);
      setValue("leaveReason", "Early Logout");
      setValue("description", "Request for early logout today");
      
      // Force single date mode for early logout
      setIsSingleDateMode(true);
    }
  }, [leaveTypeWatch, setValue]);

  useEffect(() => {
    if (isOneDay && startDate) {
      setValue("endDate", startDate);
    }
    
    if (isSingleDateMode && singleDate) {
      setValue("startDate", singleDate);
      setValue("endDate", singleDate);
    }
  }, [isOneDay, startDate, isSingleDateMode, singleDate, setValue]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle date range type change
  const handleDateRangeTypeChange = (value) => {
    setDateRangeType(value);
  };

  // Handle results per page change
  const handleResultsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Handle date range change
  const handleDateRangeChange = (start, end) => {
    setDateRange({
      startDate: start,
      endDate: end,
    });
    setCurrentPage(1); // Reset to first page when filtering
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

  // Reset filters to default values
  const handleResetField = () => {
    setFilters({
      status: "",
    });
    setDateRange({
      startDate: null,
      endDate: null,
    });
    setDateRangeType("day");
    setCurrentPage(1);
  };

  // Filter leaves by date range
  const filterLeavesByDate = (allLeaves) => {
    if (!dateRange.startDate || !dateRange.endDate) return allLeaves;
    
    const start = moment(dateRange.startDate).startOf('day');
    const end = moment(dateRange.endDate).endOf('day');

    return allLeaves.filter(leave => {
      const leaveStartDate = moment(leave.startDate);
      return leaveStartDate.isBetween(start, end, 'day', '[]');
    });
  };

  // Filter leaves by status
  const filterLeavesByStatus = (leaves) => {
    const { status } = filters;
    if (!status) return leaves;
    
    
    return leaves.filter(leave => leave.status.toLowerCase() === status.toLowerCase());
  };

  // Combined filtered results
  const applyAllFilters = (leaves) => {
    let result = filterLeavesByDate(leaves);
    result = filterLeavesByStatus(result);
    return result;
  };

  // Get final filtered leaves
  const filteredByAllCriteria = applyAllFilters(leaves);

  // Total pages calculation
  const totalPages = Math.ceil(filteredByAllCriteria.length / itemsPerPage);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await EmployeeServices.getEmployeeLeaves();


      if (response.success) {
        setLeaves(response.data);
        setFilteredLeaves(response.data);
        setCurrentPage(1); // Reset to first page when filtering
      }
    } catch (error) {
      setError(error.message || "Failed to fetch leaves");
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };


  const onSubmit = async (data) => {
    try {
      // Check if single day question is answered when not early logout
      if (selectedLeaveType !== "Early Logout" && isSingleDateMode === null) {
        toast.error("Please select if this is a single day leave");
        return;
      }
      
      setSubmitting(true);
      
      // Validate dates
      let startDate, endDate;
      
      // For early logout, validate time is after 5 PM
      if (data.leaveType === "Early Logout") {
        const currentHour = new Date().getHours();
        if (currentHour < 17) {
          toast.error("Early logout can only be requested after 5 PM");
          setSubmitting(false);
          return;
        }
        // Set today's date for early logout
        startDate = moment();
        endDate = moment();
      } else if (isSingleDateMode) {
        startDate = moment(data.singleDate);
        endDate = moment(data.singleDate);
      } else {
        startDate = moment(data.startDate);
        endDate = moment(data.endDate);
      }
      
      if (endDate.isBefore(startDate)) {
        toast.error("End date cannot be before start date");
        setSubmitting(false);
        return;
      }
      
      // Prepare data for API submission
      const submissionData = {
        ...data,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD")
      };
      
      // Remove the singleDate field as it's not needed by the API
      if (isSingleDateMode || data.leaveType === "Early Logout") {
        delete submissionData.singleDate;
      }
      
      const response = await EmployeeServices.applyForLeave(submissionData);
      
      if (response.success) {
        toast.success("Leave applied successfully");
        reset(); // Reset form fields
        setIsModalOpen(false); // Close modal after submission
        fetchLeaves(); // Reload leaves data
      } else {
        toast.error(response.message || "Failed to apply for leave");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
      console.error("Error applying for leave:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredByAllCriteria.slice(startIndex, endIndex);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      reset(); // Reset form when opening modal
    }
  };

  const toggleCalendarModal = () => {
    setIsCalendarModalOpen(!isCalendarModalOpen);
  };

  // Read query parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const statusParam = queryParams.get('status');
    
    if (statusParam) {
      setFilters(prev => ({
        ...prev,
        status: statusParam
      }));
    }
  }, [location.search]);

  // Update URL when filters change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    if (filters.status) {
      queryParams.set('status', filters.status);
    } else {
      queryParams.delete('status');
    }
    
    const newSearch = queryParams.toString();
    const newPath = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    
    // Update URL without reloading the page
    navigate(newPath, { replace: true });
  }, [filters.status, location.pathname, navigate]);

  // Handle click outside to close the calendar modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isCalendarModalOpen && calendarModalRef.current && !calendarModalRef.current.contains(event.target)) {
        toggleCalendarModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Add body class to prevent scrolling when modal is open
    if (isCalendarModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove('overflow-hidden');
    };
  }, [isCalendarModalOpen]);

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Leaves
          </h1>
        </div>

      <div className="grid gap-6 mb-8 w-full">
        {/* My Leaves Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <Button 
              onClick={toggleModal}
              className="rounded-lg hover:shadow-md bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
            >
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Apply for Leave
              </span>
            </Button>
            <Button 
              onClick={toggleCalendarModal}
              className="rounded-lg hover:shadow-md bg-blue-700"
            >
              <span className="flex items-center">
                <FaCalendarAlt className="w-4 h-4 mr-2" />
                View Calendar
              </span>
            </Button>
          </div>
        </div>

        {/* Filters Section */}
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
                
                {/* Leave Status Filter */}
                <div className="w-full sm:w-auto sm:flex-none sm:min-w-[150px]">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={(e) => handleFilterChange(e)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  >
                    {leaveStatusOptions.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
            
                
                {/* Date Range Type */}
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
                    onChange={(e) => handleResultsPerPageChange(e)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                  >
                    {resultsPerPageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} per page
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Pagination controls */}
                {filteredByAllCriteria.length > 0 && (
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
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={`flex items-center justify-center p-1.5 h-8 w-8 rounded-md ${
                          currentPage === totalPages || totalPages === 0
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

        {/* Leave Application Modal */}
        <Modal isOpen={isModalOpen} onClose={toggleModal}>
          <ModalHeader className="flex justify-between items-center">
            <span>Apply for Leave</span>
          </ModalHeader>
          <ModalBody>
            <form id="leaveApplicationForm" onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6">
                <Label className="font-medium">
                  <span>Leave Type</span>
                  <Select 
                    className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300"
                    {...register("leaveType", { required: "Leave type is required" })}
                  >
                    <option value="">Select leave type</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Full Day">Full Day</option>
                    <option value="Early Logout">Early Logout</option>
                  </Select>
                  {errors.leaveType && (
                    <HelperText valid={false}>{errors.leaveType.message || "Leave type is required"}</HelperText>
                  )}
                  {selectedLeaveType === "Early Logout" && !isEarlyLogoutValid && (
                    <HelperText valid={false}>Early logout can only be requested after 5 PM</HelperText>
                  )}
                </Label>
              </div>
              
              {selectedLeaveType !== "Early Logout" && (
                <div className="mb-6">
                  <Label className="font-medium">
                    <span>Reason Category</span>
                    <Select 
                      className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300"
                      {...register("leaveReason", { required: "Reason category is required" })}
                    >
                      <option value="">Select reason</option>
                      <option value="Casual Leave">Casual Leave</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Privilege Leave">Privilege Leave</option>
                    </Select>
                    {errors.leaveReason && (
                      <HelperText valid={false}>{errors.leaveReason.message || "Reason is required"}</HelperText>
                    )}
                  </Label>
                </div>
              )}

              {selectedLeaveType !== "Early Logout" && (
                <div className="mb-6">
                  <Label className="font-medium">
                    <span>Is this a single day leave?</span>
                    <div className="mt-2 flex space-x-4">
                      <Label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="singleDayQuestion"
                          value="yes"
                          checked={isSingleDateMode === true}
                          onChange={() => setIsSingleDateMode(true)}
                          className="form-radio h-4 w-4 text-purple-600 dark:bg-gray-800 dark:border-gray-600 border-gray-300 rounded-full focus:ring-purple-500"
                          required
                        />
                        <span className="ml-2">Yes</span>
                      </Label>
                      <Label className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="singleDayQuestion"
                          value="no"
                          checked={isSingleDateMode === false}
                          onChange={() => setIsSingleDateMode(false)}
                          className="form-radio h-4 w-4 text-purple-600 dark:bg-gray-800 dark:border-gray-600 border-gray-300 rounded-full focus:ring-purple-500"
                          required
                        />
                        <span className="ml-2">No</span>
                      </Label>
                    </div>
                    {isSingleDateMode === null && selectedLeaveType && selectedLeaveType !== "Early Logout" && (
                      <HelperText valid={false}>Please select if this is a single day leave</HelperText>
                    )}
                  </Label>
                </div>
              )}

              {selectedLeaveType === "Early Logout" ? (
                <div className="mb-6">
                  <Label className="font-medium">
                    <span>Today's Date (Auto-selected)</span>
                    <DatePicker 
                      selected={moment().toDate()}
                      className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300 px-3 py-2 rounded-md"
                      dateFormat="dd-MMM-yyyy"
                      disabled
                    />
                    <HelperText>Early logout is only applicable for today's date</HelperText>
                  </Label>
                </div>
              ) : isSingleDateMode === true && (
                <div className="mb-6">
                  <Label className="font-medium">
                    <span>Date</span>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="singleDate"
                        rules={{ required: "Date is required" }}
                        render={({ field }) => (
                          <DatePicker 
                            selected={field.value ? moment(field.value).toDate() : null}
                            onChange={(date) => field.onChange(moment(date).format("YYYY-MM-DD"))}
                            className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300 px-3 py-2 rounded-md"
                            minDate={minDate}
                            dateFormat="dd-MMM-yyyy"
                            placeholderText="Select date"
                          />
                        )}
                      />
                    </div>
                    {errors.singleDate && (
                      <HelperText valid={false}>{errors.singleDate.message || "Date is required"}</HelperText>
                    )}
                  </Label>
                </div>
              )}

              {selectedLeaveType !== "Early Logout" && isSingleDateMode !== true && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 mb-6">
                    <div>
                      <Label className="font-medium">
                        <span>Start Date</span>
                        <div className="relative">
                          <Controller
                            control={control}
                            name="startDate"
                            rules={{ required: !isSingleDateMode && "Start date is required" }}
                            render={({ field }) => (
                              <DatePicker 
                                selected={field.value ? moment(field.value).toDate() : null}
                                onChange={(date) => field.onChange(moment(date).format("YYYY-MM-DD"))}
                                className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300 px-3 py-2 rounded-md"
                                minDate={minDate}
                                dateFormat="dd-MMM-yyyy"
                                placeholderText="Select start date"
                              />
                            )}
                          />
                        </div>
                        {errors.startDate && (
                          <HelperText valid={false}>{errors.startDate.message || "Start date is required"}</HelperText>
                        )}
                      </Label>
                    </div>
                    <div>
                      <Label className="font-medium">
                        <span>End Date</span>
                        <div className="relative">
                          <Controller
                            control={control}
                            name="endDate"
                            rules={{ required: !isSingleDateMode && "End date is required" }}
                            render={({ field }) => (
                              <DatePicker 
                                selected={field.value ? moment(field.value).toDate() : null}
                                onChange={(date) => field.onChange(moment(date).format("YYYY-MM-DD"))}
                                className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300 px-3 py-2 rounded-md"
                                minDate={minDate}
                                dateFormat="dd-MMM-yyyy"
                                placeholderText="Select end date"
                                disabled={isOneDay}
                              />
                            )}
                          />
                        </div>
                        {errors.endDate && (
                          <HelperText valid={false}>{errors.endDate.message || "End date is required"}</HelperText>
                        )}
                      </Label>
                    </div>
                  </div>
                </>
              )}

              <div className="mb-4">
                <Label className="font-medium">
                  <span>Description</span>
                  <Textarea 
                    className="mt-1 w-full dark:bg-gray-800 dark:border-gray-600 bg-white border-gray-300"
                    rows="4"
                    placeholder="Please provide detailed information about your leave request"
                    disabled={selectedLeaveType === "Early Logout"}
                    {...register("description", { 
                      required: "Description is required",
                      minLength: { value: 10, message: "Description should be at least 10 characters" }
                    })}
                  />
                  {errors.description && selectedLeaveType !== "Early Logout" && (
                    <HelperText valid={false}>{errors.description.message || "Description is required"}</HelperText>
                  )}
                  {selectedLeaveType === "Early Logout" && (
                    <HelperText>Description is auto-populated for early logout requests</HelperText>
                  )}
                </Label>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-end gap-4 w-full">
              <Button 
                layout="outline" 
                onClick={toggleModal}
                className="flex-1 rounded-lg hover:shadow-md dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="leaveApplicationForm"
                disabled={submitting}
                className="flex-1 rounded-lg hover:shadow-md bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </ModalFooter>
        </Modal>

        {/* Leaves Table */}
        {loading ? (
          <TableLoading row={8} col={7} width={190} height={20} />
        ) : error ? (
          <div className={`text-center p-6 w-full bg-gray-50 dark:bg-gray-800 rounded-lg`}>
            <span className="text-red-500 dark:text-red-400">{error}</span>
          </div>
        ) : filteredByAllCriteria.length > 0 ? (
          <TableContainer className="mb-4 w-full rounded-lg overflow-hidden">
            <div className="p-4 flex flex-col bg-gray-50 dark:bg-gray-900 sm:flex-row justify-between items-start sm:items-center">
              <Badge type="primary" className="mb-2 sm:mb-0 text-sm px-3 py-1 rounded-full">
                {filteredByAllCriteria.length} {filteredByAllCriteria.length === 1 ? 'Leave' : 'Leaves'} found
              </Badge>
            </div>

            <Table className="w-full">
              <TableHeader> 
                <tr className="h-14 text-xs font-semibold text-left bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Leave Type</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Start Date</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">End Date</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Duration</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Reason</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Status</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Approved By</TableCell>
                  <TableCell className="text-center whitespace-nowrap px-4 py-3">Applied On</TableCell>
                </tr>
              </TableHeader>

              <LeavesTable 
                leaves={getPaginatedData()}
              />
            </Table>
          </TableContainer>
        ) : (
          <div className={`text-center p-8 w-full bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md`}>
            <NotFound 
              title="No leaves found" 
              subtitle="You haven't applied for any leaves yet."
              ctaText="Apply for Leave"
              ctaAction={toggleModal} 
            />
          </div>
        )}

        {/* Custom Calendar Modal */}
        {isCalendarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div 
              ref={calendarModalRef}
              className="relative w-full max-w-5xl h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl animate-fadeIn"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Attendance Calendar
                </h3>
                <button
                  onClick={toggleCalendarModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
              
              {/* Calendar Content - Allow scrolling for day details */}
              <div className="flex-grow p-4 overflow-y-auto">
                <div className="h-full">
                  <AttendanceCalendar 
                    leaves={filteredByAllCriteria} 
                    loading={loading}
                    refresh={fetchLeaves}
                  />
                </div>
              </div>
              
              {/* Fixed Footer */}
              <div className="p-4 border-t dark:border-gray-700 flex justify-end">
                <Button
                  onClick={toggleCalendarModal}
                  className="rounded-lg hover:shadow-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Leaves; 