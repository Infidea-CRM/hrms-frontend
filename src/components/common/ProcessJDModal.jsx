import React from "react";
import { MdClose, MdInfo, MdOutlineWhatsapp, MdLocationOn } from "react-icons/md";
import { getCompanyLocation } from "@/utils/optionsData";

const ProcessJDModal = ({ isOpen, onClose, jdData, phoneNumber }) => {
  // Don't render if not open or no data
  if (!isOpen || !jdData) return null;

  const {
    company,
    processName,
    designation,
    workMode,
    education,
    experience,
    communicationSkills,
    location,
    workingDays,
    workingHours,
    shifts,
    salary,
    deductions,
    roleOverview,
    benefits,
  } = jdData;

  const formatJDForWhatsApp = () => {
    let formattedJD = `*JOB DETAILS*\n\n`;
    formattedJD += `*Company:* ${company}\n`;
    formattedJD += `*Process:* ${processName}\n`;
    
    if (designation) formattedJD += `*Designation:* ${designation}\n`;
    if (workMode) formattedJD += `*Work Mode:* ${workMode}\n`;
    if (education) formattedJD += `*Education:* ${education}\n`;
    if (experience) formattedJD += `*Experience:* ${experience}\n`;
    if (communicationSkills) formattedJD += `*Communication Skills:* ${communicationSkills}\n`;
    if (location) formattedJD += `*Location:* ${location}\n`;
    if (workingDays) formattedJD += `*Working Days:* ${workingDays}\n`;
    if (workingHours) formattedJD += `*Working Hours:* ${workingHours}\n`;
    if (shifts) formattedJD += `*Shifts:* ${shifts}\n`;
    
    if (salary) {
      formattedJD += `\n*Salary:*\n`;
      if (typeof salary === "string") {
        formattedJD += `${salary}\n`;
      } else {
        salary.forEach(item => {
          formattedJD += `- ${item}\n`;
        });
      }
    }
    
    if (deductions) formattedJD += `\n*Deductions:* ${deductions}\n`;
    
    if (benefits && benefits.length > 0) {
      formattedJD += `\n*Benefits:*\n`;
      benefits.forEach(benefit => {
        formattedJD += `- ${benefit}\n`;
      });
    }
    
    if (roleOverview) formattedJD += `\n*Role Overview:*\n${roleOverview}\n`;
    
    return encodeURIComponent(formattedJD);
  };

  const handleShareOnWhatsApp = () => {
    if (!phoneNumber) {
      alert("No WhatsApp number available to share");
      return;
    }
    
    // Format phone number (remove any non-digit characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Create WhatsApp web URL with formatted JD
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${formatJDForWhatsApp()}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleShareLocation = () => {
    if (!phoneNumber) {
      alert("No WhatsApp number available to share location");
      return;
    }
    
    // Format phone number (remove any non-digit characters)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    
    // Get location URL for the company
    const locationUrl = getCompanyLocation(company);
    
    // Create WhatsApp web URL with location message
    const locationMessage = encodeURIComponent(`Please find the location for your interview at ${company}:\n${locationUrl}`);
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${locationMessage}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto py-4">
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-3xl mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MdInfo className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
              Process Details: {processName}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareOnWhatsApp}
                className="text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full p-1.5 flex items-center justify-center"
                title="Share JD on WhatsApp"
              >
                <MdOutlineWhatsapp className="w-4 h-4" />
              </button>
              <button
                onClick={handleShareLocation}
                className="text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1.5 flex items-center justify-center"
                title="Share Location on WhatsApp"
              >
                <MdLocationOn className="w-4 h-4" />
              </button>
              <button
                className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-full p-1"
                onClick={onClose}
              >
                <MdClose className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <h4 className="text-base font-semibold text-[#1a5d96] dark:text-[#e2692c] mb-2">
              Company: {company}
            </h4>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-3">
                {processName && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Process Name</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{processName}</p>
                  </div>
                )}

                {designation && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Designation</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{designation}</p>
                  </div>
                )}

                {workMode && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Mode</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{workMode}</p>
                  </div>
                )}

                {education && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Education</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{education}</p>
                  </div>
                )}

                {experience && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Experience</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{experience}</p>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-3">
                {communicationSkills && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Communication Skills</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{communicationSkills}</p>
                  </div>
                )}

                {location && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{location}</p>
                  </div>
                )}

                {workingDays && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Days</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{workingDays}</p>
                  </div>
                )}

                {workingHours && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Working Hours</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{workingHours}</p>
                  </div>
                )}

                {shifts && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Shifts</h5>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{shifts}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Salary section */}
            {salary && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary</h5>
                <div className="pl-2 border-l-2 border-[#1a5d96] dark:border-[#e2692c]">
                  {typeof salary === "string" ? (
                    <p className="text-sm text-gray-800 dark:text-gray-200">{salary}</p>
                  ) : (
                    <ul className="list-disc list-inside space-y-1">
                      {salary.map((item, index) => (
                        <li key={index} className="text-sm text-gray-800 dark:text-gray-200">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Deductions */}
            {deductions && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Deductions</h5>
                <p className="text-sm text-gray-800 dark:text-gray-200">{deductions}</p>
              </div>
            )}

            {/* Benefits section */}
            {benefits && benefits.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits</h5>
                <div className="pl-2 border-l-2 border-[#1a5d96] dark:border-[#e2692c]">
                  <ul className="list-disc list-inside space-y-1">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-800 dark:text-gray-200">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Role Overview */}
            {roleOverview && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Overview</h5>
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
                  {roleOverview}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessJDModal; 