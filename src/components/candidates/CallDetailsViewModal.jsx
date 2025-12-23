import { formatLongDate, formatLongDateAndTime } from "@/utils/dateFormatter";
import { FaPhoneAlt } from "react-icons/fa";
import { MdInfo } from "react-icons/md";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const CallDetailsViewModal = ({ call, onClose, onTryCall }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    // Focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    // Trap focus within modal
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Handle Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Helper function to check if a date is valid
  const isValidDate = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  };

  // Helper function to format date safely, returning "-" for invalid dates
  const safeFormatDate = (date) => {
    if (!isValidDate(date)) return "-";
    return formatLongDate(date);
  };

  // Helper function to get status color
  const getStatusColorClass = (status) => {
    switch(status) {
      case "Call Back Requested":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Client Call":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Inhouse Hr In Touch":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Lineup":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Not Aligned Anywhere":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      case "Not Looking for Job":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Not Picking Call":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Not Reachable":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Walkin at Infidea":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Calculate total call duration from call history
  const getTotalCallDuration = (callDurationHistory) => {
    if (!callDurationHistory || callDurationHistory.length === 0) return "0 min";
    
    const totalMinutes = callDurationHistory.reduce((total, call) => {
      // Extract numeric value from duration string (assuming format like "5 min")
      const minutes = parseInt(call.duration?.split(' ')[0]) || 0;
      return total + minutes;
    }, 0);
    
    return totalMinutes <= 1 ? `${totalMinutes} minute` : `${totalMinutes} minutes`;
  };

// Format individual call history for tooltip
const formatCallHistory = (callDurationHistory) => {
  if (!callDurationHistory || callDurationHistory.length === 0) return "No call history";
  
  // Sort the call history to show latest calls at the top (descending order by date)
  const sortedHistory = [...callDurationHistory].sort((a, b) => {
    const dateA = a.date ? new Date(a.date) : new Date(0);
    const dateB = b.date ? new Date(b.date) : new Date(0);
    return dateB - dateA;
  });
  
  return sortedHistory.map((call, index) => {
    const duration = call.duration || 0;
    const durationText = duration <= 1 ? `${duration} minute` : `${duration} minutes`;
    const dateText = call.date ? formatLongDateAndTime(call.date) : 'Date not available';
    return `Call ${sortedHistory.length - index}: ${durationText} (${dateText})`;
  }).join('\n');
};

  const formatCallSummary = (callSummary) => {
    if (!callSummary || callSummary.length === 0) return "No call summary";
    
    // Sort by date (newest first) with null checks
    const sortedSummary = [...callSummary].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    return sortedSummary.map((call) => {
      const dateText = call.date ? formatLongDateAndTime(call.date) : 'Date not available';
      const summaryText = call.summary || 'No summary';
      return `${dateText} - ${summaryText}`;
    }).join('\n');
  };


  // Helper function to render field values based on type
  const renderValue = (field) => {
    if (field.isStatus) {
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(field.value)}`}>
          {field.value}
        </span>
      );
    } else if (field.key === "timeSpent") {
      return (
        <div className="flex items-center space-x-1">
          <span>{field.value}</span>
          {call.employeeCallHistory && call.employeeCallHistory.length > 0 && (
             <div className="relative inline-block group">
             <MdInfo 
               className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
               aria-label="Call history details"
             />
             <div className="hidden group-hover:block absolute left-full ml-2 top-1/2 transform -translate-y-1/2 z-[9999] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-left">
               <div className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto max-h-40">
                 {formatCallHistory(call.employeeCallHistory)}
               </div>
             </div>
           </div>
          )}
        </div>
      );
    } else {
      return field.value;
    }
  };
  
  if (!call) return null;

  // Define all view fields in a flat array
  const viewFields = [
    { label: "Candidate Name", key: "customerName", value: call.name },
    { label: "Phone Number", key: "phoneNumber", value: call.mobileNo },
    { label: "WhatsApp Number", key: "whatsappNumber", value: call.whatsappNo},
    { label: "Source", key: "source", value: call.source, show: () => call.source },
    { label: "Gender", key: "gender", value: call.gender },
    { label: "Experience", key: "experience", value: call.experience },
    { label: "Job Interested In", key: "jobInterestedIn", value: call.jobInterestedIn || "Not Specified" },
    { label: "State", key: "state", value: call.state },
    { label: "City", key: "city", value: call.city || "Not Specified" },
    { label: "Locality", key: "locality", value: call.locality || "Not Specified", show: () => call.city?.toLowerCase() === "indore" },
    { label: "Qualification", key: "qualification", value: call.qualification || "Not Specified" },
    { label: "Course", key: "course", value: call.course || "Not Specified" },
    { label: "Completion Status", key: "completionStatus", value: call.completionStatus || "Not Specified" },
    { label: "Completion Year", key: "completionYear", value: call.completionYear || "Not Specified", show: () => call.completionYear && call.completionYear !== "-" },
    { label: "Passing Year", key: "passingYear", value: call.passingYear, show: () => call.passingYear && call.passingYear !== "-" },
    { label: "Current Salary", key: "currentSalary", value: call.currentSalary ? `₹${call.currentSalary}` : "Not Specified" },
    { label: "Expected Salary", key: "salaryExpectations", value: call.salaryExpectation ? `₹${call.salaryExpectation}` : "Not Specified" },
    { label: "Current Department", key: "currentDepartment", value: call.currentDepartment || call.customCurrentDepartment || "Not Specified" },
    { label: "Current Profile", key: "currentProfile", value: call.currentProfile || "Not Specified" },
    { label: "Profile", key: "company", value: call.companyProfile || call.customCompanyProfile, show: () => call.companyProfile || call.customCompanyProfile },
    { label: "Communication Level", key: "levelOfCommunication", value: call.communication },
    { label: "Notice Period", key: "noticePeriod", value: call.noticePeriod || "Not Specified", show: () => call.noticePeriod && call.noticePeriod !== "-" },
    { label: "Shift Preference", key: "shiftPreference", value: call.shift },
    { label: "Relocation", key: "relocation", value: call.relocation, show: () => call.relocation },
    { label: "Work Mode", key: "workMode", value: call.workMode, show: () => call.workMode },
    { label: "Call Date", key: "callDate", value: call.createdAt ? formatLongDate(call.createdAt) : "Not Specified" },
    { label: "Time Spent", key: "timeSpent", value: getTotalCallDuration(call.employeeCallHistory) },
    { label: "Call Status", key: "callStatus", value: call.callStatus, isStatus: true },
    { label: "Data Saved", key: "dataSaved", value: call.dataSaved || "Not Specified" },
    { label: "Company JD", key: "jdReferenceCompany", value: call.jdReferenceCompany, show: () => call.jdReferenceCompany },
    { label: "JD Process", key: "jdReferenceProcess", value: call.jdReferenceProcess, show: () => call.jdReferenceProcess },
    { label: "Walkin Date", key: "walkinDate", value: safeFormatDate(call.walkinDate), show: () => call.callStatus.toLowerCase() === "walkin at infidea" },
    { label: "Lineup Company", key: "lineupCompany", value: call.lineupCompany, show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Lineup Process", key: "lineupProcess", value: call.lineupProcess, show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Lineup Date", key: "lineupDate", value: safeFormatDate(call.lineupDate), show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Interview Date", key: "interviewDate", value: safeFormatDate(call.interviewDate), show: () => call.callStatus.toLowerCase() === "lineup" },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close modal when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-details-title"
    >
      <div 
        ref={modalRef}
        className="relative max-w-7xl mx-auto p-6 pr-8 rounded-xl shadow-lg w-full bg-white dark:bg-gray-800" 
        style={{ maxHeight: '90vh', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="call-details-title" className="text-2xl font-bold text-[#1a5d96] dark:text-[#e2692c]">Call Details</h2>
          <div className="flex items-center gap-3">
            {call.editable && (
              <button 
                onClick={() => onTryCall(call)} 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors text-white"
                aria-label="Try a Call"
              >
                <FaPhoneAlt className="w-4 h-4" />
                <span>Try a Call</span>
              </button>
            )}
            <button 
              ref={closeButtonRef}
              onClick={onClose} 
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {/* Lock Status Banner - Only show when locked by SOMEONE ELSE */}
          {call.isLocked && call.lockedBy && !call.isLastRegisteredBy && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    This candidate is currently locked by <span className="font-semibold">{call.lockedBy}</span>
                    {call.remainingDays !== undefined && (
                      <span className="ml-1">
                        ({call.remainingTime || `${call.remainingDays} day${call.remainingDays !== 1 ? 's' : ''}`} remaining)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-0.5">
                    You can view the candidate details but cannot edit them until the lock expires.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Your Candidate Banner - Show when YOU are the owner */}
          {call.isLastRegisteredBy && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    This is your candidate. You can update the details.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="rounded-xl p-5 shadow-lg border bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4">
              {viewFields.map((field, idx) => {
                if (field.show && !field.show()) return null;
                return (
                  <div key={idx} className="flex flex-col">
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</dt>
                    <dd className="text-sm font-medium mt-1 text-gray-900 dark:text-white">
                      {renderValue(field)}
                    </dd>
                  </div>
                );
              })}
            </div>
          </div>
          {call.callSummary && call.callSummary.length > 0 && (
            <>
              <div className="rounded-xl p-5 shadow-lg border bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[#1a5d96] dark:text-[#e2692c]">Call Summary</h3>
                <p className="text-sm break-words whitespace-pre-line text-gray-700 dark:text-gray-300">{formatCallSummary(call.callSummary)}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

CallDetailsViewModal.propTypes = {
  call: PropTypes.shape({
    name: PropTypes.string,
    mobileNo: PropTypes.string,
    whatsappNo: PropTypes.string,
    source: PropTypes.string,
    gender: PropTypes.string,
    experience: PropTypes.string,
    jobInterestedIn: PropTypes.string,
    state: PropTypes.string,
    city: PropTypes.string,
    locality: PropTypes.string,
    qualification: PropTypes.string,
    course: PropTypes.string,
    completionStatus: PropTypes.string,
    completionYear: PropTypes.string,
    passingYear: PropTypes.string,
    currentSalary: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salaryExpectation: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currentDepartment: PropTypes.string,
    customCurrentDepartment: PropTypes.string,
    currentProfile: PropTypes.string,
    companyProfile: PropTypes.string,
    customCompanyProfile: PropTypes.string,
    communication: PropTypes.string,
    noticePeriod: PropTypes.string,
    shift: PropTypes.string,
    relocation: PropTypes.string,
    workMode: PropTypes.string,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    callStatus: PropTypes.string,
    dataSaved: PropTypes.string,
    jdReferenceCompany: PropTypes.string,
    jdReferenceProcess: PropTypes.string,
    walkinDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    lineupCompany: PropTypes.string,
    lineupProcess: PropTypes.string,
    lineupDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    interviewDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    employeeCallHistory: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })),
    callSummary: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      summary: PropTypes.string
    })),
    editable: PropTypes.bool
  }),
  onClose: PropTypes.func.isRequired,
  onTryCall: PropTypes.func
};

export default CallDetailsViewModal; 