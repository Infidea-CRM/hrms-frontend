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

  // Copy candidate data to clipboard
  const handleCopyCandidateData = (e, candidate) => {
    e.stopPropagation();
    
    const name = candidate?.name || '';
    const mobileNo = candidate?.mobileNo || '';
    const whatsappNo = candidate?.whatsappNo || '';
    
    const dataToCopy = `name - ${name}\nmob no - ${mobileNo}\nwhatsapp no - ${whatsappNo}`;
    
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
        const modifiedText = formatMonthsAgo(candidate?.updatedAt, "Modified");
        const activeText = formatMonthsAgo(candidate?.createdAt || candidate?.updatedAt, "Active");
        
        return (
          <div
            key={i}
            className={`candidate-card-new ${isSelected ? 'selected' : ''}`}
          >
            <div className="candidate-card-content">
              {/* Left Section - Main Details */}
              <div className="candidate-left-section">
                {/* Checkbox */}
                <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxClick({ stopPropagation: () => {} }, candidate)}
                  onClick={(e) => handleCheckboxClick(e, candidate)}
                    className="candidate-checkbox"
                />
              </div>

                {/* Name and Unlock Button */}
                <div className="flex items-center gap-3 mb-3">
                  <h3 
                    className="candidate-name flex-1"
                      onClick={() => onView(candidate)}
                    >
                      {searchTerm ? highlightText(candidate?.name || 'No Name', searchTerm) : (candidate?.name || 'No Name')}
                    </h3>
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
                      Unlock Duplicacy
                      </button>
                    )}
                </div>

                {/* Basic Info with Icons */}
                <div className="candidate-basic-info">
                  {candidate?.experience && (
                    <div className="basic-info-item">
                      <MdWork className="basic-info-icon" />
                      <span className="basic-info-text">
                        {searchTerm ? highlightText(candidate.experience, searchTerm) : candidate.experience}
                      </span>
                    </div>
                  )}
                  {candidate?.city && (
                    <div className="basic-info-item">
                      <MdLocationOn className="basic-info-icon" />
                      <span className="basic-info-text">
                        {searchTerm ? highlightText(candidate.city, searchTerm) : candidate.city}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detailed Attributes - Label: Value format in Grid */}
                <div className="candidate-details">
                  {/* Current Status */}
                  {candidate?.callStatus && (
                    <div className="detail-item">
                      <span className="detail-label">Current:</span>
                      <span className={`detail-value highlight-status ${getStatusColor(candidate.callStatus)}`}>
                        {searchTerm ? highlightText(candidate.callStatus, searchTerm) : candidate.callStatus}
                        {candidate?.currentProfile && ` at ${candidate.currentProfile}`}
                      </span>
                    </div>
                  )}

                  {/* Preferred Location */}
                  {candidate?.city && (
                    <div className="detail-item">
                      <span className="detail-label">Pref. location:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.city, searchTerm) : candidate.city}
                      </span>
                    </div>
                  )}

                  {/* Key Skills */}
                  {(candidate?.communication || candidate?.qualification) && (
                    <div className="detail-item skills-item">
                      <span className="detail-label">Key skills:</span>
                      <span className="detail-value skills-list">
                        {[
                          candidate.communication,
                          candidate.qualification,
                          candidate.experience
                        ].filter(Boolean).join(' | ')}
                      </span>
                    </div>
                  )}

                  {/* Languages */}
                  {candidate?.language && (
                    <div className="detail-item">
                      <span className="detail-label">May also know:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.language, searchTerm) : candidate.language}
                      </span>
                    </div>
                  )}

                  {/* Additional fields */}
                  {candidate?.qualification && (
                    <div className="detail-item">
                      <span className="detail-label">Qualification:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.qualification, searchTerm) : candidate.qualification}
                      </span>
                    </div>
                  )}

                  {candidate?.jobInterestedIn && (
                    <div className="detail-item">
                      <span className="detail-label">Job Interested:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.jobInterestedIn, searchTerm) : candidate.jobInterestedIn}
                      </span>
                    </div>
                  )}

                  {candidate?.currentSalary && (
                    <div className="detail-item">
                      <span className="detail-label">Current Salary:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.currentSalary, searchTerm) : candidate.currentSalary}
                      </span>
                    </div>
                  )}

                  {candidate?.salaryExpectation && (
                    <div className="detail-item">
                      <span className="detail-label">Expected Salary:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.salaryExpectation, searchTerm) : candidate.salaryExpectation}
                      </span>
                    </div>
                  )}

                  {candidate?.mobileNo && (
                    <div className="detail-item">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value flex items-center gap-2">
                        <span>{searchTerm ? highlightText(candidate.mobileNo, searchTerm) : candidate.mobileNo}</span>
                        <button
                          onClick={(e) => handleCopyCandidateData(e, candidate)}
                          className="copy-button"
                          title="Copy candidate details"
                        >
                          <CopyOutlined className="copy-icon" />
                        </button>
                      </span>
                    </div>
                  )}

                  {/* WhatsApp Number */}
                  {candidate?.whatsappNo && (
                    <div className="detail-item">
                      <span className="detail-label">WhatsApp:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.whatsappNo, searchTerm) : candidate.whatsappNo}
                      </span>
                    </div>
                  )}

                  {/* Last Registered By */}
                  {candidate?.lastRegisteredByName && (
                    <div className="detail-item">
                      <span className="detail-label">Last Registered By:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.lastRegisteredByName, searchTerm) : candidate.lastRegisteredByName}
                      </span>
                    </div>
                  )}

                  {/* Company Profile */}
                  {(candidate?.companyProfile || candidate?.customCompanyProfile) && (
                    <div className="detail-item">
                      <span className="detail-label">Company Profile:</span>
                      <span className="detail-value">
                        {searchTerm ? highlightText(candidate.companyProfile || candidate.customCompanyProfile, searchTerm) : (candidate.companyProfile || candidate.customCompanyProfile)}
                      </span>
                    </div>
                  )}
                  {(!candidate?.companyProfile && !candidate?.customCompanyProfile) && (
                    <div className="detail-item">
                      <span className="detail-label">Company Profile:</span>
                      <span className="detail-value">-</span>
                    </div>
                  )}

                  {/* Time Spent */}
                  <div className="detail-item">
                    <span className="detail-label">Time Spent:</span>
                    <span className="detail-value flex items-center gap-1 inline-flex">
                    <span>{getTotalCallDuration(candidate?.employeeCallHistory)}</span>
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
                    </span>
                  </div>
                    </div>
                    </div>

              {/* Right Section - Profile & Actions */}
              <div className="candidate-right-section">
                {/* Profile Avatar */}
                <div className={`profile-avatar-large ${getAvatarColor(candidate?.name)}`}>
                  {getInitials(candidate?.name || '?')}
                    </div>

                {/* Summary Text */}
                <div className="candidate-summary">
                  {searchTerm ? highlightText(summary, searchTerm) : summary}
                    </div>

                {/* Action Buttons */}
                <div className="candidate-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(candidate);
                    }}
                    className="action-btn-primary"
                  >
                    View candidate's details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (candidate?.mobileNo) {
                        window.location.href = `tel:${candidate.mobileNo}`;
                      }
                    }}
                    className="action-btn-secondary"
                  >
                    <FaPhoneAlt className="action-btn-icon" />
                    Call candidate
                  </button>
                    </div>

                {/* Save Status */}
                <div className="candidate-links">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add save functionality
                    }}
                    className="link-button"
                  >
                    <FaBookmark className="link-icon" />
                    {candidate?.dataSaved === "Saved" ? "Saved" : "Not Saved"}
                  </button>
                    </div>
                  </div>

                  </div>

            {/* Footer Bar */}
            <div className="candidate-footer">
      
              <div className="footer-item">
                <span className="footer-text">
                  {modifiedText || 'Not modified'}
                      </span>
                    </div>
              <div className="footer-item">
                <span className="footer-text">
                  {activeText || 'Not active'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidatesCard;

