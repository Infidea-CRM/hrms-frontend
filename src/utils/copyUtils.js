/**
 * Reusable utility functions for copying candidate data to clipboard
 * Used in CallDetails, Lineups, and other pages
 */

import { notifySuccess, notifyError } from "./toast";

/**
 * Get formatted candidate data for clipboard (tab-separated for Excel)
 * @param {Object} candidate - The candidate object
 * @param {Object} options - Configuration options
 * @param {string} options.nameField - Field name for candidate name (default: 'name')
 * @param {string} options.mobileField - Field name for mobile number (default: 'mobileNo')
 * @param {string} options.whatsappField - Field name for whatsapp number (default: 'whatsappNo')
 * @returns {string} Tab-separated string (name, mobile, whatsapp)
 */
export const formatCandidateForClipboard = (candidate, options = {}) => {
  const {
    nameField = 'name',
    mobileField = 'mobileNo',
    whatsappField = 'whatsappNo',
  } = options;

  // Handle different field names (candidateName for lineups, name for candidates)
  const name = candidate?.[nameField] || candidate?.candidateName || candidate?.name || '';
  
  // Handle different mobile field names (contactNumber for lineups, mobileNo for candidates)
  const mobileNo = candidate?.[mobileField] || candidate?.contactNumber || candidate?.mobileNo || '';
  
  // Handle whatsapp field
  const whatsappNo = candidate?.[whatsappField] && candidate[whatsappField] !== "-" 
    ? candidate[whatsappField] 
    : (candidate?.whatsappNo && candidate.whatsappNo !== "-" ? candidate.whatsappNo : '');

  // Tab-separated format for Excel (will paste into 3 columns)
  return `${name}\t${mobileNo}\t${whatsappNo}`;
};

/**
 * Copy a single candidate's data to clipboard
 * @param {Object} candidate - The candidate object
 * @param {Object} options - Configuration options for field names
 * @param {Event} event - Optional event to stop propagation
 * @returns {Promise<boolean>} - Whether the copy was successful
 */
export const copySingleCandidate = async (candidate, options = {}, event = null) => {
  if (event) {
    event.stopPropagation();
  }

  if (!candidate) {
    notifyError("No candidate data to copy");
    return false;
  }

  const dataToCopy = formatCandidateForClipboard(candidate, options);

  try {
    await navigator.clipboard.writeText(dataToCopy);
    notifySuccess("Copied to clipboard!");
    return true;
  } catch (err) {
    console.error("Failed to copy candidate data:", err);
    notifyError("Failed to copy to clipboard");
    return false;
  }
};

/**
 * Copy multiple candidates' data to clipboard
 * @param {string[]} selectedIds - Array of selected candidate IDs
 * @param {Object[]} allCandidates - Array of all candidate objects
 * @param {Object} options - Configuration options
 * @param {string} options.idField - Field name for candidate ID (default: '_id')
 * @param {string} options.nameField - Field name for candidate name
 * @param {string} options.mobileField - Field name for mobile number
 * @param {string} options.whatsappField - Field name for whatsapp number
 * @returns {Promise<boolean>} - Whether the copy was successful
 */
export const copyMultipleCandidates = async (selectedIds, allCandidates, options = {}) => {
  const { idField = '_id', ...formatOptions } = options;

  if (!selectedIds || selectedIds.length === 0) {
    notifyError("No candidates selected");
    return false;
  }

  // Get candidate data for each selected ID
  const candidatesData = selectedIds
    .map(candidateId => {
      const candidate = allCandidates.find(c => c[idField] === candidateId);
      if (!candidate) return null;
      return formatCandidateForClipboard(candidate, formatOptions);
    })
    .filter(Boolean) // Remove any null values
    .join('\n'); // Join with newline - each candidate on a new line

  if (!candidatesData) {
    notifyError("Could not find selected candidates");
    return false;
  }

  try {
    await navigator.clipboard.writeText(candidatesData);
    const count = selectedIds.length;
    notifySuccess(`${count} candidate${count !== 1 ? 's' : ''} copied to clipboard!`);
    return true;
  } catch (err) {
    console.error("Failed to copy candidate data:", err);
    notifyError("Failed to copy to clipboard");
    return false;
  }
};

/**
 * React hook for managing candidate selection and copy functionality
 * @returns {Object} Selection state and handlers
 */
export const createSelectionHandlers = (setSelectedCandidates, setSelectAll) => {
  /**
   * Handle select all checkbox
   * @param {Object[]} visibleCandidates - Currently visible candidates
   * @param {boolean} currentSelectAll - Current select all state
   * @param {string} idField - Field name for candidate ID
   */
  const handleSelectAll = (visibleCandidates, currentSelectAll, idField = '_id') => {
    if (currentSelectAll) {
      // If currently all selected, deselect all
      setSelectedCandidates([]);
    } else {
      // Select all currently visible candidates
      const visibleIds = visibleCandidates.map(candidate => candidate[idField]);
      setSelectedCandidates(visibleIds);
    }
    setSelectAll(!currentSelectAll);
  };

  /**
   * Handle individual candidate selection
   * @param {string} candidateId - The candidate ID
   * @param {boolean} isSelected - Whether to select or deselect
   * @param {Object[]} visibleCandidates - Currently visible candidates
   * @param {string} idField - Field name for candidate ID
   */
  const handleCandidateSelection = (candidateId, isSelected, visibleCandidates, idField = '_id') => {
    if (isSelected) {
      setSelectedCandidates(prev => [...prev, candidateId]);
      // Check if all visible candidates are now selected
      const visibleIds = visibleCandidates.map(c => c[idField]);
      setSelectedCandidates(prev => {
        const newSelected = [...prev, candidateId];
        if (visibleIds.every(id => newSelected.includes(id))) {
          setSelectAll(true);
        }
        return newSelected;
      });
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
      setSelectAll(false);
    }
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setSelectedCandidates([]);
    setSelectAll(false);
  };

  return {
    handleSelectAll,
    handleCandidateSelection,
    clearSelection,
  };
};

export default {
  formatCandidateForClipboard,
  copySingleCandidate,
  copyMultipleCandidates,
  createSelectionHandlers,
};

