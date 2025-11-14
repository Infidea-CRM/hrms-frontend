import { formatLongDate, formatLongDateAndTime } from "@/utils/dateFormatter";
import { FaPhoneAlt } from "react-icons/fa";
import { MdInfo } from "react-icons/md";

const CallDetailsViewModal = ({ call, onClose, onTryCall }) => {
  

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
  const sortedHistory = [...callDurationHistory].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  return sortedHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map((call, index) => (
    `Call ${callDurationHistory.length - index}: ${call.duration<=1?`${call.duration} minute`:`${call.duration} minutes`} (${formatLongDateAndTime(call.date)})`
  )).join('\n');
};

  const formatCallSummary = (callSummary) => {
    if (!callSummary || callSummary.length === 0) return "No call summary";
    
    return callSummary?.sort((a, b) => new Date(b.date) - new Date(a.date)).map((call) => `${formatLongDateAndTime(call.date)} - ${call.summary}`).join('\n');
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
             <div className="static inline-block">
             <MdInfo className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
               onMouseEnter={(e) => {
                 const tooltip = e.currentTarget.nextElementSibling;
                 if (tooltip) tooltip.classList.remove('hidden');
               }}
               onMouseLeave={(e) => {
                 const tooltip = e.currentTarget.nextElementSibling;
                 if (tooltip) tooltip.classList.add('hidden');
               }}
             />
             <div className="hidden absolute z-[9999] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg transform -translate-x-1/2  text-left">
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
    { label: "Source", key: "source", value: call.source },
    { label: "Gender", key: "gender", value: call.gender },
    { label: "Experience", key: "experience", value: call.experience },
    { label: "Qualification", key: "qualification", value: call.qualification || "Not Specified" },
    { label: "Passing Year", key: "passingYear", value: call.passingYear || "Not Specified" },
    { label: "State", key: "state", value: call.state },
    { label: "City", key: "city", value: call.city || "Not Specified" },
    { label: "Locality", key: "locality", value: call.locality || "Not Specified", show: () => call.city?.toLowerCase() === "indore" },
    { label: "Profile", key: "company", value: call.companyProfile || "Not Specified" },
    { label: "Job Interested In", key: "jobInterestedIn", value: call.jobInterestedIn || "Not Specified" },
    { label: "Salary Expectation", key: "salaryExpectations", value: call.salaryExpectation ? `₹${call.salaryExpectation}` : "Not Specified" },
    { label: "Communication", key: "levelOfCommunication", value: call.communication },
    { label: "Notice Period", key: "noticePeriod", value: call.noticePeriod },
    { label: "Work Mode", key: "workMode", value: call.workMode || "Not Specified" },
    { label: "Shift Preference", key: "shiftPreference", value: call.shift },
    { label: "Relocation", key: "relocation", value: call.relocation },
    { label: "Call Date", key: "callDate", value: call.createdAt ? formatLongDate(call.createdAt) : "Not Specified" },
    { label: "Time Spent", key: "timeSpent", value: getTotalCallDuration(call.employeeCallHistory) },
    { label: "Call Status", key: "callStatus", value: call.callStatus, isStatus: true },
    { label: "Walkin Date", key: "walkinDate", value: call.walkinDate ? formatLongDate(call.walkinDate) : "Not Specified", show: () => call.callStatus.toLowerCase() === "walkin at infidea" },
    { label: "Lineup Company", key: "lineupCompany", value: call.lineupCompany, show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Lineup Process", key: "lineupProcess", value: call.lineupProcess, show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Lineup Date", key: "lineupDate", value: call.lineupDate ? formatLongDate(call.lineupDate) : "Not Specified", show: () => call.callStatus.toLowerCase() === "lineup" },
    { label: "Interview Date", key: "interviewDate", value: call.interviewDate ? formatLongDate(call.interviewDate) : "Not Specified", show: () => call.callStatus.toLowerCase() === "lineup" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl mx-auto p-6 pr-8 rounded-xl shadow-lg w-full bg-white dark:bg-gray-800" style={{ maxHeight: '90vh', overflow: 'hidden' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1a5d96] dark:text-[#e2692c]">Call Details</h2>
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
              onClick={onClose} 
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
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
          {call.employeeCallHistory && call.employeeCallHistory.length > 0 && (
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

export default CallDetailsViewModal; 