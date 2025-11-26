import React, { useState, useEffect, useContext } from "react";
import { FaPlus, FaSearch, FaTimesCircle,FaChevronLeft,FaChevronRight } from "react-icons/fa";
import {
  Table,
  TableCell,
  TableContainer,
  TableHeader,
} from "@windmill/react-ui";

import NotFound from "@/components/table/NotFound";

import JoiningsTable from "../components/joinings/JoiningsTable";
import  EmployeeServices from "@/services/EmployeeServices";
import useFilter from "@/hooks/useFilter";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import TableLoading from "@/components/preloader/TableLoading";
import AnimatedContent from "@/components/common/AnimatedContent";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { notifySuccess, notifyError } from "@/utils/toast";
import { 
  joiningStatusOptions as statusOptions, 
  companyOptions as joiningCompanyOptions, 
  processOptions as joiningProcessOptions, 
  dateRangeTypeOptions, 
  resultsPerPageOptions, 
  joiningTypeOptions,
  getStatusColorClass,
  getProcessesByCompany
} from "@/utils/optionsData";
import { MdClose, MdOutlineTableBar, MdTableChart, MdTableRows, MdTableView } from "react-icons/md";
import useError from "@/hooks/useError";
import { FiTable } from "react-icons/fi";



function Joinings() {
  const [joinings, setJoinings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: "",
    contactNumber: "",
    company: "",
    customCompanyName: "",
    customCompanyProcess: "",
    process: "",
    salary: "",
    joiningDate: "",
    status: "",
    joiningType: "",
    remarks: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedJoining, setSelectedJoining] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const DEFAULT_ITEMS_PER_PAGE = 10;
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDate] = useState(new Date());
  const [isLoadingCandidateName, setIsLoadingCandidateName] = useState(false);

  // Add state for FY summary modal and data
  const [showFySummaryModal, setShowFySummaryModal] = useState(false);
  const [fySummaryData, setFySummaryData] = useState(null);
  const [loadingFySummary, setLoadingFySummary] = useState(false);
  const [fySummaryError, setFySummaryError] = useState(null);
  const [totalsJoinings, setTotalsJoinings] = useState(0);
  const [totalsIncentive, setTotalsIncentive] = useState(0);
  // Add state for selected FY start year
  const currentYear = new Date().getFullYear();
  const defaultFyStartYear = new Date().getMonth() < 3 ? currentYear - 1 : currentYear;
  const [selectedFyStartYear, setSelectedFyStartYear] = useState(defaultFyStartYear);

  const { setIsUpdate } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const isAdmin = adminInfo?.isAdmin || false;

  // State for API data with pagination
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalJoinings, setTotalJoinings] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add searchTerm state to store the current search input
  const [searchTerm, setSearchTerm] = useState("");

  // Add filter state
  const [filters, setFilters] = useState({
    name: "",
    contactNumber: ""
  });

  // Add useEffect for Escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close any open modals
        if (showForm) {
          handleCancel();
        }
        if (showViewModal) {
          setShowViewModal(false);
          setSelectedJoining(null);
        }
        if (showFySummaryModal) {
          setShowFySummaryModal(false);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showForm, showViewModal, showFySummaryModal]);

  const { handleErrorNotification } = useError();

  // Fetch joinings data with pagination and search
  useEffect(() => {
    const fetchJoinings = async () => {
      try {
        setLoading(true);
        const response = await EmployeeServices.getJoiningsData(currentPage, itemsPerPage, searchTerm);
        setApiData(response);
        setTotalJoinings(response?.totalJoinings || 0);
        setTotalPages(response?.totalPages || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch joinings");
        setApiData(null);
        handleErrorNotification(err, "Joinings");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinings();
  }, [currentPage, itemsPerPage, refreshKey, searchTerm]);

  // Map API response to match expected format (preserve incentiveSummary)
  const data = apiData ? { 
    joinings: apiData.joinings || [],
    incentiveSummary: apiData.incentiveSummary || null
  } : null;

  const {
    joiningsRef,  
    handleSubmitJoinings,
    dataTable,
    serviceData,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    dateRange,
    handleDateRangeChange,
    dateRangeType,
    handleDateRangeTypeChange,
    handleSortChange,
    setDateRange
  } = useFilter(data?.joinings);



  const handleResetField = () => {
    if (joiningsRef && joiningsRef.current) {
      joiningsRef.current.value = "";
    }
    setSearchTerm("");
    handleSubmitJoinings("");
    setDateRange({ startDate: null, endDate: null });
    handleDateRangeTypeChange("day");
    setSortBy("");
    setSortOrder("asc");
    setFilters({
      status: "",
      name: "",
      contactNumber: "",
    });
    setItemsPerPage(DEFAULT_ITEMS_PER_PAGE);
    setCurrentPage(1);
    // Force a refresh
    setRefreshKey(prev => prev + 1);
  };


  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < displayTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= displayTotalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers to display (always show at least 10 pages if available)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 10;
    
    if (displayTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= displayTotalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = currentPage - Math.floor(maxVisiblePages / 2);
      let endPage = currentPage + Math.floor(maxVisiblePages / 2) - 1;
      
      if (startPage < 1) {
        startPage = 1;
        endPage = maxVisiblePages;
      }
      
      if (endPage > displayTotalPages) {
        endPage = displayTotalPages;
        startPage = Math.max(1, displayTotalPages - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // Calculate total pages - this is just a mock implementation
  const filteredByStatus = filters.status
    ? (dataTable || []).filter(c => {
        // Make comparison case-insensitive and trim whitespace
        return c.status && 
               c.status.toLowerCase().trim() === filters.status.toLowerCase().trim();
      })
    : (dataTable || []);
  
  // Use backend pagination totalPages, but fallback to client-side calculation for filtered data
  const displayTotalPages = totalPages || Math.ceil(filteredByStatus.length / itemsPerPage);

  // Toggle sort order when header is clicked
  const handleSortByField = (field) => {
    handleSortChange(field);
  };

  const handleResultsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };




  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If contact number is changed and we're adding a new joining
    if (name === "contactNumber" && value.length === 10) {
      // Fetch candidate name using API
      setIsLoadingCandidateName(true);
      EmployeeServices.getCandidateName(value)
        .then(response => {
          if (response && response.name) {
            setFormData(prev => ({ 
              ...prev, 
              [name]: value,
              candidateName: response.name || ""
            }));
          } else {
            setFormData(prev => ({ ...prev, [name]: value }));
          }
        })
        .catch(error => {
          console.error("Error fetching candidate name:", error);
          setFormData(prev => ({ ...prev, [name]: value }));
        })
        .finally(() => {
          setIsLoadingCandidateName(false);
        });
      return;
    }
    
    // If company is changed
    if (name === "company") {
      if (value.toLowerCase() === "others") {
        // When others is selected
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          process: "others"
        }));
      } else {
        // When a specific company is selected
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          customCompanyName: "",
          customCompanyProcess: ""
        }));
      }
      return;
    }
    
    // If process is changed
    if (name === "process") {
      if (value.toLowerCase() === "others") {
        // When others is selected for process
        setFormData(prev => ({ 
          ...prev, 
          [name]: value
        }));
      } else {
        // When a specific process is selected
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          customCompanyProcess: ""
        }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate contact number field
  const validateContactNumber = (number) => {
    if (!number) return 'Contact number is required';
    if (!/^\d{10}$/.test(number)) return 'Contact number must be 10 digits';
    return null;
  };

  const handleAdd = () => {
    // Reset form data
    setFormData({
      candidateName: "",
      contactNumber: "",
      joiningDate: "",
      customCompanyName: "",
      customCompanyProcess: "",
      company: "",
      process: "",
      salary: "",
      joiningType: "",
      remarks: "",
    });
    setIsLoadingCandidateName(false);
    setShowForm(true);
  };


  const handleView = (joining) => {
    setSelectedJoining(joining);
    setShowViewModal(true);
  };

  
  const handleCancel = () => {
    setFormData({
      candidateName: "",
      contactNumber: "",
      joiningDate: "",
      remarks: "",
      company: "",
      customCompanyName: "",
      customCompanyProcess: "",
      process: "",
      salary: "",
      joiningType: "",
    });
    setShowForm(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

 

  // Add highlighting function
  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={index} className="text-red-600 font-medium bg-yellow-100">{part}</span> : part
    );
  };

  // Add handling for search with highlighting
  const handleSubmitJoiningWithHighlight = (e) => {
    handleSubmitJoinings(e);
  };

  const renderTable = () => {
    return (
      <>
      <span className="text-sm text-gray-700 dark:text-gray-400 mb-1"> Total Records Found : {totalJoinings || filteredByStatus.length}</span>

      {loading ? (
        // <Loading loading={loading} />
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8">
          
          {filteredByStatus.length === 0 ? (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>No joinings match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
          ) : 
          (
            <Table>
              <TableHeader > 
                <tr className="h-14 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 ">
                <TableCell className="text-center">
                  Actions
                  </TableCell>
                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("entryDate")}>Entry Date {sortBy === "entryDate" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>
                
                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("updatedate")}>Updated Date {sortBy === "updatedate" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>
          
                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("name")}>Name {sortBy === "name" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>
                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("contactNumber")}>Contact Number {sortBy === "contactNumber" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("company")}>Company{sortBy === "company" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("process")}>Process{sortBy === "process" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("createdBy")}>Registered By {sortBy === "createdBy" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("joiningType")}>Joining Type{sortBy === "joiningType" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("joiningDate")}>Joining Date {sortBy === "joiningDate" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>
              
                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("status")}>Status{sortBy === "status" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("eligible")}>Eligible{sortBy === "eligible" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>

                  <TableCell className="text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => handleSortByField("incentiveAmount")}>Incentive Amount{sortBy === "incentiveAmount" && (
                    <span className="ml-2 text-gray-500">{sortOrder === "asc" ? "▲" : "▼"}</span>
                  )}</TableCell>
                </tr>
              </TableHeader>

              <JoiningsTable 
                joinings={filteredByStatus}
                onView={handleView}
                searchTerm={searchTerm || joiningsRef?.current?.value || ""}
                highlightText={highlightText}
              />
            </Table>
          )}
        </TableContainer>
      ) : joiningsRef.current.value != ""||dateRange.startDate != null||dateRange.endDate != null && serviceData?.length === 0 ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>No joinings match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
      ) : (
        <NotFound title="Joinings" />
      )}
      </>
    );
  };


  // Handle form submission - remove editing logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Reset form errors
      setFormErrors({});
      
      // Validate all fields
      const errors = {};
      
      if (!formData.candidateName?.trim()) {
        errors.candidateName = 'No candidate found with this number. Please enter a valid contact number.';
      }
      
      const contactError = validateContactNumber(formData.contactNumber);
      if (contactError) {
        errors.contactNumber = contactError;
      }

      if (!formData.joiningDate) {
        errors.joiningDate = 'Joining date is required';
      }
      
      if (!formData.company) {
        errors.company = 'Company is required';
      }

      if (!formData.process) {
        errors.process = 'Process is required';
      }
      
      if (formData.company.toLowerCase() === "others" && !formData.customCompanyName?.trim()) {
        errors.customCompanyName = 'Custom company name is required';
      }
      
      if (formData.process.toLowerCase() === "others" && !formData.customCompanyProcess?.trim()) {
        errors.customCompanyProcess = 'Custom process is required';
      }

      if (!formData.salary) {
        errors.salary = 'Salary is required';
      }
      
      if (!formData.joiningType) {
        errors.joiningType = 'Joining type is required';
      }

      // If there are validation errors, show them and don't submit
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        handleErrorNotification('Please correct the errors in the form', 'Form Validation');
        return;
      }

      setIsSubmitting(true);

      // Create joining payload
      const joiningData = {
        candidateName: formData.candidateName,
        contactNumber: formData.contactNumber,
        joiningDate: formData.joiningDate,
        joiningType: formData.joiningType,
        remarks: formData.remarks,
        company: formData.company.toLowerCase() === "others" ? formData.customCompanyName : formData.company,
        customCompanyName: formData.customCompanyName,
        process: formData.process.toLowerCase() === "others" ? formData.customCompanyProcess : formData.process,
        customCompanyProcess: formData.customCompanyProcess,
        salary: formData.salary,
      };
      
      // Create new joining
      await EmployeeServices.createJoiningData(joiningData);
      notifySuccess(`New joining for ${formData.candidateName} created successfully!`);
    
      // Reset form
      setFormData({
        candidateName: "",
        contactNumber: "",
        joiningDate: "",
        remarks: "",
        company: "",
        customCompanyName: "",
        customCompanyProcess: "",
        process: "",
        salary: "",
        joiningType: "",
      });
      setShowForm(false);
      
      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      handleErrorNotification(err?.response?.data?.message || err?.message, 'Create Joining');
    } finally {
      setIsSubmitting(false);
    }
  };


  const [filteredProcessOptions, setFilteredProcessOptions] = useState([{ value: "", label: "Select Process" }]);
  
  // Add useEffect to update process options when company changes
  useEffect(() => {
    setFilteredProcessOptions(getProcessesByCompany(formData.company));
    
    // Reset process selection when company changes
    if (formData.process && !getProcessesByCompany(formData.company).some(p => p.value === formData.process)) {
      setFormData(prev => ({ ...prev, process: "" }));
    }
  }, [formData.company]);

  // Helper to get FY range from start year
  function getFinancialYearRangeFromStartYear(startYear) {
    return {
      startDate: `${startYear}-04-01`,
      endDate: `${startYear + 1}-03-31`
    };
  }

  // Fetch FY summary for selected year
  const fetchFySummary = async (startYear) => {
    setLoadingFySummary(true);
    setFySummaryError(null);
    try {
      const { startDate, endDate } = getFinancialYearRangeFromStartYear(startYear);
      if (!startDate || !endDate) {
        throw new Error('Invalid financial year range');
      }
      
      const response = await EmployeeServices.getFinancialYearJoiningData(startDate, endDate);
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      setTotalsJoinings(response.totals.totalJoinings);
      setTotalsIncentive(response.totals.totalIncentive);
      setFySummaryData(response.data);
    } catch (err) {
      handleErrorNotification(err?.response?.data?.message || err?.message, 'Financial Year Summary');
      setFySummaryError("Failed to fetch FY summary");
      setFySummaryData(null);
    } finally {
      setLoadingFySummary(false);
    }
  };

  // Fetch FY summary when modal opens or selected year changes
  useEffect(() => {
    if (showFySummaryModal) {
      fetchFySummary(selectedFyStartYear);
    }
    // eslint-disable-next-line
  }, [selectedFyStartYear, showFySummaryModal]);

  // Handler to open FY summary modal (no fetch here)
  const handleShowFySummary = () => {
    setShowFySummaryModal(true);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    // Ensure status is a non-empty string before applying color
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    
    // Use statusOptions (which is aliased from joiningStatusOptions)
    const found = statusOptions.find((option) => option.value === status);
    return found
      ? found.colorClass
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Joinings
          </h1>
        </div>

      <AnimatedContent>
        {/* Fixed position search and filter container */}
        <div className="sticky top-0 left-0 right-0 z-30 pb-4">
          {/* Compact Search Bar with Add New Call Button */}
          <div className="mb-3 flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="flex flex-1 items-stretch">
              {/* Search Bar */}
              <div className="relative flex items-center shadow-md bg-white dark:bg-gray-700 rounded-l-md w-full sm:w-96 h-10">
                <FaSearch className="text-gray-500 dark:text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  ref={joiningsRef}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSubmitJoiningWithHighlight(e);
                  }}
                  value={searchTerm}
                  className="pl-4 pr-3 py-0 h-10 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none rounded-l-md"
                  style={{ minWidth: 0 }}
                />
              </div>
              <button
                onClick={handleAdd}
                className="h-10 px-4 py-0 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white flex items-center justify-center gap-2 transition-colors rounded-r-md shadow-md whitespace-nowrap"
                style={{ minWidth: 'fit-content' }}
              >
                <FaPlus />
                <span className="hidden sm:inline">Add Joining</span>
                <span className="inline sm:hidden">Add</span>
              </button>
              {/* FY Summary Button */}
              <button
                onClick={handleShowFySummary}
                className="h-10 px-3 py-0 bg-green-500 text-white rounded-md shadow-md mr-2 whitespace-nowrap flex items-center justify-center ml-2"
                style={{ minWidth: 'fit-content' }}
              >
                <FiTable/>
              </button>
            </div>


             {/* Incentives Summary - Row Layout */}
             <div className="flex flex-wrap items-center gap-2">

              {/* Calendar-style UI for Month & Date */}
              <div className="flex flex-col rounded-md overflow-hidden shadow-md h-10">
                <div className="bg-blue-500 text-white text-xs font-medium text-center py-0.5">
                {new Date().toLocaleString('default', { month: 'long' })}
                </div>
                <div className="flex-1 bg-white dark:bg-gray-700 flex items-center justify-center px-3">
                  <span className="text-base font-bold text-gray-800 dark:text-white">{apiData?.incentiveSummary?.counts.total || 0}</span>
                </div>
              </div>

               {/* Domestic Count */}
               <div className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md shadow-md">
                 <span className="text-xs font-semibold">Domestic:</span>
                 <span className="text-base font-bold text-green-600 dark:text-green-400">
                   {apiData?.incentiveSummary?.counts.domestic || 0}
                 </span>
               </div>
               
               {/* International Count */}
               <div className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md shadow-md">
                 <span className="text-xs font-semibold">International:</span>
                 <span className="text-base font-bold text-green-600 dark:text-green-400">
                   {apiData?.incentiveSummary?.counts.international || 0}
                 </span>
               </div>
               
               {/* Mid-Lateral Count*/}
               <div className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md shadow-md">
                 <span className="text-xs font-semibold">Mid-Lateral:</span>
                 <span className="text-base font-bold text-green-600 dark:text-green-400">
                   {apiData?.incentiveSummary?.counts.midLateral || 0}
                 </span>
               </div>
               
               {/* Total Incentive */}
               <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 px-3 py-2 rounded-md shadow-md">
                 <span className="text-xs font-semibold">Total Incentives:</span>
                 <span className="text-base font-bold text-indigo-700 dark:text-indigo-400">
                   ₹{apiData?.incentiveSummary?.incentives.total || 0}
                 </span>
               </div>
             </div>
          </div>

          {/* Compact Filter Bar */}
          <div className="rounded-lg shadow-md bg-white dark:bg-gray-700 p-3 z-30 max-w-full mb-4">
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
                  <option value="">Select Status</option>
                  {statusOptions.filter(option => option.value !== "").map((option, index) => (
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
              {filteredByStatus.length > 0 && displayTotalPages > 0 && (
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
                    
                    {/* Page numbers */}
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`flex items-center justify-center p-1.5 h-8 w-8 rounded-md text-xs ${
                          currentPage === pageNum
                            ? 'bg-[#1a5d96] dark:bg-[#e2692c] text-white font-semibold'
                            : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === displayTotalPages}
                      className={`flex items-center justify-center p-1.5 h-8 w-8 rounded-md ${
                        currentPage === displayTotalPages
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
        </div>
      </AnimatedContent>
    {renderTable()}

    {/* Form Modal - Update title to remove edit mention */}
    {showForm && (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative max-w-4xl bg-white mx-auto p-6 rounded-xl shadow-lg dark:bg-gray-800 w-full m-4">
          {/* Header with Add Joining and Close Button aligned */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
              Add New Joining
            </h2>
            <button 
              onClick={handleCancel} 
              className="dark:text-gray-300 dark:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Candidate Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="candidateName"
                  value={formData.candidateName}
                  onChange={handleChange}
                  required
                  readOnly={true}
                  placeholder={isLoadingCandidateName ? "Loading candidate name..." : "Enter candidate's full name"}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${true ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}
                  ${formErrors.candidateName ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {formErrors.candidateName && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.candidateName}</p>
                )}
                {!formErrors.candidateName && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter a valid contact number to auto-populate candidate name
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.contactNumber ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {formErrors.contactNumber && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.contactNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.joiningDate ? new Date(formData.joiningDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setFormData({...formData, joiningDate: date.toISOString().split('T')[0]});
                      if (formErrors.joiningDate) {
                        setFormErrors(prev => ({ ...prev, joiningDate: null }));
                      }
                    }
                  }}
                  minDate={minDate}
                  dateFormat="dd-MMM-yyyy"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.joiningDate ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholderText="Select joining date"
                  required
                />
                {formErrors.joiningDate && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.joiningDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          required={true}
                          disabled={false}
                          className={`px-2.5 py-1.5 h-9 text-sm rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#e2692c] border focus:ring-1 dark:focus:ring-[#e2692c] ${
                              (loading==null) ? 'cursor-not-allowed opacity-70' : ''
                            } ${formErrors.company ? 'border-red-500 dark:border-red-500' : ''}`}
                        >
                          {joiningCompanyOptions && joiningCompanyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {formErrors.company && (
                          <p className="mt-1 text-xs text-red-500">{formErrors.company}</p>
                        )}
                        
                        {formData.company.toLowerCase() === "others" && (
                          <div className="mt-2">
                            <input
                              type="text"
                              name="customCompanyName"
                              value={formData.customCompanyName || ""}
                              onChange={handleChange}
                              placeholder="Enter company name"
                              required={formData.company.toLowerCase() === "others"}
                              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                              dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                              ${formErrors.customCompanyName ? 'border-red-500 dark:border-red-500' : ''}`}
                            />
                            {formErrors.customCompanyName && (
                              <p className="mt-1 text-xs text-red-500">{formErrors.customCompanyName}</p>
                            )}
                          </div>
                        )}
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Process <span className="text-red-500">*</span>
                </label>
                <select
                  name="process"
                  value={formData.process}
                  onChange={handleChange}
                  required={true}
                  disabled={(loading==null)}
                  className={`px-2.5 py-1.5 h-9 text-sm rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#e2692c] border focus:ring-1 dark:focus:ring-[#e2692c] ${
                    (loading==null) ? 'cursor-not-allowed opacity-70' : ''
                  } ${formErrors.process ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  {filteredProcessOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.process && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.process}</p>
                )}
                
                {formData.process.toLowerCase() === "others" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      name="customCompanyProcess"
                      value={formData.customCompanyProcess || ""}
                      onChange={handleChange}
                      placeholder="Enter process name"
                      required={formData.process.toLowerCase() === "others"}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                      dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                      ${formErrors.customCompanyProcess ? 'border-red-500 dark:border-red-500' : ''}`}
                    />
                    {formErrors.customCompanyProcess && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.customCompanyProcess}</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Joining Type <span className="text-red-500">*</span>
                </label>
                <select
                          name="joiningType"
                          value={formData.joiningType}
                          onChange={handleChange}
                          required={true}
                          disabled={false}
                          className={`px-2.5 py-1.5 h-9 text-sm rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-[#e2692c] border focus:ring-1 dark:focus:ring-[#e2692c] ${
                              (loading==null) ? 'cursor-not-allowed opacity-70' : ''
                            }`}
                        >
                          {joiningTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required={true}
                  placeholder="Enter salary"
                  className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  required={false}
                  value={formData.remarks || ""}
                  onChange={handleChange}
                  placeholder="Add any additional notes or remarks"
                  rows="3"
                  className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-medium dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white bg-gray-100 hover:bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg font-medium 
                dark:bg-[#e2692c] dark:hover:bg-[#d15a20] dark:text-white bg-[#1a5d96] hover:bg-[#154a7a] text-white
                disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* View Modal - Remove the Edit button */}
    {showViewModal && selectedJoining && (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative max-w-2xl mx-auto p-5 rounded-xl shadow-lg bg-white dark:bg-gray-800 w-full m-4">
          {/* Header with Candidate Details and Close Button aligned */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
              {selectedJoining.candidateName}
            </h2>
            <button 
              onClick={() => setShowViewModal(false)} 
              className="dark:text-gray-300 dark:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Status Badge at the top */}
          {selectedJoining.status && (
            <div className="mb-4 flex items-center">
              <span className="text-sm font-medium dark:text-gray-300 text-gray-600 mr-3">Status:</span>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedJoining.status)}`}>
                {selectedJoining.status}
              </span>
            </div>
          )}
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Candidate Information */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm">
              <h3 className="text-md font-semibold mb-3 dark:text-[#e2692c] text-[#1a5d96] border-b pb-2 dark:border-gray-600 border-gray-200">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Candidate Information
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Contact</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    {selectedJoining.contactNumber}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Company</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    {joiningCompanyOptions.find(o => o.value === selectedJoining.company)?.label || selectedJoining.company}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Process</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    {joiningProcessOptions.find(o => o.value === selectedJoining.process)?.label || selectedJoining.process}
                  </dd>
                </div>
              </dl>
            </div>
            
            {/* Joining Details */}
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30 shadow-sm">
              <h3 className="text-md font-semibold mb-3 text-green-700 dark:text-green-400 border-b pb-2 border-green-200 dark:border-green-800/30">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Joining Details
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Joining Date</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    {selectedJoining.joiningDate ? new Date(selectedJoining.joiningDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : "Not specified"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Joining Type</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    {joiningTypeOptions.find(o => o.value === selectedJoining.joiningType)?.label || selectedJoining.joiningType || "Not specified"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="col-span-1 font-medium dark:text-gray-400 text-gray-500">Salary</dt>
                  <dd className="col-span-2 font-semibold dark:text-white text-gray-900">
                    ₹{selectedJoining.salary || "Not specified"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          
          {/* Incentive Details */}
          {(selectedJoining.eligible !== undefined || selectedJoining.incentiveAmount > 0) && (
            <div className="mt-4 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 shadow-sm">
              <h3 className="text-md font-semibold mb-3 text-indigo-700 dark:text-indigo-400 border-b pb-2 border-indigo-200 dark:border-indigo-800/30">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Incentive Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedJoining.eligible !== undefined && (
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">Eligible for Incentive</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedJoining.eligible 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedJoining.eligible ? "Yes" : "No"}
                    </span>
                  </div>
                )}
                {selectedJoining.incentiveAmount > 0 && (
                  <div>
                    <span className="font-medium text-gray-500 dark:text-gray-400 block mb-1">Incentive Amount</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ₹{selectedJoining.incentiveAmount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Remarks Section */}
          {selectedJoining.remarks && (
            <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm">
              <h3 className="text-md font-semibold mb-2 dark:text-[#e2692c] text-[#1a5d96] border-b pb-2 dark:border-gray-600 border-gray-200">
                <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                </svg>
                Remarks
              </h3>
              <p className="text-sm dark:text-gray-300 text-gray-700 mt-2">
                {selectedJoining.remarks || "No remarks provided."}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-3 py-1.5 text-sm rounded-lg font-medium dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* FY Summary Modal */}
    {showFySummaryModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full shadow-lg relative">
          <button
            onClick={() => setShowFySummaryModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <MdClose className="text-2xl rounded-full bg-gray-200 p-1 dark:bg-gray-700 dark:text-white " />
          </button>
          <h2 className="text-xl font-bold mb-4 text-center dark:text-[#e2692c] text-[#1a5d96]">
            FY Summary
          </h2>
          {/* FY Year Selector */}
          <div className="flex justify-center mb-4">
            <select
              value={selectedFyStartYear}
              onChange={e => setSelectedFyStartYear(Number(e.target.value))}
              className="px-2 py-1 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              {Array.from({ length: 80 }, (_, idx) => {
                const year = 2025 + idx;
                return (
                  <option key={year} value={year}>
                    {year}-{(year + 1).toString().slice(-2)}
                  </option>
                );
              })}
            </select>
          </div>
          {loadingFySummary ? (
            <div className="text-center py-8">Loading...</div>
          ) : fySummaryError ? (
            <div className="text-center py-8 text-red-500">{fySummaryError}</div>
          ) : fySummaryData ? (
            <table className="min-w-full border text-sm dark:text-white">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="px-3 py-2 border">Month</th>
                  <th className="px-3 py-2 border">Total Joinings</th>
                  <th className="px-3 py-2 border">Incentive</th>
                </tr>
              </thead>
              <tbody>
                {fySummaryData.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}>
                    <td className="px-3 py-2 border font-semibold">{row.month}</td>
                    <td className="px-3 py-2 border text-center">{row.totalJoinings}</td>
                    <td className="px-3 py-2 border text-center">₹{row.totalIncentive}</td>
                  </tr>
                ))}
                <tr className="font-bold bg-green-100 dark:bg-green-900">
                  <td className="px-3 py-2 border">Total</td>
                  <td className="px-3 py-2 border text-center">{totalsJoinings}</td>
                  <td className="px-3 py-2 border text-center">₹{totalsIncentive}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-red-500">No data found.</div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

export default Joinings; 