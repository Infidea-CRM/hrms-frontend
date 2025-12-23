import React, { useState, useEffect, useContext } from "react";
import { FaPlus, FaSearch, FaTimesCircle, FaChevronLeft, FaChevronRight, FaCopy } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";
import { formatLongDate } from "@/utils/dateFormatter";
import { copyMultipleCandidates } from "@/utils/copyUtils";

import NotFound from "@/components/table/NotFound";

import LineupsTable from "../components/lineups/LineupsTable";
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
import useError from "@/hooks/useError";
import {
  statusOptions, 
  lineupStatusOptions,
  companyOptions, 
  processOptions, 
  dateRangeTypeOptions, 
  resultsPerPageOptions, 
  joiningTypeOptions,
  getStatusColorClass,
  getLineupStatusColorClass,
  getProcessesByCompany
} from "@/utils/optionsData";




function Lineups() {
  const location = useLocation();
  const navigate = useNavigate();
  const [lineups, setLineups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    candidateName: "",
    contactNumber: "",
    company: "",
    process: "",
    lineupDate: "",
    interviewDate: "",
    status: "",
    remarks: "",
    joiningDate: "",
    joiningType: "",
    salary: "",
    joiningRemarks: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const DEFAULT_ITEMS_PER_PAGE = 10;
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredProcessOptions, setFilteredProcessOptions] = useState([{ value: "", label: "Select Process" }]);
  const [minDate] = useState(new Date());
  const { handleErrorNotification } = useError();

  // Remarks modal states
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [remarksLineup, setRemarksLineup] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState("");
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState("");
  const [isLoadingRemarks, setIsLoadingRemarks] = useState(false);
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  // Add useEffect for Escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close any open modals
        if (showForm) {
          handleCancel();
        }
        if (showRemarksModal) {
          handleCloseRemarksModal();
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showForm, showRemarksModal]);

  const { setIsUpdate } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const isAdmin = adminInfo?.isAdmin || false;

  // State for API data with pagination
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalLineups, setTotalLineups] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add searchTerm state to store the current search input
  const [searchTerm, setSearchTerm] = useState("");

  // Add filter state
  const [filters, setFilters] = useState({
    company: "",
    process: "",
    status: "",
    name: "",
    contactNumber: ""
  });

  // Employee filter state (for admin only) - supports multiple employee IDs
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const [isLoadingCandidateName, setIsLoadingCandidateName] = useState(false);

  // Selection state for bulk copy
  const [selectedLineups, setSelectedLineups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

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

  // Map API response to match expected format
  const data = apiData ? { lineups: apiData.lineups || [] } : null;

  // Update process options when company changes
  useEffect(() => {
    setFilteredProcessOptions(getProcessesByCompany(formData.company));
    
    // Reset process selection when company changes
    if (formData.process && !getProcessesByCompany(formData.company).some(p => p.value === formData.process)) {
      setFormData(prev => ({ ...prev, process: "" }));
    }
  }, [formData.company]);

  const {
    lineupsRef,  
    handleSubmitLineups,
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
    setDateRange,
  } = useFilter(data?.lineups);

  // Fetch lineups data with pagination, search, and filters
  useEffect(() => {
    const fetchLineups = async () => {
      try {
        setLoading(true);
        
        // Build filters object for API
        const apiFilters = {
          status: filters.status || "",
          startDate: dateRange.startDate || null,
          endDate: dateRange.endDate || null,
          dateRangeType: dateRangeType || "day"
        };
        
        const response = await EmployeeServices.getLineupsData(
          currentPage, 
          itemsPerPage, 
          searchTerm, 
          apiFilters,
          selectedEmployeeIds
        );
        setApiData(response);
        setTotalLineups(response?.totalLineups || 0);
        setTotalPages(response?.totalPages || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch lineups");
        setApiData(null);
        handleErrorNotification(err, "Lineups");
      } finally {
        setLoading(false);
      }
    };

    fetchLineups();
  }, [currentPage, itemsPerPage, refreshKey, searchTerm, filters.status, dateRange.startDate, dateRange.endDate, dateRangeType, selectedEmployeeIds]);


  const handleResetField = () => {
    if (lineupsRef && lineupsRef.current) {
      lineupsRef.current.value = "";
    }
    setSearchTerm("");
    handleSubmitLineups("");
    setDateRange({ startDate: null, endDate: null });
    handleDateRangeTypeChange("day");
    setSortBy("");
    setSortOrder("asc");
    setFilters({
      status: "",
      name: "",
      contactNumber: "",
      company: "",
      process: ""
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

  // Handler for employee filter change
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
      // Show all pages if total is less than or equal to maxVisiblePages
      for (let i = 1; i <= displayTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show 10 pages, centered around current page when possible
      let startPage = currentPage - Math.floor(maxVisiblePages / 2);
      let endPage = currentPage + Math.floor(maxVisiblePages / 2) - 1;
      
      // Adjust if we're near the beginning
      if (startPage < 1) {
        startPage = 1;
        endPage = maxVisiblePages;
      }
      
      // Adjust if we're near the end
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
  const filteredByStatus = data?.lineups || [];
  
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


  const getStatusColor = (status) => {
    return getLineupStatusColorClass(status);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when field is changed
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }

    // If contact number is changed and we're adding a new lineup (not editing)
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
      company: "",
      customCompanyName: "",
      process: "",
      customCompanyProcess: "",
      lineupYear: "",
      lineupMonth: "",
      lineupDate: "",
      interviewDate: "",
      status: "",
      remarks: "",
      joiningDate: "",
      joiningType: "",
      salary: "",
      joiningRemarks: ""
    });
    setIsLoadingCandidateName(false);
    setEditingId(null);
    setShowForm(true);
  };

  // Handle edit action
  const handleEdit = (lineup) => {
    if (!lineup) {
      // If no lineup is provided, this is an "Add New" action
      handleAdd();
      return;
    }
    
    // Convert dates to proper format for the form
    const lineupDate = lineup.lineupDate ? new Date(lineup.lineupDate).toISOString().split('T')[0] : '';
    const interviewDate = lineup.interviewDate ? new Date(lineup.interviewDate) : '';
    const joiningDate = lineup.joiningDate ? new Date(lineup.joiningDate) : '';
    
    // Determine if we need to set custom company and process values
    const isCustomCompany = !companyOptions.some(option => option.value === lineup.company && option.value !== "others");
    const isCustomProcess = !processOptions.some(option => option.value === lineup.process && option.value !== "others");
    
    setFormData({
      candidateName: lineup.name || "",
      contactNumber: lineup.contactNumber || "",
      company: isCustomCompany ? "others" : (lineup.company || ""),
      customCompanyName: isCustomCompany ? lineup.company || "" : (lineup.customCompanyName || ""),
      process: isCustomProcess ? "others" : (lineup.process || ""),
      customCompanyProcess: isCustomProcess ? lineup.process || "" : (lineup.customCompanyProcess || ""),
      lineupDate: lineupDate,
      interviewDate: interviewDate,
      status: lineup.status || "",
      remarks: lineup.remarks || "",
      joiningDate: joiningDate,
      joiningType: lineup.joiningType || "",
      salary: lineup.salary || "",
      joiningRemarks: lineup.joiningRemarks || ""
    });
    
    // Use the proper ID field from the API (_id for MongoDB, id for standard REST)
    setEditingId(lineup._id || lineup.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Remarks handlers
  const handleOpenRemarks = async (lineup) => {
    setRemarksLineup(lineup);
    setShowRemarksModal(true);
    setIsLoadingRemarks(true);
    
    try {
      const response = await EmployeeServices.getLineupRemarks(lineup._id);
      setRemarks(response?.remarks || []);
    } catch (error) {
      console.error("Error fetching remarks:", error);
      notifyError("Failed to load remarks");
      setRemarks([]);
    } finally {
      setIsLoadingRemarks(false);
    }
  };

  const handleAddRemark = async () => {
    if (!newRemark.trim()) {
      notifyError("Please enter a remark");
      return;
    }

    setIsSubmittingRemark(true);
    try {
      const response = await EmployeeServices.addLineupRemark(remarksLineup._id, newRemark.trim());
      setRemarks(response?.remarks || []);
      setNewRemark("");
      notifySuccess("Remark added successfully");
      // Refresh the lineup data to update the count
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error adding remark:", error);
      notifyError(error?.response?.data?.message || "Failed to add remark");
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handleUpdateRemark = async (remarkId) => {
    if (!editingRemarkText.trim()) {
      notifyError("Please enter a remark");
      return;
    }

    setIsSubmittingRemark(true);
    try {
      const response = await EmployeeServices.updateLineupRemark(remarksLineup._id, remarkId, editingRemarkText.trim());
      setRemarks(response?.remarks || []);
      setEditingRemarkId(null);
      setEditingRemarkText("");
      notifySuccess("Remark updated successfully");
    } catch (error) {
      console.error("Error updating remark:", error);
      notifyError(error?.response?.data?.message || "Failed to update remark");
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  const handleDeleteRemark = async (remarkId) => {
    if (!window.confirm("Are you sure you want to delete this remark?")) {
      return;
    }

    try {
      const response = await EmployeeServices.deleteLineupRemark(remarksLineup._id, remarkId);
      setRemarks(response?.remarks || []);
      notifySuccess("Remark deleted successfully");
      // Refresh the lineup data to update the count
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting remark:", error);
      notifyError(error?.response?.data?.message || "Failed to delete remark");
    }
  };

  const handleCloseRemarksModal = () => {
    setShowRemarksModal(false);
    setRemarksLineup(null);
    setRemarks([]);
    setNewRemark("");
    setEditingRemarkId(null);
    setEditingRemarkText("");
  };

  const startEditRemark = (remark) => {
    setEditingRemarkId(remark._id);
    setEditingRemarkText(remark.remark);
  };

  const cancelEditRemark = () => {
    setEditingRemarkId(null);
    setEditingRemarkText("");
  };

  // Handle status change from table dropdown
  const handleStatusChange = async (lineup, newStatus) => {
    if (newStatus === lineup.status) return;
    
    // If changing to "Joined", open the edit form to fill joining details
    if (newStatus === "Joined") {
      // Set form data with existing lineup data and new status
      const lineupDate = lineup.lineupDate ? new Date(lineup.lineupDate).toISOString().split('T')[0] : '';
      const interviewDate = lineup.interviewDate ? new Date(lineup.interviewDate) : '';
      
      setFormData({
        candidateName: lineup.name || "",
        contactNumber: lineup.contactNumber || "",
        company: lineup.company || "",
        customCompanyName: lineup.customCompany || "",
        process: lineup.process || "",
        customCompanyProcess: lineup.customProcess || "",
        lineupDate: lineupDate,
        interviewDate: interviewDate,
        status: "Joined",
        remarks: lineup.lineupRemarks || "",
        joiningDate: "",
        joiningType: "",
        salary: "",
        joiningRemarks: ""
      });
      setEditingId(lineup._id);
      setShowForm(true);
      notifySuccess("Please fill joining details to mark as Joined");
      return;
    }
    
    try {
      await EmployeeServices.updateLineupData(lineup._id, { status: newStatus });
      notifySuccess(`Status updated to ${newStatus}`);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error updating status:", error);
      notifyError(error?.response?.data?.message || "Failed to update status");
    }
  };
  
  const handleCancel = () => {
    setFormData({
      candidateName: "",
      contactNumber: "",
      company: "",
      process: "",
      lineupYear: "",
      lineupMonth: "",
      lineupDate: "",
      interviewDate: "",
      status: "",
      remarks: "",
      joiningDate: "",
      joiningType: "",
      salary: "",
      joiningRemarks: ""
    });
    setEditingId(null);
    setShowForm(false);
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

  // Handle select all for lineups
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLineups([]);
    } else {
      const visibleIds = filteredByStatus.map(lineup => lineup._id);
      setSelectedLineups(visibleIds);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual lineup selection
  const handleLineupSelection = (lineupId, isSelected) => {
    if (isSelected) {
      setSelectedLineups(prev => {
        const newSelected = [...prev, lineupId];
        // Check if all visible lineups are now selected
        const visibleIds = filteredByStatus.map(l => l._id);
        if (visibleIds.every(id => newSelected.includes(id))) {
          setSelectAll(true);
        }
        return newSelected;
      });
    } else {
      setSelectedLineups(prev => prev.filter(id => id !== lineupId));
      setSelectAll(false);
    }
  };

  // Handle copy selected lineups
  const handleCopySelectedLineups = async () => {
    await copyMultipleCandidates(selectedLineups, filteredByStatus, {
      nameField: 'name',
      mobileField: 'contactNumber',
      whatsappField: 'whatsappNo'
    });
  };

  // Clear selection when page or data changes
  useEffect(() => {
    setSelectedLineups([]);
    setSelectAll(false);
  }, [currentPage, refreshKey]);

  // Add handling for search with highlighting
  const handleSubmitLineupWithHighlight = (e) => {
    handleSubmitLineups(e);
  };

  const renderTable = () => {
    // Check if any filter is applied
    const hasFilters = searchTerm || filters.status || dateRange.startDate || dateRange.endDate;
    
    return (
      <>
      <span className="text-sm text-gray-700 dark:text-gray-400 mb-1"> Total Records Found : {totalLineups}</span>

      {loading ? (
        <TableLoading row={12} col={6} width={190} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : filteredByStatus.length > 0 ? (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
          <LineupsTable 
            lineups={filteredByStatus}
            onEdit={handleEdit}
            onRemarks={handleOpenRemarks}
            onStatusChange={handleStatusChange}
            searchTerm={searchTerm || lineupsRef?.current?.value || ""}
            highlightText={highlightText}
            loading={loading}
            selectedLineups={selectedLineups}
            onLineupSelection={handleLineupSelection}
            selectAll={selectAll}
            onSelectAll={handleSelectAll}
          />
        </div>
      ) : hasFilters ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
          <p>No lineups match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
      ) : (
        <NotFound title="Lineups" />
      )}
      </>
    );
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    if (!formData.lineupDate) {
      errors.lineupDate = 'Lineup date is required';
    }
    
    if (!formData.interviewDate) {
      errors.interviewDate = 'Interview date is required';
    }
    
    if (!formData.status) {
      errors.status = 'Status is required';
    }

    // Validate joining fields if status is "joined"
    if (formData.status.toLowerCase() === "joined") {
      if (!formData.joiningDate) {
        errors.joiningDate = 'Joining date is required';
      }
      
      if (!formData.joiningType) {
        errors.joiningType = 'Joining type is required';
      }
      
      if (!formData.salary) {
        errors.salary = 'Salary is required';
      }
    }
    
    // If there are validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      notifyError('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the interviewDate if it's a Date object
      const formattedInterviewDate = formData.interviewDate instanceof Date 
        ? formData.interviewDate.toISOString().split('T')[0]
        : formData.interviewDate;

      // Format the joiningDate if it's a Date object and status is joined
      const formattedJoiningDate = formData.joiningDate instanceof Date 
        ? formData.joiningDate.toISOString().split('T')[0]
        : formData.joiningDate;

      // Create lineup payload
      const lineupData = {
        name: formData.candidateName,
        contactNumber: formData.contactNumber,
        company: formData.company.toLowerCase() === "others" ? formData.customCompanyName : formData.company,
        customCompanyName: formData.customCompanyName,
        process: formData.process.toLowerCase() === "others" ? formData.customCompanyProcess : formData.process,
        customCompanyProcess: formData.customCompanyProcess,
        lineupDate: formData.lineupDate,
        interviewDate: formattedInterviewDate,
        status: formData.status,
        joiningRemarks: formData.joiningRemarks,
        lineupRemarks: formData.lineupRemarks
      };

      // Add joining details to payload if status is "joined"
      if (formData.status.toLowerCase() === "joined") {
        lineupData.joiningDate = formattedJoiningDate;
        lineupData.joiningType = formData.joiningType;
        lineupData.salary = formData.salary;
        lineupData.joiningRemarks = formData.joiningRemarks;
      }

      if (editingId !== null) {
        // Update existing lineup
        await EmployeeServices.updateLineupData(editingId, lineupData);
        notifySuccess(`Lineup for ${formData.candidateName} updated successfully!`);
      } else {
        // Add new lineup
        await EmployeeServices.createLineupData(lineupData);
        notifySuccess(`New lineup for ${formData.candidateName} created successfully!`);
      }
    
      // Reset form with remarks included
      setFormData({
        candidateName: "",
        contactNumber: "",
        company: "",
        customCompanyName: "",
        process: "",
        customCompanyProcess: "",
        lineupYear: "",
        lineupMonth: "",
        lineupDate: "",
        interviewDate: "",
        status: "",
        remarks: "",
        lineupRemarks: "",
        joiningDate: "",
        joiningType: "",
        salary: "",
        joiningRemarks: ""
      });
      setEditingId(null);
      setShowForm(false);
      
      // Refresh data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error submitting lineup:", error);
      notifyError(editingId 
        ? `Failed to update lineup: ${error?.response?.data?.message || 'Unknown error'}`
        : `Failed to create lineup: ${error?.response?.data?.message || 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Lineups
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
                  ref={lineupsRef}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleSubmitLineupWithHighlight(e);
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
                <span className="hidden sm:inline">Add Lineup</span>
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
              
              {/* Copy Selected Lineups Button */}
              {selectedLineups.length > 0 && (
                <div className="flex-none">
                  <button
                    onClick={handleCopySelectedLineups}
                    className="px-3 py-1.5 rounded-md text-xs bg-teal-600 hover:bg-teal-700 text-white flex items-center"
                  >
                    <FaCopy className="mr-1.5" />
                    Copy {selectedLineups.length} candidate{selectedLineups.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
              
              <div className="w-full sm:w-auto sm:flex-none sm:min-w-[150px]">
                <select
                  name="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange(e)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                >
                  <option value="">Select Status</option>
                  {lineupStatusOptions.map((option, index) => (
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
          {/* Header with Add/Edit Lineup and Close Button aligned */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
              {editingId ? "Edit Lineup" : "Add New Lineup"}
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
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.company ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  {companyOptions.map((option, index) => (
                    <option key={index} value={option.value}>
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
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.process ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  {filteredProcessOptions.map((option, index) => (
                    <option key={index} value={option.value}>
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
                  Lineup Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.lineupDate ? new Date(formData.lineupDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setFormData({...formData, lineupDate: date.toISOString().split('T')[0]});
                      if (formErrors.lineupDate) {
                        setFormErrors(prev => ({ ...prev, lineupDate: null }));
                      }
                    }
                  }}
                  minDate={minDate}
                  dateFormat="dd-MMM-yyyy"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.lineupDate ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholderText="Select lineup date"
                  required
                />
                {formErrors.lineupDate && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.lineupDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Interview Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  selected={formData.interviewDate instanceof Date ? formData.interviewDate : formData.interviewDate ? new Date(formData.interviewDate) : null}
                  onChange={(date) => {
                    if (date) {
                      setFormData({...formData, interviewDate: date});
                      if (formErrors.interviewDate) {
                        setFormErrors(prev => ({ ...prev, interviewDate: null }));
                      }
                    }
                  }}
                  minDate={minDate}
                  dateFormat="dd-MMM-yyyy"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.interviewDate ? 'border-red-500 dark:border-red-500' : ''}`}
                  placeholderText="Select interview date"
                  required
                />
                {formErrors.interviewDate && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.interviewDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                  dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                  ${formErrors.status ? 'border-red-500 dark:border-red-500' : ''}`}
                >
                  <option value="">Select Status</option>
                  {lineupStatusOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {formErrors.status && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.status}</p>
                )}
              </div>
            </div>
            
            {/* Joining Details section - shown only when status is "joined" */}
            {formData.status.toLowerCase() === "joined" && (
              <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-medium dark:text-[#e2692c] text-[#1a5d96] mb-4">
                  Joining Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={formData.joiningDate instanceof Date ? formData.joiningDate : formData.joiningDate ? new Date(formData.joiningDate) : null}
                      onChange={(date) => {
                        if (date) {
                          setFormData({...formData, joiningDate: date});
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
                      Joining Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="joiningType"
                      value={formData.joiningType}
                      onChange={handleChange}
                      required
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                      dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                      ${formErrors.joiningType ? 'border-red-500 dark:border-red-500' : ''}`}
                    >
                      {joiningTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.joiningType && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.joiningType}</p>
                    )}
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
                      placeholder="Enter salary amount"
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                      dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2
                      ${formErrors.salary ? 'border-red-500 dark:border-red-500' : ''}`}
                      required
                    />
                    {formErrors.salary && (
                      <p className="mt-1 text-xs text-red-500">{formErrors.salary}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                    Joining Remarks
                  </label>
                  <textarea
                    name="joiningRemarks"
                    value={formData.joiningRemarks || ""}
                    onChange={handleChange}
                    placeholder="Add any notes about joining conditions or special arrangements"
                    rows="2"
                    className="mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                    dark:bg-gray-700 border-gray-600 dark:text-white bg-white border-gray-300 text-gray-900 px-3 py-2"
                  />
                </div>
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm font-medium dark:text-gray-300 text-gray-700">
               Lineup Remarks
              </label>
              <textarea
                name="lineupRemarks"
                value={formData.lineupRemarks || ""}
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

    {/* Remarks Modal */}
    {showRemarksModal && remarksLineup && (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative max-w-2xl mx-auto p-5 rounded-xl shadow-lg bg-white dark:bg-gray-800 w-full m-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
            <h2 className="text-xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
                Remarks
            </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {remarksLineup?.name} - {remarksLineup?.company}
              </p>
            </div>
            <button 
              onClick={handleCloseRemarksModal} 
              className="dark:text-gray-300 dark:hover:text-white text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Add New Remark */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex-shrink-0">
            <label className="block text-sm font-medium dark:text-gray-300 text-gray-700 mb-2">
              Add New Remark
            </label>
            <div className="flex gap-2">
              <textarea
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="Enter your remark..."
                rows="2"
                className="flex-1 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddRemark}
                disabled={isSubmittingRemark || !newRemark.trim()}
                className="px-4 py-2 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-[#154a7a] dark:hover:bg-[#d15a20] text-white rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {isSubmittingRemark ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
          
          {/* Remarks List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingRemarks ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a5d96] dark:border-[#e2692c]"></div>
              </div>
            ) : remarks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <p>No remarks yet. Add the first one!</p>
                </div>
            ) : (
              <div className="space-y-3">
                {remarks.map((remark) => (
                  <div key={remark._id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {editingRemarkId === remark._id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingRemarkText}
                          onChange={(e) => setEditingRemarkText(e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditRemark}
                            className="px-3 py-1 text-xs rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateRemark(remark._id)}
                            disabled={isSubmittingRemark}
                            className="px-3 py-1 text-xs rounded-md bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-[#154a7a] dark:hover:bg-[#d15a20] text-white disabled:opacity-50"
                          >
                            {isSubmittingRemark ? "Saving..." : "Save"}
                          </button>
                </div>
                </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                          {remark.remark}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1a5d96] dark:text-[#e2692c]">
                              {remark.addedBy?.name?.en || remark.addedBy?.name || "Unknown"}
                            </span>
                            <span>•</span>
                            <span>
                              {new Date(remark.addedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
            </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditRemark(remark)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteRemark(remark._id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                              </svg>
                            </button>
                </div>
                </div>
                      </>
                    )}
            </div>
                ))}
            </div>
          )}
            </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end flex-shrink-0">
              <button
              onClick={handleCloseRemarksModal}
              className="px-4 py-2 text-sm rounded-lg font-medium dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default Lineups; 