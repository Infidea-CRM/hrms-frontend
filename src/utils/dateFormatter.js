/**
 * Date and time formatting utility for Indian formats
 */

// For consistent formatting using the India locale
const INDIA_LOCALE = "en-IN";

/**
 * Format date to DD/MM/YYYY (Indian standard format)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatStandardDate = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(INDIA_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/**
 * Format date to DD-MM-YYYY (Indian alternate format)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatHyphenatedDate = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj
    .toLocaleDateString(INDIA_LOCALE, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");
};

/**
 * Format date to DD MMM YYYY (e.g., 15 Jan 2023)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatLongDate = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(INDIA_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format date to full month name (e.g., 15 January 2023)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatFullMonthDate = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(INDIA_LOCALE, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Format date to Day, DD Month YYYY (e.g., Monday, 15 January 2023)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDayNameDate = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(INDIA_LOCALE, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Format time in 12-hour format (e.g., 02:30 PM)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time
 */
export const format12HourTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString(INDIA_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format time in 24-hour format (e.g., 14:30)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time
 */
export const format24HourTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString(INDIA_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format time in 24-hour format with seconds (e.g., 14:30:45)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time
 */
export const format24HourTimeWithSeconds = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toLocaleTimeString(INDIA_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

/**
 * Format date and time together (e.g., 15/01/2023, 02:30 PM)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateAndTime = (date) => {
  if (!date) return "";
  return `${formatStandardDate(date)}, ${format12HourTime(date)}`;
};

export const formatLongDateAndTime = (date) => {
  if (!date) return "";
  return `${formatLongDate(date)}, ${format12HourTime(date)}`;
};

/**
 * Format date and time together with 24-hour time (e.g., 15/01/2023, 14:30)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date and time
 */
export const formatDateAndTime24Hour = (date) => {
  if (!date) return "";
  return `${formatStandardDate(date)}, ${format24HourTime(date)}`;
};

/**
 * Format date and time in ISO 8601 format (e.g., 2023-01-15T14:30:45.000Z)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date and time in ISO format
 */
export const formatISODateTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  return dateObj.toISOString();
};

/**
 * Get relative time (e.g., "2 hours ago", "yesterday", "3 days ago")
 * @param {Date|string|number} date - Date to format
 * @returns {string} Relative time
 */
export const getRelativeTime = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now - dateObj);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes === 0) {
        return "just now";
      }
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    }
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays === 1) {
    return "yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return formatStandardDate(date);
  }
};

/**
 * Format date for Indian financial year (e.g., FY 2023-24)
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted financial year
 */
export const formatFinancialYear = (date) => {
  if (!date) return "";
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();

  // Indian financial year starts from April
  const fyStartYear = month >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;

  return `FY ${fyStartYear}-${String(fyEndYear).slice(-2)}`;
};
