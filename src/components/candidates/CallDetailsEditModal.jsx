import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MdPerson,
  MdSource,
  MdPhone,
  MdLocationOn,
  MdMessage,
  MdWork,
  MdSchool,
  MdTimer,
  MdAccessTime,
  MdNotes,
  MdShare,
  MdBusinessCenter,
  MdWifiCalling3,
  MdLocationCity,
  MdWatch,
  MdPublic,
  MdOutlineWhatsapp,
  MdClose,
  MdError,
  MdUpdate,
  MdInfo,
  MdTask
} from "react-icons/md";
import { IoCashOutline } from "react-icons/io5";
import EmployeeServices from "@/services/EmployeeServices";
import { notifySuccess, notifyError } from "@/utils/toast";
import Loader from "../sprinkleLoader/Loader";
import { 
  companyOptions,
  processOptions,
  getProcessesByCompany,
  callStatusOptions,
  experienceOptions,
  genderOptions,
  communicationOptions,
  shiftPreferenceOptions,
  noticePeriodOptions,
  relocationOptions,
  sourceOptions,
  workModeOptions
} from "@/utils/optionsData";
import ProcessSelector from "@/components/common/ProcessSelector";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import SearchableProcessDropdown from "@/components/common/SearchableProcessDropdown";
import { formatLongDateAndTime } from "@/utils/dateFormatter";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function CallDetailsEditModal({ isOpen, onClose, candidateData, onUpdate, isLocked, isRegisteredByMe }) {
  const [darkMode, setDarkMode] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const contactInputRef = useRef(null);
  const callSummaryRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [filteredProcessOptions, setFilteredProcessOptions] = useState([{ value: "", label: "Select Process" }]);
  
  // State variables for dropdown data
  const [qualifications, setQualifications] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [jobProfiles, setJobProfiles] = useState([]);
  const [loadingDropdownData, setLoadingDropdownData] = useState({
    qualifications: false,
    states: false,
    cities: false,
    localities: false,
    jobProfiles: false
  });

  // Form data state
  const [formData, setFormData] = useState({
    candidateName: "",
    source: "",
    gender: "",
    contactNumber: "",
    whatsappNumber: "",
    experience: "",
    qualification: "",
    passingYear: "",
    state: "",
    city: "",
    locality: "",
    salaryExpectations: "",
    levelOfCommunication: "",
    noticePeriod: "",
    shiftPreference: "",
    relocation: "",
    companyProfile: "",
    customCompanyProfile: "",
    callStatus: "",
    callSummary: "",
    callDuration: "",
    lineupCompany: "",
    customLineupCompany: "",
    lineupProcess: "",
    customLineupProcess: "",
    lineupDate: null,
    interviewDate: null,
    walkinDate: null,
    lineupRemarks: "",
    walkinRemarks: "",
    workMode: "",
    jdReferenceCompany: "",
    jdReferenceProcess: "",
    jobInterestedIn: ""
  });

  const [showCallSummaryTooltip, setShowCallSummaryTooltip] = useState(null);

  // Add this after your formData state initialization
  const [minDate] = useState(new Date());

  // Initialize form data when candidate data changes
  useEffect(() => {
    if (candidateData) {
      setFormData({
        candidateName: candidateData.name || "",
        source: candidateData.source || "",
        gender: candidateData.gender || "",
        contactNumber: candidateData.mobileNo || "",
        whatsappNumber: candidateData.whatsappNo || "",
        experience: candidateData.experience || "",
        qualification: candidateData.qualification || "",
        passingYear: candidateData.passingYear || "",
        state: candidateData.state || "",
        city: candidateData.city || "",
        locality: candidateData.locality || "",
        salaryExpectations: candidateData.salaryExpectation || "",
        levelOfCommunication: candidateData.communication || "",
        noticePeriod: candidateData.noticePeriod || "",
        shiftPreference: candidateData.shift || "",
        relocation: candidateData.relocation || "",
        companyProfile: candidateData.companyProfile || "",
        customCompanyProfile: candidateData.customCompanyProfile || "",
        callStatus: candidateData.callStatus || "",
        callDuration: candidateData.callDuration || "1",
        lineupCompany: candidateData.lineupCompany || "",
        customLineupCompany: candidateData.customLineupCompany || "",
        lineupProcess: candidateData.lineupProcess || "",
        customLineupProcess: candidateData.customLineupProcess || "",
        lineupDate: candidateData.lineupDate ? new Date(candidateData.lineupDate) : null,
        interviewDate: candidateData.interviewDate ? new Date(candidateData.interviewDate) : null,
        walkinDate: candidateData.walkinDate ? new Date(candidateData.walkinDate) : null,
        lineupRemarks: candidateData.lineupRemarks || "",
        walkinRemarks: candidateData.walkinRemarks || "",
        workMode: candidateData.workMode || "",
        jdReferenceCompany: candidateData.jdReferenceCompany || "",
        jdReferenceProcess: candidateData.jdReferenceProcess || "",
        jobInterestedIn: candidateData.jobInterestedIn || ""
      });
    }
  }, [candidateData]);

  // Update process options when company changes
  useEffect(() => {
    setFilteredProcessOptions(getProcessesByCompany(formData.lineupCompany));
    
    // Reset process selection when company changes (unless it's already a valid option)
    if (formData.lineupProcess && !getProcessesByCompany(formData.lineupCompany).some(p => p.value === formData.lineupProcess)) {
      setFormData(prev => ({ ...prev, lineupProcess: "" }));
    }
  }, [formData.lineupCompany]);

  // Add another useEffect to update process options when JD reference company changes
  useEffect(() => {
    setFilteredProcessOptions(getProcessesByCompany(formData.jdReferenceCompany || formData.lineupCompany));
    
    // Reset process selection when company changes (unless it's already a valid option)
    if (formData.jdReferenceProcess && !getProcessesByCompany(formData.jdReferenceCompany).some(p => p.value === formData.jdReferenceProcess)) {
      setFormData(prev => ({ ...prev, jdReferenceProcess: "" }));
    }
  }, [formData.jdReferenceCompany, formData.lineupCompany]);

  // Check for user's preferred theme and watch for changes
  useEffect(() => {
    const updateThemeState = () => {
      const isDark = localStorage.theme === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDarkMode(isDark);
    };

    updateThemeState();

    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        updateThemeState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && 
            mutation.target === document.documentElement) {
          updateThemeState();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, []);

  // Add keyboard shortcut listener for Ctrl+"
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl + Quote (keyCode 222)
      if (e.ctrlKey && (e.key === '"' || e.key === "'" || e.keyCode === 222 || e.which === 222)) {
        e.preventDefault();
        if (callSummaryRef.current) {
          callSummaryRef.current.focus();
          // Optional: scroll into view if needed
          callSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };

    // Add the event listener
    document.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Fetch qualifications, states on component mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInitialData = async () => {
        try {
          // Fetch qualifications
          setLoadingDropdownData(prev => ({ ...prev, qualifications: true }));
          const qualificationsRes = await EmployeeServices.getQualifications();
          if (qualificationsRes && Array.isArray(qualificationsRes)) {
            setQualifications(qualificationsRes);
          }
          setLoadingDropdownData(prev => ({ ...prev, qualifications: false }));

          // Fetch states
          setLoadingDropdownData(prev => ({ ...prev, states: true }));
          const statesRes = await EmployeeServices.getStates();
          if (statesRes && Array.isArray(statesRes)) {
            setStates(statesRes);
          }
          setLoadingDropdownData(prev => ({ ...prev, states: false }));
          
          // Fetch job profiles
          setLoadingDropdownData(prev => ({ ...prev, jobProfiles: true }));
          const jobProfilesRes = await EmployeeServices.getJobProfiles();
          if (jobProfilesRes && Array.isArray(jobProfilesRes)) {
            setJobProfiles(jobProfilesRes);
          }
          setLoadingDropdownData(prev => ({ ...prev, jobProfiles: false }));
        } catch (error) {
          console.error("Error fetching dropdown data:", error);
          notifyError("Failed to load dropdown data");
          setLoadingDropdownData({
            qualifications: false,
            states: false,
            cities: false,
            localities: false,
            jobProfiles: false
          });
        }
      };

      fetchInitialData();
    }
  }, [isOpen]);

  // Fetch cities when state changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) {
        setCities([]);
        return;
      }

      try {
        setLoadingDropdownData(prev => ({ ...prev, cities: true }));
        
        // Find the state code by looking up the selected state name in the states array
        const selectedState = states.find(state => state.name === formData.state);
        const stateCode = selectedState ? selectedState.code : formData.state;

        const citiesRes = await EmployeeServices.getCities(stateCode);
        if (citiesRes && Array.isArray(citiesRes)) {
          setCities(citiesRes);
        }
        setLoadingDropdownData(prev => ({ ...prev, cities: false }));
      } catch (error) {
        console.error("Error fetching cities:", error);
        notifyError("Failed to load cities");
        setCities([]);
        setLoadingDropdownData(prev => ({ ...prev, cities: false }));
      }
    };

    if (formData.state) {
      fetchCities();
    }
  }, [formData.state, states]);

  // Fetch localities when city is set to Indore
  useEffect(() => {
    const fetchLocalities = async () => {
      if (formData.city.toLowerCase() !== "indore") {
        setLocalities([]);
        return;
      }

      try {
        setLoadingDropdownData(prev => ({ ...prev, localities: true }));
        const localitiesRes = await EmployeeServices.getLocalities();
        if (localitiesRes && Array.isArray(localitiesRes)) {
          setLocalities(localitiesRes);
        }
        setLoadingDropdownData(prev => ({ ...prev, localities: false }));
      } catch (error) {
        console.error("Error fetching localities:", error);
        notifyError("Failed to load localities");
        setLocalities([]);
        setLoadingDropdownData(prev => ({ ...prev, localities: false }));
      }
    };

    if (formData.city.toLowerCase() === "indore") {
      fetchLocalities();
    }
  }, [formData.city]);

  const handleChange = (field, value) => {
    if (field === "contactNumber") {
      // Validate phone number length
      if (value.length > 0 && value.length !== 10) {
        setPhoneError(`Phone number must be 10 digits. Current: ${value.length}`);
        setDuplicateInfo(null);
      } else {
        setPhoneError("");
        
        // Check for duplicate when mobile number is exactly 10 digits
        if (value.length === 10) {
          checkDuplicateMobile(value);
        } else {
          setDuplicateInfo(null);
        }
      }
      
      // Auto-fill WhatsApp number with contact number
      setFormData(prev => ({ ...prev, [field]: value, whatsappNumber: value }));
      return;
    }
    
    if (field === "state") {
      // When state changes, reset city and locality
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        city: "",
        locality: "" 
      }));
      return;
    }
    
    if (field === "city") {
      // If city changed and not Indore, clear the locality
      if (value.toLowerCase() !== "indore") {
        setFormData(prev => ({ ...prev, [field]: value, locality: "" }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
      return;
    }
    
    // If company profile is changed
    if (field === "companyProfile") {
      if (value.toLowerCase() === "others") {
        // When others is selected, clear the custom profile field to ensure it's filled in newly
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          customCompanyProfile: ""
        }));
      } else {
        // When a specific profile is selected, clear the custom profile field
        setFormData(prev => ({ 
          ...prev, 
          [field]: value,
          customCompanyProfile: ""
        }));
      }
      return;
    }
    
    // If lineup company is set to others, also set lineup process to others
    if (field === "lineupCompany" && value === "others") {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        lineupProcess: "others"
      }));
      return;
    }
    
    // Handle call status changes
    if (field === "callStatus") {
      // Reset date fields when status changes to prevent invalid date errors
      if (value === "Lineup") {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          lineupDate: null,
          interviewDate: null
        }));
      } else if (value === "Walkin at Infidea") {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          walkinDate: null
        }));
      } else {
        // For other statuses, clear all date fields
        setFormData(prev => ({
          ...prev,
          [field]: value,
          lineupDate: null,
          interviewDate: null,
          walkinDate: null
        }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare candidate data for API
      const updatedData = {
        name: formData.candidateName,
        whatsappNo: formData.whatsappNumber,
        source: formData.source,
        gender: formData.gender,
        experience: formData.experience,
        qualification: formData.qualification,
        passingYear: formData.passingYear,
        state: formData.state,
        city: formData.city,
        salaryExpectation: formData.salaryExpectations,
        communication: formData.levelOfCommunication,
        noticePeriod: formData.noticePeriod,
        shift: formData.shiftPreference,
        relocation: formData.relocation || "",
        companyProfile: formData.companyProfile === "others" ? formData.customCompanyProfile : formData.companyProfile,
        callStatus: formData.callStatus,
        callDuration: formData.callDuration || "0",
        callSummary: formData.callSummary || "",
        locality: formData.locality,
        lineupCompany: formData.lineupCompany === "others" ? formData.customLineupCompany : formData.lineupCompany,
        customCompanyProfile: formData.customCompanyProfile,
        customLineupCompany: formData.customLineupCompany,
        lineupProcess: formData.lineupProcess === "others" ? formData.customLineupProcess : formData.lineupProcess,
        customLineupProcess: formData.customLineupProcess,
        lineupDate: formData.lineupDate && formData.lineupDate instanceof Date && !isNaN(formData.lineupDate) ? formData.lineupDate.toISOString() : null,
        interviewDate: formData.interviewDate && formData.interviewDate instanceof Date && !isNaN(formData.interviewDate) ? formData.interviewDate.toISOString() : null,
        walkinDate: formData.walkinDate && formData.walkinDate instanceof Date && !isNaN(formData.walkinDate) ? formData.walkinDate.toISOString() : null,
        lineupRemarks: formData.lineupRemarks,
        walkinRemarks: formData.walkinRemarks,
        workMode: formData.workMode,
        jdReferenceCompany: formData.jdReferenceCompany,
        jdReferenceProcess: formData.jdReferenceProcess,
        jobInterestedIn: formData.jobInterestedIn || ""
      };
      
      // Call API to update candidate data
      const response = await EmployeeServices.updateCandidateData(candidateData._id,updatedData);
      notifySuccess(response.message);

      // Call the onUpdate callback to refresh the parent component's data
      if (onUpdate) {
        onUpdate(updatedData);
      }
      
      // Close the modal
      onClose();
      setLoading(false);
    } catch (error) {

      notifyError(error?.response?.data?.message||error?.response?.error || "Failed to update candidate data");
      setLoading(false);
    }
  };

  // Check for duplicate mobile numbers
  const checkDuplicateMobile = async (mobileNumber) => {
    try {
      setCheckingDuplicate(true);
      const response = await EmployeeServices.checkDuplicityOfCandidateData(mobileNumber);
      
      if (response && response.isDuplicate === true) {
        setDuplicateInfo({
          registeredBy: response.registeredBy.en,
          remainingDays: response.remainingDays
        });
      } else {
        setDuplicateInfo(null);
      }
    } catch (error) {
      console.error("Error checking mobile number duplicity:", error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  // Generate call duration options
  const callDurationOptions = Array.from({ length: 31 }, (_, i) => ({
    value: `${i}`, 
    label: `${i} ${i === 1 ? 'Minute' : 'Minutes'}`
  }));
  callDurationOptions.unshift({ value: "", label: "Select Duration" });

  // Create qualification options from API data
  const qualificationOptions = [
    { value: "", label: "Select Qualification" },
    ...(qualifications?.map(qual => ({ 
      value: qual.name || qual, 
      label: qual.name || qual 
    })) || [])
  ];
  
  // Create state options from API data
  const stateOptions = [
    { value: "", label: "Select State" },
    ...(states?.map(state => ({ 
      value: state.name, 
      label: state.name 
    })) || [])
  ];
  
  // Create city options from API data
  const cityOptions = [
    { value: "", label: "Select City" },
    ...(cities?.map(city => ({ 
      value: city.name || city, 
      label: city.name || city 
    })) || [])
  ];
  
  // Create locality options from API data
  const localityOptions = [
    { value: "", label: "Select Locality" },
    ...(localities?.map(locality => ({ 
      value: locality.name || locality, 
      label: locality.name || locality 
    })) || [])
  ];

  // Create job profile options from API data
  const jobProfileOptions = useMemo(() => [
    { value: "", label: "Select Job Profile" },
    ...(jobProfiles?.map(profile => ({ 
      value: profile.name || profile, 
      label: profile.name || profile 
    })) || []),
    { value: "others", label: "Others" }
  ], [jobProfiles]);

  // All fields in a single flat array - organized as in CallInfo
  const fields = [
    { label: "Candidate's Name", key: "candidateName", icon: <MdPerson />, required: false, inputClass: "w-full" },
    { 
      label: "Mobile No.", 
      key: "contactNumber", 
      icon: <MdPhone />, 
      type: "tel", 
      pattern: "[0-9]{10}", 
      maxLength: 10, 
      required: false, 
      inputClass: "w-full", 
      ref: contactInputRef,
      readOnly: true,
    },
    { 
      label: "WhatsApp No.", 
      key: "whatsappNumber", 
      icon: <MdOutlineWhatsapp />, 
      type: "tel", 
      pattern: "[0-9]{10}", 
      maxLength: 10, 
      required: false, 
      inputClass: "w-full"
    },
    { label: "Source", key: "source", icon: <MdSource />, type: "select", options: sourceOptions, required: false, inputClass: "w-full" },
    { label: "Gender", key: "gender", icon: <MdPerson />, type: "select", options: genderOptions, required: false, inputClass: "w-full" },
    { label: "Experience", key: "experience", icon: <MdWork />, type: "select", options: experienceOptions, required: false, inputClass: "w-full" },
    { label: "Qualification", key: "qualification", icon: <MdSchool />, type: "select", options: qualificationOptions, required: false, inputClass: "w-full", loading: loadingDropdownData.qualifications },
    { 
      label: "Passing Year", 
      key: "passingYear", 
      icon: <MdSchool />, 
      type: "select",
      options: [
        { value: "", label: "Select Year" },
        ...Array.from({ length: 31 }, (_, i) => ({
          value: String(2030 - i),
          label: String(2030 - i)
        }))
      ],
      required: false,
      inputClass: "w-full"
    },
    { label: "State", key: "state", icon: <MdPublic />, type: "select", options: stateOptions, required: false, inputClass: "w-full", loading: loadingDropdownData.states },
    { label: "City", key: "city", icon: <MdLocationCity />, type: "select", options: cityOptions, required: false, inputClass: "w-full", loading: loadingDropdownData.cities },
    { label: "Salary Expectation", key: "salaryExpectations", icon: <IoCashOutline />, required: false, inputClass: "w-full" },
    { label: "Communication", key: "levelOfCommunication", icon: <MdMessage />, type: "select", options: communicationOptions, required: false, inputClass: "w-full" },
    { label: "Notice Period", key: "noticePeriod", icon: <MdTimer />, type: "select", options: noticePeriodOptions, required: false, inputClass: "w-full" },
    { label: "Shift Preference", key: "shiftPreference", icon: <MdAccessTime />, type: "select", options: shiftPreferenceOptions, required: false, inputClass: "w-full" },
    { label: "Relocation", key: "relocation", icon: <MdShare />, type: "select", options: relocationOptions, required: false, inputClass: "w-full" },
    { label: "Work Mode", key: "workMode", icon: <MdBusinessCenter />, type: "select", options: workModeOptions, required: false, inputClass: "w-full" },
    { label: "Job Profile", key: "companyProfile", icon: <MdBusinessCenter />, type: "select", options: jobProfileOptions, required: false, inputClass: "w-full", loading: loadingDropdownData.jobProfiles },
    { label: "Job Interested In", key: "jobInterestedIn", icon: <MdWork />, required: false, inputClass: "w-full" },
    { label: "Call Status", key: "callStatus", icon: <MdWifiCalling3 />, type: "select", options: callStatusOptions, required: false, inputClass: "w-full" },
    { 
      label: "Walkin Date", 
      key: "walkinDate", 
      icon: <MdAccessTime />, 
      type: "custom",
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Walkin at Infidea",
      render: ({ key, label, icon, required, inputClass }) => (
        <div className="flex flex-col relative">
          <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-base">{icon}</span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          <DatePicker
            selected={formData[key]}
            onChange={(date) => handleChange(key, date)}
            minDate={minDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            required={required}
            className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} ${inputClass}`}
          />
        </div>
      )
    },
    { 
      label: "Lineup Company", 
      key: "lineupCompany", 
      icon: <MdBusinessCenter />, 
      type: "select", 
      options: companyOptions,
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Lineup" 
    },
    { 
      label: "Lineup Process", 
      key: "lineupProcess", 
      icon: <MdBusinessCenter />, 
      type: "custom",
      options: filteredProcessOptions,
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Lineup",
      render: ({ key, label, icon, options, required, inputClass }) => (
        <div className="flex flex-col relative">
          <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-base">{icon}</span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          <SearchableProcessDropdown
            options={options}
            value={formData[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`Search ${label}...`}
            required={required}
            disabled={loading}
            darkMode={darkMode}
            className={inputClass || ''}
            phoneNumber={formData.whatsappNumber}
          />
          
          {/* Custom inputs for "others" options */}
          {(formData.lineupCompany.toLowerCase() === "others" || formData.lineupProcess.toLowerCase() === "others") && (
            <input
              type="text"
              value={formData.customLineupProcess || ""}
              onChange={(e) => handleChange("customLineupProcess", e.target.value)}
              placeholder="Custom process"
              required={false}
              className={`mt-1.5 px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full`}
            />
          )}
        </div>
      )
    },
    { 
      label: "Lineup Date", 
      key: "lineupDate", 
      icon: <MdAccessTime />, 
      type: "custom",
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Lineup",
      render: ({ key, label, icon, required, inputClass }) => (
        <div className="flex flex-col relative">
          <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-base">{icon}</span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          <DatePicker
            selected={formData[key]}
            onChange={(date) => handleChange(key, date)}
            minDate={minDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            required={required}
            className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} ${inputClass}`}
          />
        </div>
      )
    },
    { 
      label: "Interview Date", 
      key: "interviewDate", 
      icon: <MdAccessTime />, 
      type: "custom",
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Lineup",
      render: ({ key, label, icon, required, inputClass }) => (
        <div className="flex flex-col relative">
          <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-base">{icon}</span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          <DatePicker
            selected={formData[key]}
            onChange={(date) => handleChange(key, date)}
            minDate={minDate}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            required={required}
            className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} ${inputClass}`}
          />
        </div>
      )
    },
    { label: "Call Duration", key: "callDuration", icon: <MdWatch />, type: "select", options: callDurationOptions, required: false, inputClass: "w-full" },
    { 
      label: "Company JD", 
      key: "jdReferenceCompany", 
      icon: <MdBusinessCenter />, 
      type: "select", 
      options: companyOptions,
      required: false,
      inputClass: "w-full"
    },
    { 
      label: "JD Process", 
      key: "jdReferenceProcess", 
      icon: <MdTask />, 
      type: "custom", 
      options: filteredProcessOptions,
      required: false,
      inputClass: "w-full",
      render: ({ key, label, options, required, inputClass }) => (
        <div className="flex flex-col relative">
          <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <span className="text-base"><MdTask /></span>
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
          <SearchableProcessDropdown
            options={options}
            value={formData[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={`Search ${label}...`}
            required={required}
            disabled={loading}
            darkMode={darkMode}
            className={inputClass || ''}
            phoneNumber={formData.whatsappNumber}
          />
        </div>
      )
    },
    { 
      label: "Lineup Remarks", 
      key: "lineupRemarks", 
      icon: <MdNotes />, 
      type: "textarea",
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Lineup",
      span: "md:col-span-4 lg:col-span-4"
    },
    { 
      label: "Walkin Remarks", 
      key: "walkinRemarks", 
      icon: <MdNotes />, 
      type: "textarea",
      required: false,
      inputClass: "w-full",
      hidden: formData.callStatus !== "Walkin at Infidea",
      span: "md:col-span-4 lg:col-span-4"
    },
  ];

  // Show locality field only when city is Indore
  const showLocalityField = formData.city.toLowerCase() === "indore";

  // Format individual call history for tooltip
  const formatCallHistory = (employeeCallHistory) => {
    if (!employeeCallHistory || employeeCallHistory.length === 0) return "No call history";
    
    // Sort the call history to show latest calls at the top (descending order by date)
    const sortedHistory = [...employeeCallHistory].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    return sortedHistory.map((call, index) => (
      `${formatLongDateAndTime(call.date)} - ${call.summary}`
    )).join('\n');
  };

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className={`relative z-10 max-w-6xl w-11/12 max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
        <div className={`sticky top-0 z-30 flex justify-between items-center p-4 border-b bg-white dark:bg-gray-900 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-[#e2692c]' : 'text-[#1a5d96]'}`}>
            Edit Call Information
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {/* All fields in a grid layout */}
          <div className="rounded-lg p-4 shadow-md border dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3">
              {fields.map(({ label, key, type, icon, inputClass, options, required, pattern, maxLength, ref, disabled, hidden, loading, readOnly, span, render }) => {
                // Skip rendering if the field should be hidden
                if (hidden) {
                  return null;
                }

                // Use custom render function if provided (for ProcessSelector)
                if (type === "custom" && render) {
                  return (
                    <div key={key} className={span || ""}>
                      {render({ key, label, icon, options, required, inputClass })}
                    </div>
                  );
                }
                
                // Insert locality field right after city field when city is Indore
                if (key === "city" && showLocalityField) {
                  return (
                    <React.Fragment key={key}>
                      <div className="flex flex-col relative">
                        <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-base">{icon}</span>
                          {label}
                          {required && <span className="text-red-500">*</span>}
                        </label>
                        {type === "select" ? (
                          <SearchableDropdown
                            options={options}
                            value={formData[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={`Search ${label}...`}
                            required={required}
                            disabled={loading}
                            darkMode={darkMode}
                            className={inputClass || ''}
                          />
                        ) : type === "textarea" ? (
                          <textarea
                            value={formData[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            placeholder={`Enter ${label.toLowerCase()}...`}
                            required={required}
                            className={`px-2.5 py-1.5 h-24 text-sm rounded-md ${darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} resize-none ${inputClass}`}
                          />
                        ) : (
                          <input
                            type={type || "text"}
                            value={formData[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={label}
                          required={required}
                            pattern={pattern}
                            maxLength={maxLength}
                            ref={ref}
                            disabled={disabled || (key === "contactNumber" && duplicateInfo !== null)}
                            readOnly={key === "contactNumber" || undefined}
                            className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} ${inputClass} ${
                                disabled || key === "contactNumber" || (key === "contactNumber" && duplicateInfo !== null) ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                              } ${(key === "contactNumber" && duplicateInfo !== null) ? 'border-red-500 dark:border-red-500' : ''}`}
                          />
                        )}
                      </div>
                      
                      {/* Show validation error for contact number */}
                      {key === "contactNumber" && phoneError && (
                        <div className="text-xs text-red-500 mt-1">{phoneError}</div>
                      )}
                      
                      {/* Locality Field as Dropdown */}
                      <div className="flex flex-col">
                        <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="text-base"><MdLocationOn /></span>
                          Locality
                        </label>
                        <SearchableDropdown
                          options={localityOptions}
                          value={formData.locality}
                          onChange={(e) => handleChange("locality", e.target.value)}
                          placeholder="Search locality..."
                          required={false}
                          disabled={loadingDropdownData.localities}
                          darkMode={darkMode}
                          className="w-full"
                        />
                      </div>
                    </React.Fragment>
                  );
                }
                
                // Skip locality field as it's handled separately
                if (key === "locality") return null;
                
                // Special handling for textarea type (remarks)
                if (type === "textarea") {
                  return (
                    <div key={key} className={`flex flex-col relative ${span || "md:col-span-4 lg:col-span-4"}`}>
                      <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-base">{icon}</span>
                        {label}
                        {required && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                        className={`px-2.5 py-1.5 h-20 text-sm rounded-md ${darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                          : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} resize-none ${inputClass}`}
                      />
                    </div>
                  );
                }
                
                return (
                  <div key={key} className="flex flex-col relative">
                    <label className={`flex items-center gap-1.5 text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-base">{icon}</span>
                      {label}
                      {required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {type === "select" ? (
                      <>
                        <SearchableDropdown
                          options={options}
                          value={formData[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={`Search ${label}...`}
                          required={required}
                          disabled={loading}
                          darkMode={darkMode}
                          className={inputClass || ''}
                        />
                        
                        {/* Custom inputs for "others" options */}
                        {key === "lineupCompany" && (formData.lineupCompany.toLowerCase() === "others" || formData.lineupProcess.toLowerCase() === "others") && (
                          <input
                            type="text"
                            value={formData.customLineupCompany || ""}
                            onChange={(e) => handleChange("customLineupCompany", e.target.value)}
                            placeholder="Custom company"
                            required={false}
                            className={`mt-1.5 px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full`}
                          />
                        )}
                        
                        {key === "lineupProcess" && (formData.lineupCompany.toLowerCase() === "others" || formData.lineupProcess.toLowerCase() === "others") && (
                          <input
                            type="text"
                            value={formData.customLineupProcess || ""}
                            onChange={(e) => handleChange("customLineupProcess", e.target.value)}
                            placeholder="Custom process"
                            required={false}
                            className={`mt-1.5 px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full`}
                          />
                        )}
                        
                        {key === "companyProfile" && formData.companyProfile === "others" && (
                          <input
                            type="text"
                            value={formData.customCompanyProfile || ""}
                            onChange={(e) => handleChange("customCompanyProfile", e.target.value)}
                            placeholder="Custom profile"
                            required={false}
                            className={`mt-1.5 px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                              : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} w-full`}
                          />
                        )}
                      </>
                    ) : type === "textarea" ? (
                      <textarea
                        value={formData[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}...`}
                        required={required}
                        className={`px-2.5 py-1.5 h-24 text-sm rounded-md ${darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                          : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} resize-none ${inputClass}`}
                      />
                    ) : (
                      <>
                        <input
                          type={type || "text"}
                          value={formData[key]}
                          onChange={(e) => handleChange(key, e.target.value)}
                          placeholder={label}
                          required={false}
                          pattern={pattern}
                          maxLength={maxLength}
                          disabled={disabled || (key === "contactNumber" && duplicateInfo !== null)}
                          readOnly={key === "contactNumber" || undefined}
                          className={`px-2.5 py-1.5 h-9 text-sm rounded-md ${darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                            : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} ${inputClass} ${
                              disabled || key === "contactNumber" || (key === "contactNumber" && duplicateInfo !== null) ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed' : ''
                            } ${(key === "contactNumber" && duplicateInfo !== null) ? 'border-red-500 dark:border-red-500' : ''}`}
                        />
                        
                        {/* Show duplicate info for contact number */}
                        {key === "contactNumber" && duplicateInfo !== null && (
                          <div className="text-xs text-red-500 mt-1 flex items-center">
                            <MdError className="mr-1" />
                            <span>
                              Duplicate entry: Registered by {duplicateInfo.registeredBy || 'someone'} 
                              {duplicateInfo.remainingDays !== undefined ? 
                                ` (${duplicateInfo.remainingDays} days remaining)` : 
                                ''}
                            </span>
                          </div>
                        )}
                        
                        {/* Show validation error for contact number */}
                        {key === "contactNumber" && phoneError && !duplicateInfo && (
                          <div className="text-xs text-red-500 mt-1">{phoneError}</div>
                        )}

                        {/* Show loading indicator while checking for duplicates */}
                        {key === "contactNumber" && checkingDuplicate && (
                          <div className="text-xs text-blue-500 mt-1">Checking number...</div>
                        )}
                        
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Call Summary Field */}
            <div className="mt-3 grid grid-cols-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-base"><MdNotes /></span>
                  Call Summary
                </label>
                <div className="relative inline-block">
                  <MdInfo 
                    className="w-3.5 h-3.5 text-blue-500 cursor-help hover:text-blue-700" 
                    onMouseEnter={() => setShowCallSummaryTooltip(true)}
                    onMouseLeave={() => setShowCallSummaryTooltip(false)}
                  />
                  {showCallSummaryTooltip && (
                    <div className="absolute z-[9999] w-64 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2 text-left">
                      <div className="text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-pre-line overflow-y-auto max-h-40">
                        {formatCallHistory(candidateData?.callSummary)}
                      </div>
                      <div className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800 -bottom-2 left-1/2 -translate-x-1/2"></div>
                    </div>
                  )}
                </div>
              </div>
              <textarea
                ref={callSummaryRef}
                value={formData.callSummary}
                onChange={(e) => handleChange("callSummary", e.target.value)}
                placeholder="Enter call summary..."
                className={`px-2.5 py-1.5 h-20 w-full text-sm rounded-md ${darkMode 
                  ? 'border-gray-600 bg-gray-700 text-white focus:border-[#e2692c]' 
                  : 'border-gray-300 bg-white text-gray-800 focus:border-[#1a5d96]'} border focus:ring-1 ${darkMode ? 'focus:ring-[#e2692c]' : 'focus:ring-[#1a5d96]'} resize-none`}
              />
              <div className="mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Ctrl + " to focus on call summary</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-3">
            {isLocked && isRegisteredByMe ? (
              <div className="text-xs text-red-500">
                You are not authorized to update this call.
              </div>
            ) : loading ? (
              <Loader size="30" speed="1.75" />
            ) : (
              <button
                type="submit"
                className={`px-5 py-2.5 ${darkMode ? 'bg-[#e2692c] hover:bg-[#d15a20]' : 'bg-[#1a5d96] hover:bg-[#154a7a]'} text-white rounded-md text-sm shadow-md flex items-center gap-1.5 transition-colors`}
                disabled={loading || duplicateInfo !== null}
              >
                <MdUpdate className="text-base" />
                Update
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CallDetailsEditModal;