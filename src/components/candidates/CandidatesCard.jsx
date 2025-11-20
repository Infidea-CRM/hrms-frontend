import { FaEdit, FaEye, FaPhoneAlt, FaWhatsapp, FaUnlock } from "react-icons/fa";
import { MdInfo, MdLocationOn, MdWork, MdSchool, MdAccessTime } from "react-icons/md";
import { formatLongDateAndTime } from "@/utils/dateFormatter";
import { getStatusColorClass } from "@/utils/optionsData";
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
      const minutes = parseInt(call.duration?.split(' ')[0]) || 0;
      return total + minutes;
    }, 0);
    
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
      const duration = call.duration || 0;
      const durationText = duration <= 1 ? `${duration} minute` : `${duration} minutes`;
      const dateText = call.date ? formatLongDateAndTime(call.date) : 'Date not available';
      return `Call ${sortedHistory.length - index}: ${durationText} (${dateText})`;
    }).join('\n');
  };

  // Get call summary text
  const getCallSummaryText = (callSummary) => {
    if (!callSummary || callSummary.length === 0) return "No summary";
    if (Array.isArray(callSummary)) {
      return callSummary[0]?.summary || "No summary";
    }
    return callSummary;
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

  const handleCheckboxClick = (e, candidate) => {
    e.stopPropagation();
    const isSelected = selectedCandidates.includes(candidate._id);
    onCandidateSelection(candidate._id, !isSelected);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      {candidates?.map((candidate, i) => {
        const isSelected = selectedCandidates.includes(candidate._id);
        
        return (
          <div
            key={i}
            className={`candidate-card ${isSelected ? 'selected' : ''}`}
          >
            <div className="flex flex-row p-5 gap-5">
              {/* Left Side - Profile Avatar and Checkbox */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxClick({ stopPropagation: () => {} }, candidate)}
                  onClick={(e) => handleCheckboxClick(e, candidate)}
                  className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 cursor-pointer transition-all hover:scale-110"
                />
                {/* Profile Circle */}
                <div className={`profile-avatar ${getAvatarColor(candidate?.name)}`}>
                  {getInitials(candidate?.name || '?')}
                </div>
              </div>

              {/* Middle Section - Main Content */}
              <div className="flex-1 min-w-0">
                {/* Header with Name and Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                      onClick={() => onView(candidate)}
                    >
                      {searchTerm ? highlightText(candidate?.name || 'No Name', searchTerm) : (candidate?.name || 'No Name')}
                    </h3>
                    {/* Status Badge and Time */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`status-badge ${getStatusColor(candidate?.callStatus)}`}>
                        {searchTerm ? highlightText(candidate?.callStatus || 'No status', searchTerm) : (candidate?.callStatus || 'No status')}
                      </span>
                      {candidate?.remainingTime ? (
                        <span className="time-badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {candidate.remainingTime}
                        </span>
                      ) : candidate?.remainingDays ? (
                        <span className="time-badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          {candidate.remainingDays === 1 ? `${candidate.remainingDays} day` : `${candidate.remainingDays} days`}
                        </span>
                      ) : (
                        <span className="time-badge bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-300">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(candidate);
                      }}
                      className="action-button action-button-view"
                      title="View details"
                    >
                      <FaEye className="w-4 h-4" />
                    </button>
                    {candidate?.editable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(candidate);
                        }}
                        className="action-button action-button-edit"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    )}
                    {isAdmin && (candidate?.isLocked || candidate?.alreadyInHistory || candidate?.isLastRegisteredBy) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnlockDuplicacy(candidate);
                        }}
                        className="action-button action-button-unlock"
                        title="Unlock Duplicacy"
                      >
                        <FaUnlock className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content Grid */}
                <div className="card-content-grid">
                  {/* Contact Information */}
                  <div className="info-item">
                    <FaPhoneAlt className="info-item-icon" />
                    <span 
                      className="info-item-text"
                      onClick={() => onView(candidate)}
                    >
                      {searchTerm ? highlightText(candidate?.mobileNo || '-', searchTerm) : (candidate?.mobileNo || '-')}
                    </span>
                  </div>
                  {candidate?.whatsappNo && (
                    <div className="info-item">
                      <FaWhatsapp className="info-item-icon text-green-500" />
                      <span 
                        className="info-item-text"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.whatsappNo, searchTerm) : candidate.whatsappNo}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm">
                    <MdLocationOn className="info-item-icon mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="info-item-text truncate"
                        onClick={() => onView(candidate)}
                        title={candidate?.city || '-'}
                      >
                        {searchTerm ? highlightText(candidate?.city || '-', searchTerm) : (candidate?.city || '-')}
                      </div>
                      {candidate?.locality && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={candidate.locality}>
                          {searchTerm ? highlightText(candidate.locality, searchTerm) : candidate.locality}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Qualification */}
                  {candidate?.qualification && (
                    <div className="info-item">
                      <MdSchool className="info-item-icon" />
                      <span 
                        className="info-item-text truncate"
                        onClick={() => onView(candidate)}
                        title={candidate.qualification}
                      >
                        {searchTerm ? highlightText(candidate.qualification, searchTerm) : candidate.qualification}
                      </span>
                    </div>
                  )}

                  {/* Experience */}
                  {candidate?.experience && (
                    <div className="info-item">
                      <MdWork className="info-item-icon" />
                      <span 
                        className="info-item-text truncate"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.experience, searchTerm) : candidate.experience}
                      </span>
                    </div>
                  )}

                  {/* Profile */}
                  {candidate?.companyProfile && (
                    <div className="flex items-start gap-2 text-sm">
                      <MdWork className="info-item-icon mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div 
                          className="info-item-text truncate"
                          onClick={() => onView(candidate)}
                          title={candidate.companyProfile}
                        >
                          {searchTerm ? highlightText(candidate.companyProfile, searchTerm) : candidate.companyProfile}
                        </div>
                        {candidate?.jobInterestedIn && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={candidate.jobInterestedIn}>
                            {searchTerm ? highlightText(candidate.jobInterestedIn, searchTerm) : candidate.jobInterestedIn}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Communication */}
                  {candidate?.communication && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Communication: </span>
                      <span 
                        className="info-item-text"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.communication, searchTerm) : candidate.communication}
                      </span>
                    </div>
                  )}

                  {/* Shift */}
                  {candidate?.shift && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Shift: </span>
                      <span 
                        className="info-item-text"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.shift, searchTerm) : candidate.shift}
                      </span>
                    </div>
                  )}

                  {/* Notice Period */}
                  {candidate?.noticePeriod && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Notice: </span>
                      <span 
                        className="info-item-text"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.noticePeriod, searchTerm) : candidate.noticePeriod}
                      </span>
                    </div>
                  )}

                  {/* Salary */}
                  {candidate?.salaryExpectation && (
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Salary: </span>
                      <span 
                        className="info-item-text"
                        onClick={() => onView(candidate)}
                      >
                        {searchTerm ? highlightText(candidate.salaryExpectation, searchTerm) : candidate.salaryExpectation}
                      </span>
                    </div>
                  )}

                  {/* Time Spent */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MdAccessTime className="w-3.5 h-3.5" />
                    <span>{getTotalCallDuration(candidate?.employeeCallHistory)}</span>
                    {candidate?.employeeCallHistory && candidate.employeeCallHistory.length > 0 && (
                      <div className="group relative inline-block ml-1">
                        <MdInfo 
                          className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
                        />
                        <div className="hidden group-hover:block absolute z-[9999] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-left transform -translate-x-1/2 bottom-full mb-2">
                          <div className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto max-h-40">
                            {formatCallHistory(candidate.employeeCallHistory)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {candidate?.updatedAt ? formatLongDateAndTime(candidate.updatedAt) : '-'}
                  </div>

                  {/* Last Registered By */}
                  {candidate?.lastRegisteredByName && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      <span>Last Registered By: </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {searchTerm ? highlightText(candidate.lastRegisteredByName, searchTerm) : candidate.lastRegisteredByName}
                      </span>
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

