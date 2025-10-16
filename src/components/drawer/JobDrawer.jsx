import React, { useState, useEffect } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import MultiSelectDropdownField from "@/components/DropdownButton/DropdownButton";
import useAsync from "@/hooks/useAsync";
import EmployeeServices from "@/services/EmployeeServices";
import useJobSubmit from "@/hooks/useJobSubmit";

// Internal components
import Title from "@/components/form/others/Title";
import Error from "@/components/form/others/Error";
import InputArea from "@/components/form/input/InputArea";
import LabelArea from "@/components/form/selectOption/LabelArea";
import DrawerButton from "@/components/form/button/DrawerButton";

// Required field label component with red asterisk
const RequiredLabel = ({ text }) => (
  <span>
    {text} <span className="text-red-500">*</span>
  </span>
);

// Input Field Component
const InputField = ({ label, name, register, required = false, placeholder, type = "text", error, id, readOnly = false }) => (
  <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
    <LabelArea label={required ? <RequiredLabel text={label} /> : label} />
    <div className="col-span-8 sm:col-span-4">
      <InputArea
        readOnly={readOnly}
        required={required}
        register={register}
        label={label}
        name={name}
        type={type}
        placeholder={placeholder || label}
        id={id || name}
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-700 dark:text-gray-300 dark:bg-gray-700 
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
      />
      <Error errorName={error} />
    </div>
  </div>
);

// Dropdown Field Component
const DropdownField = ({ label, name, register, options, required = false, error, formatOption }) => (
  <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
    <LabelArea label={required ? <RequiredLabel text={label} /> : label} />
    <div className="col-span-8 sm:col-span-4">
      <select
        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 text-gray-700 dark:text-gray-300 dark:bg-gray-700 
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        {...register(name, { 
          required: required ? `${label} is required` : false 
        })}
        id={name}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption ? formatOption(option) : option}
          </option>
        ))}
      </select>
      <Error errorName={error} />
    </div>
  </div>
);

// Checkbox Component
const CheckboxField = ({ label, name, register, error }) => (
  <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
    <LabelArea label={label} />
    <div className="col-span-8 sm:col-span-4 flex items-center">
      <input
        type="checkbox"
        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        {...register(name)}
        id={name}
      />
      <label htmlFor={name} className="ml-2 text-gray-700 dark:text-gray-300">
        {label === "Featured Job" ? "Mark as Featured" : label}
      </label>
      <Error errorName={error} />
    </div>
  </div>
);

// Radio Field Component
const RadioField = ({ label, name, register, options, error }) => (
  <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
    <LabelArea label={label} />
    <div className="col-span-8 sm:col-span-4">
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="relative flex items-center group">
            <input
              type="radio"
              value={option}
              {...register(name)}
              className="sr-only peer"
              id={`${name}-${option}`}
            />
            <div className="px-4 py-2 rounded-full border-2 border-gray-200 dark:border-gray-600 
                          peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/30
                          cursor-pointer transition-all duration-200 
                          group-hover:border-blue-400 dark:group-hover:border-blue-500">
              <span className="text-sm text-gray-600 dark:text-gray-400 peer-checked:text-blue-600 dark:peer-checked:text-blue-400 peer-checked:font-medium">
                {option}
              </span>
            </div>
          </label>
        ))}
      </div>
      <Error errorName={error} />
    </div>
  </div>
);


// Main JobDrawer Component
const JobDrawer = ({ id }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    errors: formErrors,
    isSubmitting,
    setValue,
    watchedValues,
    setError,
    clearErrors,
  } = useJobSubmit(id);


  // States for dependent fields
  const [charCount, setCharCount] = useState(0);
  const MIN_DESCRIPTION_CHARS = 50;
  const MAX_DESCRIPTION_CHARS = 2000;

  // Fetch all data up front using useAsync hook
  const { data: locations } = useAsync(() => EmployeeServices.getLocations());
  const { data: industries } = useAsync(() => EmployeeServices.getIndustries());
  const { data: departments } = useAsync(() => EmployeeServices.getDepartments());
  const { data: localitiesData } = useAsync(() => EmployeeServices.getLocalities());


    const { data: graduateDegreesData } = useAsync(() => EmployeeServices.getGraduateDegrees());     
    const { data: postGraduateDegreesData } = useAsync(() => EmployeeServices.getPostGraduateDegrees());

  
  // States for select options
  const [localities, setLocalities] = useState([]);
  const [graduateDegrees, setGraduateDegrees] = useState([]);
  const [postGraduateDegrees, setPostGraduateDegrees] = useState([]);

  // Initialize data when fetched
  useEffect(() => {
    if (localitiesData) setLocalities(localitiesData);
    if (graduateDegreesData) setGraduateDegrees(["Any Graduate Can Apply", ...graduateDegreesData]);
    if (postGraduateDegreesData) setPostGraduateDegrees(["Any Post Graduate Can Apply", ...postGraduateDegreesData]);
  }, [localitiesData, graduateDegreesData, postGraduateDegreesData]);

  // Skills for multiselect
  const skillOptions = [

    // Administration & Office
    "MS Excel (Advanced)",
    "MS Word & PowerPoint",
    "Email Drafting",
    "Office Coordination",
    "File Management",
    "Typing (English/Hindi)",
    "Calendar Management",
    "Meeting Scheduling",
  
    // Customer Service & BPO
    "Voice Process (Inbound/Outbound)",
    "Non-Voice Process",
    "Customer Query Handling",
    "CRM Software",
    "English Communication",
    "Hindi Communication",
    "Complaint Resolution",
    "Regional Language Fluency",
  
    // Accounts & Finance
    "Tally ERP",
    "GST Filing",
    "Bookkeeping",
    "Bank Reconciliation",
    "Income Tax Filing",
    "Billing & Invoicing",
    "Financial Analysis",
  
    // Sales & Marketing
    "Field Sales",
    "Lead Generation",
    "Cold Calling",
    "Negotiation Skills",
    "Retail Sales",
    "Client Pitching",
    "Branding",
    "WhatsApp Selling",
    "Digital Marketing",
    "SEO/SEM Marketing",
  
    // IT & Software
    "Java",
    "Core Java",
    "Python",
    "JavaScript",
    "TypeScript",
    "ReactJS",
    "Angular",
    "Node.js",
    ".NET",
    "Spring Boot",
    "HTML/CSS",
    "Redux",
    "Kubernetes",
    "GCP",
    "Terraform",
    "Kafka",
    "Microservices",
    "CI/CD",
    "API Integration",
    "Git & GitHub",
    "Data Modeling",
  
    // Technician & Blue-Collar
    "Electrician Work",
    "Plumbing",
    "Carpenter Work",
    "AC Repair",
    "Fridge Repair",
    "RO Installation",
    "Welding",
    "Machine Operations",
    "Lathe Operator",
    "CCTV Installation",
  
    // Delivery & Logistics
    "Route Knowledge",
    "GPS Navigation",
    "Parcel Scanning",
    "Delivery App Usage",
    "Order Fulfillment",
    "Packaging",
    "Driving License",
  
    // Facility & Housekeeping
    "Deep Cleaning",
    "Mopping & Dusting",
    "Waste Segregation",
    "Floor Scrubbing",
    "Guest Area Setup",
  
    // Healthcare & Wellness
    "First Aid",
    "Patient Care",
    "Nursing Assistance",
    "Physiotherapy Support",
    "Fitness Coaching",
    "Diet Planning",
    "Yoga Instructor",
  
    // Hospitality & Food
    "Table Service",
    "Guest Interaction",
    "POS Billing",
    "Room Service",
    "Kitchen Helper",
  
    // Retail & Store
    "POS Handling",
    "Product Display",
    "Stock Refill",
    "Barcode Scanning",
    "Inventory Checking",
  
    // Creative & Media
    "Graphic Design",
    "Photoshop",
    "Canva",
    "Illustrator",
    "UI/UX Design",
    "Figma",
    "Video Editing",
    "Motion Graphics",
    "Reels Editing",
    "Photography",
    "Social Media Posting",
  
    // Construction & Labour
    "Civil Supervision",
    "Masonry",
    "Tile Laying",
    "Painting",
    "Scaffolding",
    "Steel Fixing",
  
    // Education & Training
    "Subject Teaching",
    "Curriculum Planning",
    "Student Counselling",
    "Online Tools (Zoom/Meet)",
  
    // Travel & Tourism
    "Tour Planning",
    "Hotel Booking",
    "Customer Assistance",
    "Travel Coordination",
    "Local Guide Knowledge",
  
    // Security Services
    "CCTV Monitoring",
    "Gate Security",
    "Fire Safety",
    "Night Duty",
  
    // Soft Skills
    "Time Management",
    "Leadership",
    "Problem Solving",
    "Critical Thinking",
    "Adaptability",
    "Quick Learner",
    "Teamwork",
    "Decision Making",
    "Conflict Resolution",
    "Self-Motivation",
    "Planning",
    "Creativity",
    "Relationship Management",
    "Interpersonal Communication",
    "Work Under Pressure",
  
    // General/Entry-Level
    "Microsoft Office",
    "Email Management",
    "Data Entry",
    "Basic English",
    "Social Media Handling"
  ];

  // Watch important form values for conditional fields
  const watchLocation = watchedValues?.location;
  const watchQualification = watchedValues?.qualification;
  const watchDescription = watchedValues?.description;

  // Update character count for description
  useEffect(() => {
    if (watchDescription) {
      setCharCount(watchDescription.length);
    }
  }, [watchDescription]);

  // Simplified description change handler
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_DESCRIPTION_CHARS) {
      setValue("description", text);
      setCharCount(text.length);
    }
  };

  // Simplified field change handler
  const handleFieldChange = (fieldName, value) => {
    setValue(fieldName, value);
    clearErrors(fieldName);
  };

  // Simplified submit handler - remove validateForm call
  const enhancedSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle submission errors
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          setError(field, { type: 'manual', message });
        });
      } else {
        setError('submit', { 
          type: 'manual', 
          message: error.message || 'An error occurred while submitting the form' 
        });
      }
    }
  };
  

  const [jobForm, setJobForm] = useState({
    companyName: "",
    title: "",
    description: "",
    industry: "",
    department: "",
    workmode: "",
    location: "",
    locality: "",
    shift: "",
    workingDays: "",
    employment: "",
    qualification: "",
    specificDegree: "",
    joining: "",
    skills: [],
    experience: "",
    interview: "",
    process: "",
    experienceMinYears: "",
    experienceMaxYears: "",
    minSalary: "",
    maxSalary: "",
    salaryType: "",
    isFeatured: false,
    employeeSize: "",
    companyBanner: "",
    companyLogo: "",
  });

  // Helper function to clear errors
  const clearErrorForField = (fieldName) => {
    if (formErrors[fieldName]) {
      clearErrors(fieldName);
    }
  };

  // Handle form changes
  const handleFormChange = (fieldName, value) => {
    setJobForm(prev => ({ ...prev, [fieldName]: value }));
    clearErrorForField(fieldName);
  };

  // Handle location change
  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setJobForm({ 
      ...jobForm, 
      location: newLocation,
      locality: "" // Reset locality when location changes
    });
    clearErrorForField('location');
    clearErrorForField('locality');
  };

  // Enhanced formatter for salary display with salary type consideration
  const formatSalaryWithType = (amount, type) => {
    let formattedAmount = "";
    
    if (amount >= 100000) {
      const lacs = amount / 100000;
      if (lacs % 1 === 0) {
        formattedAmount = `₹${lacs} Lac${lacs > 1 ? 's' : ''}`;
      } else {
        formattedAmount = `₹${lacs.toFixed(1)} Lac${lacs > 1 ? 's' : ''}`;
      }
    } else if (amount >= 1000) {
      formattedAmount = `₹${(amount / 1000).toFixed(0)}k`;
    } else {
      formattedAmount = `₹${amount}`;
    }
    
    return formattedAmount;
  };

  return (
    <>
      <div className="w-full relative p-6 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        <Title
          title={id ? "Update Job" : "Add Job"}
          description={id ? "Update your job posting details from here" : "Add your new job posting details from here"}
        />
      </div>

      <Scrollbars className="w-full md:w-7/12 lg:w-8/12 xl:w-8/12 relative dark:bg-gray-700 dark:text-gray-200">
        <form onSubmit={handleSubmit(enhancedSubmit)}>
          {/* Show global form error if any */}
          {formErrors.submit && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              {formErrors.submit.message}
            </div>
          )}

          <div className="px-6 pt-8 flex-grow scrollbar-hide w-full max-h-full pb-40">
            
            {/* Featured Job Toggle */}
            <CheckboxField
              label="Featured Job"
              name="isFeatured"
              register={register}
              error={formErrors.isFeatured}
            />

            {/* Active Job Toggle */}
            <CheckboxField
              label="Active Job"
              name="isActive"
              register={register}
              error={formErrors.isActive}
            />

            {/* View Count */}
            <InputField
              label="View Count"
              name="views"
              register={register}
              required={true}
              error={formErrors.views}
            />

            {/* Basic Information Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Basic Information
              </h3>
            </div>

            <InputField
              label="Company Name"
              name="companyName"
              register={register}
              required={true}
              readOnly={true}
              error={formErrors.companyName}
            />

            <InputField
              label="Job Title"
              name="title"
              register={register}
              required={true}
              error={formErrors.title}
            />

            {/* Job Description with character counter */}
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={<RequiredLabel text="Job Description" />} />
              <div className="col-span-8 sm:col-span-4">
                <textarea
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 text-gray-700 dark:text-gray-300 dark:bg-gray-700 
                    ${formErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                  {...register("description", { required: true })}
                  rows={4}
                  id="description"
                  placeholder="Enter detailed job description"
                  onChange={handleDescriptionChange}
                ></textarea>
                {formErrors.description ? (
                  <Error errorName={formErrors.description} />
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    {charCount}/{MAX_DESCRIPTION_CHARS} characters (minimum {MIN_DESCRIPTION_CHARS})
                  </p>
                )}
              </div>
            </div>

            {/* Salary and Experience Section */}
            <div className="mb-6 mt-10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Salary & Experience
              </h3>
            </div>

            <DropdownField
              label="Minimum Salary"
              name="minSalary"
              register={register}
              options={[
                "1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "10000",
                "11000", "12000", "13000", "14000", "15000", "16000", "17000", "18000", "19000", "20000",
                "21000", "22000", "23000", "24000", "25000", "26000", "27000", "28000", "29000", "30000",
                "31000", "32000", "33000", "34000", "35000", "36000", "37000", "38000", "39000", "40000",
                "41000", "42000", "43000", "44000", "45000", "46000", "47000", "48000", "49000", "50000",
                "51000", "52000", "53000", "54000", "55000", "56000", "57000", "58000", "59000", "60000",
                "61000", "62000", "63000", "64000", "65000", "66000", "67000", "68000", "69000", "70000",
                "71000", "72000", "73000", "74000", "75000", "76000", "77000", "78000", "79000", "80000",
                "81000", "82000", "83000", "84000", "85000", "86000", "87000", "88000", "89000", "90000",
                "91000", "92000", "93000", "94000", "95000", "96000", "97000", "98000", "99000", "100000",
                "110000", "120000", "130000", "140000", "150000", "175000", "200000", "225000", "250000",
                "275000", "300000", "325000", "350000", "375000", "400000", "425000", "450000", "475000",
                "500000", "550000", "600000", "650000", "700000", "750000", "800000", "850000", "900000",
                "950000", "1000000"
              ]}
              formatOption={(value) => formatSalaryWithType(parseInt(value))}
              required={true}
              error={formErrors.minSalary}
            />

            <DropdownField
              label="Maximum Salary"
              name="maxSalary"
              register={register}
              options={[
                "1000", "2000", "3000", "4000", "5000", "6000", "7000", "8000", "9000", "10000",
                "11000", "12000", "13000", "14000", "15000", "16000", "17000", "18000", "19000", "20000",
                "21000", "22000", "23000", "24000", "25000", "26000", "27000", "28000", "29000", "30000",
                "31000", "32000", "33000", "34000", "35000", "36000", "37000", "38000", "39000", "40000",
                "41000", "42000", "43000", "44000", "45000", "46000", "47000", "48000", "49000", "50000",
                "51000", "52000", "53000", "54000", "55000", "56000", "57000", "58000", "59000", "60000",
                "61000", "62000", "63000", "64000", "65000", "66000", "67000", "68000", "69000", "70000",
                "71000", "72000", "73000", "74000", "75000", "76000", "77000", "78000", "79000", "80000",
                "81000", "82000", "83000", "84000", "85000", "86000", "87000", "88000", "89000", "90000",
                "91000", "92000", "93000", "94000", "95000", "96000", "97000", "98000", "99000", "100000",
                "110000", "120000", "130000", "140000", "150000", "175000", "200000", "225000", "250000",
                "275000", "300000", "325000", "350000", "375000", "400000", "425000", "450000", "475000",
                "500000", "550000", "600000", "650000", "700000", "750000", "800000", "850000", "900000",
                "950000", "1000000"
              ]}
              formatOption={(value) => formatSalaryWithType(parseInt(value))}
              required={true}
              error={formErrors.maxSalary}
            />

            <DropdownField
              label="Salary Type"
              name="salaryType"
              register={register}
              options={["Per Month", "Per Annum", "CTC Per Annum", "CTC Per Month"]}
              required={true}
              error={formErrors.salaryType}
            />

            <DropdownField
              label="Minimum Experience"
              name="experienceMinYears"
              register={register}
              options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25].map(year => 
                `${year}`
              )}
              formatOption={(value) => `${value} ${value === "1" ? 'Year' : 'Years'}`}
              required={true}
              error={formErrors.experienceMinYears}
            />

            <DropdownField
              label="Maximum Experience"
              name="experienceMaxYears"
              register={register}
              options={[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25, 30].map(year => 
                `${year}`
              )}
              formatOption={(value) => `${value} ${value === "1" ? 'Year' : 'Years'}`}
              required={true}
              error={formErrors.experienceMaxYears}
            />

            {/* Job Details Section */}
            <div className="mb-6 mt-10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Job Details
              </h3>
            </div>

            <DropdownField
              label="Industry"
              name="industry"
              register={register}
              options={industries || []}
              required={true}
              error={formErrors.industry}
            />

            <DropdownField
              label="Department"
              name="department"
              register={register}
              options={departments || []}
              required={true}
              error={formErrors.department}
            />

            <DropdownField
              label="Work Mode"
              name="workmode"
              register={register}
              options={["Remote", "Hybrid", "On-Site"]}
              required={true}
              error={formErrors.workmode}
            />

            <DropdownField
              label="Location"
              name="location"
              register={register}
              options={locations || []}
              required={true}
              error={formErrors.location}
              onChange={(e) => handleLocationChange(e)}
            />

            {/* Conditional Locality field */}
            {watchLocation === "Indore" && (
              <DropdownField
                label="Locality"
                name="locality"
                register={register}
                options={localities || []}
                required={true}
                error={formErrors.locality}
              />
            )}

            <DropdownField
              label="Shift"
              name="shift"
              register={register}
              options={["Day Shift", "Night Shift", "Rotational Shift"]}
              required={true}
              error={formErrors.shift}
            />

            <DropdownField
              label="Working Days"
              name="workingDays"
              register={register}
              options={["5 Days", "5.5 Days", "6 Days"]}
              required={true}
              error={formErrors.workingDays}
            />

            <DropdownField
              label="Employment Type"
              name="employment"
              register={register}
              options={["Full-Time", "Part-Time", "Freelance", "Internship"]}
              required={true}
              error={formErrors.employment}
            />

            {/* Education Section */}
            <div className="mb-6 mt-10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Education & Skills
              </h3>
            </div>

            <DropdownField
              label="Qualification"
              name="qualification"
              register={register}
              options={["Graduate", "12th Pass and above", "Post Graduate", "Diploma", "Any one can apply"]}
              required={true}
              error={formErrors.qualification}
            />

            {/* Conditional Specific Degree field */}
            {watchQualification === "Graduate" && (
              <DropdownField
                label="Graduate Degree"
                name="specificDegree"
                register={register}
                options={graduateDegrees || []}
                required={true}
                error={formErrors.specificDegree}
              />
            )}

            {watchQualification === "Post Graduate" && (
              <DropdownField
                label="Post Graduate Degree"
                name="specificDegree"
                register={register}
                options={postGraduateDegrees || []}
                required={true}
                error={formErrors.specificDegree}
              />
            )}

            <DropdownField
              label="Joining"
              name="joining"
              register={register}
              options={["Immediate", "1 Month", "2 Months", "3 Months"]}
              required={true}
              error={formErrors.joining}
            />

            {/* Skills Input using MultiSelect */}
            <div className="grid grid-cols-6 gap-3 md:gap-5 xl:gap-6 lg:gap-6 mb-6">
              <LabelArea label={<RequiredLabel text="Skills" />} />
              <div className="col-span-8 sm:col-span-4">
                <MultiSelectDropdownField
                  options={skillOptions}
                  name="skills"
                  value={watchedValues?.skills || []}
                  onChange={(selectedSkills) => {
                    setValue("skills", selectedSkills);
                    clearErrors("skills");
                  }}
                  label="Select Skills"
                />
                <Error errorName={formErrors.skills} />
              </div>
            </div>


            {/* Additional Information */}
            <RadioField
              label="Experience Level"
              name="experience"
              register={register}
              options={["Fresher", "Experienced", "Both"]}
              error={formErrors.experience}
            />

            <RadioField
              label="Interview Process"
              name="interview"
              register={register}
              options={["Online", "In-Person"]}
              error={formErrors.interview}
            />

            <RadioField
              label="Process Type"
              name="process"
              register={register}
              options={["Voice", "Chat"]}
              error={formErrors.process}
            />

            <DropdownField
              label="Employee Size"
              name="employeeSize"
              register={register}
              options={[
                "1-10 employees",
                "11-50 employees",
                "51-200 employees",
                "201-500 employees",
                "501-1000 employees",
                "1001-5000 employees",
                "5001+ employees"
              ]}
              error={formErrors.employeeSize}
            />

            <InputField
              label="Company Banner"
              name="companyBanner"
              register={register}
              required={false}
              error={formErrors.companyBanner}
            />

            <InputField
              label="Company Logo"
              name="companyLogo"
              register={register}
              required={false}
              error={formErrors.companyLogo}
            />
            
          </div>

          <DrawerButton id={id} title="Job" loading={isSubmitting} />
        </form>
      </Scrollbars>
    </>
  );
};

export default JobDrawer; 