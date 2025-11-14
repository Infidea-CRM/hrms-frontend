import { TableBody, TableCell, TableRow } from "@windmill/react-ui";
import { useState } from "react";
import { FaEdit, FaEye, FaLock, FaUnlock, FaInfoCircle } from "react-icons/fa";

// Internal imports
import { formatLongDateAndTime } from "@/utils/dateFormatter";
import { MdInfo } from "react-icons/md";
import { getStatusColorClass } from "@/utils/optionsData";

const CandidatesTable = ({
  candidates, 
  onView, 
  onEdit, 
  handleDuplicityCheck,
  searchTerm = "", 
  highlightText, 
  selectedCandidates = [], 
  onCandidateSelection
}) => {

  // Use a wrapper function that handles null/undefined status values
  const getStatusColor = (status) => {
    // Ensure status is a non-empty string before applying color
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    return getStatusColorClass(status);
  };

  // Calculate total call duration from call history
  const getTotalCallDuration = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call made yet";
    
    const totalMinutes = employeeCallHistory.reduce((total, call) => {
      // Extract numeric value from duration string (assuming format like "5 min")
      const minutes = parseInt(call.duration?.split(' ')[0]) || 0;
      return total + minutes;
    }, 0);
    
    return totalMinutes <= 1 ? `${totalMinutes} minute` : `${totalMinutes} minutes`;
  };

  // Format individual call history for tooltip
  const formatCallHistory = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call history";
    
    // Sort the call history to show latest calls at the top (descending order by date)
    const sortedHistory = [...employeeCallHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedHistory.map((call, index) => (
      `Call ${employeeCallHistory.length - index}: ${call.duration<=1?`${call.duration} minute`:`${call.duration} minutes`} (${formatLongDateAndTime(call.date)})`
    )).join('\n');
  };

  const formatCallSummary = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call summary";
    
    return employeeCallHistory?.map((call) => call.summary).join('\n');
  };

  // Get formatted call summary text - properly handle objects or arrays
  const getCallSummaryText = (callSummary) => {
    if (!callSummary) return "";
    
    // If it's an array, extract and join the summaries
    if (Array.isArray(callSummary)) {
      return callSummary.map(item => {
        if (typeof item === 'object' && item.summary) {
          return item.summary;
        }
        return typeof item === 'string' ? item : '';
      }).join(', ');
    }
    
    // If it's an object with a summary property
    if (typeof callSummary === 'object' && callSummary.summary) {
      return callSummary.summary;
    }
    
    // If it's a string, use it directly
    if (typeof callSummary === 'string') {
      return callSummary;
    }
    
    // Fallback to empty string for any other type
    return "";
  };

  // Handle checkbox click without triggering row click
  const handleCheckboxClick = (e, candidate) => {
    e.stopPropagation(); // Prevent row click event
    const isSelected = selectedCandidates.includes(candidate._id);
    onCandidateSelection(candidate._id, !isSelected);
  };

  return (
    <>
      <TableBody className="dark:bg-gray-900">
        {candidates?.map((candidate, i) => {
          const isSelected = selectedCandidates.includes(candidate._id);
          
          return (
            <TableRow 
              key={i} 
              className={`text-center transition-colors duration-150
                hover:bg-gray-100 dark:hover:bg-gray-800 ${isSelected ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
            >
              {/* Selection Checkbox */}
              <TableCell className="text-center" onClick={(e) => handleCheckboxClick(e, candidate)}>
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => {}} // Controlled component
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 cursor-pointer" 
                />
              </TableCell>
              
              {/* Actions*/}
              <TableCell className="flex justify-center items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(candidate);
                    }}
                    className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-blue-600 hover:text-blue-700 dark:hover:text-blue-500"
                    title="View details"
                  >
                    <FaEye className="w-3.5 h-3.5" />
                  </button>
                  {candidate?.editable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(candidate);
                      }}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-900 text-green-600 hover:text-green-700 dark:hover:text-green-500"
                      title="Edit"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </TableCell>

              {/* Last Registered By */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.lastRegisteredByName, searchTerm) : candidate?.lastRegisteredByName}
                </span>
              </TableCell>

              {/* Updated Date */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">{formatLongDateAndTime(candidate?.updatedAt)}</span>
              </TableCell>

              {/* Call Status */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${getStatusColor(candidate?.callStatus)}`}>
                  {searchTerm ? highlightText(candidate?.callStatus || 'No status', searchTerm) : (candidate?.callStatus || 'No status')}
                </span>
              </TableCell>
              
              {/* Remaining Days */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                {candidate?.remainingTime ? (
                  <span className="text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5">
                    {candidate.remainingTime}
                  </span>
                ) : candidate?.remainingDays ? (
                  <span className="text-sm rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium px-1.5 py-0.5">
                    {candidate.remainingDays === 1 ? `${candidate.remainingDays} day` : `${candidate.remainingDays} days`}
                  </span>
                ) : (
                  <span className="text-sm inline-flex items-center rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300 text-xs font-medium px-1.5 py-0.5">
                    Free to use
                  </span>
                )}
              </TableCell>
                
              {/* Time Spent */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-sm">{getTotalCallDuration(candidate?.employeeCallHistory)}</span>
                  {candidate?.employeeCallHistory && candidate.employeeCallHistory.length > 0 && (
                    <div className="group inline-block">
                      <MdInfo 
                        className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
                      />
                      <div className="hidden group-hover:block fixed z-[9000] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-left transform -translate-y-full -translate-x-1/2 mt-1">
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto max-h-40">
                          {formatCallHistory(candidate.employeeCallHistory)}
                        </div>
                        <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800 mx-auto"></div>
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>

              {/* Name */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.name, searchTerm) : candidate?.name}
                </span>
              </TableCell>

              {/* Contact Number */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.mobileNo, searchTerm) : candidate?.mobileNo}
                </span>
              </TableCell>

              {/* WhatsApp Number */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.whatsappNo, searchTerm) : candidate?.whatsappNo}
                </span>
              </TableCell>

              {/* Qualification */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.qualification, searchTerm) : candidate?.qualification}
                </span>
              </TableCell>

              {/* Location */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.city, searchTerm) : candidate?.city}
                </span>
              </TableCell>

              {/* Locality */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.locality || "-", searchTerm) : (candidate?.locality || "-")}
                </span>
              </TableCell>

              {/* Experience */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.experience, searchTerm) : candidate?.experience}
                </span>
              </TableCell>

              {/* Communication */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.communication, searchTerm) : candidate?.communication}
                </span>
              </TableCell>

              {/* Profile */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.companyProfile, searchTerm) : candidate?.companyProfile}
                </span>
              </TableCell>

              {/* Job Interested In */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.jobInterestedIn || "-", searchTerm) : (candidate?.jobInterestedIn || "-")}
                </span>
              </TableCell>

              {/* Salary Expectation */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.salaryExpectation, searchTerm) : candidate?.salaryExpectation}
                </span>
              </TableCell>

              {/* Shift Preference */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.shift, searchTerm) : candidate?.shift}
                </span>
              </TableCell>

              {/* Notice Period */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.noticePeriod, searchTerm) : candidate?.noticePeriod}
                </span>
              </TableCell>

              {/* Gender */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.gender, searchTerm) : candidate?.gender}
                </span>
              </TableCell>

              {/* Source */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm">
                  {searchTerm ? highlightText(candidate?.source, searchTerm) : candidate?.source}
                </span>
              </TableCell>

              {/* Call Summary */}
              <TableCell onClick={() => onView(candidate)} className="cursor-pointer">
                <span className="text-sm max-w-xs inline-block overflow-hidden text-ellipsis whitespace-nowrap" title={formatCallSummary(candidate?.callDurationHistory)}>
                  {searchTerm ? 
                    highlightText(getCallSummaryText(candidate?.callSummary), searchTerm) : 
                    getCallSummaryText(candidate?.callSummary)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </>
  );
};

export default CandidatesTable; 