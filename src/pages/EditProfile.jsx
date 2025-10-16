import { useTranslation } from "react-i18next";
import { useState, useEffect, useContext } from "react";
import { MdPerson, MdNumbers, MdWork, MdPhone, MdEmail, MdDateRange, MdHome, MdLocationOn, MdAccountBalance } from "react-icons/md";
import { FaCamera, FaSave, FaEdit } from "react-icons/fa";
import Cookies from "js-cookie";
//internal import
import EmployeeServices from "@/services/EmployeeServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import { notifyError, notifySuccess } from "@/utils/toast";
import { formatLongDate } from "@/utils/dateFormatter";
import { uploadImage, deleteImage } from "@/services/CloudinaryService";
import { AdminContext } from "@/context/AdminContext";
import { setCookieWithIST } from "@/hooks/useLoginSubmit";

// Function to calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  const fieldsToCheck = [
    'name',
    'designation',
    'contact',
    'dob',
    'address',
    'emergencyContactName',
    'emergencyContactNumber',
    'relation',
    'bankName',
    'branchName',
    'ifsc',
    'accountNumber',
    'beneficiaryAddress',
    'image'
  ];

  const filledFields = fieldsToCheck.filter(field => {
    const value = profile[field];
    return value && value.toString().trim() !== '';
  });

  return Math.round((filledFields.length / fieldsToCheck.length) * 100);
};

// Function to convert percentage to coordinates on the gauge arc
const percentageToCoordinates = (percentage, radius) => {
  // Convert percentage to angle (180 degrees = 100%)
  const angle = (percentage / 100) * 180;
  // Convert angle to radians
  const radians = (angle - 90) * (Math.PI / 180);
  // Calculate coordinates
  const x = radius * Math.cos(radians) + radius;
  const y = radius * Math.sin(radians) + radius;
  return { x, y };
};

const EditProfile = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(AdminContext);
  const { adminInfo } = state;

  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    image: "",
    imagePublicId: "",
    name: "",
    empCode: "",
    designation: "",
    contact: "",
    email: "",
    joiningDate: "",
    dob: "",
    address: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    relation: "",
    bankName: "",
    branchName: "",
    ifsc: "",
    accountNumber: "",
    reAccountNumber: "",
    beneficiaryAddress: "",
  });

  // Track original server values to determine if fields should be editable
  const [serverValues, setServerValues] = useState({});

  // Fetch employee profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await EmployeeServices.getEmployeeProfile();
        
        if (response) {
          // Directly use the response object that contains employee data
          const employeeData = response.employee;
          
          // Extract public ID from image URL if available
          let imagePublicId = "";
          if (employeeData.profileImage) {
            try {
              const url = new URL(employeeData.profileImage);
              const pathParts = url.pathname.split('/');
              const uploadIndex = pathParts.findIndex(part => part === 'upload');
              
              if (uploadIndex !== -1 && uploadIndex < pathParts.length - 2) {
                let startIndex = uploadIndex + 1;
                if (pathParts[startIndex].startsWith('v') && /^v\d+$/.test(pathParts[startIndex])) {
                  startIndex++;
                }
                imagePublicId = pathParts.slice(startIndex).join('/').split('.')[0];
              }
            } catch (error) {
              console.error("Error extracting public ID from profile image URL:", error);
            }
          }

          const profileData = {
            image: employeeData.profileImage || "",
            imagePublicId: imagePublicId,
            name: employeeData.name?.en || "",
            empCode: employeeData.employeeCode || "",
            designation: employeeData.designation || "",
            contact: employeeData.mobile || "",
            email: employeeData.email || "",
            joiningDate: employeeData.createdAt || "",
            dob: employeeData.dateOfBirth || "",
            address: employeeData.address || "",
            emergencyContactName: employeeData.emergencyContact?.name || "",
            emergencyContactNumber: employeeData.emergencyContact?.number || "",
            relation: employeeData.emergencyContact?.relation || "",
            bankName: employeeData.bankDetails?.bankName || "",
            branchName: employeeData.bankDetails?.branch || "",
            ifsc: employeeData.bankDetails?.ifsc || "",
            accountNumber: employeeData.bankDetails?.accountNumber || "",
            reAccountNumber: employeeData.bankDetails?.accountNumber || "",
            beneficiaryAddress: employeeData.bankDetails?.beneficiaryAddress || "",
          };

          setProfile(profileData);

          // Store server values to check if fields are already filled
          setServerValues({
            name: employeeData.name?.en || "",
            designation: employeeData.designation || "",
            contact: employeeData.mobile || "",
            dob: employeeData.dateOfBirth || "",
            address: employeeData.address || "",
            emergencyContactName: employeeData.emergencyContact?.name || "",
            emergencyContactNumber: employeeData.emergencyContact?.number || "",
            relation: employeeData.emergencyContact?.relation || "",
            bankName: employeeData.bankDetails?.bankName || "",
            branchName: employeeData.bankDetails?.branch || "",
            ifsc: employeeData.bankDetails?.ifsc || "",
            accountNumber: employeeData.bankDetails?.accountNumber || "",
            beneficiaryAddress: employeeData.bankDetails?.beneficiaryAddress || "",
          });
        }
      } catch (error) {
        notifyError(error?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Helper function to check if a field should be disabled
  const isFieldDisabled = (key, defaultDisabled = false) => {
    if (defaultDisabled) return true; // Fields like empCode, email, joiningDate are always disabled
    
    // Address and designation are always editable
    if (key === 'address' || key === 'designation') {
      return false;
    }
    
    // Check if the field has a value from server (not empty/null/undefined)
    // If server value exists and is not empty, field is disabled (read-only)
    // If server value is empty/null/undefined, field is editable
    const serverValue = serverValues[key];
    return serverValue && serverValue.toString().trim() !== "";
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  // Helper function to format dates for display
  const getDisplayDate = (isoDate) => {
    return isoDate ? formatLongDate(isoDate) : "";
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        // Show file preview immediately for a better UX
        const reader = new FileReader();
        reader.onloadend = () => {
          // This will only update the local preview, not save to backend
          setProfile({ ...profile, image: reader.result });
        };
        reader.readAsDataURL(file);
        
        // Delete existing image if we have its public ID
        if (profile.imagePublicId) {
          try {
            await deleteImage(profile.imagePublicId);
          } catch (deleteError) {
            console.error("Error deleting previous profile image:", deleteError);
            // Continue with upload even if delete fails
          }
        } else if (profile.image && profile.image.startsWith('http')) {
          // Fallback: Try to extract public ID from URL if not stored
          try {
            const url = new URL(profile.image);
            const pathParts = url.pathname.split('/');
            const uploadIndex = pathParts.findIndex(part => part === 'upload');
            
            if (uploadIndex !== -1 && uploadIndex < pathParts.length - 2) {
              let startIndex = uploadIndex + 1;
              if (pathParts[startIndex].startsWith('v') && /^v\d+$/.test(pathParts[startIndex])) {
                startIndex++;
              }
              
              const publicId = pathParts.slice(startIndex).join('/').split('.')[0];
              
              if (publicId) {
                await deleteImage(publicId);
              }
            } else {
              console.warn("Could not extract public ID from URL:", profile.image);
            }
          } catch (deleteError) {
            console.error("Error deleting previous profile image:", deleteError);
            // Continue with upload even if delete fails
          }
        }
        
        // Upload to Cloudinary
        const result = await uploadImage(file, 'profile-images', `employee-${profile.empCode || Date.now()}`);
        
        if (result && result.url) {
          // Update profile with the Cloudinary URL and store the public ID
          setProfile({ 
            ...profile, 
            image: result.url,
            imagePublicId: result.publicId 
          });
          
          // Update profile image immediately on API without waiting for save button
          try {
            const updated = await EmployeeServices.updateEmployeeProfileImage(result.url);
            notifySuccess(updated.message);
            
            // Update adminInfo Cookie with the new profile image
            if (adminInfo) {
              const updatedAdminInfo = { 
                ...adminInfo,
                user: { 
                  ...adminInfo.user,
                  profileImage: result.url 
                }
              };
              
              // Update the adminInfo context
              dispatch({ type: "USER_LOGIN", payload: updatedAdminInfo });
              
              // Update the cookie
              setCookieWithIST("adminInfo", JSON.stringify(updatedAdminInfo));
            }
          } catch (updateError) {
            console.error("Error updating profile image on API:", updateError);
            notifyError(updateError?.response?.data?.message || "Failed to update profile image");
          }
        }
      } catch (error) {
        notifyError(error?.message || "Failed to upload image");
        console.error("Error uploading image:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate account number match if both are provided
      if (profile.accountNumber && profile.reAccountNumber && profile.accountNumber !== profile.reAccountNumber) {
        notifyError("Account numbers do not match");
        setLoading(false);
        return;
      }
      
      // Prepare data for update - include all editable fields that have values
      const profileData = {};
      
      // Always include email and mobile (contact) in the payload
      profileData.email = profile.email;
      profileData.mobile = profile.contact;
      
      // Always include address and designation since they're always editable
      if (profile.address !== undefined) {
        profileData.address = profile.address;
      }
      
      if (profile.designation !== undefined) {
        profileData.designation = profile.designation;
      }
      
      // Include other fields only if they were empty on server and now have values
      if (!serverValues.name && profile.name) {
        profileData.name = { en: profile.name };
      }
      if (!serverValues.dob && profile.dob) {
        profileData.dateOfBirth = profile.dob;
      }
      
      // Emergency contact details
      if (!serverValues.emergencyContactName && profile.emergencyContactName) {
        if (!profileData.emergencyContact) profileData.emergencyContact = {};
        profileData.emergencyContact.name = profile.emergencyContactName;
      }
      if (!serverValues.emergencyContactNumber && profile.emergencyContactNumber) {
        if (!profileData.emergencyContact) profileData.emergencyContact = {};
        profileData.emergencyContact.number = profile.emergencyContactNumber;
      }
      if (!serverValues.relation && profile.relation) {
        if (!profileData.emergencyContact) profileData.emergencyContact = {};
        profileData.emergencyContact.relation = profile.relation;
      }
      
      // Bank details
      if (!serverValues.bankName && profile.bankName) {
        if (!profileData.bankDetails) profileData.bankDetails = {};
        profileData.bankDetails.bankName = profile.bankName;
      }
      if (!serverValues.branchName && profile.branchName) {
        if (!profileData.bankDetails) profileData.bankDetails = {};
        profileData.bankDetails.branch = profile.branchName;
      }
      if (!serverValues.ifsc && profile.ifsc) {
        if (!profileData.bankDetails) profileData.bankDetails = {};
        profileData.bankDetails.ifsc = profile.ifsc;
      }
      if (!serverValues.accountNumber && profile.accountNumber) {
        if (!profileData.bankDetails) profileData.bankDetails = {};
        profileData.bankDetails.accountNumber = profile.accountNumber;
      }
      if (!serverValues.beneficiaryAddress && profile.beneficiaryAddress) {
        if (!profileData.bankDetails) profileData.bankDetails = {};
        profileData.bankDetails.beneficiaryAddress = profile.beneficiaryAddress;
      }
      
      // Include profileImage if it has been updated
      if (profile.image && profile.image.startsWith('http')) {
        profileData.profileImage = profile.image;
      }
      // Include imagePublicId if available (for future reference)
      if (profile.imagePublicId) {
        profileData.imagePublicId = profile.imagePublicId;
      }

      // Call the update API with the profile data
      const updated = await EmployeeServices.updateEmployeeProfile(profileData);
      notifySuccess(updated.message);
      setEditMode(false);
      
      // Transform the returned employee data to match the profile state format
      if (updated.employee) {
        // Get public ID from response or try to extract it from the image URL if not provided
        let imagePublicId = updated.employee.imagePublicId || "";
        if (!imagePublicId && updated.employee.profileImage) {
          try {
            const url = new URL(updated.employee.profileImage);
            const pathParts = url.pathname.split('/');
            const uploadIndex = pathParts.findIndex(part => part === 'upload');
            
            if (uploadIndex !== -1 && uploadIndex < pathParts.length - 2) {
              let startIndex = uploadIndex + 1;
              if (pathParts[startIndex].startsWith('v') && /^v\d+$/.test(pathParts[startIndex])) {
                startIndex++;
              }
              imagePublicId = pathParts.slice(startIndex).join('/').split('.')[0];
            }
          } catch (error) {
            console.error("Error extracting public ID from profile image URL:", error);
          }
        }
        
        const updatedProfileData = {
          image: updated.employee.profileImage || "",
          imagePublicId: imagePublicId,
          name: updated.employee.name?.en,
          empCode: updated.employee.employeeCode,
          designation: updated.employee.designation,
          contact: updated.employee.mobile,
          email: updated.employee.email,
          joiningDate: updated.employee.createdAt,
          dob: updated.employee.dateOfBirth,
          address: updated.employee.address,
          emergencyContactName: updated.employee.emergencyContact?.name,
          emergencyContactNumber: updated.employee.emergencyContact?.number,
          relation: updated.employee.emergencyContact?.relation,
          bankName: updated.employee.bankDetails?.bankName,
          branchName: updated.employee.bankDetails?.branch,
          ifsc: updated.employee.bankDetails?.ifsc,
          accountNumber: updated.employee.bankDetails?.accountNumber,
          reAccountNumber: updated.employee.bankDetails?.accountNumber,
          beneficiaryAddress: updated.employee.bankDetails?.beneficiaryAddress,
        };

        setProfile(updatedProfileData);

        // Update server values to reflect the new state
        setServerValues({
          name: updated.employee.name?.en || "",
          designation: updated.employee.designation || "",
          contact: updated.employee.mobile || "",
          dob: updated.employee.dateOfBirth || "",
          address: updated.employee.address || "",
          emergencyContactName: updated.employee.emergencyContact?.name || "",
          emergencyContactNumber: updated.employee.emergencyContact?.number || "",
          relation: updated.employee.emergencyContact?.relation || "",
          bankName: updated.employee.bankDetails?.bankName || "",
          branchName: updated.employee.bankDetails?.branch || "",
          ifsc: updated.employee.bankDetails?.ifsc || "",
          accountNumber: updated.employee.bankDetails?.accountNumber || "",
          beneficiaryAddress: updated.employee.bankDetails?.beneficiaryAddress || "",
        });
        
        // Update profile image in adminInfo cookie if it has changed
        if (adminInfo && updated.employee.profileImage) {
          const updatedAdminInfo = { 
            ...adminInfo,
            user: { 
              ...adminInfo.user,
              profileImage: updated.employee.profileImage 
            }
          };
          
          // Update the adminInfo context
          dispatch({ type: "USER_LOGIN", payload: updatedAdminInfo });
          
          // Update the cookie
          setCookieWithIST("adminInfo", JSON.stringify(updatedAdminInfo));
        }
      }
    } catch (error) {
      notifyError(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Define fields by section with medium heights
  const employeeFields = [
    { 
      label: "Employee Name", 
      key: "name", 
      icon: <MdPerson />, 
      maxLength: 50,
    },
    { 
      label: "Employee Code", 
      key: "empCode", 
      icon: <MdNumbers />, 
      maxLength: 10,
      disabled: true,
    },
    { 
      label: "Designation", 
      key: "designation", 
      icon: <MdWork />, 
      maxLength: 50,
    },
    { 
      label: "Contact Number", 
      key: "contact", 
      icon: <MdPhone />, 
      type: "tel",
      pattern: "[0-9]{10}",
      maxLength: 10,
    },
    { 
      label: "Email ID", 
      key: "email", 
      icon: <MdEmail />, 
      type: "email",
      maxLength: 50,
      disabled: true
    },
    { 
      label: "Joining Date", 
      key: "joiningDate", 
      type: "date", 
      icon: <MdDateRange />,
      formatDisplay: true,
      disabled: true
    }
  ];

  const personalFields = [
    { 
      label: "Date of Birth", 
      key: "dob", 
      type: "date", 
      icon: <MdDateRange />,
      formatDisplay: true
    },
    {
      label: "Address",
      key: "address",
      icon: <MdHome />,
      maxLength: 100,
    },
    { 
      label: "Emergency Contact Name", 
      key: "emergencyContactName", 
      icon: <MdPerson />, 
      maxLength: 50,
    },
    { 
      label: "Emergency Contact Number", 
      key: "emergencyContactNumber", 
      icon: <MdPhone />, 
      type: "tel",
      pattern: "[0-9]{10}",
      maxLength: 10,
    },
    { 
      label: "Relation", 
      key: "relation", 
      icon: <MdPerson />, 
      maxLength: 30,
    }
  ];

  const bankFields = [
    { 
      label: "Bank Name", 
      key: "bankName", 
      icon: <MdAccountBalance />, 
      maxLength: 50,
    },
    { 
      label: "Branch", 
      key: "branchName", 
      icon: <MdAccountBalance />, 
      maxLength: 50,
    },
    { 
      label: "IFSC", 
      key: "ifsc", 
      icon: <MdNumbers />, 
      maxLength: 11,
    },
    { 
      label: "Account Number", 
      key: "accountNumber", 
      icon: <MdNumbers />, 
      maxLength: 18,
    },
    { 
      label: "Re-Enter Account Number", 
      key: "reAccountNumber", 
      icon: <MdNumbers />, 
      maxLength: 18,
      disabled: true,
    },
    { 
      label: "Beneficiary Address", 
      key: "beneficiaryAddress", 
      icon: <MdLocationOn />, 
      maxLength: 100,
    }
  ];

  // Render a section of fields
  const renderFields = (fields) => {
    return fields.map(({ label, key, type, icon, maxLength, pattern, disabled, formatDisplay }) => {
      const fieldDisabled = isFieldDisabled(key, disabled);
      
      return (
        <div key={key} className="mb-3">
          <label className="flex items-center gap-1.5 text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            <span className="text-base">{icon}</span>
            {label}
            {(key === 'address' || key === 'designation') && (
              <span className="text-xs text-green-600 ml-1">(Always Editable)</span>
            )}
            {fieldDisabled && key !== 'address' && key !== 'designation' && (
              <span className="text-xs text-gray-500 ml-1">(Already filled)</span>
            )}
            {!fieldDisabled && key !== 'address' && key !== 'designation' && (
              <span className="text-xs text-blue-600 ml-1">(Can be filled)</span>
            )}
          </label>
          {editMode && !fieldDisabled ? (
            <input
              type={type || "text"}
              value={profile[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={label}
              maxLength={maxLength}
              pattern={pattern}
              className="w-full px-2.5 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-[#1a5d96] dark:focus:border-[#e2692c] focus:ring-1 focus:ring-[#1a5d96] dark:focus:ring-[#e2692c]"
            />
          ) : (
            <div className="w-full px-2.5 py-1.5 text-sm rounded border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white flex items-center truncate overflow-hidden opacity-70">
              {formatDisplay ? getDisplayDate(profile[key]) : profile[key]}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <AnimatedContent>
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white">
        <div className="h-full flex flex-col">
          {/* User Information Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 flex justify-between items-center mt-5">
            <div className="flex items-center gap-3">
              {/* Profile Image with Completion Gauge */}
<div className="relative flex items-center">
  <div className="relative w-16 h-16">
    {/* Completion Gauge SVG - Perfectly aligned around profile image */}
    <svg
      className="absolute inset-0 w-16 h-16 transform -rotate-90"
      viewBox="0 0 64 64"
    >
      {/* Background Circle */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="3"
        className="dark:stroke-gray-600"
      />
      
      {/* Progress Circle */}
      {(() => {
        const percentage = calculateProfileCompletion(profile);
        const circumference = 2 * Math.PI * 28;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        
        return (
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out dark:stroke-emerald-400"
          />
        );
      })()}
    </svg>

    {/* Profile Image Container */}
    <div className="relative w-14 h-14 m-1 rounded-full overflow-hidden shadow-lg border-2 border-white dark:border-gray-700">
      {loading && profile.image?.startsWith('data:') ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <img
          src={
            profile.image && 
            (profile.image.startsWith('http') || profile.image.startsWith('data:'))
              ? profile.image
              : "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"
          }
          alt="Profile"
          className="w-full h-full object-contain"
        />
      )}
    </div>

    {/* Completion Percentage Badge */}
    <div className="absolute text-green-500 text-xs font-bold translate-x-1/2">
      {calculateProfileCompletion(profile)}%
    </div>

    {/* Edit Overlay */}
    {editMode && (
      <>
        <label
          htmlFor="imageUpload"
          className={`absolute inset-0 m-1 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer rounded-full ${
            loading ? 'opacity-70' : 'opacity-100'
          } transition-opacity duration-300`}
        >
          {loading ? (
            <span className="text-white text-xs">Uploading...</span>
          ) : (
            <FaCamera className="text-white text-base" />
          )}
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={loading}
        />
      </>
    )}
                </div>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1a5d96] dark:text-[#e2692c] tracking-tight">
                  {profile.name ? profile.name : "Name not available"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">Employee Code:</span> {profile.empCode ? profile.empCode : "not available"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.designation ? profile.designation : "Designation not available"}
                </p>
              </div>
            </div>
            
            <div>
              <button
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                disabled={loading}
                className={`px-3 py-1.5 bg-[#1a5d96] hover:bg-[#154a7a] dark:bg-[#e2692c] dark:hover:bg-[#d15a20] text-white rounded text-sm shadow-md flex items-center gap-1.5 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : editMode ? (
                  <>
                    <FaSave size={14} /> Save Changes
                  </>
                ) : (
                  <>
                    <FaEdit size={14} /> Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
  
          {/* Content with sections */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2 mt-4">
            {/* Employee Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[calc(100vh-4.5rem)]">
              <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-[#1a5d96] dark:text-[#e2692c]">Employee Details</h3>
              </div>
              <div className="p-3 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
                {renderFields(employeeFields)}
              </div>
            </div>
  
            {/* Personal Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[calc(100vh-4.5rem)]">
              <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-[#1a5d96] dark:text-[#e2692c]">Personal Details</h3>
              </div>
              <div className="p-3 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
                {renderFields(personalFields)}
              </div>
            </div>
  
            {/* Bank Details Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[calc(100vh-4.5rem)]">
              <div className="px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-sm font-semibold text-[#1a5d96] dark:text-[#e2692c]">Bank Details</h3>
              </div>
              <div className="p-3 overflow-y-auto max-h-[calc(100vh-6.5rem)]">
                {renderFields(bankFields)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
};

export default EditProfile;