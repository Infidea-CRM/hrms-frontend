import { FaEdit, FaPhoneAlt, FaWhatsapp, FaUnlock, FaBookmark } from "react-icons/fa";
import { MdInfo, MdLocationOn, MdWork, MdSchool, MdAccessTime } from "react-icons/md";
import { CopyOutlined } from "@ant-design/icons";
import { formatLongDateAndTime } from "@/utils/dateFormatter";
import { getStatusColorClass } from "@/utils/optionsData";
import { notifySuccess } from "@/utils/toast";
import "./CandidatesCard.css";

const CandidatesCard = ({
  candidates,
  onView,
  onEdit,
  searchTerm = "",
  highlightText,
  selectedCandidates = [],
  onCandidateSelection,
  onUnlockDuplicacy,
  isAdmin = false,
}) => {
  // Use a wrapper function that handles null/undefined status values
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    return getStatusColorClass(status);
  };

  // Calculate total call duration from call history
  const getTotalCallDuration = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call made yet";
    
    const totalMinutes = employeeCallHistory.reduce((total, call) => {
      // Handle duration as string number (e.g., "5") or number
      let minutes = 0;
      if (typeof call.duration === 'string') {
        // If it's a string, try to parse it (could be "5" or "5 minutes")
        const parsed = parseInt(call.duration.split(' ')[0]);
        minutes = isNaN(parsed) ? 0 : parsed;
      } else if (typeof call.duration === 'number') {
        minutes = call.duration;
      }
      return total + minutes;
    }, 0);
    
    if (totalMinutes === 0) return "No call made yet";
    return totalMinutes <= 1 ? `${totalMinutes} minute` : `${totalMinutes} minutes`;
  };

  // Format individual call history for tooltip
  const formatCallHistory = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call history";
    
    const sortedHistory = [...employeeCallHistory].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : new Date(0);
      const dateB = b.date ? new Date(b.date) : new Date(0);
      return dateB - dateA;
    });
    
    return sortedHistory.map((call, index) => {
      let durationText = '0 minutes';
      if (typeof call.duration === 'string') {
        const parsed = parseInt(call.duration.split(' ')[0]);
        const minutes = isNaN(parsed) ? 0 : parsed;
        durationText = minutes <= 1 ? `${minutes} minute` : `${minutes} minutes`;
      } else if (typeof call.duration === 'number') {
        durationText = call.duration <= 1 ? `${call.duration} minute` : `${call.duration} minutes`;
      }
      const dateText = call.date ? formatLongDateAndTime(call.date) : 'Date not available';
      return `Call ${sortedHistory.length - index}: ${durationText} (${dateText})`;
    }).join('\n');
  };

  // Get call summary text - properly handle objects or arrays
  const getCallSummaryText = (callSummary) => {
    if (!callSummary) return "No summary";
    
    // If it's an array, extract and join the summaries
    if (Array.isArray(callSummary)) {
      const summaries = callSummary.map(item => {
        if (typeof item === 'object' && item.summary) {
          return item.summary;
        }
        return typeof item === 'string' ? item : '';
      }).filter(Boolean);
      
      return summaries.length > 0 ? summaries.join(', ') : "No summary";
    }
    
    // If it's an object with a summary property
    if (typeof callSummary === 'object' && callSummary.summary) {
      return callSummary.summary;
    }
    
    // If it's a string, use it directly
    if (typeof callSummary === 'string') {
    return callSummary;
    }
    
    // Fallback
    return "No summary";
  };

  // Copy candidate name, phone number, and WhatsApp number to clipboard (Excel format - tab separated)
  const handleCopyCandidateData = (e, candidate) => {
    e.stopPropagation();
    
    const name = candidate?.name || '';
    const mobileNo = candidate?.mobileNo || '';
    const whatsappNo = candidate?.whatsappNo && candidate.whatsappNo !== "-" ? candidate.whatsappNo : '';
    
    // Tab-separated format for Excel (will paste into 3 columns)
    const dataToCopy = `${name}\t${mobileNo}\t${whatsappNo}`;
    
    navigator.clipboard.writeText(dataToCopy).then(() => {
      notifySuccess("Copied to clipboard!");
    }).catch((err) => {
      console.error("Failed to copy:", err);
    });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      // If name has multiple parts, take first letter of first and last name
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1) {
      // If only one part, take first letter
      return nameParts[0][0].toUpperCase();
    }
    return "?";
  };

  // Get background color for avatar based on name
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-500";
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Calculate months since date
  const getMonthsAgo = (date) => {
    if (!date) return null;
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  };

  // Format "Modified in last X months" or "Active in last X months"
  const formatMonthsAgo = (date, prefix = "Modified") => {
    const months = getMonthsAgo(date);
    if (months === null) return null;
    if (months === 0) return `${prefix} today`;
    if (months === 1) return `${prefix} in last month`;
    return `${prefix} in last ${months} months`;
  };


  const handleCheckboxClick = (e, candidate) => {
    e.stopPropagation();
    const isSelected = selectedCandidates.includes(candidate._id);
    onCandidateSelection(candidate._id, !isSelected);
  };

  return (
    <div className="flex flex-col gap-3 mb-6">
      {candidates?.map((candidate, i) => {
        const isSelected = selectedCandidates.includes(candidate._id);
        const summary = getCallSummaryText(candidate?.callSummary);
        
        return (
          <div
            key={i}
            className={`candidate-card-new ${isSelected ? 'selected' : ''}`}
          >
            <div className="candidate-card-content">
                {/* Checkbox */}
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxClick({ stopPropagation: () => {} }, candidate)}
                  onClick={(e) => handleCheckboxClick(e, candidate)}
                    className="candidate-checkbox"
                />
              </div>

              {/* Left Section - Main Details */}
              <div className="candidate-left-section">
                {/* Header: Name, Avatar, Unlock Button */}
                <div className="candidate-header">
                  <div className="header-left">
                    <div className={`profile-avatar-compact ${getAvatarColor(candidate?.name)}`}>
                      {getInitials(candidate?.name || '?')}
                    </div>
                    <div className="header-info">
                      <div className="name-salary-wrapper">
                        <h3 
                          className="candidate-name"
                      onClick={() => onView(candidate)}
                    >
                      {searchTerm ? highlightText(candidate?.name || 'No Name', searchTerm) : (candidate?.name || 'No Name')}
                    </h3>
                        {/* Salary - Next to Name in Light Grey */}
                        {((candidate?.currentSalary && candidate.currentSalary !== "-") || candidate?.salaryExpectation) && (
                          <span className="salary-text-inline">
                            {candidate?.currentSalary && candidate.currentSalary !== "-" && (
                              <span className="current-salary">
                                {searchTerm ? highlightText(candidate.currentSalary, searchTerm) : candidate.currentSalary}
                              </span>
                            )}
                            {candidate?.salaryExpectation && (
                              <>
                                {candidate?.currentSalary && candidate.currentSalary !== "-" && <span className="salary-separator">, </span>}
                                <span className="expected-salary">
                                  expected ({searchTerm ? highlightText(candidate.salaryExpectation, searchTerm) : candidate.salaryExpectation})
                                </span>
                              </>
                            )}
                          </span>
                        )}
                        {/* Summary - After Expected Salary in Available Space */}
                        {summary && summary !== "No summary" && (
                          <span className="summary-text-inline">
                            {searchTerm ? highlightText(summary, searchTerm) : summary}
                          </span>
                        )}
                      </div>
                      <div className="candidate-basic-info">
                        {candidate?.experience && (
                          <span className="basic-info-badge">
                            <MdWork className="basic-info-icon" />
                            {searchTerm ? highlightText(candidate.experience, searchTerm) : candidate.experience}
                          </span>
                        )}
                        {candidate?.city && (
                          <span className="basic-info-badge">
                            <MdLocationOn className="basic-info-icon" />
                            {searchTerm ? highlightText(candidate.city, searchTerm) : candidate.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (candidate?.isLocked || candidate?.alreadyInHistory || candidate?.isLastRegisteredBy) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnlockDuplicacy(candidate);
                      }}
                      className="action-btn-unlock-inline"
                      title="Unlock Duplicacy"
                    >
                      <FaUnlock className="action-btn-icon" />
                      Unlock
                      </button>
                  )}
                </div>

                {/* Status Badge */}
                  {candidate?.callStatus && (
                  <div className="status-wrapper">
                    <span className={`status-badge-compact ${getStatusColor(candidate.callStatus)}`}>
                        {searchTerm ? highlightText(candidate.callStatus, searchTerm) : candidate.callStatus}
                      {candidate?.currentProfile && ` • ${candidate.currentProfile}`}
                      </span>
                    </div>
                  )}

                {/* Important Details Grid */}
                <div className="candidate-details-compact">
                  {candidate?.jobInterestedIn && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Job Interested:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.jobInterestedIn, searchTerm) : candidate.jobInterestedIn}
                      </span>
                    </div>
                  )}

                  {/* Phone & WhatsApp - Combined with Icons */}
                  {(candidate?.mobileNo || (candidate?.whatsappNo && candidate.whatsappNo !== "-")) && (
                    <div className="detail-compact contact-detail">
                      <span className="detail-label-compact">Contact:</span>
                      <span className="detail-value-compact flex items-center gap-2 flex-wrap">
                        {candidate?.mobileNo && (
                          <span className="phone-number-wrapper flex items-center gap-1.5">
                            <FaPhoneAlt className="phone-icon text-gray-600 dark:text-gray-400" />
                            <span>{searchTerm ? highlightText(candidate.mobileNo, searchTerm) : candidate.mobileNo}</span>
                          </span>
                        )}
                        {candidate?.mobileNo && candidate?.whatsappNo && candidate.whatsappNo !== "-" && (
                          <span className="contact-separator text-gray-400 dark:text-gray-500">/</span>
                        )}
                        {candidate?.whatsappNo && candidate.whatsappNo !== "-" && (
                          <span className="whatsapp-number-wrapper flex items-center gap-1.5">
                            <FaWhatsapp className="whatsapp-icon text-green-600 dark:text-green-400" />
                            <span>{searchTerm ? highlightText(candidate.whatsappNo, searchTerm) : candidate.whatsappNo}</span>
                          </span>
                        )}
                      </span>
                    </div>
                  )}


                  {candidate?.noticePeriod && candidate.noticePeriod !== "-" && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Notice Period:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.noticePeriod, searchTerm) : candidate.noticePeriod}
                      </span>
                    </div>
                  )}

                  {candidate?.qualification && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Qualification:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.qualification, searchTerm) : candidate.qualification}
                      </span>
                    </div>
                  )}

                  {candidate?.completionYear && candidate.completionYear !== "-" && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Completion Year:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.completionYear, searchTerm) : candidate.completionYear}
                      </span>
                    </div>
                  )}

                  {candidate?.communication && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Communication:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.communication, searchTerm) : candidate.communication}
                      </span>
                    </div>
                  )}

                  {candidate?.course && candidate.course !== "-" && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Course:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.course, searchTerm) : candidate.course}
                      </span>
                    </div>
                  )}

                  {candidate?.lastRegisteredByName && (
                    <div className="detail-compact">
                      <span className="detail-label-compact">Registered By:</span>
                      <span className="detail-value-compact">
                        {searchTerm ? highlightText(candidate.lastRegisteredByName, searchTerm) : candidate.lastRegisteredByName}
                      </span>
                    </div>
                  )}
                    </div>
                    </div>

              {/* Right Section - Actions */}
              <div className="candidate-right-section">
                <div className="action-buttons-wrapper">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(candidate);
                    }}
                    className="action-btn-primary-compact"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => handleCopyCandidateData(e, candidate)}
                    className="action-btn-copy-compact"
                    title="Copy candidate phone number name"
                  >
                    <CopyOutlined className="action-btn-icon" />
                    Copy
                  </button>
                </div>
                <div className="time-spent-wrapper">
                  <span className="time-spent-text">
                    {getTotalCallDuration(candidate?.employeeCallHistory)}
                  </span>
                    {candidate?.employeeCallHistory && candidate.employeeCallHistory.length > 0 && (
                        <div className="group relative inline-block">
                        <MdInfo 
                          className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
                        />
                          <div className="hidden group-hover:block absolute z-[9999] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-left transform -translate-x-1/2 bottom-full mb-2 left-1/2">
                          <div className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto max-h-40">
                            {formatCallHistory(candidate.employeeCallHistory)}
                          </div>
                        </div>
                      </div>
                    )}
                    </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidatesCard;

