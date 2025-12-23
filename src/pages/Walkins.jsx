import React, { useState, useEffect, useContext } from "react";
import { FaPlus, FaSearch, FaTimesCircle, FaChevronLeft, FaChevronRight, FaCopy } from "react-icons/fa";
import { copyMultipleCandidates } from "@/utils/copyUtils";

import NotFound from "@/components/table/NotFound";

import WalkinsTable from "../components/walkins/WalkinsTable";
import  EmployeeServices from "@/services/EmployeeServices";
import useFilter from "@/hooks/useFilter";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import TableLoading from "@/components/preloader/TableLoading";
import AnimatedContent from "@/components/common/AnimatedContent";
import EmployeeFilterDropdown from "@/components/common/EmployeeFilterDropdown";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { notifySuccess, notifyError } from "@/utils/toast";
import {
  dateRangeTypeOptions,
  resultsPerPageOptions,
  walkinStatusOptions,
  getWalkinStatusColorClass,
} from "@/utils/optionsData";
import useError from "@/hooks/useError";



function Walkins() {
  const [walkins, setWalkins] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    candidateName: "",
    contactNumber: "",
    walkinDate: "",
    walkinRemarks: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const DEFAULT_ITEMS_PER_PAGE = 10;
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDate] = useState(new Date());
  const [isLoadingCandidateName, setIsLoadingCandidateName] = useState(false);

  const { setIsUpdate } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const isAdmin = adminInfo?.isAdmin || false;

  // State for API data with pagination
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalWalkins, setTotalWalkins] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add searchTerm state to store the current search input
  const [searchTerm, setSearchTerm] = useState("");

  // Add filter state
  const [filters, setFilters] = useState({
    status: "",
    name: "",
    contactNumber: ""
  });

  // Employee filter state (for admin only) - supports multiple employee IDs
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  // Selection state for bulk copy
  const [selectedWalkins, setSelectedWalkins] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add useEffect for Escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close any open modals
        if (showForm) {
          handleCancel();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showForm]);

  const { handleErrorNotification } = useError();

  // Map API response to match expected format
  const data = apiData ? { walkins: apiData.walkins || [] } : null;

  const {
    walkinsRef,  
    handleSubmitWalkins,
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
  } = useFilter(data?.walkins);

  // Fetch walkins data with pagination, search, and filters
  useEffect(() => {
    const fetchWalkins = async () => {
      try {
        setLoading(true);
        
        // Build filters object for API
        const apiFilters = {
          status: filters.status || "",
          startDate: dateRange.startDate || null,
          endDate: dateRange.endDate || null,
          dateRangeType: dateRangeType || "day"
        };
        
        const response = await EmployeeServices.getWalkinsData(
          currentPage, 
          itemsPerPage, 
          searchTerm, 
          apiFilters,
          selectedEmployeeIds
        );
        setApiData(response);
        setTotalWalkins(response?.totalWalkins || 0);
        setTotalPages(response?.totalPages || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch walkins");
        setApiData(null);
        handleErrorNotification(err, "Walkins");
      } finally {
        setLoading(false);
      }
    };

    fetchWalkins();
  }, [currentPage, itemsPerPage, refreshKey, searchTerm, filters.status, dateRange.startDate, dateRange.endDate, dateRangeType, selectedEmployeeIds]);


  const handleResetField = () => {
    if (walkinsRef && walkinsRef.current) {
      walkinsRef.current.value = "";
    }
    setSearchTerm("");
    handleSubmitWalkins("");
    setDateRange({ startDate: null, endDate: null });
    handleDateRangeTypeChange("day");
    setSortBy("");
    setSortOrder("asc");
    setFilters({
      status: "",
      name: "",
      contactNumber: "",
    });
    setSelectedEmployeeIds([]); // Reset employee filter
    setItemsPerPage(DEFAULT_ITEMS_PER_PAGE);
    setCurrentPage(1);
    // Force a refresh
    setRefreshKey(prev => prev + 1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handler for employee filter change (multi-select)
  const handleEmployeeChange = (employeeIds) => {
    setSelectedEmployeeIds(employeeIds);
    setCurrentPage(1); // Reset to first page when employee filter changes
  };

  // Wrapper for date range change to also reset page
  const handleDateRangeChangeWithReset = (startDate, endDate) => {
    handleDateRangeChange(startDate, endDate);
    setCurrentPage(1);
  };

  // Wrapper for date range type change to also reset page
  const handleDateRangeTypeChangeWithReset = (type) => {
    handleDateRangeTypeChange(type);
    setCurrentPage(1);
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

  // Use data directly from API (filtering is now handled by backend)
  // Don't use dataTable as it applies client-side filtering which conflicts with server-side filtering
  const filteredByStatus = data?.walkins || [];
  
  // Use backend pagination totalPages
  const displayTotalPages = totalPages || 1;

  // Toggle sort order when header is clicked
  const handleSortByField = (field) => {
    handleSortChange(field);
  };

  const handleResultsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };




  // Generate year options from 2020 to current year + 2
  const currentYear = new Date().getFullYear();
  const yearOptions = [{ value: "", label: "Select Year" }];
  for (let year = 2020; year <= currentYear + 2; year++) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  // Generate date options 1-31
  const dateOptions = [{ value: "", label: "Select Date" }];
  for (let date = 1; date <= 31; date++) {
    const dateValue = date < 10 ? `0${date}` : `${date}`;
    dateOptions.push({ value: dateValue, label: dateValue });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If contact number is changed and we're adding a new walkin (not editing)
    if (name === "contactNumber" && !editingId && value.length === 10) {
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
      walkinDate: "",
    });
    setIsLoadingCandidateName(false);
    setEditingId(null);
    setShowForm(true);
  };

  // Handle edit action
  const handleEdit = (walkin) => {
    if (!walkin) {
      // If no walkin is provided, this is an "Add New" action
      handleAdd();
      return;
    }
    
    // Convert dates to proper format for the form
    const walkinDate = walkin.walkinDate ? new Date(walkin.walkinDate).toISOString().split('T')[0] : '';
    
    setFormData({
      candidateName: walkin.candidateName || "",
      contactNumber: walkin.contactNumber || "",
      walkinDate: walkinDate,
      walkinRemarks: walkin.walkinRemarks || ""
    });
    // Use the proper ID field from the API (_id for MongoDB, id for standard REST)
    setEditingId(walkin._id || walkin.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle status change from table dropdown
  const handleStatusChange = async (walkin, newStatus) => {
    if (newStatus === walkin.status) return;
    
    try {
      await EmployeeServices.updateWalkinData(walkin._id, { status: newStatus });
      notifySuccess(`Status updated to ${newStatus}`);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error updating status:", error);
      notifyError(error?.response?.data?.message || "Failed to update status");
    }
  };

  // Handle select all for walkins
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedWalkins([]);
    } else {
      const visibleIds = filteredByStatus.map(walkin => walkin._id);
      setSelectedWalkins(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual walkin selection
  const handleWalkinSelection = (walkinId, isSelected) => {
    if (isSelected) {
      setSelectedWalkins(prev => {
        const newSelected = [...prev, walkinId];
        // Check if all visible walkins are now selected
        const visibleIds = filteredByStatus.map(w => w._id);
        if (visibleIds.every(id => newSelected.includes(id))) {
          setSelectAll(true);
        }
        return newSelected;
      });
    } else {
      setSelectedWalkins(prev => prev.filter(id => id !== walkinId));
      setSelectAll(false);
    }
  };

  // Handle copy selected walkins
  const handleCopySelectedWalkins = async () => {
    await copyMultipleCandidates(selectedWalkins, filteredByStatus, {
      nameField: 'candidateName',
      mobileField: 'contactNumber',
      whatsappField: 'whatsappNo'
    });
  };

  // Clear selection when page or data changes
  useEffect(() => {
    setSelectedWalkins([]);
    setSelectAll(false);
  }, [currentPage, refreshKey]);

  
  const handleCancel = () => {
    setFormData({
      candidateName: "",
      contactNumber: "",
      walkinDate: ""
    });
    setEditingId(null);
    setShowForm(false);
  };

// Helper function to get status color




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
  const handleSubmitWalkinWithHighlight = (e) => {
    handleSubmitWalkins(e);
  };

  const renderTable = () => {
    // Check if any filter is applied
    const hasFilters = searchTerm || filters.status || dateRange.startDate || dateRange.endDate;
    
    return (
      <>
      <span className="text-sm text-gray-700 dark:text-gray-400 mb-1"> Total Records Found : {totalWalkins}</span>

      {loading ? (
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : filteredByStatus.length > 0 ? (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
              <WalkinsTable 
                walkins={filteredByStatus}
                onEdit={handleEdit}
            onStatusChange={handleStatusChange}
                searchTerm={searchTerm || walkinsRef?.current?.value || ""}
                highlightText={highlightText}
            loading={loading}
            selectedWalkins={selectedWalkins}
            onWalkinSelection={handleWalkinSelection}
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
          />
        </div>
      ) : hasFilters ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
          <p>No walkins match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
      ) : (
        <NotFound title="Walkins" />
      )}
      </>
    );
  };


  // Handle form submission
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
      
      if (!formData.walkinDate) {
        errors.walkinDate = 'Walkin date is required';
      }
      
      // If there are validation errors, show them and don't submit
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        handleErrorNotification('Please correct the errors in the form', 'Form Validation');
        return;
      }

      setIsSubmitting(true);

      // Create walkin payload
      const walkinData = {
        candidateName: formData.candidateName,
        contactNumber: formData.contactNumber,
        walkinDate: formData.walkinDate,
        walkinRemarks: formData.walkinRemarks
      };
      
      if (editingId !== null) {
        // Update existing walkin
        await EmployeeServices.updateWalkinData(editingId, walkinData);
        notifySuccess(`Walkin for ${formData.candidateName} updated successfully!`);
      } else {
        // Add new walkin
        await EmployeeServices.createWalkinData(walkinData);
        notifySuccess(`New walkin for ${formData.candidateName} created successfully!`);
      }
    
      // Reset form
      setFormData({
        candidateName: "",
        contactNumber: "",
        walkinDate: "",
        walkinRemarks: ""
      });
      setEditingId(null);
      setShowForm(false);
      
      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      handleErrorNotification(
        err?.response?.data?.message || err?.message,
        editingId ? 'Update Walkin' : 'Create Walkin'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Walkins
          </h1>
        </div>

      <AnimatedContent>
        {/* Fixed position search and filter container */}
        <div className="sticky top-0 left-0 right-0 z-30 pb-4">
          {/* Compact Search Bar with Add New Call Button */}
          <div className="mb-3 flex flex-col sm:flex-row gap-2">
            <div className="flex flex-1">
              <div className="relative flex items-center shadow-md bg-white dark:bg-gray-700 rounded-l-md w-full sm:w-96">
                <FaSearch className="text-gray-500 dark:text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  ref={walkinsRef}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSubmitWalkinWithHighlight(e);
                  }}
                  value={searchTerm}
                  className="pl-4 pr-3 py-2.5 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none rounded-l-md"
                />
              </div>
              <button
                onClick={handleAdd}
                className="px-4 py-2.5 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white flex items-center justify-center gap-2 transition-colors rounded-r-md shadow-md"
              >
                <FaPlus />
                <span className="hidden sm:inline">Add Walkin</span>
                <span className="inline sm:hidden">Add</span>
              </button>
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
              
              {/* Copy Selected Walkins Button */}
              {selectedWalkins.length > 0 && (
                <div className="flex-none">
                  <button
                    onClick={handleCopySelectedWalkins}
                    className="px-3 py-1.5 rounded-md text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center"
                  >
                    <FaCopy className="mr-1.5" />
                    Copy {selectedWalkins.length} candidate{selectedWalkins.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
              
              {/* Status Filter */}
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[150px]">
                <select
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange(e)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                >
                  <option value="">Select Status</option>
                  {walkinStatusOptions && walkinStatusOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[120px]">
                <select 
                  value={dateRangeType}
                  onChange={(e) => handleDateRangeTypeChangeWithReset(e.target.value)}
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
                      onChange={(date) => handleDateRangeChangeWithReset(date, dateRange.endDate)}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="yyyy"
                      showYearPicker
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="Start Year"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                  <div className="w-full sm:w-auto sm:flex-none sm:min-w-[120px]">
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => handleDateRangeChangeWithReset(dateRange.startDate, date)}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="yyyy"
                      showYearPicker
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="End Year"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                </>
              ) : dateRangeType === 'month' ? (
                <>
                  <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => handleDateRangeChangeWithReset(date, dateRange.endDate)}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="MMM-yyyy"
                      showMonthYearPicker
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="Start Month"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                  <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => handleDateRangeChangeWithReset(dateRange.startDate, date)}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="MMM-yyyy"
                      showMonthYearPicker
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="End Month"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => handleDateRangeChangeWithReset(date, dateRange.endDate)}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="dd-MMM-yyyy"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="Start Date"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                  <div className="w-full sm:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => handleDateRangeChangeWithReset(dateRange.startDate, date)}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="dd-MMM-yyyy"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="End Date"
                      popperClassName="!z-[9999]"
                      portalId="root"
                    />
                  </div>
                </>
              )}
              
              {/* Employee Filter Dropdown (Admin Only) */}
              <EmployeeFilterDropdown
                isAdmin={isAdmin}
                selectedEmployeeIds={selectedEmployeeIds}
                onEmployeeChange={handleEmployeeChange}
              />
              
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

    {/* Form Modal */}
    {showForm && (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative max-w-4xl bg-white mx-auto p-6 rounded-xl shadow-lg dark:bg-gray-800 w-full m-4">
          {/* Header with Add/Edit Walkin and Close Button aligned */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
              {editingId ? "Edit Walkin" : "Add New Walkin"}
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
                    {editingId 
                      ? "Candidate name cannot be edited" 
                      : "Enter a valid contact number to auto-populate candidate name"}
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
                  readOnly={editingId !== null}
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${editingId !== null ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''}
                  ${formErrors.contactNumber ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {formErrors.contactNumber && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.contactNumber}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Walkin Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.walkinDate ? new Date(formData.walkinDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setFormData({...formData, walkinDate: date.toISOString().split('T')[0]});
                      if (formErrors.walkinDate) {
                        setFormErrors(prev => ({ ...prev, walkinDate: null }));
                      }
                    }
                  }}
                  minDate={minDate}
                  dateFormat="dd-MMM-yyyy"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.walkinDate ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholderText="Select walkin date"
                  required
                />
                {formErrors.walkinDate && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.walkinDate}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                Walkin Remarks
              </label>
              <textarea
                name="walkinRemarks"
                value={formData.walkinRemarks || ""}
                onChange={handleChange}
                placeholder="Add any additional notes or remarks"
                rows="3"
                className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2"
              />
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
                    {editingId ? "Updating..." : "Submitting..."}
                  </span>
                ) : (
                  editingId ? "Update" : "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}

export default Walkins; 