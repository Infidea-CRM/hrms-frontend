import requests from "./httpService";

const EmployeeServices = {
  /**
   * Send OTP for Employee registration
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   */
  sendEmployeeOtp: async (body) => {
    return requests.post("/auth/employee/send-otp", body);
  },

  /**
   * Resend OTP for Employee registration
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   */
  resendEmployeeOtp: async (body) => {
    return requests.post("/auth/employee/resend-otp", body);
  },

  /**
   * Verify OTP for Employee registration
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   * @param {string} body.otp - OTP received via email
   */
  verifyEmployeeOtp: async (body) => {
    return requests.post("/auth/employee/verify-otp", body);
  },

  /**
   * Register a new Employee
   * @param {Object} body - Request body
   * @param {string} body.name - Employee name
   * @param {string} body.email - Employee email
   * @param {string} body.mobile - Employee mobile number
   * @param {string} body.password - Employee password
   * @param {string} body.role - Employee role
   */
  registerEmployee: async (body) => {
    return requests.post("/auth/employee/register", body);
  },

  /**
   * Login Employee
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   * @param {string} body.password - Employee password
   */
  loginEmployee: async (body) => {
    return requests.post(`/auth/employee/login`, body);
  },

  /**
   * Verify login OTP for employee authentication
   * @param {Object} body - Request body
   * @param {string} body.userId - Employee ID
   * @param {string} body.otp - OTP received from admin
   */
  verifyLoginOtp: async (body) => {
    return requests.post("/auth/employee/verify-login-otp", body);
  },

  /**
   * Resend login OTP for employee authentication
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   */
  resendLoginOtp: async (body) => {
    return requests.post("/auth/employee/resend-login-otp", body);
  },

  /**
   * Get current authenticated Employee
   */
  getCurrentEmployee: async () => {
    // This endpoint should match what your backend uses to send Employee details
    return requests.get("/Employee/Employee-profile");
  },

  /**
   * Logout Employee and clear the HTTP-only cookie
   */
  logoutEmployee: async () => {
    return requests.post("/auth/employee/logout");
  },

  /**
   * Send OTP to email for password reset
   * @param {Object} body - Request body
   * @param {string} body.email - Email to send OTP
   */
  forgotEmployeePassword: async (body) => {
    return requests.post("/auth/employee/forgot-Password", body);
  },

  /**
   * Resend OTP for forgot password
   * @param {Object} body - Request body
   * @param {string} body.email - Email to send OTP
   */
  resendEmployeeForgotPasswordOtp: async (body) => {
    return requests.post("/auth/employee/resend-forgot-password-otp", body);
  },

  /**
   * Reset password with OTP
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   * @param {string} body.otp - OTP received via email
   * @param {string} body.newPassword - New password
   */
  resetEmployeePassword: async (body) => {
    return requests.post("/auth/employee/reset-password", body);
  },

  /**
   * Request email verification
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   */
  requestEmployeeEmailVerification: async (body) => {
    return requests.post("/auth/employee/email-verification", body);
  },

  /**
   * Resend email verification OTP
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   */
  resendEmployeeVerifyEmailOtp: async (body) => {
    return requests.post("/auth/employee/resend-verify-email-otp", body);
  },

  /**
   * Verify Employee email with OTP
   * @param {Object} body - Request body
   * @param {string} body.email - Employee email
   * @param {string} body.otp - OTP received via email
   */
  verifyEmployeeEmail: async (body) => {
    return requests.post("/auth/employee/verify-email", body);
  },

  getEmployeeProfile: async () => {
    return requests.get("/Employee/Employee-profile");
  },

  updateEmployeeProfile: async (body) => {
    return requests.put(`/Employee/update-employee-profile`, {
      profileData: body,
    });
  },

  getEmployeeDashboardAnalytics: async () => {
    return requests.get("/Employee/dashboard");
  },

  getEmployeeDashboardRecentApplicants: async (body) => {
    return requests.get(
      `/Employee/dashboard-recent-applicants?page=${body.page}&limit=${body.limit}`
    );
  },

  getQualifications: async () => {
    return requests.get("/qualifications");
  },

  getStates: async () => {
    return requests.get("/states");
  },

  getCities: async (stateCode) => {
    return requests.get(`/cities/${stateCode}`);
  },

  getLocations: async () => {
    return requests.get("/corporate:metro:cities");
  },
  getDepartments: async () => {
    return requests.get("/preferredroles");
  },
  getIndustries: async () => {
    return requests.get("/industries");
  },
  getLocalities: async () => {
    return requests.get("/localities/indore");
  },

  createCandidateData: async (body) => {
    return requests.post("/candidates/create", body);
  },

  getCandidatesData: async (page = 1, limit = 10, search = "", filters = {}, dateRange = {}, employeeId = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (search) {
      params.append('search', search);
    }
    
    // Add employeeId filter (for admin)
    if (employeeId) {
      params.append('employeeId', employeeId);
    }
    
    // Add filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && Array.isArray(filters[key]) && filters[key].length > 0) {
        filters[key].forEach(value => {
          params.append(`filters[${key}]`, value);
        });
      }
    });
    
    // Add date range
    if (dateRange.startDate) {
      params.append('startDate', dateRange.startDate instanceof Date ? dateRange.startDate.toISOString() : dateRange.startDate);
    }
    if (dateRange.endDate) {
      params.append('endDate', dateRange.endDate instanceof Date ? dateRange.endDate.toISOString() : dateRange.endDate);
    }
    if (dateRange.dateRangeType) {
      params.append('dateRangeType', dateRange.dateRangeType);
    }
    
    return requests.get(`/candidates?${params.toString()}`);
  },

  getAllEmployees: async () => {
    return requests.get("/Employee/all-employees");
  },

  updateCandidateData: async (candidateId, body) => {
    return requests.patch(`/candidates/${candidateId}`, body);
  },

  checkDuplicityOfCandidateData: async (mobileNo) => {
    return requests.get(`/candidates/check-duplicate/${mobileNo}`);
  },

  /**
   * Mark a candidate for the current employee
   * @param {string} mobileNo - Mobile number of the candidate
   */

  markCandidate: async (mobileNo) => {
    return requests.post(`/candidates/mark/${mobileNo}`);
  },

  checkDuplicityofInputField: async (mobileNo) => {
    return requests.get(`/candidates/check-duplicate-input/${mobileNo}`);
  },

  unlockCandidateDuplicacy: async (mobileNo) => {
    return requests.post(`/candidates/unlock-duplicacy/${mobileNo}`);
  },

  bulkUnlockCandidates: async (candidateIds) => {
    return requests.post("/candidates/bulk-unlock", { candidateIds });
  },

  bulkUploadCandidates: async (body) => {
    return requests.post("/candidates/bulk-upload", body);
  },

  getDashboardAnalytics: async () => {
    return requests.get("/employee/analytics");
  },

  getDashboardVisualData: async () => {
    return requests.get("/employee/dashboard-visual-data");
  },

  getIncentivesData: async () => {
    return requests.get("/employee/incentives-data");
  },

  getRecentFeeds: async (params = {}) => {
    const { after, limit } = params;
    let url = "/employee/recent-feeds";

    if (after || limit) {
      const queryParams = [];
      if (after) queryParams.push(`after=${after}`);
      if (limit) queryParams.push(`limit=${limit}`);
      url += `?${queryParams.join("&")}`;
    }

    return requests.get(url);
  },

  createLineupData: async (body) => {
    return requests.post("/lineups/create", body);
  },

  getLineupsData: async (page = 1, limit = 10, search = "", filters = {}, employeeId = null) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (search) {
      params.append('search', search);
    }
    
    // Add status filter
    if (filters.status) {
      params.append('status', filters.status);
    }
    
    // Add date range filters - send as YYYY-MM-DD format to avoid timezone issues
    if (filters.startDate) {
      const startDate = filters.startDate instanceof Date 
        ? `${filters.startDate.getFullYear()}-${String(filters.startDate.getMonth() + 1).padStart(2, '0')}-${String(filters.startDate.getDate()).padStart(2, '0')}`
        : filters.startDate;
      params.append('startDate', startDate);
    }
    if (filters.endDate) {
      const endDate = filters.endDate instanceof Date 
        ? `${filters.endDate.getFullYear()}-${String(filters.endDate.getMonth() + 1).padStart(2, '0')}-${String(filters.endDate.getDate()).padStart(2, '0')}`
        : filters.endDate;
      params.append('endDate', endDate);
    }
    if (filters.dateRangeType) {
      params.append('dateRangeType', filters.dateRangeType);
    }
    
    // Add employee filter (for admin)
    if (employeeId) {
      params.append('employeeId', employeeId);
    }
    
    return requests.get(`/lineups?${params.toString()}`);
  },

  getWalkinsData: async (page = 1, limit = 10, search = "") => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return requests.get(`/walkins?page=${page}&limit=${limit}${searchParam}`);
  },

  createWalkinData: async (body) => {
    return requests.post("/walkins/create", body);
  },

  updateWalkinData: async (walkinId, body) => {
    return requests.put(`/walkins/${walkinId}`, body);
  },

  updateLineupData: async (lineupId, body) => {
    return requests.put(`/lineups/${lineupId}`, body);
  },

  // Lineup Remarks APIs
  getLineupRemarks: async (lineupId) => {
    return requests.get(`/lineups/${lineupId}/remarks`);
  },

  addLineupRemark: async (lineupId, remark) => {
    return requests.post(`/lineups/${lineupId}/remarks`, { remark });
  },

  updateLineupRemark: async (lineupId, remarkId, remark) => {
    return requests.put(`/lineups/${lineupId}/remarks/${remarkId}`, { remark });
  },

  deleteLineupRemark: async (lineupId, remarkId) => {
    return requests.delete(`/lineups/${lineupId}/remarks/${remarkId}`);
  },

  createJoiningData: async (body) => {
    return requests.post("/joinings/create", body);
  },

  getJoiningsData: async (page = 1, limit = 10, search = "") => {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    return requests.get(`/joinings?page=${page}&limit=${limit}${searchParam}`);
  },

  updateJoiningData: async (joiningId, body) => {
    return requests.put(`/joinings/${joiningId}`, body);
  },

  startActivity: async (body) => {
    return requests.post("/activity/start", body);
  },

  getCurrentActivity: async () => {
    return requests.get("/activity/current");
  },

  goOnDesk: async () => {
    return requests.post("/activity/on-desk");
  },

  getActivityHistory: async () => {
    return requests.get("/activity/history");
  },

  getActivityTimeLimits: async () => {
    return requests.get("/activity/time-limits");
  },

  getOnDeskData: async () => {
    return requests.get("/activity/on-desk-data");
  },

  applyForLeave: async (leaveData) => {
    return requests.post("/leaves/apply", leaveData);
  },

  getEmployeeLeaves: async () => {
    return requests.get("/leaves/my-leaves");
  },

  getAttendanceCalendarData: async (month, year) => {
    return requests.get(
      `/employee/attendance-calendar?month=${month}&year=${year}`
    );
  },

  logOut: async () => {
    return requests.post("/auth/employee/logout");
  },

  getEmployeeProfileImage: async () => {
    return requests.get("/employee/employee-profile-image");
  },

  updateEmployeeProfileImage: async (body) => {
    return requests.put(`/employee/update-employee-profile-image`, {
      profileImage: body,
    });
  },
  getJobProfiles: async () => {
    return requests.get("/jobprofiles");
  },
  getReminders: async () => {
    return requests.get("/reminders");
  },
  createReminder: async (body) => {
    return requests.post("/reminders", body);
  },

  updateReminder: async (reminderId, body) => {
    return requests.patch(`/reminders/${reminderId}`, body);
  },

  deleteReminder: async (reminderId) => {
    return requests.delete(`/reminders/${reminderId}`);
  },

  markReminderAsDone: async (reminderId) => {
    return requests.patch(`/reminders/${reminderId}/complete`);
  },

  /**
   * Create a new client
   * @param {Object} body - Client data
   * @param {string} body.name - Client name
   * @param {string} body.number - Client contact number
   * @param {string} body.designation - Client designation (optional)
   * @param {string} body.companyName - Client company name (optional)
   */
  createClient: async (body) => {
    return requests.post("/clients", body);
  },

  getFinancialYearJoiningData: async (startDate, endDate) => {
    return requests.get(
      `/joinings/financial-year-summary?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getCandidateName: async (mobileNo) => {
    return requests.get(`/candidates/get-by-mobile/${mobileNo}`);
  },

  bulkMarkDataSaved: async (candidateIds) => {
    return requests.post("/candidates/bulk-mark-data-saved", { candidateIds });
  },
};
export default EmployeeServices;
