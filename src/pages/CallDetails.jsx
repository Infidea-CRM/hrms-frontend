import {
  Table,
  TableCell,
  TableContainer,
  TableHeader,
  Modal,
  ModalBody,
  ModalFooter,
  Button,
} from "@windmill/react-ui";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

//internal import
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import useFilter from "@/hooks/useFilter";
import EmployeeServices from "@/services/EmployeeServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import { SidebarContext } from "@/context/SidebarContext";
import { AdminContext } from "@/context/AdminContext";
import DatePicker from "react-datepicker";  
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch, FaPlus, FaTimesCircle, FaChevronLeft, FaChevronRight, FaUserCheck, FaUpload, FaFileExcel, FaFilter, FaCheck, FaCopy, FaUnlock } from "react-icons/fa";
import { MdError, MdClose, MdExpandMore, MdExpandLess } from "react-icons/md";
import CandidatesCard from "@/components/candidates/CandidatesCard";
import CandidatesCardSkeleton from "@/components/candidates/CandidatesCardSkeleton";
import CallDetailsViewModal from "@/components/candidates/CallDetailsViewModal";
import CallDetailsEditModal from "@/components/candidates/CallDetailsEditModal";
import { Toaster, toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { 
  dateRangeTypeOptions, 
  resultsPerPageOptions,
  callStatusOptions,
  experienceOptions,
  genderOptions,
  communicationOptions,
  shiftPreferenceOptions,
  noticePeriodOptions,
  relocationOptions,
  sourceOptions
} from "@/utils/optionsData";

const DEFAULT_ITEMS_PER_PAGE = 10;

const CallDetails = () => {
  const [selectedCall, setSelectedCall] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    callStatus: [],
    experience: [],
    gender: [],
    communication: [],
    shift: [],
    noticePeriod: [],
    relocation: [],
    source: [],
    qualification: [],
    locality: [],
  });
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [checkingDuplicity, setCheckingDuplicity] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [candidateToUnlock, setCandidateToUnlock] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  
  // Bulk upload state
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [previewData, setPreviewData] = useState([]);

  // Bulk upload drag-and-drop state
  const [isDragActive, setIsDragActive] = useState(false);

  // Add these new states for the filter dropdowns
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilterColumn, setActiveFilterColumn] = useState(null);

  const { setIsUpdate } = useContext(SidebarContext);
  const { state } = useContext(AdminContext);
  const { adminInfo } = state;
  const isAdmin = adminInfo?.isAdmin || false;

  // State for API data with pagination
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add searchTerm state to store the current search input (must be before useEffect that uses it)
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch candidates data with pagination and search
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await EmployeeServices.getCandidatesData(currentPage, itemsPerPage, searchTerm);
        setApiData(response);
        setTotalCandidates(response?.totalCandidates || 0);
        setTotalPages(response?.totalPages || 0);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to fetch candidates");
        setApiData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [currentPage, itemsPerPage, refreshKey, searchTerm]);

  // Map API response to match expected format
  const data = apiData ? { candidates: apiData.candidates || [] } : null;


  // Add states for API data
  const [qualifications, setQualifications] = useState([]);
  const [localities, setLocalities] = useState([]);

  // Refresh is handled by the fetchCandidates useEffect via refreshKey dependency

  // Add useEffect to fetch qualifications and localities
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        // Fetch qualifications
        const qualificationsRes = await EmployeeServices.getQualifications();
        if (qualificationsRes && Array.isArray(qualificationsRes)) {
          setQualifications(qualificationsRes);
        }
        
        // Fetch localities (for Indore)
        const localitiesRes = await EmployeeServices.getLocalities();
        if (localitiesRes && Array.isArray(localitiesRes)) {
          setLocalities(localitiesRes);
        }
      } catch (error) {
        console.error("Error fetching filter data:", error);
        toast.error("Failed to load filter options");
      }
    };

    fetchFilterData();
  }, []);

  const {
    candidateRef,  
    handleSubmitCandidate,
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
  } = useFilter(data?.candidates);

  const navigate = useNavigate();

  const [duplicityCheckCount, setDuplicityCheckCount] = useState(0);

  // Add selected candidates state
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Add useEffect for Escape key handling
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        // Close any open modals
        if (showViewModal) {
          setShowViewModal(false);
          setSelectedCall(null);
        }
        if (showEditModal) {
          setShowEditModal(false);
          setSelectedCall(null);
        }
        if (showBulkUploadModal) {
          setShowBulkUploadModal(false);
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleEscapeKey);

    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showViewModal, showEditModal, showBulkUploadModal]);

  const handleResetField = () => {
    if (candidateRef && candidateRef.current) {
      candidateRef.current.value = "";
    }
    handleSubmitCandidate("");
    setSearchTerm(""); // Clear search term to reset backend search
    setDateRange({ startDate: null, endDate: null });
    handleDateRangeTypeChange("day");
    setSortBy("");
    setSortOrder("asc");
    setFilters({
      callStatus: [],
      experience: [],
      gender: [],
      communication: [],
      shift: [],
      noticePeriod: [],
      relocation: [],
      source: [],
      qualification: [],
      locality: [],
    });
    setItemsPerPage(DEFAULT_ITEMS_PER_PAGE);
    setCurrentPage(1);
    setMobileNumber("");
    setMobileError("");
    setDuplicateInfo(null);
    setDuplicityCheckCount(0);
    // Force a refresh
    setRefreshKey(prev => prev + 1);
  };

  const handleMobileNumberChange = (e) => {
    const value = e.target.value;
    
    // Allow only numbers
    const numberOnly = value.replace(/\D/g, '');
    
    // Enforce max length
    if (numberOnly.length <= 10) {
      setMobileNumber(numberOnly);
      
      // Show validation error for incomplete numbers
      if (numberOnly.length > 0 && numberOnly.length < 10) {
        setMobileError(`Phone number must be 10 digits. Current: ${numberOnly.length}`);
        setDuplicateInfo(null);
      } else {
        setMobileError("");
      }
      
      // Auto-submit when length reaches 10
      if (numberOnly.length === 10 && duplicityCheckCount < 3) {
        handleDuplicityCheck(numberOnly);
      }
    }
  };

  const handleDuplicityCheck = async (number = mobileNumber) => {
    // Check count limit, but only for the input field initiated checks
    if (duplicityCheckCount >= 3 && number === mobileNumber) return;
    
    // Only increment count if check is initiated from the input field
    if (number === mobileNumber) {
      setDuplicityCheckCount(count => count + 1);
    }
    
    if (!number || number.length < 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    // Set loading state for all checks
    setCheckingDuplicity(true);
    setMobileError("");
    
    try {
      const response = await EmployeeServices.checkDuplicityofInputField(number);

      // Handle candidate data - now always returns data even if locked
      // Check both response.candidate and response.data.candidate (in case of nested structure)
      // Also handle case where response itself might be the candidate object
      const candidateData = response?.candidate || response?.data?.candidate || (response?._id ? response : null);
      const isLocked = response?.isLocked !== undefined ? response.isLocked : (response?.data?.isLocked || false);
      const lockedBy = response?.lockedBy || response?.data?.lockedBy || null;
      const remainingDays = response?.remainingDays !== undefined ? response.remainingDays : (response?.data?.remainingDays || 0);
      const remainingTime = response?.remainingTime || response?.data?.remainingTime || null;
      const alreadyInHistory = response?.alreadyInHistory !== undefined ? response.alreadyInHistory : (response?.data?.alreadyInHistory || false);
      const isLastRegisteredBy = response?.isLastRegisteredBy !== undefined ? response.isLastRegisteredBy : (response?.data?.isLastRegisteredBy || false);

      if (candidateData) {
        // Create a copy of candidateData to avoid mutating the original response
        const candidate = { ...candidateData };
        
        // Use editable from response (set by backend based on lock status)
        // editable will be false if locked by someone else, true if not locked or locked by current user
        
        // Add lock and registration status flags to candidate object for modal display
        candidate.isLocked = isLocked;
        candidate.lockedBy = lockedBy;
        candidate.remainingDays = remainingDays;
        candidate.remainingTime = remainingTime;
        candidate.alreadyInHistory = alreadyInHistory;
        candidate.isLastRegisteredBy = isLastRegisteredBy;
        
        // Ensure editable property is set (from backend response or default)
        candidate.editable = candidateData.editable !== undefined ? candidateData.editable : (!isLocked && !alreadyInHistory && !isLastRegisteredBy);
        
        // Transform callDurationHistory to callSummary if callSummary doesn't exist
        if (!candidate.callSummary || candidate.callSummary.length === 0) {
          if (candidate.callDurationHistory && candidate.callDurationHistory.length > 0) {
            // Transform callDurationHistory to callSummary format
            candidate.callSummary = candidate.callDurationHistory
              .filter(item => item && item.summary) // Only include items with summary
              .map(item => ({
                date: item.date || candidate.updatedAt || candidate.createdAt || new Date(),
                summary: item.summary
              }));
          } else {
            candidate.callSummary = [];
          }
        } else if (candidate.callSummary && !Array.isArray(candidate.callSummary)) {
          // If callSummary exists but is not an array, convert it to array format
          candidate.callSummary = [
            { 
              date: candidate.updatedAt || candidate.createdAt || new Date(), 
              summary: candidate.callSummary 
            }
          ];
        }

        // Set duplicate info for UI display based on lock or registration status
        if (isLocked && lockedBy) {
          const timeInfo = remainingTime ? remainingTime : `${remainingDays} days`;
          toast(`Candidate is locked by ${lockedBy} for ${timeInfo}. Viewing in read-only mode.`, {
            icon: 'ℹ️',
            duration: 4000,
          });
          
          setDuplicateInfo({
            lockedBy: lockedBy,
            remainingTime: timeInfo,
            alreadyRegistered: false
          });
        } else if (alreadyInHistory || isLastRegisteredBy) {
          toast("You have already registered this candidate. Viewing in read-only mode.", {
            icon: 'ℹ️',
            duration: 4000,
          });
          
          setDuplicateInfo({
            lockedBy: null,
            remainingTime: null,
            alreadyRegistered: true
          });
        } else {
          // Clear duplicate info if not locked and not already registered
          setDuplicateInfo(null);
        }

        // Open modal with candidate data
        setShowViewModal(true);
        setSelectedCall(candidate);
      } else {
        toast.error("Candidate data not found in response");
      }

    } catch (error) {
      // Check if error has response data (HTTP error)
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        // Check if candidate data is present in error response (some APIs return data with error status)
        if (errorData.candidate) {
          // Create a copy of candidate data
          const candidate = { ...errorData.candidate };
          
          // Add lock and registration status flags to candidate object for modal display
          candidate.isLocked = errorData.isLocked || false;
          candidate.lockedBy = errorData.lockedBy || null;
          candidate.remainingDays = errorData.remainingDays || 0;
          candidate.remainingTime = errorData.remainingTime || null;
          candidate.alreadyInHistory = errorData.alreadyInHistory || false;
          candidate.isLastRegisteredBy = errorData.isLastRegisteredBy || false;
          candidate.editable = candidate.editable !== undefined ? candidate.editable : (!candidate.isLocked && !candidate.alreadyInHistory && !candidate.isLastRegisteredBy);
      
          // Transform callDurationHistory to callSummary if callSummary doesn't exist
          if (!candidate.callSummary || candidate.callSummary.length === 0) {
            if (candidate.callDurationHistory && candidate.callDurationHistory.length > 0) {
              candidate.callSummary = candidate.callDurationHistory
                    .filter(item => item && item.summary)
                .map(item => ({
                  date: item.date || candidate.updatedAt || candidate.createdAt || new Date(),
                  summary: item.summary
                }));
            } else {
              candidate.callSummary = [];
            }
          } else if (candidate.callSummary && !Array.isArray(candidate.callSummary)) {
            candidate.callSummary = [
              { 
                date: candidate.updatedAt || candidate.createdAt || new Date(), 
                summary: candidate.callSummary 
              }
            ];
          }

          // Set duplicate info for locked or already registered candidates
          if (candidate.isLocked && candidate.lockedBy) {
            const timeInfo = candidate.remainingTime ? candidate.remainingTime : `${candidate.remainingDays} days`;
            setDuplicateInfo({
              lockedBy: candidate.lockedBy,
              remainingTime: timeInfo,
              alreadyRegistered: false
            });
            toast(`Candidate is locked by ${candidate.lockedBy} for ${timeInfo}. Viewing in read-only mode.`, {
              icon: 'ℹ️',
              duration: 4000,
            });
          } else if (candidate.alreadyInHistory || candidate.isLastRegisteredBy) {
            setDuplicateInfo({
              lockedBy: null,
              remainingTime: null,
              alreadyRegistered: true
            });
            toast("You have already registered this candidate. Viewing in read-only mode.", {
              icon: 'ℹ️',
              duration: 4000,
            });
          } else {
            setDuplicateInfo(null);
          }

          // Show modal with candidate data
          setShowViewModal(true);
          setSelectedCall(candidate);
          return; // Exit early since we handled the data
        }

        // Candidate not found
        if (error.response.status === 404 && errorData.message === "Candidate not found") {
          // Redirect to call-info and prefill the number
          navigate("/call-info", {
            state: { prefillNumber: number }
          });
          return;
        }
        
        // Handle other errors only if no candidate data was found
        toast.error(errorData.message || "An error occurred while checking duplicity");
      } else {
        // Network error or other non-HTTP error
        toast.error(error.message || "An error occurred while checking duplicity. Please check your connection and try again.");
      }
    } finally {
      setCheckingDuplicity(false);
    }
  };

  const handleFilterChange = (columnName, value) => {
    setFilters(prev => {
      const updatedFilters = { ...prev };
      
      // Ensure the filter is an array
      if (!Array.isArray(updatedFilters[columnName])) {
        updatedFilters[columnName] = [];
      }
      
      // Toggle the value in the array
      if (updatedFilters[columnName].includes(value)) {
        updatedFilters[columnName] = updatedFilters[columnName].filter(item => item !== value);
      } else {
        updatedFilters[columnName] = [...updatedFilters[columnName], value];
      }
      
      return updatedFilters;
    });
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

  // Update the applyFilters function to handle non-array values
  const applyFilters = (data) => {
    if (!data) return [];
    
    
    return data.filter(item => {
      // Check each filter
      for (const [key, values] of Object.entries(filters)) {
        // Skip empty filters or non-array values
        if (!values || values.length === 0) continue;
        
        // Ensure values is an array
        if (!Array.isArray(values)) {
          continue;
        }
        
        const itemValue = item[key] || '';
        const matches = values.some(value => {
          const normalizedItemValue = String(itemValue).trim().toLowerCase();
          const normalizedFilterValue = String(value).toLowerCase();
          return normalizedItemValue === normalizedFilterValue;
        });
        
        if (!matches) return false;
      }
      
      return true;
    });
  };
  
  // Use the new filter function
  const filteredData = applyFilters(dataTable || []);
  
  // Use backend pagination totalPages, but fallback to client-side calculation for filtered data
  const displayTotalPages = totalPages || Math.ceil(filteredData.length / itemsPerPage);

  // Toggle sort order when header is clicked
  const handleSortByField = (field) => {
    handleSortChange(field);
  };

  const handleResultsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleView = (call) => {
    // Ensure the call object has editable property and properly formatted callSummary
    if (call) {
      // Set editable property to control "Try a Call" button visibility
      call.editable = true;
      
      // Transform callDurationHistory to callSummary if callSummary doesn't exist
      if (!call.callSummary || call.callSummary.length === 0) {
        if (call.callDurationHistory && call.callDurationHistory.length > 0) {
          // Transform callDurationHistory to callSummary format
          call.callSummary = call.callDurationHistory
            .filter(item => item.summary) // Only include items with summary
            .map(item => ({
              date: item.date || call.updatedAt || call.createdAt || new Date(),
              summary: item.summary
            }));
        }
      } else if (call.callSummary && !Array.isArray(call.callSummary)) {
        // If callSummary exists but is not an array, convert it to array format
        call.callSummary = [
          { 
            date: call.updatedAt || call.createdAt || new Date(), 
            summary: call.callSummary 
          }
        ];
      }
    }
    
    setSelectedCall(call);
    setShowViewModal(true);
  };

  const handleEdit = (call) => {

      setSelectedCall(call);
      setShowEditModal(true);
  };

  const handleUpdate = () => {
    // Close the modal
    setShowEditModal(false);
    // Refresh the table data
    setRefreshKey(prev => prev + 1);
  };

  const handleUnlockDuplicacy = (candidate) => {
    if (!candidate || !candidate.mobileNo) {
      toast.error("Invalid candidate data");
      return;
    }
    setCandidateToUnlock(candidate);
    setShowUnlockModal(true);
  };

  const confirmUnlockDuplicacy = async () => {
    if (!candidateToUnlock || !candidateToUnlock.mobileNo) {
      toast.error("Invalid candidate data");
      setShowUnlockModal(false);
      return;
    }

    setUnlocking(true);
    try {
      await EmployeeServices.unlockCandidateDuplicacy(candidateToUnlock.mobileNo);
      toast.success("Candidate duplicacy unlocked successfully");
      setShowUnlockModal(false);
      setCandidateToUnlock(null);
      // Refresh the table data
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unlock candidate duplicacy");
    } finally {
      setUnlocking(false);
    }
  };

  const closeUnlockModal = () => {
    if (!unlocking) {
      setShowUnlockModal(false);
      setCandidateToUnlock(null);
    }
  };

  const navigateToCallInfo = () => {
    navigate("/call-info");
  };

  // Bulk upload handlers
  const handleBulkUploadModalOpen = () => {
    setBulkUploadFile(null);
    setUploadResult(null);
    setUploadError(null);
    setPreviewData([]);
    setShowBulkUploadModal(true);
  };

  const handleBulkUploadModalClose = () => {
    setShowBulkUploadModal(false);
  };

  // Helper function to parse Excel file and extract candidate data
  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Map the data to match the expected format
          const candidates = jsonData.map(row => {
            // Check for different possible column names
            const name = row.Name || row.name || row.CANDIDATE_NAME || row.candidate_name || row.CandidateName || '';
            const mobileNo = row['Contact Number'] || row.Mobile || row.mobile || row.MOBILE || row.Phone || row.phone || row.mobileNo || '';
            
            return { name, mobileNo };
          });
          
          resolve(candidates);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(new Error('Could not parse the Excel file. Please check the format.'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file. Please try again.'));
      reader.readAsBinaryString(file);
    });
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setBulkUploadFile(selectedFile);
    setUploadError(null);
    setUploadResult(null);
    
    if (selectedFile) {
      try {
        const candidates = await parseExcelFile(selectedFile);
        setPreviewData(candidates);
        
        if (candidates.length === 0) {
          setUploadError('No data found in the Excel file.');
        }
      } catch (error) {
        setUploadError(error.message);
      }
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      setUploadError('Please select a file first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Reuse the parseExcelFile helper function
      const candidates = await parseExcelFile(bulkUploadFile);

      if (candidates.length === 0) {
        setUploadError('No data found in the Excel file.');
        setIsUploading(false);
        return;
      }

      // Send to backend using existing service
      const response = await EmployeeServices.bulkUploadCandidates({ candidates });
      setUploadResult(response);
      
      // Refresh the table data after successful upload
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error processing or uploading:', error);
      setUploadError(error.response?.data?.message || error.message || 'Error uploading candidates. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadSampleFile = () => {
    // Create sample data
    const sampleData = [
      { Name: 'John Doe', 'Contact Number': '9876543210' },
      { Name: 'Jane Smith', 'Contact Number': '8765432109' },
    ];
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
    
    // Generate file and trigger download
    XLSX.writeFile(wb, 'candidate_bulk_upload_sample.xlsx');
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setBulkUploadFile(selectedFile);
      setUploadError(null);
      setUploadResult(null);
      
      try {
        const candidates = await parseExcelFile(selectedFile);
        setPreviewData(candidates);
        
        if (candidates.length === 0) {
          setUploadError('No data found in the Excel file.');
        }
      } catch (error) {
        setUploadError(error.message);
      }
    }
  };

  // Create qualification options from API data
  const qualificationOptions = qualifications.map(qual => ({
    value: qual.name || qual,
    label: qual.name || qual
  }));

  // Create locality options from API data
  const localityOptions = localities.map(locality => ({
    value: locality.name || locality,
    label: locality.name || locality
  }));

  // Filter column options
  const filterColumns = [
    {
      name: "callStatus",
      label: "Call Status",
      options: callStatusOptions
    },
    {
      name: "experience",
      label: "Experience",
      options: experienceOptions
    },
    {
      name: "gender",
      label: "Gender",
      options: genderOptions
    },
    {
      name: "communication",
      label: "Communication",
      options: communicationOptions
    },
    {
      name: "shift",
      label: "Shift Preference",
      options: shiftPreferenceOptions
    },
    {
      name: "noticePeriod",
      label: "Notice Period",
      options: noticePeriodOptions
    },
    {
      name: "relocation",
      label: "Relocation",
      options: relocationOptions
    },
    {
      name: "source",
      label: "Source",
      options: sourceOptions
    },
    {
      name: "qualification",
      label: "Qualification",
      options: qualificationOptions
    },
    {
      name: "locality",
      label: "Locality",
      options: localityOptions
    }
  ];

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Set active filter column
  const setFilterColumn = (columnName) => {
    setActiveFilterColumn(activeFilterColumn === columnName ? null : columnName);
  };

  // Clear all filters of a specific type
  const clearFilterType = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: []
    }));
  };

  // Count total active filters
  const totalActiveFilters = Object.values(filters).reduce(
    (count, filterValues) => count + filterValues.length, 
    0
  );

  const dropdownRef = useRef(null);

  // Add click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    }

    // Add event listener when dropdown is open
    if (showFilterDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterDropdown]);

  // Add a function to highlight matched text
  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    
    const parts = String(text).split(new RegExp(`(${highlight})`, 'gi'));
    
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() 
        ? <span key={index} className="text-red-600 font-medium bg-yellow-100">{part}</span> 
        : part
    );
  };

  const handleSubmitCandidateWithHighlight = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset to page 1 when searching
    setCurrentPage(1);
    // Note: The useEffect will automatically trigger fetch when searchTerm changes
  };

  // Add function to handle copying selected mobile numbers
  const handleCopySelectedNumbers = () => {
    if (selectedCandidates.length === 0) {
      toast.error("No candidates selected");
      return;
    }

    // Get only mobile numbers from selected candidates
    const selectedNumbers = selectedCandidates
      .map(candidateId => {
        const candidate = filteredData.find(c => c._id === candidateId);
        return candidate?.mobileNo;
      })
      .filter(Boolean) // Remove any undefined/null values
      .join('\n'); // Join with newline, not comma

    // Copy to clipboard
    navigator.clipboard.writeText(selectedNumbers)
      .then(() => {
        toast.success(`${selectedCandidates.length} numbers copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy numbers:', err);
        toast.error("Failed to copy numbers");
      });
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      // If currently all selected, deselect all
      setSelectedCandidates([]);
    } else {
      // Select all currently visible candidates
      const visibleCandidates = filteredData
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map(candidate => candidate._id);
      setSelectedCandidates(visibleCandidates);
    }
    setSelectAll(!selectAll);
  };

  // Handle individual candidate selection
  const handleCandidateSelection = (candidateId, isSelected) => {
    if (isSelected) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  // Effect to update selectAll state when page changes
  useEffect(() => {
    const visibleCandidates = filteredData
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map(candidate => candidate._id);

    // Check if all visible candidates are selected
    const allSelected = visibleCandidates.length > 0 && 
      visibleCandidates.every(id => selectedCandidates.includes(id));
    
    setSelectAll(allSelected);
  }, [currentPage, selectedCandidates, filteredData, itemsPerPage]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedCandidates([]);
    setSelectAll(false);
  }, [filters, dateRange, searchTerm]);

  return (
    <>
     <div className="flex justify-between items-center mb-4 mt-4">
          <h1 className="text-2xl font-bold dark:text-[#e2692c] text-[#1a5d96]">
            Call Details
          </h1>
     </div>

     <Toaster position="top-right" />

      <AnimatedContent>
        {/* Fixed position search and filter container */}
        <div className="sticky top-0 left-0 right-0 z-30 pb-4">
          {/* Compact Search Bar with Add New Call Button */}
          <div className="mb-3 flex flex-col sm:flex-row md:flex-row gap-2">
          {/* Duplicity Check */}
            <div className="flex flex-col flex-1 md:max-w-md">
              <div className="flex h-10">
                <div className="relative flex items-center shadow-md bg-white dark:bg-gray-700 rounded-l-md w-full">
                  <input
                    type="text"
                    placeholder="Enter mobile number..."
                    value={mobileNumber}
                    onChange={handleMobileNumberChange}
                    className={`pl-4 pr-3 py-2 w-full h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none rounded-l-md ${
                      (mobileError || duplicateInfo) ? 'border-red-500 dark:border-red-500' : ''
                    }`}
                    maxLength={10}
                  />
                </div>
                <button
                  onClick={() => handleDuplicityCheck()}
                  disabled={checkingDuplicity || mobileNumber.length !== 10 || duplicityCheckCount >= 3}
                  className="px-3 sm:px-4 py-2 h-10 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white flex items-center justify-center gap-1 sm:gap-2 transition-colors rounded-r-md shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <FaUserCheck />
                  <span className="text-xs sm:text-sm whitespace-nowrap">
                    {checkingDuplicity ? 'Checking...' : 'Check Duplicity'}
                  </span>
                </button>
              </div>
              
              {/* Container with fixed height for error messages to prevent UI shifts */}
              <div className="h-6 mt-1 ml-1">
                {/* Mobile validation error message */}
                {mobileError && (
                  <div className="text-xs text-red-500">
                    {mobileError}
                  </div>
                )}
                
                {/* Loading state with checking info */}
                {checkingDuplicity && (
                  <div className="text-xs text-blue-500 flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking candidate status...</span>
                  </div>
                )}
                
                {/* Duplicate info message */}
                {!checkingDuplicity && duplicateInfo && (
                  <div className="text-xs text-red-500 flex items-center">
                    <MdError className="mr-1" />
                    <span>
                      {duplicateInfo.alreadyRegistered 
                        ? "You have already registered this candidate previously."
                        : `Candidate already locked by ${duplicateInfo.lockedBy} for ${duplicateInfo.remainingTime}`
                      }
                      {duplicityCheckCount > 0 && ` (${duplicityCheckCount}/3 checks used)`}
                    </span>
                  </div>
                )}
                
                {/* Show check count when no duplicate info is present */}
                {duplicityCheckCount > 0 && !duplicateInfo && !mobileError && !checkingDuplicity && (
                  <div className="text-xs text-gray-500">
                    {duplicityCheckCount}/3 checks used
                  </div>
                )}
                
                {/* Max checks reached message */}
                {duplicityCheckCount >= 3 && !duplicateInfo && !mobileError && !checkingDuplicity && (
                  <div className="text-xs text-red-500">You have reached the maximum number of checks.</div>
                )}
              </div>
            </div>
            <div className="flex flex-1 md:flex-row">
              <div className="relative flex items-center shadow-md bg-white dark:bg-gray-700 rounded-l-md w-full sm:w-full md:w-96 h-10">
                <FaSearch className="text-gray-500 dark:text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search candidate..."
                  ref={candidateRef}
                  onChange={(e) => handleSubmitCandidateWithHighlight(e)}
                  className="pl-4 pr-3 py-2 h-10 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none rounded-l-md"
                />
              </div>
              <div className="flex h-10">
                <button
                  onClick={navigateToCallInfo}
                  className="px-3 sm:px-4 py-2 h-10 bg-teal-900 dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white flex items-center justify-center gap-1 sm:gap-2 transition-colors shadow-md"
                >
                  <FaPlus />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Add Call</span>
                </button>
                <button
                  onClick={handleBulkUploadModalOpen}
                  className="px-3 sm:px-4 py-2 h-10 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white flex items-center justify-center gap-1 sm:gap-2 transition-colors rounded-r-md shadow-md ml-1"
                >
                  <FaUpload />
                  <span className="text-xs sm:text-sm whitespace-nowrap">Bulk Upload</span>
                </button>
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
              
              {/* Enhanced filter dropdown with all columns and ref for click outside */}
              <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[150px] relative" ref={dropdownRef}>
                <button
                  onClick={toggleFilterDropdown}
                  className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <span className="flex items-center">
                    <FaFilter className="mr-1.5 text-gray-600 dark:text-gray-300" />
                    Filters
                    {totalActiveFilters > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full text-xs">
                        {totalActiveFilters}
                      </span>
                    )}
                  </span>
                  {showFilterDropdown ? <MdExpandLess className="text-gray-600 dark:text-gray-300" /> : <MdExpandMore className="text-gray-600 dark:text-gray-300" />}
                </button>
                
                {/* Enhanced dropdown for all filters */}
                {showFilterDropdown && (
                  <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-40">
                    <div className="p-2">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Filter by</span>
                        <button 
                          onClick={handleResetField}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Reset all
                        </button>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto mt-1">
                        {filterColumns.map(column => (
                          <div key={column.name} className="mb-2 border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => setFilterColumn(column.name)}
                                className="flex items-center justify-between w-full px-2 py-1.5 text-xs font-medium text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                              >
                                <span className="flex items-center">
                                  {column.label}
                                  {filters[column.name].length > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full text-xs">
                                      {filters[column.name].length}
                                    </span>
                                  )}
                                </span>
                                {activeFilterColumn === column.name ? <MdExpandLess /> : <MdExpandMore />}
                              </button>
                              
                              {filters[column.name].length > 0 && (
                                <button
                                  onClick={() => clearFilterType(column.name)}
                                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            
                            {activeFilterColumn === column.name && (
                              <div className="ml-2 mt-1 border-l-2 border-gray-200 dark:border-gray-600 pl-2 max-h-40 overflow-y-auto">
                                {column.options.map(option => (
                                  <div 
                                    key={option.value}
                                    className="flex items-center px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
                                    onClick={() => handleFilterChange(column.name, option.value)}
                                  >
                                    <div className={`w-4 h-4 mr-2 flex items-center justify-center border rounded ${
                                      filters[column.name].includes(option.value) 
                                        ? 'bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600' 
                                        : 'border-gray-300 dark:border-gray-500'
                                    }`}>
                                      {filters[column.name].includes(option.value) && 
                                        <FaCheck className="text-white text-xs" />
                                      }
                                    </div>
                                    <span>{option.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[120px]">
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
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[120px]">
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
                      popperClassName="z-[10000]"
                    />
                  </div>
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[120px]">
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
                      popperClassName="z-[10000]"
                    />
                  </div>
                </>
              ) : dateRangeType === 'month' ? (
                <>
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[130px]">
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
                      popperClassName="z-[10000]"
                    />
                  </div>
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[130px]">
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
                      popperClassName="z-[10000]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.startDate}
                      onChange={(date) => handleDateRangeChange(date, dateRange.endDate)}
                      selectsStart
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="dd-MMM-yyyy"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="Start Date"
                      popperClassName="z-[10000]"
                    />
                  </div>
                  <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[130px]">
                    <DatePicker
                      selected={dateRange.endDate}
                      onChange={(date) => handleDateRangeChange(dateRange.startDate, date)}
                      selectsEnd
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      dateFormat="dd-MMM-yyyy"
                      className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1"
                      placeholderText="End Date"
                      popperClassName="z-[10000]"
                    />
                  </div>
                </>
              )}
              
              {/* Items per page selector */}
              <div className="w-full sm:w-auto md:w-auto sm:flex-none sm:min-w-[100px]">
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
              
              {/* Copy Numbers Button */}
              {selectedCandidates.length > 0 && (
                <div className="w-full sm:w-auto md:w-auto sm:flex-none">
                  <button
                    onClick={handleCopySelectedNumbers}
                    className="flex items-center justify-center w-full px-3 py-1.5 rounded-md text-xs bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    <FaCopy className="mr-1.5" />
                    Copy {selectedCandidates.length} number{selectedCandidates.length !== 1 ? 's' : ''}
                  </button>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </AnimatedContent>

      <span className="text-sm text-gray-700 dark:text-gray-400 mb-1"> Total Records Found : {totalCandidates || filteredData.length}</span>

      {loading ? (
        <CandidatesCardSkeleton count={itemsPerPage} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500 block py-8">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <>
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              <p className="mb-4">No calls match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="px-4 py-2 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Select All Checkbox - Above Cards */}
              <div className="mb-4 flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 cursor-pointer" 
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Select All ({selectedCandidates.length} selected)
                </span>
              </div>

              {/* Cards Grid */}
              <CandidatesCard 
                candidates={filteredData}
                onView={handleView}
                onEdit={handleEdit}
                searchTerm={searchTerm}
                highlightText={highlightText}
                selectedCandidates={selectedCandidates}
                onCandidateSelection={handleCandidateSelection}
                onUnlockDuplicacy={handleUnlockDuplicacy}
                isAdmin={isAdmin}
              />
              
              {/* Pagination controls - at bottom of cards */}
              {filteredData.length > 0 && (
                <div className="flex justify-center items-center mt-6 mb-4 space-x-2">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center p-2 h-9 w-9 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <FaChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
                    Page {currentPage} of {displayTotalPages}
                  </span>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === displayTotalPages}
                    className={`flex items-center justify-center p-2 h-9 w-9 rounded-md ${
                      currentPage === displayTotalPages
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <FaChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : ((candidateRef.current?.value !== "" || dateRange.startDate != null || dateRange.endDate != null) && serviceData?.length === 0) ? (
        <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              <p>No calls match your filter criteria.</p>
              <button
                onClick={handleResetField}
                className="mt-2 px-3 py-1.5 rounded-md text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300"
              >
                Reset Filters
              </button>
            </div>
      ) : (
        <NotFound title="Call Details" />
      )}

      {showViewModal && (
        <CallDetailsViewModal
          call={selectedCall}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCall(null);
          }}
          onTryCall={(call) => {
            setShowViewModal(false);
            handleEdit(call);
          }}
        >
          <div className="mt-4 flex justify-end space-x-3">
            {selectedCall.editable && (
              <button
                onClick={() => {
                  handleEdit(selectedCall);
                  setShowViewModal(false);
                }}
                className="px-3 py-1.5 text-sm rounded-lg font-medium dark:bg-[#e2692c] dark:hover:bg-[#d15a20] text-white bg-[#1a5d96] hover:bg-[#154a7a] transition-colors"
              >
                Edit
              </button>
            )}
            <button
              onClick={() => setShowViewModal(false)}
              className="px-3 py-1.5 text-sm rounded-lg font-medium dark:bg-gray-600 dark:hover:bg-gray-700 dark:text-white bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </CallDetailsViewModal>
      )}

      {showEditModal && (
        <CallDetailsEditModal
          candidateData={selectedCall}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCall(null);
          }}
          onUpdate={handleUpdate}
          isOpen={showEditModal}
          isLocked={selectedCall?.isLocked}
          isRegisteredByMe={selectedCall?.registeredByMe}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl mx-auto" style={{ maxHeight: '90vh' }}>
            <div className="flex justify-between items-center px-4 py-3 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold dark:text-[#e2692c] text-[#1a5d96]">
                Bulk Upload Candidates
              </h3>
              <button
                onClick={handleBulkUploadModalClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 48px)' }}>
              {/* Instructions */}
              <div className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 mb-1 text-sm">
                  Upload an Excel file with candidate data. The file must include columns for Name and Contact Number.
                </p>
                <button
                  onClick={downloadSampleFile}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-xs"
                >
                  <FaFileExcel className="mr-1" /> Download sample Excel file
                </button>
              </div>
              
              {/* File Upload */}
              <div className="mb-4 flex flex-col items-center">
                <div
                  className={`w-full flex flex-col items-center px-2 py-4 rounded-lg shadow tracking-wide border-2 transition-colors duration-200 cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-dashed border-blue-400 bg-white dark:bg-gray-700'}
                    hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900
                    ${uploadResult ? 'pointer-events-none opacity-60' : ''}
                  `}
                  onDragOver={uploadResult ? undefined : handleDragOver}
                  onDragLeave={uploadResult ? undefined : handleDragLeave}
                  onDrop={uploadResult ? undefined : handleDrop}
                  onClick={uploadResult ? undefined : () => document.getElementById('bulk-upload-input').click()}
                  style={{ minHeight: 70 }}
                >
                  <FaUpload className="text-2xl text-[#1a5d96] dark:text-[#e2692c] mb-1" />
                  <span className="text-sm leading-normal text-gray-700 dark:text-gray-300 mb-0.5">
                    {bulkUploadFile ? bulkUploadFile.name : 'Drag & drop or click to select an Excel file'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">(Accepted: .xlsx, .xls)</span>
                  <input
                    id="bulk-upload-input"
                    type="file"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    disabled={!!uploadResult}
                  />
                </div>
              </div>
              
              {/* Preview */}
              {previewData.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
                    Preview ({previewData.length} entries)
                  </h4>
                  <div className="overflow-x-auto rounded-md border dark:border-gray-700">
                    <div className="max-h-40 overflow-y-auto rounded-md">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Contact Number
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {previewData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                              <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                {row.name || <span className="text-red-500">Missing</span>}
                              </td>
                              <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                {row.mobileNo || <span className="text-red-500">Missing</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Message */}
              {uploadError && (
                <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md text-xs">
                  {uploadError}
                </div>
              )}
              
              {/* Upload Results */}
              {uploadResult && (
                <div className="mb-4">
                  <div className={`p-2 rounded-md text-xs ${
                    uploadResult.status === 'success' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
                  }`}>
                    {uploadResult.message}
                  </div>
                  
                  {uploadResult.results && (
                    <div className="mt-2">
                      <h4 className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
                        Upload Results
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-2 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-md text-center">
                          <div className="text-base font-bold text-green-700 dark:text-green-200">
                            {uploadResult.results.successful || 0}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-300">
                            Successful
                          </div>
                        </div>
                        
                        <div className="p-2 bg-red-100 dark:bg-red-800 rounded-md text-center">
                          <div className="text-base font-bold text-red-700 dark:text-red-200">
                            {uploadResult.results.failed || 0}
                          </div>
                          <div className="text-xs text-red-600 dark:text-red-300">
                            Failed
                          </div>
                        </div>
                        
                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-md text-center">
                          <div className="text-base font-bold text-blue-700 dark:text-blue-200">
                            {uploadResult.results.total || 0}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-300">
                            Total
                          </div>
                        </div>
                      </div>
                      
                      {uploadResult.results.details && uploadResult.results.details.length > 0 && (
                        <div className="overflow-x-auto rounded-md border dark:border-gray-700">
                          <div className="max-h-40 overflow-y-auto rounded-md">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                              <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Mobile
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Details
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {uploadResult.results.details.map((item, index) => {
                                  
                                  // Determine if it's a success based on multiple potential attributes
                                  const isSuccess = 
                                    (item.status && 
                                      (String(item.status).toLowerCase().includes('success') || 
                                       String(item.status).toLowerCase().includes('successful'))) ||
                                    (item.isSuccess) ||
                                    (item.success === true) ||
                                    (!item.error && !item.reason) ||
                                    (item.result && String(item.result).toLowerCase().includes('success'));
                                    
                                  return (
                                    <tr key={index} className={isSuccess ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'}>
                                      <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                        {item.name}
                                      </td>
                                      <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                        {item.mobileNo}
                                      </td>
                                      <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                        {item.status}
                                      </td>
                                      <td className="px-3 py-1 whitespace-nowrap text-gray-900 dark:text-gray-300">
                                        {item.reason || item.message || (isSuccess ? 'Added successfully' : '')}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleBulkUpload}
                  disabled={!bulkUploadFile || isUploading || uploadResult}
                  className="px-4 py-2 bg-[#1a5d96] dark:bg-[#e2692c] hover:bg-gray-600 dark:hover:bg-[#d15a20] text-white rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : uploadResult ? (
                    <>
                      <FaUpload />
                      Upload Complete
                    </>
                  ) : (
                    <>
                      <FaUpload />
                      Upload Candidates
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Duplicacy Confirmation Modal */}
      <Modal isOpen={showUnlockModal} onClose={closeUnlockModal}>
        <ModalBody className="text-center custom-modal px-8 pt-6 pb-4">
          <span className="flex justify-center text-3xl mb-6 text-amber-500">
            <FaUnlock />
          </span>
          <h2 className="text-xl font-medium mb-1">
            Are you sure you want to unlock duplicacy for{" "}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              {candidateToUnlock?.name || candidateToUnlock?.mobileNo || "this candidate"}
            </span>?
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            This will remove the lock and allow other employees to register this candidate again.
          </p>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            className="w-full sm:w-auto hover:bg-white hover:border-gray-50"
            layout="outline"
            onClick={closeUnlockModal}
            disabled={unlocking}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmUnlockDuplicacy} 
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
            disabled={unlocking}
          >
            {unlocking ? "Unlocking..." : "Yes, Unlock"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default CallDetails;
